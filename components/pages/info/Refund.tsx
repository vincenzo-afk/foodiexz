"use client"
import { InfoPage } from "../../InfoPage"
import { Link } from "react-router-dom"

export function Refund() {
  return (
    <InfoPage
      title="Refund Policy"
      subtitle="Last updated: August 14, 2026"
    >
      <h2>1. When you're eligible for a refund</h2>
      <p>
        You can request a refund or redelivery if your order arrives with wrong, missing or
        spoiled items, if an item is significantly different from its listing, or if the order
        never reaches you. Requests must be raised within 30 minutes of the scheduled delivery
        time via the "Report an issue" option on your order page, or by contacting support.
      </p>

      <h2>2. Refund timelines</h2>
      <p>
        Approved refunds are processed as follows: wallet and UPI refunds are credited within
        1–3 business days; card refunds take 5–7 business days depending on your bank; cash
        payments are refunded to your FoodiezX wallet or a bank account you nominate.
      </p>

      <h2>3. Partial refunds</h2>
      <p>
        If only part of your order is affected, we refund the value of the affected item(s)
        along with the proportional share of delivery fee and taxes. The remainder of your
        order is not refunded.
      </p>

      <h2>4. What is not refundable</h2>
      <p>
        We cannot refund orders that were correctly prepared and delivered as ordered, orders
        cancelled after preparation had begun (a cancellation fee may apply to compensate the
        restaurant), or claims raised after the 30-minute reporting window, except in cases of
        genuine health and safety concerns.
      </p>

      <h2>5. How to request a refund</h2>
      <p>
        Open <Link to="/orders">your order</Link>, tap "Report an issue", choose the affected
        items and submit. You can also raise a request through the{" "}
        <Link to="/contact">contact form</Link> — include your order number, the items affected
        and, where helpful, a photo. Our team reviews every request and responds within one
        business day.
      </p>

      <p>
        Questions? Visit the <Link to="/help">help center</Link> or{" "}
        <Link to="/contact">contact us</Link>.
      </p>
    </InfoPage>
  )
}
