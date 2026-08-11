import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2),
  mobile: z.string().min(10).max(15),
  email: z.email(),
  businessName: z.string().min(2),
  gstNumber: z.string().optional(),
  type: z.enum(["RETAIL", "WHOLESALE", "DISTRIBUTOR"]),
  address: z.string().min(3),
  status: z.enum(["LEAD", "ACTIVE", "INACTIVE"]).default("LEAD"),
  followUpDate: z.string().nullable().optional(),
  notes: z.string().optional()
});

export const followUpSchema = z.object({
  note: z.string().min(1),
  followUpDate: z.string().nullable().optional(),
});
