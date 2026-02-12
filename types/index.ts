export type UserRole = "USER" | "ADMIN";

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
};


// TYPES PARA LA APP DE TICKET 
export type TripStatus = "DRAFT" | "ACTIVE" | "COMPLETED" // Ajusta según tu enum Prisma

// Trip completo
export interface Trip {
  id: string
  userId: string
  city: string
  startDate: Date | string  // ✅ Prisma puede devolver string o Date
  endDate: Date | string
  project?: string | null
  notes?: string | null
  status: TripStatus
  totalAmount: number // Decimal como number
  createdAt: Date
  updatedAt: Date
  // Relaciones (opcional, si backend las incluye)
  user?: User
  expenses?: Expense[]
}

// Para crear (sin ID, relaciones)
export interface CreateTripDto {
  city: string
  startDate: Date
  endDate: Date
  project?: string
  notes?: string
}

// Expense completo
export interface Expense {
  id: string
  tripId: string
  date: Date
  amount: number // Decimal como number
  category?: string | null
  vendor?: string | null
  description?: string | null
  receiptUrl?: string | null
  createdAt: Date
  updatedAt: Date
  // Relaciones
  trip?: Trip
}

// Para crear expense
export interface CreateExpenseDto {
  tripId: string
  date: Date
  amount: number
  category?: string
  vendor?: string
  description?: string
  receiptUrl?: string
}

export interface TripFormDto {
  city: string
  startDate: string  // YYYY-MM-DD
  endDate: string
  project?: string
  notes?: string
}

// Para mutations (si necesitas)
export interface UpdateTripDto {
  city?: string
  startDate?: Date
  endDate?: Date
  project?: string
  notes?: string
  status?: TripStatus
}

export interface UpdateExpenseDto {
  date?: Date
  amount?: number
  category?: string
  vendor?: string
  description?: string
  receiptUrl?: string
}