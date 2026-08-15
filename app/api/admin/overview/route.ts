import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (auth instanceof NextResponse) return auth
  const summary = db.getAnalyticsSummary()
  return NextResponse.json({
    ...summary,
    users: db.getUsers().length,
    restaurants: db.getRestaurants().length,
    openRestaurants: db.getRestaurants().filter((restaurant) => restaurant.isOpen).length,
    activeOrders: db.getUsers().flatMap((user) => db.getOrdersByUser(user.id)).filter((order) => ["preparing", "on-the-way"].includes(order.status)).length,
    failedNotifications: db.getFailedNotifications(),
    recentAudit: db.getAuditLogs().slice(0, 20),
  })
}
