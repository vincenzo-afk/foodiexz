import bcryptjs from "bcryptjs"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { signToken } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body
    const user = db.getUserByEmail(email)
    if (!user || !(await bcryptjs.compare(password, user.password))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }
    const token = signToken(user.id)
    const addresses = db.getAddressesByUser(user.id)
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        wallet: user.wallet,
        addresses,
        dietaryPreference: user.dietaryPreference,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Login failed" }, { status: 400 })
  }
}
