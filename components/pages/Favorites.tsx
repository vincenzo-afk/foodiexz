"use client"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Heart, Trash2 } from "lucide-react"
import { api } from "../../lib/api"
import { useStore } from "../../store/useStore"
import { RestaurantCard } from "../RestaurantCard"
import { Button } from "../ui/button"

export function Favorites() {
  const { isAuthenticated, favorites, toggleFavorite } = useStore()
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      api.getRestaurants().then((data) => {
        const all = Array.isArray(data) ? data : []
        setRestaurants(all.filter((r: any) => favorites.includes(r.id)))
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, favorites])

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h1 className="text-2xl font-bold mb-2">Please sign in</h1>
        <p className="text-muted-foreground mb-6">Save your favorite restaurants by logging in.</p>
        <Button asChild>
          <Link to="/auth">Sign in</Link>
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        My Favorites
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        {restaurants.length} {restaurants.length === 1 ? "restaurant" : "restaurants"} saved
      </p>

      {restaurants.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-2">No favorites yet.</p>
          <p className="text-sm text-muted-foreground mb-6">
            Tap the heart on any restaurant to save it here.
          </p>
          <Button asChild>
            <Link to="/">Explore restaurants</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {restaurants.map((r) => (
            <div key={r.id} className="relative group">
              <RestaurantCard restaurant={r} />
              <button
                onClick={() => toggleFavorite(r.id)}
                title="Remove from favorites"
                className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow transition-colors"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
