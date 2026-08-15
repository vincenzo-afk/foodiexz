"use client"
import { useEffect, useState } from "react"
import { Tag, Copy, Check, Gift, Truck, Percent, IndianRupee } from "lucide-react"
import { api } from "../../lib/api"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

interface Offer {
  id: string
  code: string
  description: string
  minOrder: number
  maxDiscount: number
  discountPercent: number | null
  validTill: string
  type?: string
  canApply?: boolean
  discountAmount?: number
  expired?: boolean
}

const typeMeta: Record<string, { icon: any; label: string; tone: string }> = {
  percent: { icon: Percent, label: "Percentage off", tone: "bg-primary/10 text-primary border-primary/20" },
  "free-delivery": { icon: Truck, label: "Free delivery", tone: "bg-accent/15 text-accent-foreground/80 border-accent/30" },
  flat: { icon: IndianRupee, label: "Flat discount", tone: "bg-secondary text-secondary-foreground border-border" },
}

function offerMeta(o: Offer) {
  if (o.type === "free-delivery") return typeMeta["free-delivery"]
  if (o.discountPercent) return typeMeta.percent
  return typeMeta.flat
}

export function Offers() {
  const navigate = useNavigate()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    api.getOffers().then((data) => {
      setOffers(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [])

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code)
      toast.success(`Code ${code} copied — apply it at checkout`)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
        <Tag className="w-6 h-6 text-primary" />
        Offers & Coupons
      </h1>
      <p className="text-muted-foreground mb-8 ml-8">
        Real deals, no gimmicks. Apply a code at checkout and the discount is deducted instantly.
      </p>

      {loading ? (
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      ) : offers.length === 0 ? (
        <div className="text-center border border-border rounded-xl p-12">
          <Gift className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="font-semibold">No offers available right now</p>
          <p className="text-sm text-muted-foreground mt-1">Check back soon — new deals land every week.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((o) => {
            const meta = offerMeta(o)
            const Icon = meta.icon
            return (
              <div
                key={o.id || o.code}
                className="border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 bg-card hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-11 h-11 rounded-lg border flex items-center justify-center shrink-0 ${meta.tone}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold tracking-wide">{o.code}</span>
                      <Badge variant="outline" className="text-[10px] uppercase">{o.expired ? "Expired" : meta.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{o.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Min order ₹{o.minOrder}{o.expired ? " · No longer available" : ""}
                      {o.validTill
                        ? ` · Valid till ${new Date(o.validTill).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                        : ""}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => copyCode(o.code)}
                  disabled={o.expired}
                >
                  {copied === o.code ? (
                    <>
                      <Check className="w-4 h-4" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy code
                    </>
                  )}
                </Button>
              </div>
            )
          })}
          <div className="border border-border rounded-xl p-5 bg-muted/40 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <p className="text-sm text-muted-foreground">
              Have a code in hand? Apply it at checkout or use it directly from your cart.
            </p>
            <Button variant="ghost" size="sm" onClick={() => navigate("/checkout")}>
              Go to checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
