"use client"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Package, Star, Timer, RotateCcw, Ban, Search, Copy, Check } from "lucide-react"
import { StarRating } from "../StarRating"
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

const statusTabs = [
  { key: "all", label: "All" },
  { key: "preparing", label: "Preparing" },
  { key: "on-the-way", label: "On the way" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
]

export function Orders() {
  const navigate = useNavigate()
  const { isAuthenticated, user, addToCart, clearCart } = useStore()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [ratingFor, setRatingFor] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")

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

  // Reorder with current menu availability and prices instead of replaying stale order data.
  const handleReorder = async (order: any) => {
    try {
      const [fullOrder, restaurant] = await Promise.all([
        api.getOrderById(order.id),
        api.getRestaurantById(order.restaurantId),
      ])
      if (!fullOrder?.items || fullOrder.items.length === 0 || !restaurant) {
        toast.error("Could not load this order's current menu")
        return
      }

      const currentDishes = new Map((restaurant.dishes || []).map((dish: any) => [dish.id, dish]))
      const availableItems = fullOrder.items
        .map((item: any) => ({ item, dish: currentDishes.get(item.dishId) }))
        .filter(({ dish }: { dish: any }) => dish && dish.isOpen !== false)

      if (availableItems.length === 0) {
        toast.error("None of the items from this order are currently available")
        return
      }

      clearCart()
      for (const { item, dish } of availableItems) {
        addToCart({
          dishId: dish.id,
          name: dish.name,
          price: dish.price,
          image: dish.image || item.image || "",
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          isVeg: dish.isVeg,
        })
      }

      const skipped = fullOrder.items.length - availableItems.length
      toast.success(
        skipped > 0
          ? `${availableItems.length} item(s) reordered; ${skipped} unavailable item(s) skipped`
          : `Reordered ${availableItems.length} item(s) from ${restaurant.name}`,
      )
      navigate("/cart")
    } catch (err: any) {
      toast.error(err?.message || "Could not reorder this order")
    }
  }

  // Cancel: allowed before the rider is on the way. Once on-the-way, cancellation is locked.
  const handleCancel = async (orderId: string) => {
    try {
      await api.cancelOrder(orderId)
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o)))
      toast.success("Order cancelled")
    } catch (err: any) {
      toast.error(err?.message || "Could not cancel this order")
    }
  }

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

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by restaurant or order ID"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {statusTabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
              statusFilter === key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-4">No orders yet. Hungry?</p>
          <Button asChild>
            <Link to="/">Start ordering</Link>
          </Button>
        </div>
      ) : (
        <>
          {orders.filter(
            (order) =>
              (statusFilter === "all" || order.status === statusFilter) &&
              (!search ||
                order.restaurantName.toLowerCase().includes(search.toLowerCase()) ||
                order.id.toLowerCase().includes(search.toLowerCase())),
          ).length === 0 && (
            <div className="text-center py-12">
              <Package className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground text-sm">
                No orders match your filters. Try a different search or status.
              </p>
            </div>
          )}
        <div className="space-y-4">
          {orders
            .filter(
              (order) =>
                (statusFilter === "all" || order.status === statusFilter) &&
                (!search ||
                  order.restaurantName.toLowerCase().includes(search.toLowerCase()) ||
                  order.id.toLowerCase().includes(search.toLowerCase())),
            )
            .map((order) => (
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
                      {order.status === "preparing" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/40 hover:bg-destructive/5"
                          onClick={() => handleCancel(order.id)}
                        >
                          <Ban className="w-3.5 h-3.5" /> Cancel
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/order/${order.id}`}>View</Link>
                      </Button>
                      {order.status === "delivered" && (
                        <Button variant="outline" size="sm" onClick={() => handleReorder(order)}>
                          <RotateCcw className="w-3.5 h-3.5" /> Reorder
                        </Button>
                      )}
                    </div>
                  )}
                  {order.status === "delivered" && (
                    <>
                      {order.rating ? (
                        <span className="inline-flex items-center gap-1 text-sm">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-medium">{order.rating}</span>
                          <span className="text-muted-foreground">Rated</span>
                        </span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-accent-foreground"
                          onClick={() => setRatingFor(order.id)}
                        >
                          <Star className="w-3.5 h-3.5" /> Rate
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {order.review && ratingFor !== order.id && (
                <p className="text-sm text-muted-foreground border-t border-border pt-3 mt-3 italic">
                  “{order.review}”
                </p>
              )}

              {ratingFor === order.id && (
                <div className="mt-4 border-t border-border pt-4 space-y-3">
                  <StarRating value={rating} size={24} onChange={setRating} />
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
      </>
      )}
    </div>
  )
}
