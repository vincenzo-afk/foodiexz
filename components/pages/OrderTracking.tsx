"use client"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { CheckCircle2, Circle, Package, Timer, Bike, Home, ArrowLeft } from "lucide-react"
import { api } from "../../lib/api"
import { Button } from "../ui/button"
import { Confetti } from "../Confetti"

const steps = [
  { key: "preparing", label: "Preparing your order", icon: Timer, sub: "The restaurant is cooking your food" },
  { key: "on-the-way", label: "On the way", icon: Bike, sub: "Your rider has picked up the order" },
  { key: "delivered", label: "Delivered", icon: Home, sub: "Enjoy your meal!" },
]

export function OrderTracking() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (id) {
      api.getOrderById(id).then((data) => {
        if (data) {
          setOrder(data)
          if (data.status === "delivered") setShowConfetti(true)
        }
        setLoading(false)
      })
    }
  }, [id])

  useEffect(() => {
    if (!id || !order) return
    // Poll status every 10 seconds
    const timer = setInterval(() => {
      api.getOrderStatus(id).then((status) => {
        if (status?.status) {
          setOrder((prev: any) => ({ ...prev, status: status.status }))
          if (status.status === "delivered") setShowConfetti(true)
        }
      })
    }, 10000)
    return () => clearInterval(timer)
  }, [id, order])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h1 className="text-2xl font-bold mb-2">Order not found</h1>
        <p className="text-muted-foreground mb-6">We couldn't find this order.</p>
        <Button asChild>
          <Link to="/orders">View all orders</Link>
        </Button>
      </div>
    )
  }

  const currentIdx = steps.findIndex((s) => s.key === order.status)
  const isCancelled = order.status === "cancelled"

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {showConfetti && <Confetti />}
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <Link to="/orders" className="p-1 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        Order Tracking
      </h1>
      <p className="text-sm text-muted-foreground mb-8">Order #{order.id}</p>

      {isCancelled ? (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-8 text-center">
          <Package className="w-12 h-12 mx-auto mb-3 text-destructive" />
          <h2 className="text-xl font-bold mb-2">Order Cancelled</h2>
          <p className="text-muted-foreground mb-6">This order was cancelled.</p>
          <Button asChild>
            <Link to="/">Order something else</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Progress timeline */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="space-y-6">
              {steps.map((step, idx) => {
                const Icon = step.icon
                const done = idx < currentIdx || order.status === step.key
                const active = idx === currentIdx
                return (
                  <div key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`p-2 rounded-full border-2 ${
                          done
                            ? active
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-green-500 bg-green-500 text-white"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {done && !active ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      {idx < steps.length - 1 && (
                        <div
                          className={`w-0.5 h-10 ${idx < currentIdx ? "bg-green-500" : "bg-border"}`}
                        />
                      )}
                    </div>
                    <div className="pt-1">
                      <h3
                        className={`font-semibold ${
                          done ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">{step.sub}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Order summary */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-bold mb-3">Order Summary</h2>
            <p className="text-sm font-medium mb-2">{order.restaurantName}</p>
            <ul className="text-sm space-y-1 mb-4">
              {(order.items || []).map((item: any, idx: number) => (
                <li key={idx} className="flex justify-between text-muted-foreground">
                  <span>
                    {item.quantity} × {item.name}
                  </span>
                  <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between font-bold border-t border-border pt-3">
              <span>Total Paid</span>
              <span>₹{order.total}</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Status refreshes automatically every 10 seconds.
            </p>
            <Button variant="outline" asChild>
              <Link to="/orders">Back to Orders</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
