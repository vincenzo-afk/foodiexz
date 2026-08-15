import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"

const updateSchema = z.object({
  scheduledFor: z.string().datetime({ offset: true }).optional(),
  status: z.enum(["cancelled"]).optional(),
})

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { id } = await params
  const order = db.getScheduledOrdersByUser(auth.userId).find((item) => item.id === id)
  if (!order) return NextResponse.json({ error: "Scheduled order not found" }, { status: 404 })
  if (order.status !== "scheduled") return NextResponse.json({ error: "This scheduled order cannot be changed" }, { status: 409 })

  const parsed = updateSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Invalid update" }, { status: 400 })
  const cutoff = new Date(order.cutoffAt).getTime()
  if (Date.now() >= cutoff) return NextResponse.json({ error: "The change window has closed" }, { status: 409 })

  const scheduledFor = parsed.data.scheduledFor ? new Date(parsed.data.scheduledFor).getTime() : undefined
  if (scheduledFor && scheduledFor < Date.now() + 15 * 60 * 1000) {
    return NextResponse.json({ error: "Choose a time at least 15 minutes from now" }, { status: 400 })
  }
  const updated = db.updateScheduledOrder(id, { status: parsed.data.status || order.status, scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : order.scheduledFor, cutoffAt: scheduledFor ? new Date(scheduledFor - 15 * 60 * 1000).toISOString() : order.cutoffAt })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { id } = await params
  const order = db.getScheduledOrdersByUser(auth.userId).find((item) => item.id === id)
  if (!order) return NextResponse.json({ error: "Scheduled order not found" }, { status: 404 })
  if (Date.now() >= new Date(order.cutoffAt).getTime()) return NextResponse.json({ error: "The cancellation window has closed" }, { status: 409 })
  db.updateScheduledOrder(id, { status: "cancelled" })
  db.createNotification({ id: `N-${Date.now()}-${Math.random()}`, userId: auth.userId, title: "Scheduled order cancelled", message: `${order.restaurantName} scheduled order was cancelled.`, type: "info", link: "/scheduled-orders", eventKey: `scheduled-cancelled:${id}`, read: false, deliveryStatus: "in-app", createdAt: new Date().toISOString() })
  return NextResponse.json({ success: true })
}
