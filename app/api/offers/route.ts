import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  return NextResponse.json(db.getOffers())
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { code, orderTotal } = body
    const offer = db.getOffers().find((o) => o.code.toUpperCase() === (code || "").toUpperCase())
    if (!offer) {
      return NextResponse.json({ valid: false, message: "Invalid coupon code" })
    }
    if (orderTotal < offer.minOrder) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order of \u20b9${offer.minOrder} required`,
      })
    }
    let discount = 0
    if (offer.discountPercent) {
      discount = Math.min((orderTotal * offer.discountPercent) / 100, offer.maxDiscount)
    } else {
      discount = offer.maxDiscount
    }
    return NextResponse.json({
      valid: true,
      discount: Math.round(discount),
      message: `\u20b9${Math.round(discount)} saved!`,
    })
  } catch (err: any) {
    return NextResponse.json({ valid: false, message: "Error validating coupon" }, { status: 500 })
  }
}
