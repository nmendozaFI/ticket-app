import { z } from "zod";

// ============= TRIP SCHEMAS =============
export const createTripSchema = z.object({
  city: z.string().min(1, "La ciudad es requerida"),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()),
  project: z.string().optional(),
  notes: z.string().optional(),
});

export const updateTripSchema = z.object({
  city: z.string().min(1).optional(),
  startDate: z.string().datetime().or(z.date()).optional(),
  endDate: z.string().datetime().or(z.date()).optional(),
  project: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["PENDIENTE", "APROBADO", "RECHAZADO"]).optional(), // ✅ Corregido
  totalAmount: z.number().optional(),
});

// Schema específico para actualizar status
export const updateStatusSchema = z.object({
  status: z.enum(["PENDIENTE", "APROBADO", "RECHAZADO"]), // ✅ Corregido
});

// ============= EXPENSE SCHEMAS =============
export const createExpenseSchema = z.object({
  date: z.string().datetime().or(z.date()),
  amount: z.number().positive("El monto debe ser mayor a 0"),
  category: z.string().optional(),
  vendor: z.string().optional(),
  description: z.string().optional(),
  receiptUrl: z.string().url().optional().or(z.literal("")),
  invoiceNumber: z.string().optional(), 
  paymentMethod: z.string().optional(), 
});

export const updateExpenseSchema = z.object({
  date: z.string().datetime().or(z.date()).optional(),
  amount: z.number().positive().optional(),
  category: z.string().optional(),
  vendor: z.string().optional(),
  description: z.string().optional(),
  receiptUrl: z.string().url().optional().or(z.literal("")),
  invoiceNumber: z.string().optional(),  // ✅ NUEVO
  paymentMethod: z.string().optional(),  // ✅ NUEVO
});