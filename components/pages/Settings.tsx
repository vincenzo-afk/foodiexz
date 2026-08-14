"use client"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Leaf, Shield, Bell, KeyRound } from "lucide-react"
import { useStore } from "../../store/useStore"
import { Button } from "../ui/button"
import { toast } from "sonner"

export function Settings() {
  const { user, isAuthenticated, updateProfile, setDietaryPreference } = useStore()
  const [dietary, setDietary] = useState<"all" | "veg" | "non-veg">("all")
  const [notifications, setNotifications] = useState(true)

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
      </div>
    </div>
  )
}
