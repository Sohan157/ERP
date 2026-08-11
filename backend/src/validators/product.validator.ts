import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(2).max(50),
  category: z.string().min(2),
  unitPrice: z.number().nonnegative(),
  currentStock: z.number().int().nonnegative().optional(),
  minStock: z.number().int().nonnegative(),
  warehouseLocation: z.string().min(1)
});

export const stockSchema = z.object({
  quantity: z.number().int().positive(),
  type: z.enum(["IN", "OUT"]),
  reason: z.string().min(2)
});
