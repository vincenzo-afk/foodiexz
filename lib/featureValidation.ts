import { z } from "zod"
import { deliveryAddressSchema, orderItemSchema } from "@/lib/validation"

export const roleSchema = z.enum(["user", "admin", "restaurant_manager"])

export const notificationPreferencesSchema = z.object({
  inApp: z.boolean().optional(),
  email: z.boolean().optional(),
  orderUpdates: z.boolean().optional(),
  promotions: z.boolean().optional(),
})

export const scheduledOrderSchema = z.object({
  restaurantId: z.string().trim().min(1),
  items: z.array(orderItemSchema).min(1).max(50),
  total: z.number().finite().positive().max(1_000_000),
  paymentMethod: z.enum(["cod", "wallet", "card", "upi"]),
  deliveryAddress: deliveryAddressSchema,
  scheduledFor: z.string().datetime({ offset: true }),
  timezone: z.string().trim().min(1).max(64),
})

export const cartValidationSchema = z.object({
  restaurantId: z.string().trim().min(1),
  items: z.array(z.object({ dishId: z.string().trim().min(1), quantity: z.number().int().min(1).max(99) })).min(1).max(50),
})

export const analyticsEventSchema = z.object({
  name: z.string().trim().regex(/^[a-z][a-z0-9_.-]{1,63}$/),
  restaurantId: z.string().trim().max(64).optional(),
  sessionId: z.string().trim().max(128).optional(),
  properties: z.record(z.union([z.string().max(300), z.number().finite(), z.boolean(), z.null()])).optional().default({}),
})
