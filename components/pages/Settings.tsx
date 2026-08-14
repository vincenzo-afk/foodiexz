"use client"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Leaf, Shield, Bell, KeyRound, Wallet } from "lucide-react"
import api from "../../lib/api"
import { useStore } from "../../store/useStore"
import { Button } from "../ui/button"
import { toast } from "sonner"

export function Settings() {
  const { user, isAuthenticated, updateProfile, setDietaryPreference, syncWallet } = useStore()
  const [dietary, setDietary] = useState<"all" | "veg" | "non-veg">("all")
  const [notifications, setNotifications] = useState(true)
  const [customAmount, setCustomAmount] = useState("")
  const [toppingUp, setToppingUp] = useState(false)

  useEffect(() => {
    if (user?.dietaryPreference) setDietary(user.dietaryPreference)
  }, [user])

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h1 className="text-2xl font-bold mb-2">Please sign in</h1>
        <p className="text-muted-foreground mb-6">Manage your settings by logging in.</p>
        <Button asChild>
          <Link to="/auth">Sign in</Link>
        </Button>
      </div>
    )
  }

  const handleDietaryChange = (value: "all" | "veg" | "non-veg") => {
    setDietary(value)
    setDietaryPreference(value)
    toast.success(`Dietary preference set to ${value}`)
  }

  const handleTopUp = async (amount: number) => {
    if (!user || toppingUp) return
    if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) {
      toast.error("Please enter a valid top-up amount (max ₹1,00,000)")
      return
    }
    setToppingUp(true)
    try {
      const res = await api.topUpWallet(Math.round(amount))
      const newBalance = (res as any)?.wallet ?? (res as any)?.balance ?? user.wallet
      updateProfile({ wallet: newBalance })
      toast.success(`₹${amount} added to your wallet`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Top-up failed")
    } finally {
      setToppingUp(false)
      void syncWallet()
      setCustomAmount("")
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Link to="/profile" className="p-1 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        Settings
      </h1>

      <div className="space-y-6">
        {/* Dietary preference */}
        <section className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="w-5 h-5 text-primary" />
            <h2 className="font-bold">Dietary Preference</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Filter restaurants based on your dietary preference.
          </p>
          <div className="flex gap-2">
            {(
              [
                { value: "all", label: "All" },
                { value: "veg", label: "Vegetarian" },
                { value: "non-veg", label: "Non-vegetarian" },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleDietaryChange(value)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  dietary === value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:border-primary/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-bold">Notifications</h2>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Receive updates about orders, offers, and more.
            </p>
            <button
              onClick={() => {
                setNotifications((v) => !v)
                toast.success(notifications ? "Notifications turned off" : "Notifications turned on")
              }}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                notifications ? "bg-green-500" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  notifications ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </section>

        {/* Security */}
        <section className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <KeyRound className="w-5 h-5 text-primary" />
            <h2 className="font-bold">Security</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Your account is protected with email & password authentication.
          </p>
          <div className="text-sm space-y-1.5 text-muted-foreground">
            <p>
              Signed in as <span className="text-foreground font-medium">{user.email}</span>
            </p>
            <p>Account created: {new Date().toLocaleDateString()}</p>
          </div>
        </section>

        {/* Profile info */}
        <section className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-bold mb-3">Profile Information</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Name</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Phone</p>
              <p className="font-medium">{user.phone || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Wallet</p>
              <p className="font-medium">₹{user.wallet}</p>
            </div>
          </div>
        </section>

        {/* Wallet */}
        <section className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-5 h-5 text-primary" />
            <h2 className="font-bold">FoodiezX Wallet</h2>
          </div>
          <div className="flex items-center justify-between bg-muted rounded-lg px-4 py-3 mb-4">
            <span className="text-sm text-muted-foreground">Current balance</span>
            <span className="text-xl font-bold text-primary">₹{user.wallet}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Top up your wallet and pay instantly at checkout with zero payment fees.
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {[100, 200, 500].map((amt) => (
              <button
                key={amt}
                disabled={toppingUp}
                onClick={() => void handleTopUp(amt)}
                className="px-5 py-2 rounded-full text-sm font-semibold border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
              >
                + ₹{amt}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              min={10}
              max={100000}
              value={customAmount}
              disabled={toppingUp}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Other amount"
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-50"
            />
            <Button
              disabled={toppingUp || !customAmount}
              onClick={() => void handleTopUp(Number(customAmount))}
            >
              {toppingUp ? "Adding…" : "Add money"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
