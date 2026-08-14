import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { id } = await params

  try {
    const body = await req.json()
    const { rating, comment } = body
    const order = db.getOrderById(id)
    if (!order || order.userId !== auth.userId) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    db.updateOrder(id, { rating, review: comment })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
