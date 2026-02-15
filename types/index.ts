export type UserRole = "USER" | "ADMIN";

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
};

export interface PaginatedResponse<T> {
  trips: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// TYPES PARA LA APP DE TICKET 
export type TripStatus = "PENDIENTE" | "APROBADO" | "RECHAZADO"  // ✅ Corregido

// Trip completo
export interface Trip {
  id: string
  userId: string
  city: string
  startDate: Date | string  
  endDate: Date | string
  project?: string | null
  notes?: string | null
  status: TripStatus
  totalAmount: number 
  createdAt: Date
  updatedAt: Date
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
  invoiceNumber?: string | null  
  paymentMethod?: string | null  
  createdAt: Date
  updatedAt: Date
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
  invoiceNumber?: string  
  paymentMethod?: string  
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
  invoiceNumber?: string  
  paymentMethod?: string  
}