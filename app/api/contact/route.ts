import { NextResponse } from "next/server"

// In-memory contact inbox (demo environment; serverless instance lifetime).
const messages: { name: string; email: string; message: string; receivedAt: string }[] = []

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, message } = body
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email and message are required" }, { status: 400 })
    }
    messages.push({ name, email, message, receivedAt: new Date().toISOString() })
    return NextResponse.json({ success: true, message: "Thanks — we will get back to you within 24 hours." })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to send message" }, { status: 400 })
  }
}
