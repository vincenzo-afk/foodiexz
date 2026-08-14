"use client"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Mail, Lock, User, Phone, UtensilsCrossed } from "lucide-react"
import { useStore } from "../../store/useStore"
import { Button } from "../ui/button"

export function Auth() {
  const navigate = useNavigate()
  const { login, signup, isAuthenticated } = useStore()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" })

  if (isAuthenticated) {
    navigate("/")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      let ok: boolean
      if (mode === "login") {
        ok = await login(form.email, form.password)
      } else {
        ok = await signup(form.name, form.email, form.password, form.phone)
      }
      if (ok) {
        const prev = (window as any).__authRedirect || "/"
        delete (window as any).__authRedirect
        navigate(prev)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-400px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-sm p-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="p-2 bg-primary/10 rounded-full">
            <UtensilsCrossed className="w-6 h-6 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-1">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-center text-sm text-muted-foreground mb-6">
          {mode === "login"
            ? "Sign in to continue ordering delicious food"
            : "Join FoodiezX and get ₹500 welcome bonus"}
        </p>

        <div className="flex bg-muted rounded-full p-1 mb-6">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
              mode === "login" ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
              mode === "signup" ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                required
                className="w-full border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm bg-background"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              required
              type="email"
              className="w-full border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm bg-background"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))}
            />
          </div>
          {mode === "signup" && (
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className="w-full border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm bg-background"
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => setForm((v) => ({ ...v, phone: e.target.value }))}
              />
            </div>
          )}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              required
              type="password"
              minLength={6}
              className="w-full border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm bg-background"
              placeholder="Password (min 6 characters)"
              value={form.password}
              onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))}
            />
          </div>
          <Button type="submit" size="lg" className="w-full rounded-full" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
