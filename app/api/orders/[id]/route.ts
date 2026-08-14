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
