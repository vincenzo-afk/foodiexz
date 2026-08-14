"use client"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Package, Star, Timer } from "lucide-react"
import { api } from "../../lib/api"
import { useStore } from "../../store/useStore"
import { Button } from "../ui/button"
import { toast } from "sonner"

const statusColors: Record<string, string> = {
  preparing: "bg-secondary text-secondary-foreground",
  "on-the-way": "bg-primary/10 text-primary",
  delivered: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-destructive/10 text-destructive",
}

export function Orders() {
  const { isAuthenticated, user } = useStore()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [ratingFor, setRatingFor] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState("")

  useEffect(() => {
    if (isAuthenticated) {
      api.getOrders().then((data) => {
        setOrders(Array.isArray(data) ? data : [])
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const handleRate = async (orderId: string) => {
    try {
      await api.submitReview(orderId, rating, review)
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, rating, review } : o)),
      )
      setRatingFor(null)
      setReview("")
      toast.success("Thanks for your review!")
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit review")
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h1 className="text-2xl font-bold mb-2">Please sign in</h1>
        <p className="text-muted-foreground mb-6">View your order history by logging in.</p>
        <Button asChild>
          <Link to="/auth">Sign in</Link>
        </Button>
      </div>
    )
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
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-4">No orders yet. Hungry?</p>
          <Button asChild>
            <Link to="/">Start ordering</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{order.restaurantName}</h3>
                  <p className="text-xs text-muted-foreground">
                    Order #{order.id} • {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    statusColors[order.status] || "bg-muted text-muted-foreground"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <ul className="text-sm space-y-1 mb-3">
                {(order.items || []).map((item: any, idx: number) => (
                  <li key={idx} className="flex justify-between text-muted-foreground">
                    <span>
                      {item.quantity} × {item.name}
                    </span>
                    <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="font-bold">Total: ₹{order.total}</span>
                <div className="flex items-center gap-2">
                  {order.status === "preparing" || order.status === "on-the-way" ? (
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Timer className="w-3.5 h-3.5 text-primary" /> {order.etaMinutes ?? 5} min
                      </span>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/order/${order.id}`}>Track</Link>
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/order/${order.id}`}>View</Link>
                    </Button>
                  )}
                  {order.status === "delivered" && !order.rating && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-accent-foreground"
                      onClick={() => setRatingFor(order.id)}
                    >
                      <Star className="w-3.5 h-3.5" /> Rate
                    </Button>
                  )}
                </div>
              </div>

              {ratingFor === order.id && (
                <div className="mt-4 border-t border-border pt-4 space-y-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setRating(n)}>
                        <Star
                          className={`w-6 h-6 ${
                            n <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <input
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                    placeholder="Write a review (optional)"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleRate(order.id)}>
                      Submit review
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setRatingFor(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
