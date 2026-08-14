import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { id } = await params

  const order = db.getOrderById(id)
  if (!order || order.userId !== auth.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  let deliveryAddress = {}
  try {
    deliveryAddress = JSON.parse(order.deliveryAddress)
  } catch {
    deliveryAddress = {}
  }
  return NextResponse.json({
    ...order,
    items: db.getOrderItems(id),
    deliveryAddress,
  })
}

// User-initiated cancellation — matches the standard delivery-app rule:
// allowed while the order is still in the kitchen, locked once the rider is on the way.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { id } = await params

  const order = db.getOrderById(id)
  if (!order || order.userId !== auth.userId) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 })
  }
  if (order.status === "cancelled") {
    return NextResponse.json({ message: "Order is already cancelled" }, { status: 400 })
  }
  if (order.status === "delivered") {
    return NextResponse.json({ message: "Order has been delivered and cannot be cancelled" }, { status: 400 })
  }
  if (order.status === "on-the-way") {
    return NextResponse.json({ message: "Rider is already on the way — please use the help option instead" }, { status: 409 })
  }
  if (order.status !== "preparing") {
    return NextResponse.json({ message: "This order cannot be cancelled in its current state" }, { status: 409 })
  }

  order.statusHistory = [...(order.statusHistory || []), { status: "cancelled", at: Date.now() }]
  db.updateOrder(id, { status: "cancelled" })
  return NextResponse.json({ id, status: "cancelled", cancelledAt: Date.now() })
}
