import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const { type, address, landmark, isDefault } = body
    const userAddresses = db.getAddressesByUser(auth.userId)
    const makeDefault = isDefault || userAddresses.length === 0
    if (makeDefault) db.clearDefaultsForUser(auth.userId)
    db.createAddress({
      id: "ADDR" + Date.now(),
      userId: auth.userId,
      type,
      address,
      landmark,
      isDefault: makeDefault,
    })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
