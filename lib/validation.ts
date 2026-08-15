import { z } from "zod"

export const deliveryAddressSchema = z.object({
  type: z.string().trim().max(32).optional(),
  address: z.string().trim().min(1, "Delivery address is required").max(500),
  landmark: z.string().trim().max(200).optional(),
  lat: z.number().finite().min(-90).max(90).optional(),
  lng: z.number().finite().min(-180).max(180).optional(),
})

export const orderItemSchema = z.object({
  dishId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(160),
  price: z.number().finite().nonnegative(),
  quantity: z.number().int().min(1).max(99),
  isVeg: z.boolean().optional(),
  image: z.string().trim().max(2000).optional(),
})

export const createOrderSchema = z.object({
  restaurantId: z.string().trim().min(1),
  restaurantName: z.string().trim().min(1).max(160),
  total: z.number().finite().positive().max(1_000_000),
  paymentMethod: z.enum(["cod", "wallet", "card", "upi"]),
  deliveryAddress: deliveryAddressSchema,
  items: z.array(orderItemSchema).min(1).max(50),
  tip: z.number().finite().nonnegative().max(10_000).optional().default(0),
  deliveryNote: z.string().trim().max(500).nullable().optional(),
  idempotencyKey: z.string().trim().min(8).max(128).optional(),
})

export const couponValidationSchema = z.object({
  code: z.string().trim().min(1).max(64),
  orderTotal: z.number().finite().nonnegative().max(1_000_000),
})

export const walletTopUpSchema = z.object({
  amount: z.number().finite().positive().max(10_000),
  reason: z.string().trim().max(120).optional(),
})

export const orderStatusSchema = z.object({
  status: z.enum(["preparing", "on-the-way", "delivered", "cancelled"]),
})

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review: z.string().trim().max(1000).optional().default(""),
})

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  message: z.string().trim().min(10).max(2000),
})

export const signUpSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
  phone: z.string().trim().max(32).optional(),
})

export const loginSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(128),
})

export function validationError(error: z.ZodError) {
  return error.issues.map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`).join("; ")
}
