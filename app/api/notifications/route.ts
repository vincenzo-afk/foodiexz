import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  return NextResponse.json({
    notifications: db.getNotificationsByUser(auth.userId),
    unreadCount: db.getUnreadNotificationCount(auth.userId),
  })
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  db.markAllNotificationsRead(auth.userId)
  return NextResponse.json({ success: true, unreadCount: 0 })
}
