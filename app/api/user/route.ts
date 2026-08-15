import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth, signToken } from "@/lib/auth"

export async function GET(req: Request) {
  const auth = await requireAuth(req as any)
  if (auth instanceof NextResponse) return auth
  const user = db.getUserById(auth.userId)
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  const addresses = db.getAddressesByUser(user.id)
  return NextResponse.json({
    token: signToken(user.id),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      wallet: user.wallet,
      addresses,
      dietaryPreference: user.dietaryPreference,
      role: user.role,
      memberships: db.getRestaurantMemberships(user.id),
      unreadNotifications: db.getUnreadNotificationCount(user.id),
      notificationPreferences: user.notificationPreferences,
      timezone: user.timezone,
      personalizationOptOut: user.personalizationOptOut,
    },
  })
}
