import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") || "").toLowerCase()
  const results = db.searchRestaurants(q).map((r) => ({
    id: r.id,
    name: r.name,
    cuisine: r.cuisine,
    rating: r.rating,
    deliveryTime: r.deliveryTime,
    distance: r.distance,
    image: r.image,
    priceForTwo: r.priceForTwo,
    offer: r.offer,
    isOpen: r.isOpen,
    totalRatings: r.totalRatings,
    description: r.description,
  }))
  return NextResponse.json(results)
}
