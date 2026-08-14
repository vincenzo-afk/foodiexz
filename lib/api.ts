const API_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) || "/api"

interface ApiResponse<T> {
  data?: T
  error?: string
}

const getAuthToken = () => localStorage.getItem("authToken")

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken()
  const headers: any = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }))
    throw new Error(error.error || "API request failed")
  }

  return response.json()
}

export const api = {
  // Restaurants
  getRestaurants: async (filters?: { cuisine?: string; rating?: number }) => {
    try {
      return await apiFetch("/restaurants")
    } catch (err) {
      console.error("Error fetching restaurants:", err)
      return []
    }
  },

  getRestaurantById: async (id: string) => {
    try {
      return await apiFetch(`/restaurants/${id}`)
    } catch (err) {
      console.error("Error fetching restaurant:", err)
      return null
    }
  },

  searchRestaurants: async (query: string) => {
    try {
      const dishes = await apiFetch(`/dishes/search?q=${encodeURIComponent(query)}`)
      return dishes
    } catch (err) {
      console.error("Error searching:", err)
      return []
    }
  },

  searchRestaurantsByQuery: async (query: string) => {
    try {
      return await apiFetch(`/restaurants/search?q=${encodeURIComponent(query)}`)
    } catch (err) {
      return []
    }
  },

  // Dishes
  getDishesByRestaurant: async (restaurantId: string) => {
    try {
      const restaurant = await apiFetch(`/restaurants/${restaurantId}`)
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
      return await apiFetch(`/dishes/${id}`)
    } catch (err) {
      console.error("Error fetching dish:", err)
      return null
    }
  },

  // Auth
  signup: async (name: string, email: string, password: string, phone: string) => {
    try {
      const response = await apiFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password, phone }),
      })
      if (response.token) {
        localStorage.setItem("authToken", response.token)
      }
      return response
    } catch (err) {
      throw err
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })
      if (response.token) {
        localStorage.setItem("authToken", response.token)
      }
      return response
    } catch (err) {
      throw err
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await apiFetch("/user")
      if (response?.user) {
        localStorage.setItem("authToken", response.token || localStorage.getItem("authToken"))
      }
      return response?.user
    } catch (err) {
      return null
    }
  },

  logout: async () => {
    localStorage.removeItem("authToken")
  },

  // Orders
  placeOrder: async (order: any) => {
    try {
      return await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify(order),
      })
    } catch (err) {
      throw err
    }
  },

  getOrders: async () => {
    try {
      return await apiFetch("/orders")
    } catch (err) {
      return []
    }
  },

  getOrderById: async (id: string) => {
    try {
      return await apiFetch(`/orders/${id}`)
    } catch (err) {
      return null
    }
  },

  getOrderStatus: async (id: string) => {
    try {
      return await apiFetch(`/orders/${id}/status`)
    } catch (err) {
      return null
    }
  },

  submitReview: async (orderId: string, rating: number, comment: string) => {
    try {
      return await apiFetch(`/orders/${orderId}/review`, {
        method: "POST",
        body: JSON.stringify({ rating, comment }),
      })
    } catch (err) {
      throw err
    }
  },

  updateOrderStatus: async (id: string, status: string) => {
    try {
      return await apiFetch(`/orders/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      })
    } catch (err) {
      throw err
    }
  },

  // Offers
  getOffers: async () => {
    try {
      return await apiFetch("/offers")
    } catch (err) {
      return []
    }
  },

  validateCoupon: async (code: string, orderTotal: number) => {
    try {
      return await apiFetch("/offers/validate", {
        method: "POST",
        body: JSON.stringify({ code, orderTotal }),
      })
    } catch (err) {
      return { valid: false, message: "Error validating coupon" }
    }
  },

  // Addresses
  addAddress: async (address: any) => {
    try {
      return await apiFetch("/addresses", {
        method: "POST",
        body: JSON.stringify(address),
      })
    } catch (err) {
      throw err
    }
  },

  updateAddress: async (id: string, address: any) => {
    try {
      return await apiFetch(`/addresses/${id}`, {
        method: "PUT",
        body: JSON.stringify(address),
      })
    } catch (err) {
      throw err
    }
  },

  deleteAddress: async (id: string) => {
    try {
      return await apiFetch(`/addresses/${id}`, {
        method: "DELETE",
      })
    } catch (err) {
      throw err
    }
  },

  setDefaultAddress: async (id: string) => {
    try {
      return await apiFetch(`/addresses/${id}/default`, {
        method: "PUT",
      })
    } catch (err) {
      throw err
    }
  },

  // Favorites
  addToFavorites: async (restaurantId: string) => {
    try {
      return await apiFetch(`/favorites/${restaurantId}`, {
        method: "POST",
      })
    } catch (err) {
      throw err
    }
  },

  removeFromFavorites: async (restaurantId: string) => {
    try {
      return await apiFetch(`/favorites/${restaurantId}`, {
        method: "DELETE",
      })
    } catch (err) {
      throw err
    }
  },

  getFavorites: async () => {
    try {
      return await apiFetch("/favorites")
    } catch (err) {
      return []
    }
  },
}

export default api
