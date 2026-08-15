import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { notificationPreferencesSchema } from "@/lib/featureValidation"
import { z } from "zod"

const preferencesSchema = notificationPreferencesSchema.extend({
  timezone: z.string().trim().min(1).max(64).optional(),
  personalizationOptOut: z.boolean().optional(),
})

export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const parsed = preferencesSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Invalid preferences" }, { status: 400 })
  const { timezone, personalizationOptOut, ...notificationPreferences } = parsed.data
  const user = db.updateUserPreferences(auth.userId, {
    notificationPreferences: { inApp: true, email: false, orderUpdates: true, promotions: true, ...notificationPreferences },
    timezone,
    personalizationOptOut,
  })
  return NextResponse.json({ success: true, notificationPreferences: user?.notificationPreferences, timezone: user?.timezone, personalizationOptOut: user?.personalizationOptOut })
}
