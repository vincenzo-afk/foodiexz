import { create } from "zustand"
import { persist } from "zustand/middleware"
import { api } from "../lib/api" // Assuming api is imported from a separate file

// Types
export interface User {
  id: string
  name: string
  email: string
  phone: string
  addresses: Address[]
  dietaryPreference: "all" | "veg" | "non-veg"
  wallet: number
}

export interface Address {
  id: string
  type: string
  address: string
  landmark?: string
  lat?: number
  lng?: number
  isDefault: boolean
}

export interface CartItem {
  dishId: string
  restaurantId: string
  restaurantName: string
  name: string
  price: number
  quantity: number
  image: string
  customization?: string
  isVeg: boolean
}

export interface Review {
  id: string
  userId: string
  userName: string
  restaurantId?: string
  dishId?: string
  rating: number
  comment: string
  createdAt: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "order"
  read: boolean
  createdAt: string
  link?: string
}

export interface Order {
  id: string
  restaurantId: string
  restaurantName: string
  items: CartItem[]
  total: number
  status: "preparing" | "on-the-way" | "delivered" | "cancelled"
  createdAt: string
  deliveryAddress: Address
  paymentMethod: string
  tip?: number
  deliveryNote?: string | null
  rating?: number
  review?: string
}

interface AppState {
  // Auth
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string, phone: string) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => void
  setDietaryPreference: (preference: "all" | "veg" | "non-veg") => void
  syncWallet: () => Promise<void>

  // Cart
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, "quantity">) => void
  removeFromCart: (dishId: string) => void
  updateQuantity: (dishId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getMultiRestaurantFee: () => number
  getUniqueRestaurants: () => string[]

  // Favorites
  favorites: string[]
  toggleFavorite: (restaurantId: string) => void
  isFavorite: (restaurantId: string) => boolean
  setFavorites: (favorites?: string[]) => void

  // Recently viewed restaurants (last 5 visited detail pages)
  recentlyViewed: string[]
  addToRecentlyViewed: (restaurantId: string) => void
  clearRecentlyViewed: () => void

  // Orders
  orders: Order[]
  placeOrder: (order: Omit<Order, "id" | "createdAt" | "status">) => Promise<string>
  updateOrderStatus: (orderId: string, status: Order["status"]) => void
  rateOrder: (orderId: string, rating: number, review?: string) => void

  // Reviews
  reviews: Review[]
  addReview: (review: Omit<Review, "id" | "createdAt" | "userId" | "userName">) => void
  getRestaurantReviews: (restaurantId: string) => Review[]

  // Notifications
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void
  markNotificationAsRead: (notificationId: string) => void
  markAllNotificationsAsRead: () => void
  getUnreadCount: () => number

  // Addresses
  addAddress: (address: Omit<Address, "id">) => void
  updateAddress: (id: string, address: Partial<Address>) => void
  deleteAddress: (id: string) => void
  setDefaultAddress: (id: string) => void

  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Filters
  filters: {
    rating: number | null
    priceRange: [number, number] | null
    cuisine: string[]
    sortBy: "rating" | "deliveryTime" | "priceForTwo" | null
  }
  setFilters: (filters: Partial<AppState["filters"]>) => void
  clearFilters: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth initial state
      user: null,
      isAuthenticated: false,

      // Auth actions
      login: async (email: string, password: string) => {
        try {
          const response = await api.login(email, password)
          if (response.token) {
            localStorage.setItem("authToken", response.token)
          }

          set({
            user: {
              id: response.user.id,
              name: response.user.name,
              email: response.user.email,
              phone: response.user.phone,
              addresses: response.user.addresses || [],
              dietaryPreference: response.user.dietaryPreference || "all",
              wallet: response.user.wallet || 0,
            },
            isAuthenticated: true,
          })

          get().addNotification({
            title: "Welcome back!",
            message: `Good to see you, ${response.user.name}`,
            type: "success",
          })

          return true
        } catch (err) {
          get().addNotification({
            title: "Login failed",
            message: err instanceof Error ? err.message : "Invalid credentials",
            type: "warning",
          })
          return false
        }
      },

      signup: async (name: string, email: string, password: string, phone: string) => {
        try {
          const response = await api.signup(name, email, password, phone)
          if (response.token) {
            localStorage.setItem("authToken", response.token)
          }

          set({
            user: {
              id: response.user.id,
              name: response.user.name,
              email: response.user.email,
              phone: response.user.phone,
              addresses: response.user.addresses || [],
              dietaryPreference: response.user.dietaryPreference || "all",
              wallet: response.user.wallet || 500,
            },
            isAuthenticated: true,
          })

          get().addNotification({
            title: "Welcome to FoodiezX!",
            message: "₹500 added to your wallet as welcome bonus",
            type: "success",
          })

          return true
        } catch (err) {
          get().addNotification({
            title: "Signup failed",
            message: err instanceof Error ? err.message : "Please try again",
            type: "warning",
          })
          return false
        }
      },

      logout: () => {
        localStorage.removeItem("authToken")
        set({ user: null, isAuthenticated: false, cart: [], favorites: [] })
      },

      updateProfile: (data: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          const updatedUser = { ...currentUser, ...data }
          set({ user: updatedUser })

          if (typeof localStorage === "undefined") return
          const users = JSON.parse(localStorage.getItem("foodiezx_users") || "[]")
          const userIndex = users.findIndex((u: any) => u.id === currentUser.id)
          if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...data }
            localStorage.setItem("foodiezx_users", JSON.stringify(users))
          }
        }
      },

      setDietaryPreference: (preference: "all" | "veg" | "non-veg") => {
        get().updateProfile({ dietaryPreference: preference })
      },

      // Sync wallet balance from the server wallet (authoritative source)
      syncWallet: async () => {
        if (!get().isAuthenticated || !get().user) return
        try {
          const wallet = await api.getWallet()
          if (wallet && typeof wallet.balance === "number" && get().user) {
            get().updateProfile({ wallet: wallet.balance })
          }
        } catch {
          // leave local balance unchanged on failure
        }
      },

      // Cart initial state
      cart: [],

      // Cart actions
      addToCart: (item) => {
        const cart = get().cart
        const existingItem = cart.find((i) => i.dishId === item.dishId)

        if (existingItem) {
          set({
            cart: cart.map((i) => (i.dishId === item.dishId ? { ...i, quantity: i.quantity + 1 } : i)),
          })
        } else {
          set({ cart: [...cart, { ...item, quantity: 1 }] })
        }

        // Check for multi-restaurant warning
        const restaurants = get().getUniqueRestaurants()
        if (restaurants.length > 1) {
          get().addNotification({
            title: "Multi-restaurant order",
            message: `Adding from ${restaurants.length} restaurants. Extra fees may apply.`,
            type: "warning",
          })
        }
      },

      removeFromCart: (dishId) => {
        set({ cart: get().cart.filter((item) => item.dishId !== dishId) })
      },

      updateQuantity: (dishId, quantity) => {
        if (quantity === 0) {
          get().removeFromCart(dishId)
        } else {
          set({
            cart: get().cart.map((item) => (item.dishId === dishId ? { ...item, quantity } : item)),
          })
        }
      },

      clearCart: () => {
        set({ cart: [] })
      },

      getCartTotal: () => {
        return get().cart.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getMultiRestaurantFee: () => {
        const restaurants = get().getUniqueRestaurants()
        return restaurants.length > 1 ? (restaurants.length - 1) * 20 : 0
      },

      getUniqueRestaurants: () => {
        const cart = get().cart
        return [...new Set(cart.map((item) => item.restaurantId))]
      },

      // Favorites initial state
      favorites: [],

      // Favorites actions
      toggleFavorite: async (restaurantId: string) => {
        const favorites = get().favorites
        const isFav = favorites.includes(restaurantId)

        try {
          if (isFav) {
            await api.removeFromFavorites(restaurantId)
            set({ favorites: favorites.filter((id) => id !== restaurantId) })
          } else {
            await api.addToFavorites(restaurantId)
            set({ favorites: [...favorites, restaurantId] })
            get().addNotification({
              title: "Added to favorites",
              message: "Restaurant saved to your favorites",
              type: "success",
            })
          }
        } catch (err) {
          get().addNotification({
            title: "Error",
            message: "Failed to update favorites",
            type: "warning",
          })
        }
      },

      // Helper method to check if restaurant is favorite
      isFavorite: (restaurantId: string) => {
        return get().favorites.includes(restaurantId)
      },

      // Recently viewed initial state
      recentlyViewed: [],

      // Recently viewed actions: keep the last 5 distinct restaurant ids, newest first
      addToRecentlyViewed: (restaurantId: string) => {
        const recent = get().recentlyViewed.filter((id) => id !== restaurantId)
        set({ recentlyViewed: [restaurantId, ...recent].slice(0, 5) })
      },

      clearRecentlyViewed: () => {
        set({ recentlyViewed: [] })
      },

      // Method to set favorites from API
      setFavorites: async (favorites?: string[]) => {
        try {
          if (get().user && get().isAuthenticated) {
            const favs = await api.getFavorites()
            set({ favorites: favs })
          }
        } catch (err) {
          console.error("Error fetching favorites:", err)
        }
      },

      // Orders initial state
      orders: [],

      // Orders actions
      placeOrder: async (order) => {
        try {
          const response = await api.placeOrder({
            restaurantId: order.restaurantId,
            restaurantName: order.restaurantName,
            items: order.items.map((item) => ({
              dishId: item.dishId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
            total: order.total,
            paymentMethod: order.paymentMethod,
            deliveryAddress: order.deliveryAddress,
            tip: order.tip,
          })

          const orderId = response.orderId

          const newOrder: Order = {
            ...order,
            id: orderId,
            createdAt: new Date().toISOString(),
            status: "preparing",
          }

          set({ orders: [newOrder, ...get().orders] })
          get().clearCart()

          get().addNotification({
            title: "Order placed successfully!",
            message: `Order #${orderId} is being prepared`,
            type: "order",
            link: `/order/${orderId}`,
          })

          return orderId
        } catch (err) {
          get().addNotification({
            title: "Order failed",
            message: err instanceof Error ? err.message : "Failed to place order",
            type: "warning",
          })
          throw err
        }
      },

      updateOrderStatus: (orderId, status) => {
        set({
          orders: get().orders.map((order) => (order.id === orderId ? { ...order, status } : order)),
        })

        const order = get().orders.find((o) => o.id === orderId)
        if (order) {
          const messages = {
            preparing: "Your order is being prepared",
            "on-the-way": "Your order is on the way! 🚴",
            delivered: "Order delivered! Enjoy your meal 🎉",
            cancelled: "Order cancelled",
          }

          get().addNotification({
            title: `Order #${orderId}`,
            message: messages[status],
            type: status === "delivered" ? "success" : "order",
            link: `/order/${orderId}`,
          })
        }
      },

      rateOrder: (orderId, rating, review) => {
        set({
          orders: get().orders.map((order) => (order.id === orderId ? { ...order, rating, review } : order)),
        })
      },

      // Reviews initial state
      reviews: [],

      // Reviews actions
      addReview: (review) => {
        const user = get().user
        if (!user) return

        const newReview: Review = {
          ...review,
          id: "REV" + Date.now(),
          userId: user.id,
          userName: user.name,
          createdAt: new Date().toISOString(),
        }

        set({ reviews: [newReview, ...get().reviews] })
      },

      getRestaurantReviews: (restaurantId) => {
        return get().reviews.filter((r) => r.restaurantId === restaurantId)
      },

      // Notifications initial state
      notifications: [],

      // Notifications actions
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: "NOTIF" + Date.now(),
          createdAt: new Date().toISOString(),
          read: false,
        }

        set({ notifications: [newNotification, ...get().notifications.slice(0, 49)] }) // Keep last 50
      },

      markNotificationAsRead: (notificationId) => {
        set({
          notifications: get().notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
        })
      },

      markAllNotificationsAsRead: () => {
        set({
          notifications: get().notifications.map((n) => ({ ...n, read: true })),
        })
      },

      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.read).length
      },

      // Addresses actions
      addAddress: (address) => {
        const user = get().user
        if (!user) return

        const newAddress: Address = {
          ...address,
          id: "ADDR" + Date.now(),
          isDefault: user.addresses.length === 0 ? true : address.isDefault,
        }

        // If new address is default, make others non-default
        const updatedAddresses = newAddress.isDefault
          ? [...user.addresses.map((a) => ({ ...a, isDefault: false })), newAddress]
          : [...user.addresses, newAddress]

        get().updateProfile({ addresses: updatedAddresses })
      },

      updateAddress: (id, addressData) => {
        const user = get().user
        if (!user) return

        const updatedAddresses = user.addresses.map((a) => (a.id === id ? { ...a, ...addressData } : a))

        get().updateProfile({ addresses: updatedAddresses })
      },

      deleteAddress: (id) => {
        const user = get().user
        if (!user) return

        get().updateProfile({
          addresses: user.addresses.filter((a) => a.id !== id),
        })
      },

      setDefaultAddress: (id) => {
        const user = get().user
        if (!user) return

        get().updateProfile({
          addresses: user.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        })
      },

      // Search initial state
      searchQuery: "",

      // Search actions
      setSearchQuery: (query) => {
        set({ searchQuery: query })
      },

      // Filters initial state
      filters: {
        rating: null,
        priceRange: null,
        cuisine: [],
        sortBy: null,
      },

      // Filters actions
      setFilters: (newFilters) => {
        set({ filters: { ...get().filters, ...newFilters } })
      },

      clearFilters: () => {
        set({
          filters: {
            rating: null,
            priceRange: null,
            cuisine: [],
            sortBy: null,
          },
        })
      },
    }),
    {
      name: "foodiezx-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        cart: state.cart,
        filters: state.filters,
        favorites: state.favorites,
        orders: state.orders,
        reviews: state.reviews,
        notifications: state.notifications,
        recentlyViewed: state.recentlyViewed,
      }),
    },
  ),
)
