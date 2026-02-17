export type UserRole = "USER" | "ADMIN";

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
};

export type TripStatus = "PENDIENTE" | "APROBADO" | "RECHAZADO";

// ✅ NUEVO: asignación
export interface TripAssignment {
  id: string;
  tripId: string;
  userId: string;
  user?: User;
  createdAt: Date;
}

export interface Trip {
  id: string;
  createdByAdminId: string        // ✅ NUEVO
  createdByAdmin?: User           // ✅ NUEVO
  city: string;
  startDate: Date | string;
  endDate: Date | string;
  project?: string | null;
  notes?: string | null;
  status: TripStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  assignedUsers?: TripAssignment[] // ✅ NUEVO (reemplaza a user)
  expenses?: Expense[];
}

// ✅ NUEVO: DTO para crear viaje (solo admin)
export interface CreateTripDto {
  city: string;
  startDate: Date;
  endDate: Date;
  project?: string;
  notes?: string;
  assignedUserIds: string[]        // ✅ NUEVO: uno o varios usuarios
}

export interface UpdateTripDto {
  city?: string;
  startDate?: Date;
  endDate?: Date;
  project?: string;
  notes?: string;
  status?: TripStatus;
  assignedUserIds?: string[]       // ✅ NUEVO
}

export interface TripFormDto {
  city: string;
  startDate: string;
  endDate: string;
  project?: string;
  notes?: string;
  assignedUserIds: string[]        // ✅ NUEVO
}

export interface Expense {
  id: string;
  tripId: string;
  date: Date;
  amount: number;
  category?: string | null;        // incluye "Billete" ← NUEVO
  vendor?: string | null;
  description?: string | null;
  receiptUrl?: string | null;
  invoiceNumber?: string | null;
  paymentMethod?: string | null;
  createdByAdminId?: string | null // ✅ NUEVO
  createdAt: Date;
  updatedAt: Date;
  trip?: Trip;
}

export interface CreateExpenseDto {
  tripId: string;
  date: Date;
  amount: number;
  category?: string;
  vendor?: string;
  description?: string;
  receiptUrl?: string;
  invoiceNumber?: string;
  paymentMethod?: string;
}

export interface UpdateExpenseDto {
  date?: Date;
  amount?: number;
  category?: string;
  vendor?: string;
  description?: string;
  receiptUrl?: string;
  invoiceNumber?: string;
  paymentMethod?: string;
}

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