import { describe, expect, it } from "vitest"
import { createOrderSchema, couponValidationSchema, walletTopUpSchema } from "./validation"

describe("validation schemas", () => {
  it("accepts a valid order payload", () => {
    const result = createOrderSchema.safeParse({
      restaurantId: "1",
      restaurantName: "Spice Junction",
      total: 359,
      paymentMethod: "cod",
      deliveryAddress: { address: "Block 42, Connaught Place" },
      items: [{ dishId: "d1", name: "Chicken Biryani", price: 299, quantity: 1 }],
    })

    expect(result.success).toBe(true)
  })

  it("rejects empty carts and invalid payment methods", () => {
    const result = createOrderSchema.safeParse({
      restaurantId: "1",
      restaurantName: "Spice Junction",
      total: 359,
      paymentMethod: "bitcoin",
      deliveryAddress: { address: "Block 42" },
      items: [],
    })

    expect(result.success).toBe(false)
  })

  it("rejects wallet amounts above the per-request cap", () => {
    expect(walletTopUpSchema.safeParse({ amount: 10_001 }).success).toBe(false)
  })

  it("requires a non-negative numeric order total for coupon validation", () => {
    expect(couponValidationSchema.safeParse({ code: "FOODIE50", orderTotal: 199 }).success).toBe(true)
    expect(couponValidationSchema.safeParse({ code: "FOODIE50", orderTotal: -1 }).success).toBe(false)
  })
})
