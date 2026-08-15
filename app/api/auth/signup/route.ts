import bcryptjs from "bcryptjs"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { signToken } from "@/lib/auth"
import { signUpSchema, validationError } from "@/lib/validation"

export async function POST(req: Request) {
  try {
    const parsed = signUpSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 })
    }
    const { name, email, password, phone } = parsed.data
    const normalizedEmail = email.toLowerCase()
    const role = process.env.ADMIN_EMAIL?.toLowerCase() === normalizedEmail ? "admin" : "user"
    if (db.getUserByEmail(normalizedEmail)) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }
    const hashedPassword = await bcryptjs.hash(password, 10)
    const userId = "USER" + Date.now()
    db.createUser({
      id: userId,
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      dietaryPreference: "all",
      wallet: 500,
      createdAt: new Date().toISOString(),
      role,
    })
    const token = signToken(userId)
    return NextResponse.json({
      token,
      user: { id: userId, name, email: normalizedEmail, phone, wallet: 500, addresses: [], dietaryPreference: "all", role, notificationPreferences: { inApp: true, email: false, orderUpdates: true, promotions: true }, timezone: "Asia/Kolkata", personalizationOptOut: false },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Signup failed" }, { status: 400 })
  }
}
