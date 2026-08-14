import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function POST(req: Request) {
  const auth = await requireAuth(req as any)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const { restaurantId, restaurantName, total, paymentMethod, deliveryAddress, items } = body
    const orderId = "ORD" + Date.now()
    db.createOrder(
      {
        id: orderId,
        userId: auth.userId,
        restaurantId,
        restaurantName,
        total,
        paymentMethod,
        deliveryAddress: JSON.stringify(deliveryAddress || {}),
        status: "preparing",
        createdAt: new Date().toISOString(),
      },
      (items || []).map((item: any) => ({
        orderId,
        dishId: item.dishId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
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
    })),
    total: o.total,
    status: o.status,
    createdAt: o.createdAt,
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
