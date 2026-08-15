import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { couponValidationSchema, validationError } from "@/lib/validation"

function isExpired(validTill: string) {
  if (!validTill) return false
  return new Date(`${validTill}T23:59:59.999Z`).getTime() < Date.now()
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const totalParam = url.searchParams.get("total")
  const parsedTotal = totalParam == null ? null : Number(totalParam)
  const orderTotal = parsedTotal != null && Number.isFinite(parsedTotal) && parsedTotal >= 0 ? parsedTotal : null

  const offers = db.getOffers().map((o) => {
    const expired = isExpired(o.validTill)
    if (orderTotal == null || expired) return { ...o, expired, canApply: false, discountAmount: 0 }
    const canApply = orderTotal >= o.minOrder
    let discountAmount = 0
    if (canApply) {
      if (o.discountPercent) {
        discountAmount = Math.min((orderTotal * o.discountPercent) / 100, o.maxDiscount)
      } else {
        discountAmount = o.maxDiscount
      }
    }
    return { ...o, expired, canApply, discountAmount: Math.round(discountAmount) }
  })

  return NextResponse.json(offers)
}

export async function POST(req: Request) {
  try {
    const parsed = couponValidationSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ valid: false, message: validationError(parsed.error) }, { status: 400 })
    }
    const { code, orderTotal } = parsed.data
    const offer = db.getOffers().find((o) => o.code.toUpperCase() === code.toUpperCase())
    if (!offer) {
      return NextResponse.json({ valid: false, message: "Invalid coupon code" })
    }
    if (isExpired(offer.validTill)) {
      return NextResponse.json({ valid: false, message: "This offer has expired" })
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
