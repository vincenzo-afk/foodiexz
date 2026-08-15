"use client"
import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search, MapPin, Sparkles, History, Clock } from "lucide-react"
import { api } from "../../lib/api"
import { useStore } from "../../store/useStore"
import { RestaurantCard, getPopularDishes } from "../RestaurantCard"
import { dishes as allDishes } from "../../lib/seedData"
import { PromoCarousel } from "../PromoCarousel"
import { FilterPanel } from "../FilterPanel"

// One-tap quick filters — a standard shortcut on every major delivery app.
const quickChips = [
  { label: "All", cuisines: [] },
  { label: "Veg", cuisines: ["Veg"] },
  { label: "Indian", cuisines: ["Indian", "North Indian", "Mughlai", "South Indian"] },
  { label: "Chinese", cuisines: ["Chinese", "Asian", "Thai"] },
  { label: "Pizza & Pasta", cuisines: ["Pizza", "Pasta", "Italian"] },
  { label: "Burgers", cuisines: ["Burgers", "American", "Fast Food"] },
  { label: "Japanese", cuisines: ["Japanese", "Sushi"] },
  { label: "Mexican", cuisines: ["Mexican", "Tex-Mex"] },
]

// Sort options: rating · delivery time · distance · cost for two (default: Recommended).
type SortKey = "recommended" | "rating" | "deliveryTime" | "distance" | "priceForTwo"
const sortOptions: { key: SortKey; label: string }[] = [
  { key: "recommended", label: "Recommended" },
  { key: "rating", label: "Rating" },
  { key: "deliveryTime", label: "Fastest delivery" },
  { key: "distance", label: "Nearest" },
  { key: "priceForTwo", label: "Cost: low to high" },
]

export function Home() {
  const navigate = useNavigate()
  const { filters, setFilters, searchQuery, setSearchQuery, recentlyViewed, clearRecentlyViewed } = useStore()
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>("recommended")
  const [activeChip, setActiveChip] = useState(0)
  const [isVegChip, setIsVegChip] = useState(false)
  const [recommendations, setRecommendations] = useState<any[]>([])

  useEffect(() => {
    api.getRestaurants().then((data) => {
      setRestaurants(Array.isArray(data) ? data : [])
      setLoading(false)
    })
    api.getRecommendations().then((data) => {
      setRecommendations(data?.sections?.recommended || [])
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
    if (isVegChip) {
      // "Veg" chip: restaurants with at least some veg dishes (Zomato-style veg-friendly filter).
      result = result.filter((r) => r.dishes?.some((d: any) => d.isVeg))
    }
    if (filters.rating) {
      result = result.filter((r) => r.rating >= filters.rating!)
    }
    if (filters.priceRange) {
      result = result.filter(
        (r) => r.priceForTwo >= filters.priceRange![0] && r.priceForTwo <= filters.priceRange![1],
      )
    }
    // Recommended = highest rating first, breaking ties by nearest distance.
    if (sortKey === "recommended" || sortKey === "rating") {
      result.sort((a, b) => b.rating - a.rating || (a.distanceKm ?? 99) - (b.distanceKm ?? 99))
    }
    if (sortKey === "deliveryTime") {
      result.sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime))
    }
    if (sortKey === "distance") result.sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99))
    if (sortKey === "priceForTwo") result.sort((a, b) => a.priceForTwo - b.priceForTwo)
    return result
  }, [restaurants, searchQuery, filters, sortKey, isVegChip])

  // Quick-filter chips: replace the store's cuisine filter in one tap.
  // The "Veg" chip (index 1) is handled in the filter pipeline itself.
  // "All" behaves like the Filters panel's Clear so quick chips never combine
  // with stale persisted rating/price filters from a previous session.
  // The Veg chip uses an explicit state (isVegChip) rather than a fake "Veg"
  // cuisine, so the cuisine filter never silently wipes the whole list.
  const applyChip = (index: number) => {
    const chip = quickChips[index]
    setActiveChip(index)
    if (index === 0) {
      setIsVegChip(false)
      setFilters({ cuisine: [], rating: null, priceRange: null })
    } else if (index === 1) {
      setIsVegChip(true)
      setFilters({ cuisine: [], rating: null, priceRange: null })
    } else {
      setIsVegChip(false)
      setFilters({ cuisine: chip.cuisines })
    }
  }

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
        {/* Recently viewed strip — re-jump to restaurants you checked out */}
        {recentlyViewed.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Recently Viewed</h2>
              </div>
              <button
                onClick={() => clearRecentlyViewed()}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {recentlyViewed
                .map((rid) => restaurants.find((r) => r.id === rid))
                .filter(Boolean)
                .map((r: any) => (
                  <Link
                    key={r.id}
                    to={`/restaurant/${r.id}`}
                    className="flex-shrink-0 w-48 bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-colors group"
                  >
                    <div className="relative h-24 overflow-hidden bg-muted">
                      <img
                        src={r.image || "/placeholder.svg"}
                        alt={r.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        {r.name}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        {r.deliveryTime}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        )}

        {recommendations.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4"><div><h2 className="text-xl font-semibold">Picked for you</h2><p className="text-sm text-muted-foreground">Useful recommendations with a reason behind every pick.</p></div></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.slice(0, 3).map((restaurant: any) => <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`} className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"><div className="flex gap-3"><img src={restaurant.image || "/placeholder.svg"} alt={restaurant.name} className="w-20 h-20 rounded-lg object-cover" /><div className="min-w-0"><p className="font-semibold truncate">{restaurant.name}</p><p className="text-xs text-muted-foreground mt-1">★ {restaurant.rating} · {restaurant.deliveryTime}</p><p className="text-xs text-primary mt-2 line-clamp-2">{restaurant.recommendationReasons?.[0]}</p></div></div></Link>)}
            </div>
          </section>
        )}

        {/* Promo Carousel */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold">Today's Best Offers</h2>
          </div>
          <PromoCarousel />
        </section>

        {/* Quick filters + sort */}
        <section className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {quickChips.map((chip, i) => (
              <button
                key={chip.label}
                onClick={() => applyChip(i)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
                  activeChip === i
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-foreground hover:border-primary/50"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </section>

        {/* Restaurants */}
        <section>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-bold">Restaurants Near You</h2>
              <p className="text-sm text-muted-foreground">{filtered.length} options available</p>
            </div>
            <div className="flex items-center gap-2">
              <FilterPanel />
              <div className="flex items-center gap-1 border border-border rounded-full bg-card p-1">
                {sortOptions.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSortKey(s.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                      sortKey === s.key
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
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
                onClick={() => {
                  setSearchQuery("")
                  setFilters({ cuisine: [], rating: null, priceRange: null })
                  setActiveChip(0)
                  setSortKey("recommended")
                }}
                className="mt-3 text-primary underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((r: any) => (
                <RestaurantCard
                  key={r.id}
                  restaurant={{
                    ...r,
                    popularDishes: getPopularDishes(allDishes, r.id),
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
