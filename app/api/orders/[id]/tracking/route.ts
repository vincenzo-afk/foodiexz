import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

/** Live tracking snapshot for an order: rider position, ETA, progress, status history. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const order = db.getOrderById(id)
  if (!order || order.userId !== auth.userId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

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
