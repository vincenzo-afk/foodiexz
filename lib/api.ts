const API_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) || "/api"

const getAuthToken = () => {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem("authToken")
}

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken()
  const headers = new Headers(options.headers)
  headers.set("Content-Type", "application/json")

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const message = data?.error || data?.message || "API request failed"
    throw new Error(message)
  }

  return data
}

export const api = {
  // Restaurants
  getRestaurants: async (_filters?: { cuisine?: string; rating?: number }) => {
    try {
      return await apiFetch("/restaurants")
    } catch (err) {
      console.error("Error fetching restaurants:", err)
      return []
    }
  },

  getRestaurantById: async (id: string) => {
    try {
      return await apiFetch(`/restaurants/${encodeURIComponent(id)}`)
    } catch (err) {
      console.error("Error fetching restaurant:", err)
      return null
    }
  },

  searchRestaurants: async (query: string) => {
    return api.searchRestaurantsByQuery(query)
  },

  searchRestaurantsByQuery: async (query: string) => {
    try {
      return await apiFetch(`/restaurants/search?q=${encodeURIComponent(query)}`)
    } catch (err) {
      console.error("Error searching restaurants:", err)
      return []
    }
  },

  searchDishesByQuery: async (query: string) => {
    return api.searchDishes(query)
  },

  getOffersForTotal: async (orderTotal: number) => {
    try {
      return await apiFetch(`/offers?total=${encodeURIComponent(String(orderTotal))}`)
    } catch (err) {
      console.error("Error fetching offers:", err)
      return []
    }
  },

  sendContact: async (data: { name: string; email: string; message: string }) => {
    return apiFetch("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  // Dishes
  getDishesByRestaurant: async (restaurantId: string) => {
    try {
      const restaurant = await apiFetch(`/restaurants/${encodeURIComponent(restaurantId)}`)
      return restaurant.dishes || []
    } catch (err) {
      console.error("Error fetching dishes:", err)
      return []
    }
  },

  searchDishes: async (query: string) => {
    try {
      return await apiFetch(`/dishes/search?q=${encodeURIComponent(query)}`)
    } catch (err) {
      console.error("Error searching dishes:", err)
      return []
    }
  },

  getDishById: async (id: string) => {
    try {
      return await apiFetch(`/dishes/${encodeURIComponent(id)}`)
    } catch (err) {
      console.error("Error fetching dish:", err)
      return null
    }
  },

  // Auth
  signup: async (name: string, email: string, password: string, phone?: string) => {
    const response = await apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password, phone }),
    })
    if (response.token && typeof window !== "undefined") {
      window.localStorage.setItem("authToken", response.token)
    }
    return response
  },

  login: async (email: string, password: string) => {
    const response = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    if (response.token && typeof window !== "undefined") {
      window.localStorage.setItem("authToken", response.token)
    }
    return response
  },

  getCurrentUser: async () => {
    try {
      const response = await apiFetch("/user")
      if (response?.user && response.token && typeof window !== "undefined") {
        window.localStorage.setItem("authToken", response.token)
      }
      return response?.user
    } catch {
      return null
    }
  },

  logout: async () => {
    if (typeof window !== "undefined") window.localStorage.removeItem("authToken")
  },

  // Orders
  placeOrder: async (order: unknown) => {
    return apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify(order),
    })
  },

  getOrders: async () => {
    try {
      return await apiFetch("/orders")
    } catch {
      return []
    }
  },

  getOrderById: async (id: string) => {
    try {
      return await apiFetch(`/orders/${encodeURIComponent(id)}`)
    } catch {
      return null
    }
  },

  getOrderStatus: async (id: string) => {
    try {
      return await apiFetch(`/orders/${encodeURIComponent(id)}/status`)
    } catch {
      return null
    }
  },

  getOrderTracking: async (id: string) => {
    try {
      return await apiFetch(`/orders/${encodeURIComponent(id)}/tracking`)
    } catch {
      return null
    }
  },

  cancelOrder: async (orderId: string) => {
    return apiFetch(`/orders/${encodeURIComponent(orderId)}`, { method: "DELETE" })
  },

  submitReview: async (orderId: string, rating: number, review: string) => {
    return apiFetch(`/orders/${encodeURIComponent(orderId)}/review`, {
      method: "POST",
      body: JSON.stringify({ rating, review }),
    })
  },

  updateOrderStatus: async (id: string, status: string) => {
    return apiFetch(`/orders/${encodeURIComponent(id)}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    })
  },

  // Offers
  getOffers: async () => {
    try {
      return await apiFetch("/offers")
    } catch {
      return []
    }
  },

  validateCoupon: async (code: string, orderTotal: number) => {
    try {
      return await apiFetch("/offers", {
        method: "POST",
        body: JSON.stringify({ code, orderTotal }),
      })
    } catch {
      return { valid: false, message: "Error validating coupon" }
    }
  },

  // Wallet
  getWallet: async () => {
    try {
      return await apiFetch("/wallet")
    } catch {
      return null
    }
  },

  topUpWallet: async (amount: number) => {
    return apiFetch("/wallet", {
      method: "POST",
      body: JSON.stringify({ amount }),
    })
  },

  // Addresses
  getAddresses: async () => {
    try {
      return await apiFetch("/addresses")
    } catch {
      return []
    }
  },

  createAddress: async (address: unknown) => {
    return apiFetch("/addresses", {
      method: "POST",
      body: JSON.stringify(address),
    })
  },

  addAddress: async (address: unknown) => api.createAddress(address),

  updateAddress: async (id: string, address: unknown) => {
    return apiFetch(`/addresses/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(address),
    })
  },

  deleteAddress: async (id: string) => {
    return apiFetch(`/addresses/${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
  },

  setDefaultAddress: async (id: string) => {
    return apiFetch(`/addresses/${encodeURIComponent(id)}/default`, {
      method: "PUT",
    })
  },

  // Favorites
  addToFavorites: async (restaurantId: string) => {
    return apiFetch(`/favorites/${encodeURIComponent(restaurantId)}`, {
      method: "POST",
    })
  },

  removeFromFavorites: async (restaurantId: string) => {
    return apiFetch(`/favorites/${encodeURIComponent(restaurantId)}`, {
      method: "DELETE",
    })
  },

  getFavorites: async () => {
    try {
      return await apiFetch("/favorites")
    } catch {
      return []
    }
  },
}

export default api
