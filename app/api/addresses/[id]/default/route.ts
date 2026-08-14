import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { id } = await params
  const address = db.getAddressById(id)
  if (!address || address.userId !== auth.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  try {
    db.clearDefaultsForUser(auth.userId)
    db.updateAddress(id, { isDefault: true })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
