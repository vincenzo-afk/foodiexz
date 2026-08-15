import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { CalendarClock, Clock3, MapPin, XCircle } from "lucide-react"
import { api } from "../../lib/api"
import { useStore } from "../../store/useStore"
import { Button } from "../ui/button"
import { toast } from "sonner"

interface ScheduledOrder {
  id: string
  restaurantName: string
  total: number
  scheduledFor: string
  cutoffAt: string
  status: "scheduled" | "ready" | "failed" | "cancelled"
  failureReason?: string
}

const localDateTime = (minutesFromNow: number) => {
  const date = new Date(Date.now() + minutesFromNow * 60_000)
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16)
}

export function ScheduledOrders() {
  const { user, isAuthenticated, cart, getCartTotal } = useStore()
  const [orders, setOrders] = useState<ScheduledOrder[]>([])
  const [scheduledFor, setScheduledFor] = useState(localDateTime(60))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const selectedAddress = user?.addresses.find((address) => address.isDefault) || user?.addresses[0]
  const restaurantIds = [...new Set(cart.map((item) => item.restaurantId))]
  const canScheduleCart = cart.length > 0 && restaurantIds.length === 1 && Boolean(selectedAddress)
  const total = useMemo(() => {
    const subtotal = getCartTotal()
    return Math.max(0, subtotal + (subtotal >= 199 ? 0 : 25) + Math.round(subtotal * 0.05))
  }, [getCartTotal, cart])

  const load = async () => {
    try {
      const response = await api.getScheduledOrders()
      setOrders(Array.isArray(response) ? response : [])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load scheduled orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) void load()
    else setLoading(false)
  }, [isAuthenticated])

  const scheduleCart = async () => {
    if (!canScheduleCart || !selectedAddress) {
      toast.error("Add a default address and keep one restaurant in your cart to schedule an order")
      return
    }
    setSaving(true)
    try {
      const restaurantId = restaurantIds[0]
      const created = await api.createScheduledOrder({
        restaurantId,
        items: cart,
        total,
        paymentMethod: "cod",
        deliveryAddress: selectedAddress,
        scheduledFor: new Date(scheduledFor).toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      setOrders((current) => [created, ...current])
      toast.success("Scheduled order created")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to schedule order")
    } finally {
      setSaving(false)
    }
  }

  const cancel = async (id: string) => {
    try {
      await api.cancelScheduledOrder(id)
      setOrders((current) => current.map((order) => order.id === id ? { ...order, status: "cancelled" } : order))
      toast.success("Scheduled order cancelled")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to cancel scheduled order")
    }
  }

  if (!isAuthenticated) return <div className="max-w-2xl mx-auto px-4 py-16 text-center"><CalendarClock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" /><h1 className="text-2xl font-bold mb-2">Please sign in</h1><p className="text-muted-foreground mb-6">Schedule future deliveries after signing in.</p><Button asChild><Link to="/auth">Sign in</Link></Button></div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div><h1 className="text-3xl font-bold flex items-center gap-2"><CalendarClock className="w-7 h-7 text-primary" /> Scheduled orders</h1><p className="text-muted-foreground mt-2">Plan a delivery ahead of time. We re-check the menu at the cutoff window.</p></div>

      <section className="bg-card border border-border rounded-xl p-5 space-y-4"><h2 className="font-bold">Schedule your current cart</h2><p className="text-sm text-muted-foreground">{canScheduleCart ? `${cart.length} item(s) · ₹${total}` : "Use one restaurant, a default address, and at least one cart item."}</p><label className="block text-sm font-medium">Delivery date and time<input type="datetime-local" min={localDateTime(15)} value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} className="mt-2 w-full border border-border rounded-lg bg-background px-3 py-2" /></label>{selectedAddress && <p className="text-sm text-muted-foreground flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-primary" />{selectedAddress.address}</p>}<Button onClick={() => void scheduleCart()} disabled={!canScheduleCart || saving}>{saving ? "Scheduling…" : "Schedule order"}</Button></section>

      <section className="space-y-3"><h2 className="font-bold">Your scheduled deliveries</h2>{loading ? <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /> : orders.length === 0 ? <div className="border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground">No scheduled orders yet.</div> : orders.map((order) => <div key={order.id} className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><p className="font-semibold">{order.restaurantName}</p><p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Clock3 className="w-4 h-4" />{new Date(order.scheduledFor).toLocaleString("en-IN")}</p><p className="text-xs text-muted-foreground mt-1">₹{order.total} · {order.status}{order.failureReason ? ` · ${order.failureReason}` : ""}</p></div>{order.status === "scheduled" && <Button variant="outline" size="sm" onClick={() => void cancel(order.id)}><XCircle className="w-4 h-4" /> Cancel</Button>}</div>)}</section>
    </div>
  )
}
