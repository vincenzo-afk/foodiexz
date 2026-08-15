import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { roleSchema } from "@/lib/featureValidation"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req)
  if (auth instanceof NextResponse) return auth
  const { id } = await params
  const parsed = roleSchema.safeParse((await req.json()).role)
  if (!parsed.success) return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  const user = db.updateUserRole(id, parsed.data)
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  db.createAuditLog({ id: `AUD-${Date.now()}-${Math.random()}`, actorUserId: auth.userId, action: "user.role.updated", targetType: "user", targetId: id, metadata: { role: parsed.data }, createdAt: new Date().toISOString() })
  return NextResponse.json({ id: user.id, role: user.role })
}
