import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

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
  if (!ownAddress(id, auth.userId)) return NextResponse.json({ error: "Not found" }, { status: 404 })

  try {
    const body = await req.json()
    const { type, address, landmark, isDefault } = body
    if (isDefault) db.clearDefaultsForUser(auth.userId)
    db.updateAddress(id, { type, address, landmark, isDefault: !!isDefault })
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
