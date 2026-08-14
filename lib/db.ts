// In-memory database for the FoodiezX API (serverless-friendly replacement for SQLite).
// Data is seeded with the bundled catalog (restaurants, dishes, offers) and
// user-generated records (users, addresses, orders, favorites, reviews) persist
// for the lifetime of the serverless instance.
import { restaurants as seedRestaurants, dishes as seedDishes, offers as seedOffers } from "./seedData"

export interface DbRestaurant {
  id: string
  name: string
  cuisine: string[]
  rating: number
  deliveryTime: string
  distance: string
  image: string
  priceForTwo: number
  offer: string
  isOpen: boolean
  totalRatings: string
  description: string
  address: string
  openTime: string
  closeTime: string
}

export interface DbDish {
  id: string
  restaurantId: string
  name: string
  description: string
  price: number
  image: string
  category: string
  isVeg: boolean
  rating: number
  customizable: boolean
  bestseller: boolean
}

export interface DbUser {
  id: string
  name: string
  email: string
  password: string
  phone?: string
  dietaryPreference: string
  wallet: number
  createdAt: string
}

export interface DbAddress {
  id: string
  userId: string
  type?: string
  address: string
  landmark?: string
  isDefault: boolean
}

export interface DbOrder {
  id: string
  userId: string
  restaurantId: string
  restaurantName: string
  total: number
  paymentMethod: string
  deliveryAddress: string
  status: string
  rating?: number
  review?: string
  createdAt: string
}

export interface DbOrderItem {
  id: string
  orderId: string
  dishId: string
  name: string
  price: number
  quantity: number
}

export interface DbFavorite {
  userId: string
  restaurantId: string
}

export interface DbOffer {
  id: string
  code: string
  description: string
  minOrder: number
  maxDiscount: number
  discountPercent: number | null
  validTill: string
}

const restaurants: DbRestaurant[] = seedRestaurants.map((r) => ({
  ...r,
  cuisine: r.cuisine,
  deliveryTime: r.deliveryTime,
  priceForTwo: r.priceForTwo,
  isOpen: r.isOpen,
  totalRatings: r.totalRatings,
  openTime: r.openTime,
  closeTime: r.closeTime,
}))

const dishes: DbDish[] = seedDishes.map((d) => ({
  ...d,
  isVeg: d.isVeg,
  customizable: d.customizable,
  bestseller: d.bestseller,
}))

const offers: DbOffer[] = seedOffers.map((o) => ({
  ...o,
  minOrder: o.minOrder,
  maxDiscount: o.maxDiscount,
  discountPercent: o.discountPercent,
}))

const users: DbUser[] = []
const addresses: DbAddress[] = []
const orders: DbOrder[] = []
const orderItems: DbOrderItem[] = []
const favorites: DbFavorite[] = []

export const db = {
  getRestaurants: () => restaurants,
  getRestaurantById: (id: string) => restaurants.find((r) => r.id === id),
  searchRestaurants: (q: string) =>
    restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.cuisine.some((c) => c.toLowerCase().includes(q)) ||
        r.description.toLowerCase().includes(q),
    ),
  getDishes: () => dishes,
  getDishesByRestaurant: (restaurantId: string) => dishes.filter((d) => d.restaurant_id === restaurantId || d.restaurantId === restaurantId),
  searchDishes: (q: string) =>
    dishes.filter((d) => d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)),
  getDishById: (id: string) => dishes.find((d) => d.id === id),
  getOffers: () => offers,

  getUserByEmail: (email: string) => users.find((u) => u.email === email),
  getUserById: (id: string) => users.find((u) => u.id === id),
  createUser: (user: DbUser) => {
    users.push(user)
    return user
  },

  getAddressesByUser: (userId: string) => addresses.filter((a) => a.userId === userId),
  getAddressById: (id: string) => addresses.find((a) => a.id === id),
  createAddress: (a: DbAddress) => {
    addresses.push(a)
    return a
  },
  updateAddress: (id: string, data: Partial<DbAddress>) => {
    const a = addresses.find((x) => x.id === id)
    if (a) Object.assign(a, data)
    return a
  },
  deleteAddress: (id: string) => {
    const idx = addresses.findIndex((a) => a.id === id)
    if (idx !== -1) addresses.splice(idx, 1)
  },
  clearDefaultsForUser: (userId: string) => {
    addresses.forEach((a) => {
      if (a.userId === userId) a.isDefault = false
    })
  },

  getOrdersByUser: (userId: string) => orders.filter((o) => o.userId === userId).reverse(),
  getOrderById: (id: string) => orders.find((o) => o.id === id),
  createOrder: (order: DbOrder, items: Omit<DbOrderItem, "id">[]) => {
    orders.push(order)
    orderItems.push(...items.map((i) => ({ ...i, id: "ITEM" + Date.now() + Math.random() })))
    return order
  },
  getOrderItems: (orderId: string) => orderItems.filter((i) => i.orderId === orderId),
  updateOrder: (id: string, data: Partial<DbOrder>) => {
    const o = orders.find((x) => x.id === id)
    if (o) Object.assign(o, data)
    return o
  },

  addFavorite: (userId: string, restaurantId: string) => {
    if (!favorites.some((f) => f.userId === userId && f.restaurantId === restaurantId)) {
      favorites.push({ userId, restaurantId })
    }
  },
  removeFavorite: (userId: string, restaurantId: string) => {
    const idx = favorites.findIndex((f) => f.userId === userId && f.restaurantId === restaurantId)
    if (idx !== -1) favorites.splice(idx, 1)
  },
  getFavorites: (userId: string) => favorites.filter((f) => f.userId === userId).map((f) => f.restaurantId),
}
