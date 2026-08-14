"use client"
import { useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"
import dynamic from "next/dynamic"
import { CheckCircle2, Circle, Timer, Bike, Home, ArrowLeft, Navigation, MapPin } from "lucide-react"
import { api } from "../../lib/api"
import { Button } from "../ui/button"
import { Confetti } from "../Confetti"

// SSR-hostile Leaflet map — never rendered on the server.
const OrderMap = dynamic(() => import("../Map").then((m) => m.Map), { ssr: false })

interface TrackingSnapshot {
  orderId: string
  status: string
  statusHistory: { status: string; at: number }[]
  restaurant: { name: string; lat: number; lng: number; address: string }
  delivery: { address: string; lat: number; lng: number }
  rider: { lat: number; lng: number } | null
  progress: number
  distanceKm: number
  etaMinutes: number
  route: { lat: number; lng: number }[] | null
  createdAt: string
}

const steps = [
  { key: "preparing", label: "Preparing your order", icon: Timer, sub: "The restaurant is cooking your food" },
  { key: "on-the-way", label: "On the way", icon: Bike, sub: "Your rider has picked up the order" },
  { key: "delivered", label: "Delivered", icon: Home, sub: "Enjoy your meal!" },
]

function ETA_ring({ progress, eta }: { progress: number; eta: number }) {
  const r = 26
  const c = 2 * Math.PI * r
  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg viewBox="0 0 64 64" className="h-20 w-20 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--muted)" strokeWidth="5" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold leading-none">{eta} min</span>
        <span className="text-[10px] text-muted-foreground">ETA</span>
      </div>
    </div>
  )
}

export function OrderTracking() {
  const { id } = useParams<{ id: string }>()
  const [tracking, setTracking] = useState<TrackingSnapshot | null>(null)
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!id) return

    const refresh = () => {
      api.getOrderTracking(id).then((data: any) => {
        if (data && !data.error) {
          setTracking(data)
          setOrder((prev: any) => prev)
          if (data.status === "delivered") {
            setShowConfetti(true)
            if (pollingRef.current) clearInterval(pollingRef.current)
          }
        }
        setLoading(false)
      })
    }

    refresh()
    pollingRef.current = setInterval(refresh, 5000)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!tracking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h1 className="text-2xl font-bold mb-2">Order not found</h1>
        <p className="text-muted-foreground mb-6">We couldn't find this order.</p>
        <Button asChild>
          <Link to="/orders">View all orders</Link>
        </Button>
      </div>
    )
  }

  const currentIdx = steps.findIndex((s) => s.key === tracking.status)
  const isCancelled = tracking.status === "cancelled"

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {showConfetti && <Confetti />}
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <Link to="/orders" className="p-1 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        Order Tracking
      </h1>
      <p className="text-sm text-muted-foreground mb-6">Order #{tracking.orderId}</p>

      {isCancelled ? (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-8 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-destructive" />
          <h2 className="text-xl font-bold mb-2">Order Cancelled</h2>
          <p className="text-muted-foreground mb-6">This order was cancelled.</p>
          <Button asChild>
            <Link to="/">Order something else</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Live map */}
          <div className="mb-6">
            <OrderMap
              data={{
                route: tracking.route,
                restaurant: tracking.restaurant
                  ? { lat: tracking.restaurant.lat, lng: tracking.restaurant.lng, name: tracking.restaurant.name }
                  : null,
                delivery: tracking.delivery
                  ? { lat: tracking.delivery.lat, lng: tracking.delivery.lng, address: tracking.delivery.address }
                  : null,
                rider: tracking.rider,
                status: tracking.status,
              }}
            />
          </div>

          {/* ETA + progress strip */}
          <div className="bg-card border border-border rounded-xl p-5 mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <ETA_ring progress={tracking.progress} eta={tracking.etaMinutes} />
              <div>
                <p className="font-semibold flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-primary" />
                  {tracking.status === "on-the-way"
                    ? "Rider is on the way"
                    : tracking.status === "delivered"
                      ? "Order delivered"
                      : "Restaurant is preparing"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {Math.round(tracking.progress * 100)}% of the journey complete •{" "}
                  {tracking.distanceKm} km to cover
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-medium bg-accent/15 text-accent-foreground">
              Live tracking
            </span>
          </div>

          {/* Progress timeline */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="space-y-6">
              {steps.map((step, idx) => {
                const Icon = step.icon
                const done = idx < currentIdx || tracking.status === step.key
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
                        {done && !active ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>
                      {idx < steps.length - 1 && (
                        <div
                          className={`w-0.5 h-10 ${idx < currentIdx ? "bg-green-500" : "bg-border"}`}
                        />
                      )}
                    </div>
                    <div className="pt-1">
                      <h3 className={`font-semibold ${done ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">{step.sub}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Your rider's location refreshes automatically every 5 seconds.
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
