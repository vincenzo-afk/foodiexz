import jwt from "jsonwebtoken"
import { NextRequest, NextResponse } from "next/server"

export const JWT_SECRET =
  (typeof process !== "undefined" && process.env.JWT_SECRET) || "foodiezx-dev-secret"

export function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" })
}

export function decodeToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return { userId: (decoded as any).userId }
  } catch {
    return null
  }
}

export function unauthorized(message = "No token"): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 })
}

export async function requireAuth(req: NextRequest): Promise<{ userId: string } | NextResponse> {
  const header = req.headers.get("authorization")
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null
  if (!token) return unauthorized("No token")
  const decoded = decodeToken(token)
  if (!decoded) return unauthorized("Invalid token")
  return decoded
}
