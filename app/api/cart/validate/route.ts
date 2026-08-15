import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { cartValidationSchema } from "@/lib/featureValidation"

export async function POST(req: NextRequest) {
  const parsed = cartValidationSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Invalid cart payload" }, { status: 400 })
  const { restaurantId, items } = parsed.data
  const restaurant = db.getRestaurantById(restaurantId)
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })

  const changes: { dishId: string; reason: string; currentPrice?: number; name?: string }[] = []
  const validatedItems = items.flatMap((item) => {
    const dish = db.getDishById(item.dishId)
    if (!dish || dish.restaurantId !== restaurantId) {
      changes.push({ dishId: item.dishId, reason: "unavailable" })
      return []
    }
    return [{ dishId: dish.id, name: dish.name, price: dish.price, quantity: item.quantity, isVeg: dish.isVeg, image: dish.image }]
  })
  const subtotal = validatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return NextResponse.json({
    valid: changes.length === 0 && restaurant.isOpen,
    restaurant: { id: restaurant.id, name: restaurant.name, isOpen: restaurant.isOpen },
    items: validatedItems,
    subtotal,
    deliveryFee: subtotal >= 199 ? 0 : 25,
    changes: restaurant.isOpen ? changes : [...changes, { dishId: restaurantId, reason: "restaurant_closed" }],
    checkedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  })
}
