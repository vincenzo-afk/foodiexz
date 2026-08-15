import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const suppliedSecret = req.headers.get("x-cron-secret")
  if (!cronSecret || suppliedSecret !== cronSecret) {
    const auth = await requireAdmin(req)
    if (auth instanceof NextResponse) return auth
  }
  const due = db.getDueScheduledOrders()
  const processed: string[] = []

  for (const scheduled of due) {
    const locked = db.updateScheduledOrder(scheduled.id, { status: "ready" })
    if (!locked || locked.status !== "ready") continue
    const restaurant = db.getRestaurantById(scheduled.restaurantId)
    if (!restaurant || !restaurant.isOpen) {
      db.updateScheduledOrder(scheduled.id, { status: "failed", failureReason: "Restaurant is unavailable" })
      db.createNotification({ id: `N-${Date.now()}-${Math.random()}`, userId: scheduled.userId, title: "Scheduled order could not be placed", message: `${scheduled.restaurantName} is unavailable for this delivery window.`, type: "warning", link: "/scheduled-orders", eventKey: `scheduled-failed:${scheduled.id}`, read: false, deliveryStatus: "in-app", createdAt: new Date().toISOString() })
      continue
    }
    const currentItems = scheduled.items.map((item) => db.getDishById(item.dishId)).filter(Boolean)
    if (currentItems.length !== scheduled.items.length) {
      db.updateScheduledOrder(scheduled.id, { status: "failed", failureReason: "One or more dishes are no longer available" })
      db.createNotification({ id: `N-${Date.now()}-${Math.random()}`, userId: scheduled.userId, title: "Scheduled order needs review", message: `${scheduled.restaurantName} changed its menu before the cutoff.`, type: "warning", link: "/scheduled-orders", eventKey: `scheduled-menu-failed:${scheduled.id}`, read: false, deliveryStatus: "in-app", createdAt: new Date().toISOString() })
      continue
    }
    const currentSubtotal = currentItems.reduce((sum, item, index) => sum + item!.price * scheduled.items[index].quantity, 0)
    const currentTotal = currentSubtotal + (currentSubtotal >= 199 ? 0 : 25) + Math.round(currentSubtotal * 0.05)
    if (Math.abs(currentTotal - scheduled.total) > 1) {
      db.updateScheduledOrder(scheduled.id, { status: "failed", failureReason: "Menu prices changed before the cutoff" })
      db.createNotification({ id: `N-${Date.now()}-${Math.random()}`, userId: scheduled.userId, title: "Scheduled order needs review", message: `${scheduled.restaurantName} changed prices before the cutoff.`, type: "warning", link: "/scheduled-orders", eventKey: `scheduled-price-failed:${scheduled.id}`, read: false, deliveryStatus: "in-app", createdAt: new Date().toISOString() })
      continue
    }
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    db.createOrder({
      id: orderId,
      userId: scheduled.userId,
      restaurantId: scheduled.restaurantId,
      restaurantName: scheduled.restaurantName,
      total: scheduled.total,
      paymentMethod: scheduled.paymentMethod,
      deliveryAddress: scheduled.deliveryAddress,
      status: "preparing",
      statusHistory: [{ status: "preparing", at: Date.now() }],
      createdAt: new Date().toISOString(),
      restaurantLat: restaurant.lat,
      restaurantLng: restaurant.lng,
    }, scheduled.items.map((item) => ({ ...item, id: undefined as never, orderId })))
    db.createNotification({ id: `N-${Date.now()}-${Math.random()}`, userId: scheduled.userId, title: "Scheduled order is being prepared", message: `${scheduled.restaurantName} has started preparing your order.`, type: "order", link: `/order/${orderId}`, eventKey: `scheduled-ready:${scheduled.id}`, read: false, deliveryStatus: "in-app", createdAt: new Date().toISOString() })
    processed.push(scheduled.id)
  }

  return NextResponse.json({ processed: processed.length, ids: processed })
}
