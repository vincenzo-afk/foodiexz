import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { scheduledOrderSchema } from "@/lib/featureValidation"

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  return NextResponse.json(db.getScheduledOrdersByUser(auth.userId))
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const parsed = scheduledOrderSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Invalid scheduled order payload" }, { status: 400 })

  const { restaurantId, items, total, paymentMethod, deliveryAddress, scheduledFor, timezone } = parsed.data
  const restaurant = db.getRestaurantById(restaurantId)
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  if (!restaurant.isOpen) return NextResponse.json({ error: "Restaurant is not accepting scheduled orders" }, { status: 409 })

  const scheduledAt = new Date(scheduledFor).getTime()
  const now = Date.now()
  if (!Number.isFinite(scheduledAt) || scheduledAt < now + 15 * 60 * 1000) {
    return NextResponse.json({ error: "Choose a delivery time at least 15 minutes from now" }, { status: 400 })
  }

  const persistedItems = items.map((item) => {
    const dish = db.getDishById(item.dishId)
    if (!dish || dish.restaurantId !== restaurantId) throw new Error(`Dish ${item.dishId} is unavailable`)
    return { id: `SITEM-${Date.now()}-${Math.random()}`, orderId: "", dishId: dish.id, name: dish.name, price: dish.price, quantity: item.quantity, isVeg: dish.isVeg, image: dish.image }
  })
  const cutoffAt = new Date(scheduledAt - 15 * 60 * 1000).toISOString()
  const order = db.createScheduledOrder({
    id: `SCH-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: auth.userId,
    restaurantId,
    restaurantName: restaurant.name,
    items: persistedItems,
    total,
    paymentMethod,
    deliveryAddress: JSON.stringify(deliveryAddress),
    scheduledFor: new Date(scheduledAt).toISOString(),
    timezone,
    cutoffAt,
    status: "scheduled",
    createdAt: new Date(now).toISOString(),
    updatedAt: new Date(now).toISOString(),
  })
  db.createNotification({
    id: `N-${Date.now()}-${Math.random()}`,
    userId: auth.userId,
    title: "Scheduled order created",
    message: `${restaurant.name} is booked for ${new Date(scheduledAt).toLocaleString()}.`,
    type: "success",
    link: "/scheduled-orders",
    eventKey: `scheduled-created:${order.id}`,
    read: false,
    deliveryStatus: "in-app",
    createdAt: new Date().toISOString(),
  })
  return NextResponse.json(order, { status: 201 })
}
