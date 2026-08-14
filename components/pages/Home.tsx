"use client"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, MapPin, Sparkles } from "lucide-react"
import { api } from "../../lib/api"
import { useStore } from "../../store/useStore"
import { RestaurantCard } from "../RestaurantCard"
import { PromoCarousel } from "../PromoCarousel"
import { FilterPanel } from "../FilterPanel"

export function Home() {
  const navigate = useNavigate()
  const { filters, searchQuery, setSearchQuery } = useStore()
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getRestaurants().then((data) => {
      setRestaurants(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    let result = [...restaurants]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.cuisine?.some((c: string) => c.toLowerCase().includes(q)) ||
          r.description?.toLowerCase().includes(q),
      )
    }
    if (filters.cuisine.length > 0) {
      result = result.filter((r) => r.cuisine?.some((c: string) => filters.cuisine.includes(c)))
    }
    if (filters.rating) {
      result = result.filter((r) => r.rating >= filters.rating!)
    }
    if (filters.priceRange) {
      result = result.filter(
        (r) => r.priceForTwo >= filters.priceRange![0] && r.priceForTwo <= filters.priceRange![1],
      )
    }
    if (filters.sortBy === "rating") result.sort((a, b) => b.rating - a.rating)
    if (filters.sortBy === "deliveryTime") {
      result.sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime))
    }
    if (filters.sortBy === "priceForTwo") result.sort((a, b) => a.priceForTwo - b.priceForTwo)
    return result
  }, [restaurants, searchQuery, filters])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (searchQuery.trim()) navigate("/search")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/10 via-accent/10 to-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm">Delivering to Connaught Place, New Delhi</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Hungry? <span className="text-primary">We've got you</span>
          </h1>
          <p className="text-muted-foreground mb-6">
            Order from the best restaurants around you, delivered fast.
          </p>
          <form onSubmit={handleSearch} className="max-w-xl">
            <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-3 shadow-sm">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for restaurants or dishes..."
                className="flex-1 bg-transparent outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Promo Carousel */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold">Today's Best Offers</h2>
          </div>
          <PromoCarousel />
        </section>

        {/* Restaurants */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Restaurants Near You</h2>
              <p className="text-sm text-muted-foreground">{filtered.length} options available</p>
            </div>
            <FilterPanel />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg">No restaurants match your search.</p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3 text-primary underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
