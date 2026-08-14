"use client"
import { useEffect, useMemo, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Star, Clock, MapPin, Heart, ArrowLeft, UtensilsCrossed, IndianRupee } from "lucide-react"
import { api } from "../../lib/api"
import { useStore } from "../../store/useStore"
import { DishCard } from "../DishCard"
import { ImageWithFallback } from "../figma/ImageWithFallback"
import { toast } from "sonner"

export function RestaurantDetail() {
  const { id } = useParams<{ id: string }>()
  const { favorites, toggleFavorite, isAuthenticated, cart, getCartTotal } = useStore()
  const [restaurant, setRestaurant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<string>("All")

  useEffect(() => {
    if (id) {
      api.getRestaurantById(id).then((data) => {
        setRestaurant(data)
        setLoading(false)
      })
    }
  }, [id])

  const categories = useMemo(() => {
    if (!restaurant?.dishes) return ["All"]
    const set = new Set<string>(["All"])
    restaurant.dishes.forEach((d: any) => d.category && set.add(d.category))
    return Array.from(set)
  }, [restaurant])

  const visibleDishes = useMemo(() => {
    const dishes = restaurant?.dishes || []
    return category === "All" ? dishes : dishes.filter((d: any) => d.category === category)
  }, [restaurant, category])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-muted-foreground">
        <p className="text-lg mb-4">Restaurant not found</p>
        <Link to="/" className="text-primary underline">
          Back to home
        </Link>
      </div>
    )
  }

  const isFavorite = favorites.includes(restaurant.id)
  const hasOtherRestaurantItems =
    cart.length > 0 && cart.some((item) => item.restaurantId !== restaurant.id)

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Banner */}
      <div className="relative h-72 overflow-hidden">
        <ImageWithFallback
          src={restaurant.image || "/placeholder.svg"}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <Link
          to="/"
          className="absolute top-4 left-4 flex items-center gap-1 bg-white/90 text-foreground rounded-full px-3 py-1.5 text-sm font-medium hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <button
          onClick={() => {
            if (!isAuthenticated) {
              toast.error("Please sign in to save favorites")
              return
            }
            toggleFavorite(restaurant.id)
          }}
          className={`absolute top-4 right-4 p-2.5 rounded-full shadow-lg transition-colors ${
            isFavorite ? "bg-red-500 text-white" : "bg-white/90 text-foreground hover:bg-white"
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? "fill-white" : ""}`} />
        </button>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h1 className="text-3xl font-bold mb-1">{restaurant.name}</h1>
          <p className="text-white/90 line-clamp-2">{restaurant.description}</p>
        </div>
      </div>

      {/* Info bar */}
      <div className="max-w-4xl mx-auto px-4 py-5 flex flex-wrap gap-4 text-sm">
        <span className="flex items-center gap-1.5">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold">{restaurant.rating}</span>
          <span className="text-muted-foreground">({restaurant.totalRatings} ratings)</span>
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="w-4 h-4" />
          {restaurant.deliveryTime} min
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          {restaurant.address}
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <IndianRupee className="w-4 h-4" />
          ₹{restaurant.priceForTwo} for two
        </span>
        {!restaurant.isOpen && (
          <span className="px-2 py-0.5 bg-destructive text-destructive-foreground rounded text-xs font-medium">
            Closed
          </span>
        )}
      </div>

      {/* Offer */}
      {restaurant.offer && (
        <div className="max-w-4xl mx-auto px-4 mb-6">
          <div className="border border-dashed border-primary/50 rounded-lg px-4 py-3 flex items-center gap-2 text-sm">
            <span className="text-primary font-bold">{restaurant.offer}</span>
          </div>
        </div>
      )}

      {/* Multi-restaurant warning */}
      {hasOtherRestaurantItems && (
        <div className="max-w-4xl mx-auto px-4 mb-6">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm">
            Your cart has items from another restaurant. Adding items here will still work, but
            multi-restaurant fees may apply.
          </div>
        </div>
      )}

      {/* Menu */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-2">
          <UtensilsCrossed className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Menu</h2>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap border transition-colors ${
                category === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:border-primary/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {visibleDishes.map((dish: any) => (
            <DishCard key={dish.id} dish={dish} restaurantName={restaurant.name} />
          ))}
        </div>

        {visibleDishes.length === 0 && (
          <p className="text-center text-muted-foreground py-10">No dishes in this category.</p>
        )}
      </div>

      {/* Floating cart bar */}
      {cart.length > 0 && (
        <Link
          to="/cart"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-primary text-primary-foreground rounded-full px-6 py-3 shadow-xl flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <span className="bg-primary-foreground/20 rounded-full px-2.5 py-0.5 text-sm font-semibold">
            {cart.reduce((sum, i) => sum + i.quantity, 0)}
          </span>
          <span className="font-semibold">₹{getCartTotal().toFixed(0)}</span>
          <span className="text-sm">View Cart</span>
        </Link>
      )}
    </div>
  )
}
