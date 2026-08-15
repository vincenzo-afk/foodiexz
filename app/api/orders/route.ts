import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { haversine } from "@/lib/db"
import { deductWallet } from "@/app/api/wallet/route"
import { createOrderSchema, validationError } from "@/lib/validation"

export async function POST(req: Request) {
  const auth = await requireAuth(req as any)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const parsed = createOrderSchema.safeParse({
      ...body,
      idempotencyKey: req.headers.get("Idempotency-Key") || body?.idempotencyKey,
    })
    if (!parsed.success) {
      return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 })
    }

    const { restaurantId, restaurantName, total, paymentMethod, deliveryAddress, items, tip, deliveryNote, idempotencyKey } = parsed.data
    const restaurant = db.getRestaurantById(restaurantId)
    if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })

    if (idempotencyKey) {
      const existingOrder = db.getOrderByIdempotencyKey(auth.userId, idempotencyKey)
      if (existingOrder) return NextResponse.json({ orderId: existingOrder.id, duplicate: true })
    }

    const persistedItems = items.map((item) => {
      const dish = db.getDishById(item.dishId)
      if (!dish || dish.restaurantId !== restaurantId) {
        throw new Error(`Dish ${item.dishId} is not available from this restaurant`)
      }
      return {
        orderId: "",
        dishId: dish.id,
        name: dish.name,
        price: dish.price,
        quantity: item.quantity,
        isVeg: dish.isVeg,
        image: dish.image,
      }
    })

    const user = db.getUserById(auth.userId)
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
    if (paymentMethod === "wallet") {
      const debited = deductWallet(user.id, total, `Order payment: ${restaurantName}`)
      if (!debited.success) {
        return NextResponse.json(
          { error: "Insufficient wallet balance. Please top up or choose another payment method." },
          { status: 402 },
        )
      }
    }

    const orderId = "ORD" + Date.now() + Math.random().toString(36).slice(2, 7)
    const addr = deliveryAddress
    const now = Date.now()
    db.createOrder(
      {
        id: orderId,
        userId: auth.userId,
        restaurantId,
        restaurantName: restaurant.name,
        total,
        paymentMethod,
        deliveryAddress: JSON.stringify(addr),
        deliveryLat: addr.lat ?? undefined,
        deliveryLng: addr.lng ?? undefined,
        restaurantLat: restaurant.lat,
        restaurantLng: restaurant.lng,
        status: "preparing",
        statusHistory: [{ status: "preparing", at: now }],
        createdAt: new Date(now).toISOString(),
        tip,
        deliveryNote: deliveryNote || null,
        idempotencyKey,
      },
      persistedItems.map((item) => ({ ...item, orderId })),
    )
    return NextResponse.json({ orderId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Order failed" }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const orders = db.getOrdersByUser(auth.userId).map((o) => ({
    id: o.id,
    restaurantId: o.restaurantId,
    restaurantName: o.restaurantName,
    items: db.getOrderItems(o.id).map((i) => ({
      dishId: i.dishId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      isVeg: i.isVeg,
    })),
    total: o.total,
    status: o.status,
    createdAt: o.createdAt,
    etaMinutes: (() => {
      if (o.status === "delivered") return 0
      const km =
        o.restaurantLat && o.deliveryLat
          ? haversine({ lat: o.restaurantLat, lng: o.restaurantLng! }, { lat: o.deliveryLat, lng: o.deliveryLng! })
          : 3
      const remaining = km * (1 - Math.min(1, (Date.now() - new Date(o.createdAt).getTime()) / 60000 / 8))
      return Math.max(1, Math.round((remaining / 30) * 60))
    })(),
    paymentMethod: o.paymentMethod,
    rating: o.rating,
    review: o.review,
    deliveryAddress: (() => {
      try {
        return JSON.parse(o.deliveryAddress)
      } catch {
        return {}
      }
    })(),
  }))
  return NextResponse.json(orders)
}
