import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dish = db.getDishById(id)
  if (!dish) return NextResponse.json({ error: "Dish not found" }, { status: 404 })
  return NextResponse.json(dish)
}
