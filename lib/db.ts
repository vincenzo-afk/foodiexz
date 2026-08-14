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
  lat?: number
  lng?: number
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
  lat?: number
  lng?: number
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
  deliveryLat?: number
  deliveryLng?: number
  restaurantLat?: number
  restaurantLng?: number
  status: string
  statusHistory: { status: string; at: number }[]
  rating?: number
  review?: string
  createdAt: string
  deliveryFee?: number
  tip?: number
  deliveryNote?: string | null
}

export interface DbOrderItem {
  id: string
  orderId: string
  dishId: string
  name: string
  price: number
  quantity: number
  isVeg?: boolean
  image?: string
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
  type?: string
}

const restaurants: DbRestaurant[] = seedRestaurants.map((r) => ({
  ...r,
  lat: r.lat,
  lng: r.lng,
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
  type: o.type,
}))

// ---------- Live tracking helpers ----------

export interface GeoPoint {
  lat: number
  lng: number
}

/** Haversine distance in km between two points. */
export function haversine(a: GeoPoint, b: GeoPoint): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const s1 = Math.sin(dLat / 2)
  const s2 = Math.sin(dLng / 2)
  const h = s1 * s1 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * s2 * s2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Rider moves slower during preparation (stuck near restaurant) and faster once on the way.
 *  durationMinutes: total simulated journey length in minutes from order placement. */
const PREP_FRACTION = 0.35 // fraction of journey spent in "preparing" stage

/** Returns rider progress 0..1 for an order at elapsed ms since placement. */
export function progressForOrder(order: DbOrder): number {
  const elapsedMin = (Date.now() - new Date(order.createdAt).getTime()) / 60000
  // Total journey time: 8 min for <=2km, up to 15 min for longer orders
  const dist = order.restaurantLat && order.deliveryLat
    ? haversine({ lat: order.restaurantLat, lng: order.restaurantLng! }, { lat: order.deliveryLat, lng: order.deliveryLng! })
    : 3
  const totalMinutes = Math.min(15, Math.max(8, dist * 2.5))
  return Math.min(1, elapsedMin / totalMinutes)
}

/** Map progress + status to the rider position along the route. */
export function riderPositionFor(order: DbOrder): GeoPoint | null {
  if (!order.restaurantLat || !order.deliveryLat) return null
  const from: GeoPoint = { lat: order.restaurantLat, lng: order.restaurantLng! }
  const to: GeoPoint = { lat: order.deliveryLat, lng: order.deliveryLng! }
  let t = progressForOrder(order)
  // During preparation the rider stays within the first 5% of the route
  if (order.status === "preparing") t = Math.min(t, 0.05)
  else if (order.status === "delivered") t = 1
  return { lat: from.lat + (to.lat - from.lat) * t, lng: from.lng + (to.lng - from.lng) * t }
}

/** Auto-advance order status based on progress (idempotent). */
export function advanceOrderStatus(order: DbOrder): DbOrder {
  if (order.status === "delivered" || order.status === "cancelled") return order
  const t = progressForOrder(order)
  let next: string | null = null
  if (t >= 1) next = "delivered"
  else if (t >= PREP_FRACTION && order.status === "preparing") next = "on-the-way"
  if (next && next !== order.status) {
    order.status = next
    order.statusHistory.push({ status: next, at: Date.now() })
  }
  return order
}

/** Fetch a road route polyline from OSRM (public, keyless) between two points.
 * Returns null if unavailable (caller should fall back to a straight line). */
export async function fetchRoutePolyline(from: GeoPoint, to: GeoPoint): Promise<{ geometry: GeoPoint[]; distanceKm: number } | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) })
    if (!res.ok) return null
    const data = (await res.json()) as any
    const route = data?.routes?.[0]
    if (!route) return null
    return {
      geometry: route.geometry.coordinates.map((c: number[]) => ({ lat: c[1], lng: c[0] })),
      distanceKm: (route.distance / 1000),
    }
  } catch {
    return null
  }
}

const users: DbUser[] = []
const addresses: DbAddress[] = []
const orders: DbOrder[] = []
const orderItems: DbOrderItem[] = []
const favorites: DbFavorite[] = []

export const db = {
  fetchRoutePolyline,
  advanceOrderStatus,
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
  getDishesByRestaurant: (restaurantId: string) => dishes.filter((d) => d.restaurantId === restaurantId),
  searchDishes: (q: string) =>
    dishes.filter((d) => d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)),
  getDishById: (id: string) => dishes.find((d) => d.id === id),
  getOffers: () => offers,

  getUserByEmail: (email: string) => users.find((u) => u.email === email),
  getUserById: (id: string) => users.find((u) => u.id === id),
  updateUserWallet: (id: string, wallet: number) => {
    const u = users.find((u) => u.id === id)
    if (u) u.wallet = Math.max(0, wallet)
  },
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
  /** Returns live tracking snapshot: rider position, ETA, route, status history. */
  getOrderTracking: (id: string) => {
    const order = orders.find((o) => o.id === id)
    if (!order) return null
    advanceOrderStatus(order)
    const pos = riderPositionFor(order)
    let distanceKm = order.restaurantLat && order.deliveryLat
      ? haversine({ lat: order.restaurantLat, lng: order.restaurantLng! }, { lat: order.deliveryLat, lng: order.deliveryLng! })
      : 0
    const remaining = distanceKm * (1 - progressForOrder(order))
    const speedKmh = order.status === "on-the-way" ? 30 : 18
    const etaMinutes = order.status === "delivered" ? 0 : Math.max(1, Math.round((remaining / speedKmh) * 60))
    return {
      orderId: order.id,
      status: order.status,
      statusHistory: order.statusHistory,
      restaurant: {
        name: order.restaurantName,
        lat: order.restaurantLat,
        lng: order.restaurantLng,
        address: order.deliveryAddress,
      },
      delivery: { address: order.deliveryAddress, lat: order.deliveryLat, lng: order.deliveryLng },
      rider: pos,
      progress: Math.min(1, progressForOrder(order)),
      distanceKm: Math.round(distanceKm * 10) / 10,
      etaMinutes,
      createdAt: order.createdAt,
    }
  },
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
