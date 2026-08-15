"use client"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search as SearchIcon, UtensilsCrossed, Store } from "lucide-react"
import { api } from "../../lib/api"
import { useStore } from "../../store/useStore"
import { RestaurantCard } from "../RestaurantCard"
import { DishCard } from "../DishCard"
import { Button } from "../ui/button"

export function Search() {
  const navigate = useNavigate()
  const { searchQuery, setSearchQuery } = useStore()
  const [tab, setTab] = useState<"restaurants" | "dishes">("restaurants")
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [dishes, setDishes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!searchQuery.trim()) return
    void api.trackEvent({ name: "search_submitted", properties: { queryLength: searchQuery.trim().length } })
    setLoading(true)
    Promise.allSettled([
      api.searchRestaurantsByQuery(searchQuery),
      api.searchDishesByQuery(searchQuery),
    ]).then(([resR, resD]) => {
      setRestaurants(
        resR.status === "fulfilled" ? (Array.isArray(resR.value) ? resR.value : []) : [],
      )
      setDishes(resD.status === "fulfilled" ? (Array.isArray(resD.value) ? resD.value : []) : [])
      setLoading(false)
    })
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate("/search")
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Search Results</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-3">
          <SearchIcon className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for restaurants or dishes..."
            className="flex-1 bg-transparent outline-none text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" size="sm" className="rounded-full">
            Search
          </Button>
        </div>
      </form>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("restaurants")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
            tab === "restaurants"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border hover:border-primary/50"
          }`}
        >
          <Store className="w-4 h-4" />
          Restaurants ({restaurants.length})
        </button>
        <button
          onClick={() => setTab("dishes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
            tab === "dishes"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border hover:border-primary/50"
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          Dishes ({dishes.length})
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : tab === "restaurants" ? (
        restaurants.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            No restaurants found for "{searchQuery}".
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {restaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )
      ) : dishes.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">
          No dishes found for "{searchQuery}".
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {dishes.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              restaurantName={dish.restaurantName || dish.restaurant_id || ""}
            />
          ))}
        </div>
      )}
    </div>
  )
}
