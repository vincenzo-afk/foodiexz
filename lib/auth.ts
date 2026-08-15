import jwt from "jsonwebtoken"
import { NextRequest, NextResponse } from "next/server"
import { db, type UserRole } from "@/lib/db"

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

export async function requireRole(req: NextRequest, roles: UserRole[]): Promise<{ userId: string; role: UserRole } | NextResponse> {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const role = db.getUserRole(auth.userId)
  if (!roles.includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  return { ...auth, role }
}

export async function requireAdmin(req: NextRequest) {
  return requireRole(req, ["admin"])
}
