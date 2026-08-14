import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { haversine } from "@/lib/db"
import { deductWallet } from "@/app/api/wallet/route"

export async function POST(req: Request) {
  const auth = await requireAuth(req as any)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const { restaurantId, restaurantName, total, paymentMethod, deliveryAddress, items, tip, deliveryNote } = body
    if (paymentMethod === "wallet") {
      const user = db.getUserById(auth.userId)
      if (!user || user.wallet < total) {
        return NextResponse.json(
          { error: "Insufficient wallet balance. Please top up or choose another payment method." },
          { status: 402 },
        )
      }
      deductWallet(user.id, total, `Order payment: ${restaurantName}`)
    }
    const orderId = "ORD" + Date.now()
    const restaurant = db.getRestaurantById(restaurantId)
    const addr = deliveryAddress || {}
    db.createOrder(
      {
        id: orderId,
        userId: auth.userId,
        restaurantId,
        restaurantName,
        total,
        paymentMethod,
        deliveryAddress: JSON.stringify(addr),
        deliveryLat: addr.lat || undefined,
        deliveryLng: addr.lng || undefined,
        restaurantLat: restaurant?.lat,
        restaurantLng: restaurant?.lng,
        status: "preparing",
        statusHistory: [{ status: "preparing", at: Date.now() }],
        createdAt: new Date().toISOString(),
        tip: tip ? Number(tip) : 0,
        deliveryNote: deliveryNote || null,
      },
      (items || []).map((item: any) => ({
        orderId,
        dishId: item.dishId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        isVeg: item.isVeg,
        image: item.image,
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
