import bcryptjs from "bcryptjs"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { signToken } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, phone } = body
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (db.getUserByEmail(email)) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }
    const hashedPassword = await bcryptjs.hash(password, 10)
    const userId = "USER" + Date.now()
    db.createUser({
      id: userId,
      name,
      email,
      password: hashedPassword,
      phone,
      dietaryPreference: "all",
      wallet: 500,
      createdAt: new Date().toISOString(),
    })
    const token = signToken(userId)
    return NextResponse.json({
      token,
      user: { id: userId, name, email, phone, wallet: 500, addresses: [], dietaryPreference: "all" },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Signup failed" }, { status: 400 })
  }
}
