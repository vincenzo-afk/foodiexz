import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { restaurantId } = await params
  db.addFavorite(auth.userId, restaurantId)
  return NextResponse.json({ success: true })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> },
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { restaurantId } = await params
  db.removeFavorite(auth.userId, restaurantId)
  return NextResponse.json({ success: true })
}
