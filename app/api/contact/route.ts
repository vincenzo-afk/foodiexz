import { NextResponse } from "next/server"
import { contactSchema, validationError } from "@/lib/validation"

// In-memory contact inbox (demo environment; serverless instance lifetime).
const messages: { name: string; email: string; message: string; receivedAt: string }[] = []

export async function POST(req: Request) {
  try {
    const parsed = contactSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 })
    }
    const { name, email, message } = parsed.data
    messages.push({ name, email: email.toLowerCase(), message, receivedAt: new Date().toISOString() })
    return NextResponse.json({ success: true, message: "Thanks — we will get back to you within 24 hours." })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to send message" }, { status: 400 })
  }
}
