import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const restaurant = db.getRestaurantById(id)
  if (!restaurant) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const dishes = db.getDishesByRestaurant(id).map((d) => ({
    id: d.id,
    restaurantId: d.restaurantId,
    name: d.name,
    description: d.description,
    price: d.price,
    image: d.image,
    category: d.category,
    isVeg: d.isVeg,
    rating: d.rating,
    customizable: d.customizable,
    bestseller: d.bestseller,
  }))
  return NextResponse.json({ ...restaurant, dishes })
}
