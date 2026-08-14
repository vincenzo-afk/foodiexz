"use client"
import { useEffect, useState } from "react"
import { Tag, Copy, Check } from "lucide-react"
import { api } from "../../lib/api"
import { toast } from "sonner"

export function Offers() {
  const [offers, setOffers] = useState<any[]>([])
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
      toast.success(`Copied code: ${code}`)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <Tag className="w-6 h-6 text-primary" />
        Offers & Coupons
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Use these codes at checkout to save on your order.
      </p>

      <div className="space-y-4">
        {offers.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No offers available right now.</p>
        ) : (
          offers.map((offer) => (
            <div
              key={offer.id || offer.code}
              className="bg-card border border-dashed border-primary/40 rounded-xl p-5 flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-bold text-lg">{offer.code}</p>
                <p className="text-sm text-muted-foreground">{offer.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Min order ₹{offer.minOrder}
                  {offer.validTill ? ` • Valid till ${new Date(offer.validTill).toLocaleDateString()}` : ""}
                </p>
              </div>
              <button
                onClick={() => copyCode(offer.code)}
                className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors shrink-0"
              >
                {copied === offer.code ? (
                  <>
                    <Check className="w-4 h-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
