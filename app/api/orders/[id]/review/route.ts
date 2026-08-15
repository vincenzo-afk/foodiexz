import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { reviewSchema, validationError } from "@/lib/validation"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { id } = await params

  try {
    const parsed = reviewSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 })
    }
    const order = db.getOrderById(id)
    if (!order || order.userId !== auth.userId) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    if (order.status !== "delivered") {
      return NextResponse.json({ error: "Reviews are available after delivery" }, { status: 409 })
    }
    db.updateOrder(id, parsed.data)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
