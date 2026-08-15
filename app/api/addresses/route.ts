import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { deliveryAddressSchema, validationError } from "@/lib/validation"

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  return NextResponse.json(db.getAddressesByUser(auth.userId))
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    const parsed = deliveryAddressSchema.extend({ isDefault: z.boolean().optional() }).safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 })
    }
    const { type, address, landmark, lat, lng, isDefault } = parsed.data
    const userAddresses = db.getAddressesByUser(auth.userId)
    const makeDefault = isDefault || userAddresses.length === 0
    if (makeDefault) db.clearDefaultsForUser(auth.userId)
    db.createAddress({
      id: "ADDR" + Date.now(),
      userId: auth.userId,
      type,
      address,
      landmark,
      lat: lat ?? undefined,
      lng: lng ?? undefined,
      isDefault: makeDefault,
    })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Missing address id" }, { status: 400 })
    const parsed = deliveryAddressSchema.partial().extend({ isDefault: z.boolean().optional() }).safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 })
    }
    const { type, address, landmark, lat, lng, isDefault } = parsed.data
    const existing = db.getAddressById(id)
    if (!existing || existing.userId !== auth.userId) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }
    if (isDefault) db.clearDefaultsForUser(auth.userId)
    db.updateAddress(id, {
      type: type ?? existing.type,
      address: address ?? existing.address,
      landmark: landmark ?? existing.landmark,
      lat: lat ?? existing.lat,
      lng: lng ?? existing.lng,
      isDefault: isDefault ?? existing.isDefault,
    })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
