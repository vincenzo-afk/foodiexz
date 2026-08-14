"use client"
import { Link } from "react-router-dom"
import {
  User,
  MapPin,
  Package,
  Heart,
  Gift,
  Settings,
  LogOut,
  Wallet,
  ArrowRight,
} from "lucide-react"
import { useStore } from "../../store/useStore"
import { Button } from "../ui/button"

export function Profile() {
  const { user, isAuthenticated, logout, favorites, orders } = useStore()

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h1 className="text-2xl font-bold mb-2">Please sign in</h1>
        <p className="text-muted-foreground mb-6">View your profile by logging in.</p>
        <Button asChild>
          <Link to="/auth">Sign in</Link>
        </Button>
      </div>
    )
  }

  const menu = [
    { icon: Package, label: "My Orders", desc: `${orders.length} orders`, href: "/orders" },
    { icon: MapPin, label: "Saved Addresses", desc: `${user.addresses?.length || 0} addresses`, href: "/addresses" },
    { icon: Heart, label: "Favorites", desc: `${favorites.length} restaurants`, href: "/favorites" },
    { icon: Gift, label: "Offers", desc: "Exclusive deals", href: "/offers" },
    { icon: Wallet, label: "Wallet", desc: `₹${user.wallet} balance`, href: "/settings" },
    { icon: Settings, label: "Settings", desc: "Preferences & more", href: "/settings" },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-6 text-primary-foreground mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <span className="text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold">{user.name}</h1>
            <p className="text-primary-foreground/80 text-sm">{user.email}</p>
            <div className="flex items-center gap-1 mt-1 text-sm">
              <Wallet className="w-4 h-4" />
              <span>₹{user.wallet} wallet balance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {menu.map(({ icon: Icon, label, desc, href }) => (
          <Link
            key={label}
            to={href}
            className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="p-2 bg-primary/10 rounded-full">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <Button
        variant="outline"
        className="w-full mt-6 text-destructive border-destructive/40 hover:bg-destructive/10"
        onClick={() => {
          logout()
          window.location.href = "/"
        }}
      >
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </div>
  )
}
