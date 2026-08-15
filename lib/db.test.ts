import { describe, expect, it } from "vitest"
import { db, haversine, progressForOrder } from "./db"

describe("tracking helpers", () => {
  it("calculates zero distance for the same coordinate", () => {
    expect(haversine({ lat: 28.6139, lng: 77.209 }, { lat: 28.6139, lng: 77.209 })).toBe(0)
  })

  it("clamps progress for orders created in the future", () => {
    const progress = progressForOrder({
      id: "future",
      userId: "user",
      restaurantId: "1",
      restaurantName: "Spice Junction",
      total: 100,
      paymentMethod: "cod",
      deliveryAddress: "{}",
      status: "preparing",
      statusHistory: [],
      createdAt: new Date(Date.now() + 60_000).toISOString(),
    })

    expect(progress).toBe(0)
  })

  it("finds an order by user-scoped idempotency key", () => {
    const orderId = `TEST-${Date.now()}`
    db.createOrder(
      {
        id: orderId,
        userId: "test-user",
        restaurantId: "1",
        restaurantName: "Spice Junction",
        total: 100,
        paymentMethod: "cod",
        deliveryAddress: "{}",
        status: "preparing",
        statusHistory: [{ status: "preparing", at: Date.now() }],
        createdAt: new Date().toISOString(),
        idempotencyKey: `idem-${Date.now()}`,
      },
      [],
    )

    const order = db.getOrderById(orderId)
    expect(order).toBeDefined()
    expect(db.getOrderByIdempotencyKey("test-user", order!.idempotencyKey!)).toEqual(order)
  })
})
