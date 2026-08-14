import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"

/** Live tracking snapshot for an order: rider position, ETA, progress, status history. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const tracking = db.getOrderTracking(id)
  if (!tracking) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  // Resolve the road route geometry for the map polyline.
  let route: { geometry: { lat: number; lng: number }[]; distanceKm: number } | null = null
  const from = tracking.restaurant
  const to = tracking.delivery
  if (from?.lat != null && to?.lat != null) {
    route = await db.fetchRoutePolyline({ lat: from.lat, lng: from.lng! }, { lat: to.lat, lng: to.lng! })
  }

  return NextResponse.json({
    ...tracking,
    route: route?.geometry ?? null,
    routeDistanceKm: route ? Math.round(route.distanceKm * 10) / 10 : tracking.distanceKm,
  })
}
