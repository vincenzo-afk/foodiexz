"use client"

import { BrowserRouter, Routes, Route } from "react-router-dom"
import "./app/globals.css"
import { Navbar } from "./components/Navbar"
import { Footer } from "./components/Footer"
import { Home } from "./components/pages/Home"
import { RestaurantDetail } from "./components/pages/RestaurantDetail"
import { Cart } from "./components/pages/Cart"
import { Checkout } from "./components/pages/Checkout"
import { Auth } from "./components/pages/Auth"
import { OrderTracking } from "./components/pages/OrderTracking"
import { Orders } from "./components/pages/Orders"
import { Profile } from "./components/pages/Profile"
import { Search } from "./components/pages/Search"
import { Favorites } from "./components/pages/Favorites"
import { Offers } from "./components/pages/Offers"
import { Addresses } from "./components/pages/Addresses"
import { Settings } from "./components/pages/Settings"
import { NotFound } from "./components/pages/NotFound"
import { Toaster } from "./components/ui/sonner"
import { SplashScreen } from "./components/SplashScreen"
import { useState, useEffect } from "react"
import { useStore } from "./store/useStore"

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const { isAuthenticated, user } = useStore()

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (token && !isAuthenticated) {
      // Try to validate token or fetch user data
      console.log("[v0] Auth token found, initializing user session")
    }
  }, [isAuthenticated])

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/restaurant/:id" element={<RestaurantDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/order/:id" element={<OrderTracking />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/search" element={<Search />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/addresses" element={<Addresses />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-center" richColors />
        </div>
      </BrowserRouter>
    </>
  )
}
