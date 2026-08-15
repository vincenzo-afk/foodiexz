import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  const user = auth instanceof NextResponse ? null : db.getUserById(auth.userId)
  const restaurants = db.getRestaurants().filter((restaurant) => restaurant.isOpen)
  const favorites = user ? new Set(db.getFavorites(user.id)) : new Set<string>()
  const orderCounts = new Map<string, number>()
  if (user) {
    db.getOrdersByUser(user.id).forEach((order) => orderCounts.set(order.restaurantId, (orderCounts.get(order.restaurantId) || 0) + 1))
  }
  const isVeg = user?.dietaryPreference === "veg"
  const ranked = restaurants
    .filter((restaurant) => !isVeg || db.getDishesByRestaurant(restaurant.id).some((dish) => dish.isVeg))
    .map((restaurant) => {
      const reasons: string[] = []
      let score = restaurant.rating * 10
      if (favorites.has(restaurant.id)) {
        score += 30
        reasons.push("You saved this restaurant")
      }
      if (orderCounts.has(restaurant.id)) {
        score += Math.min(25, orderCounts.get(restaurant.id)! * 10)
        reasons.push("You ordered here before")
      }
      if (restaurant.distance && Number.parseFloat(restaurant.distance) < 3) {
        score += 10
        reasons.push("Fast near you")
      }
      if (isVeg) reasons.push("Matches your vegetarian preference")
      return { ...restaurant, recommendationScore: Math.round(score), recommendationReasons: reasons.length ? reasons : ["Popular near you"] }
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)

  return NextResponse.json({
    personalized: Boolean(user && !user.personalizationOptOut),
    sections: {
      recommended: ranked.slice(0, 6),
      orderAgain: ranked.filter((restaurant) => orderCounts.has(restaurant.id)).slice(0, 6),
      fastNearby: ranked.slice().sort((a, b) => Number.parseFloat(a.deliveryTime) - Number.parseFloat(b.deliveryTime)).slice(0, 6),
    },
  })
}
