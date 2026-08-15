import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { id } = await params
  const notification = db.markNotificationRead(auth.userId, id)
  if (!notification) return NextResponse.json({ error: "Notification not found" }, { status: 404 })
  return NextResponse.json({ success: true, unreadCount: db.getUnreadNotificationCount(auth.userId) })
}
