import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { deliveryAddressSchema, validationError } from "@/lib/validation"
import { z } from "zod"

function ownAddress(id: string, userId: string) {
  const a = db.getAddressById(id)
  return a && a.userId === userId ? a : null
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { id } = await params
  const existing = ownAddress(id, auth.userId)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  try {
    const parsed = deliveryAddressSchema.partial().extend({ isDefault: z.boolean().optional() }).safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 })
    }
    const { type, address, landmark, lat, lng, isDefault } = parsed.data
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { id } = await params
  if (!ownAddress(id, auth.userId)) return NextResponse.json({ error: "Not found" }, { status: 404 })
  db.deleteAddress(id)
  return NextResponse.json({ success: true })
}
