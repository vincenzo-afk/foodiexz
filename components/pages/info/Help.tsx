"use client"
import { InfoPage } from "../../InfoPage"
import { Link } from "react-router-dom"
import { ShoppingCart, CreditCard, Bike, RotateCcw, MapPin, Star } from "lucide-react"

const topics = [
  { icon: ShoppingCart, title: "Placing an order", body: "Browse restaurants, add dishes to your cart, pick a payment method and checkout. You can track your order live from the Orders page." },
  { icon: CreditCard, title: "Payments", body: "We accept cards, UPI, net banking, wallets and cash on delivery. All card payments are processed by a PCI-DSS compliant gateway." },
  { icon: Bike, title: "Delivery", body: "Most orders arrive within 25–35 minutes. Live map tracking shows your rider's position from the moment food leaves the restaurant." },
  { icon: RotateCcw, title: "Returns & refunds", body: "Wrong item or a quality issue? Report it within 30 minutes of delivery from your order detail page and we'll refund or redeliver." },
  { icon: MapPin, title: "Addresses", body: "Save multiple delivery addresses in Settings → Addresses and switch between them at checkout in one tap." },
  { icon: Star, title: "Ratings & reviews", body: "Rate your order after delivery. Your reviews help other customers choose and help restaurants improve." },
]

export function Help() {
  return (
    <InfoPage title="Help Center" subtitle="Everything you need to know, in one place">
      <div className="grid sm:grid-cols-2 gap-4">
        {topics.map((t) => (
          <div key={t.title} className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <t.icon className="w-4 h-4 text-primary" />
              <p className="font-semibold">{t.title}</p>
            </div>
            <p className="text-sm text-muted-foreground">{t.body}</p>
          </div>
        ))}
      </div>
      <h2>Still need help?</h2>
      <p>
        Our support team is online daily from 8 AM to midnight. Reach us through the{" "}
        <Link to="/contact">contact form</Link>, or read our <Link to="/faq">frequently asked questions</Link>
        {" "}for instant answers.
      </p>
    </InfoPage>
  )
}
