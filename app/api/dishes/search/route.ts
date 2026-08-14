import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") || "").toLowerCase()
  const results = db.searchDishes(q).map((d) => ({
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
  return NextResponse.json(results)
}
