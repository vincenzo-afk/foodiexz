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

  it("deduplicates notifications by user and event key", () => {
    const userId = `notification-user-${Date.now()}`
    const first = db.createNotification({ id: `N-${Date.now()}-1`, userId, title: "Order", message: "Preparing", type: "order", eventKey: "order-status-1", read: false, deliveryStatus: "in-app", createdAt: new Date().toISOString() })
    const second = db.createNotification({ id: `N-${Date.now()}-2`, userId, title: "Order", message: "Preparing again", type: "order", eventKey: "order-status-1", read: false, deliveryStatus: "in-app", createdAt: new Date().toISOString() })
    expect(second.id).toBe(first.id)
    expect(db.getUnreadNotificationCount(userId)).toBe(1)
  })

  it("finds due scheduled orders", () => {
    const userId = `scheduled-user-${Date.now()}`
    const order = db.createScheduledOrder({ id: `SCH-${Date.now()}`, userId, restaurantId: "1", restaurantName: "Spice Junction", items: [], total: 100, paymentMethod: "cod", deliveryAddress: "{}", scheduledFor: new Date(Date.now() - 1_000).toISOString(), timezone: "Asia/Kolkata", cutoffAt: new Date(Date.now() - 60_000).toISOString(), status: "scheduled", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    expect(db.getDueScheduledOrders().some((item) => item.id === order.id)).toBe(true)
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
