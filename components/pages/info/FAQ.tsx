"use client"
import { useState } from "react"
import { InfoPage } from "../../InfoPage"
import { ChevronDown, ChevronUp } from "lucide-react"

const faqs = [
  { q: "How do I place an order?", a: "Browse restaurants or dishes, tap 'Add to cart', then head to checkout. Choose a delivery address and payment method and confirm. Your order appears on the Orders page with live tracking." },
  { q: "How long does delivery take?", a: "Most orders arrive within 25–35 minutes in Delhi/NCR. The ETA shown at checkout and on your tracking page updates live based on the rider's position and traffic conditions." },
  { q: "How does live order tracking work?", a: "Once your order leaves the restaurant, a map appears showing the rider's position on the actual road route to your address. It refreshes every 15 seconds with an estimated time of arrival." },
  { q: "How do I use a coupon or offer?", a: "Visit the Offers page to see all current deals. At checkout, enter the code in the coupon field and tap 'Apply'. The discount is deducted instantly if your order meets the minimum order requirement." },
  { q: "Can I get a refund?", a: "Yes — for wrong, missing or quality-issue items reported within 30 minutes of delivery. Refunds to cards take 5–7 business days; wallet/UPI refunds are usually faster. See our Refund Policy for details." },
  { q: "How do ratings and reviews work?", a: "After delivery, tap 'Rate order' on your order card. You can rate the restaurant, specific dishes and the delivery experience. Reviews are visible to other customers." },
  { q: "Can I save multiple addresses?", a: "Yes. Go to Settings → Addresses to add and manage several delivery locations. You can switch between them in one tap at checkout." },
  { q: "What payment methods do you accept?", a: "Credit/debit cards, UPI, net banking, popular wallets, and cash on delivery. All card transactions run through a PCI-DSS compliant gateway." },
  { q: "Can I cancel an order after placing it?", a: "You can cancel free of charge before the restaurant starts preparing. Once preparation has begun, a cancellation fee may apply to compensate the restaurant. Use the cancel option on your live order page." },
  { q: "When is customer support available?", a: "Our support team is online every day from 8 AM to midnight via the contact form on this site, and the help center is available 24/7." },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <InfoPage title="FAQ" subtitle="Quick answers to the most common questions">
      <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
        {faqs.map((f, i) => (
          <div key={f.q}>
            <button
              className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="font-medium">{f.q}</span>
              {open === i ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
            </button>
            {open === i && <div className="px-4 pb-4 text-sm text-muted-foreground">{f.a}</div>}
          </div>
        ))}
      </div>
    </InfoPage>
  )
}
