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
import { Admin } from "./components/pages/Admin"
import { ScheduledOrders } from "./components/pages/ScheduledOrders"
import { NotFound } from "./components/pages/NotFound"
import { About } from "./components/pages/info/About"
import { Careers } from "./components/pages/info/Careers"
import { Team } from "./components/pages/info/Team"
import { Blog } from "./components/pages/info/Blog"
import { Help } from "./components/pages/info/Help"
import { Contact } from "./components/pages/info/Contact"
import { Partner } from "./components/pages/info/Partner"
import { FAQ } from "./components/pages/info/FAQ"
import { Terms } from "./components/pages/info/Terms"
import { Privacy } from "./components/pages/info/Privacy"
import { Refund } from "./components/pages/info/Refund"
import { Cookie } from "./components/pages/info/Cookie"
import { Toaster } from "./components/ui/sonner"
import { SplashScreen } from "./components/SplashScreen"
import { useState, useEffect } from "react"
import { useStore } from "./store/useStore"

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const { hydrateSession } = useStore()

  useEffect(() => {
    void hydrateSession()
  }, [hydrateSession])

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
              <Route path="/admin" element={<Admin />} />
              <Route path="/scheduled-orders" element={<ScheduledOrders />} />
              <Route path="/about" element={<About />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/team" element={<Team />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/help" element={<Help />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/partner" element={<Partner />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/refund" element={<Refund />} />
              <Route path="/cookie" element={<Cookie />} />
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
