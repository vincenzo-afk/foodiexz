import { NextResponse } from "next/server"
import { db } from "@/lib/db"

function formatRestaurant(r: any) {
  return {
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
    address: r.address,
    openTime: r.openTime,
    closeTime: r.closeTime,
  }
}

export async function GET() {
  return NextResponse.json(db.getRestaurants().map(formatRestaurant))
}
