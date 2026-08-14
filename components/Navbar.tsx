"use client"

import { Search, ShoppingCart, User, Heart, MapPin, Menu, X } from "lucide-react"
import { useState } from "react"
import { useStore } from "../store/useStore"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { NotificationPanel } from "./NotificationPanel"
import { Button } from "./ui/button"

export function Navbar() {
  const { cart, isAuthenticated, user, searchQuery, setSearchQuery } = useStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center group-hover:shadow-lg transition-shadow">
              <svg viewBox="0 0 100 100" className="w-6 h-6 text-white" fill="currentColor">
                <path
                  d="M25 30v40c0 5 3 8 6 8h2v10h4v-10h6v10h4v-10h2c3 0 6-3 6-8V30M33 30v6M39 30v6M45 30v6"
                  stroke="white"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M60 25c8 0 12 6 12 12s-4 12-12 12v20h4v10h-8v-10h4v-20c-8 0-12-6-12-12s4-12 12-12z"
                  fill="white"
                />
              </svg>
            </div>
            <span className="font-bold text-lg text-primary hidden sm:inline">FoodiezX</span>
          </Link>

          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80 transition-colors">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">New Delhi</p>
              <p className="text-xs text-muted-foreground">Connaught Place</p>
            </div>
          </div>

          <div className="hidden md:block flex-1 max-w-md mx-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search restaurants or dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => navigate("/search")}
                className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all hover:border-primary/50"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <NotificationPanel />

                <Link
                  to="/favorites"
                  className="p-2 hover:bg-secondary rounded-lg transition-colors relative group"
                  title="Favorites"
                >
                  <Heart className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
                </Link>

                <Link
                  to="/cart"
                  className="p-2 hover:bg-secondary rounded-lg transition-colors relative group"
                  title="Shopping Cart"
                >
                  <ShoppingCart className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
                  {cartItemsCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold"
                    >
                      {cartItemsCount}
                    </motion.span>
                  )}
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-secondary rounded-lg transition-colors ml-2 border border-border group"
                >
                  <User className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium hidden lg:inline">{user?.name?.split(" ")[0]}</span>
                </Link>
              </>
            ) : (
              <Button asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <div className="md:hidden pb-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => navigate("/search")}
              className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 hover:bg-secondary rounded-lg transition-colors"
              >
                Home
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-2 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <span>Cart</span>
                    {cartItemsCount > 0 && (
                      <span className="px-2 py-1 bg-accent text-primary-foreground rounded-full text-xs font-bold">
                        {cartItemsCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/favorites"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-2 hover:bg-secondary rounded-lg transition-colors"
                  >
                    Favorites
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-2 hover:bg-secondary rounded-lg transition-colors"
                  >
                    Orders
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-2 hover:bg-secondary rounded-lg transition-colors"
                  >
                    Profile
                  </Link>
                </>
              ) : (
                <Button asChild className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
