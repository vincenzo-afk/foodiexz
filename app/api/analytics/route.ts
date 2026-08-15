import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { analyticsEventSchema } from "@/lib/featureValidation"

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  const userId = auth instanceof NextResponse ? undefined : auth.userId
  const parsed = analyticsEventSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Invalid analytics event" }, { status: 400 })
  db.recordAnalyticsEvent({
    id: `AE-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: parsed.data.name,
    userId,
    restaurantId: parsed.data.restaurantId,
    sessionId: parsed.data.sessionId,
    properties: parsed.data.properties,
    createdAt: new Date().toISOString(),
  })
  return NextResponse.json({ accepted: true })
}
