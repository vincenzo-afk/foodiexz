import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { orderStatusSchema, validationError } from "@/lib/validation"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const order = db.getOrderById(id)
  if (!order || order.userId !== auth.userId) return NextResponse.json({ error: "Order not found" }, { status: 404 })
  db.advanceOrderStatus(order)
  return NextResponse.json({ id: order.id, status: order.status, createdAt: order.createdAt })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  try {
    const parsed = orderStatusSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 })
    }
    const order = db.getOrderById(id)
    if (!order || order.userId !== auth.userId) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const allowedCustomerTransitions: Record<string, string[]> = {
      preparing: ["cancelled"],
      "on-the-way": [],
      delivered: [],
      cancelled: [],
    }
    if (!allowedCustomerTransitions[order.status]?.includes(parsed.data.status)) {
      return NextResponse.json({ error: "This status transition is not allowed" }, { status: 409 })
    }

    db.updateOrder(id, {
      status: parsed.data.status,
      statusHistory: [...order.statusHistory, { status: parsed.data.status, at: Date.now() }],
    })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
