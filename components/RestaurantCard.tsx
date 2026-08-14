"use client"

import type React from "react"

import { Star, Clock, Heart, MapPin, TrendingUp } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { ImageWithFallback } from "./figma/ImageWithFallback"
import { useStore } from "../store/useStore"
import { motion } from "motion/react"
import { Badge } from "./ui/badge"

interface Restaurant {
  id: string
  name: string
  cuisine: string[]
  rating: number
  deliveryTime: string
  distance: string
  image: string
  priceForTwo: number
  offer?: string
  isOpen: boolean
  totalRatings: string
}

interface RestaurantCardProps {
  restaurant: Restaurant
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const { favorites, toggleFavorite, isAuthenticated } = useStore()
  const [imageLoaded, setImageLoaded] = useState(false)
  const isFavorite = favorites.includes(restaurant.id)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isAuthenticated) {
      toggleFavorite(restaurant.id)
    }
  }

  return (
    <Link to={`/restaurant/${restaurant.id}`}>
      <motion.div
        whileHover={{ y: -6 }}
        className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-border hover:border-primary/30"
      >
        <div className="relative h-48 overflow-hidden bg-muted">
          <ImageWithFallback
            src={restaurant.image || "/placeholder.svg"}
            alt={restaurant.name}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />

          {!restaurant.isOpen && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Badge variant="destructive" className="text-base">
                Currently Closed
              </Badge>
            </div>
          )}

          {restaurant.offer && restaurant.isOpen && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <p className="text-white font-semibold text-sm flex items-center gap-1">
                <span>💥</span> {restaurant.offer}
              </p>
            </div>
          )}

          {restaurant.rating >= 4.7 && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-emerald-600 hover:bg-emerald-600">
                <TrendingUp className="w-3 h-3 mr-1" /> Top Rated
              </Badge>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 w-10 h-10 bg-background/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-background transition-colors z-10 border border-border"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
            />
          </motion.button>
        </div>

        <div className="p-4">
          <div className="mb-3">
            <h3 className="font-bold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              {restaurant.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{restaurant.cuisine.join(" • ")}</p>
          </div>

          <div className="flex items-center justify-between text-sm mb-3 gap-2">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5 bg-primary text-primary-foreground px-2 py-1 rounded">
                <Star className="w-3.5 h-3.5 fill-white" />
                <span className="font-semibold">{restaurant.rating}</span>
              </div>
              <span className="text-muted-foreground">({restaurant.totalRatings})</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{restaurant.deliveryTime}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{restaurant.distance}</span>
            </div>
            <span className="font-semibold text-foreground">₹{restaurant.priceForTwo} for two</span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
