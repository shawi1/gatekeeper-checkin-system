// Requirements: Shared TypeScript interfaces across all applications
// Purpose: Type safety and consistency for API contracts

// Requirement: FR-05 - Ticket status lifecycle
export type TicketStatus = 'REGISTERED' | 'WAITLISTED' | 'CHECKED_IN' | 'CANCELLED';

export type UserRole = 'ATTENDEE' | 'ORGANIZER' | 'ADMIN';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

// Event interfaces
export interface Event {
  id: string;
  title: string;
  description?: string;
  dateTime: Date | string;
  location: string;
  price: number;
  capacity: number;
  isPrivate: boolean;
  inviteToken?: string;
  imageUrl?: string;
  organizerId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  dateTime: Date | string;
  location: string;
  price: number;
  capacity: number;
  isPrivate: boolean;
  imageUrl?: string;
}

// User interfaces
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Ticket interfaces
export interface Ticket {
  id: string;
  jwtToken?: string;
  status: TicketStatus;
  nonce?: string;
  checkInTime?: Date | string;
  userId: string;
  eventId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface TicketWithDetails extends Ticket {
  event: Event;
  user: User;
}

export interface RegisterTicketInput {
  eventId: string;
  inviteToken?: string; // For private events
}

export interface RegisterTicketResponse {
  ticket: Ticket;
  requiresPayment: boolean;
  paymentClientSecret?: string; // Stripe client secret for paid events
}

// Requirements: FR-08 - Color-coded validation feedback
export interface ValidationResult {
  valid: boolean;
  reason?: string;
  color: 'green' | 'yellow' | 'red';
  message: string;
  ticket?: Ticket;
}

// Requirement: FR-07, FR-10, FR-11 - Scanner validation input
export interface ValidateTicketInput {
  token: string;
  eventId: string;
}

// Requirement: FR-09 - Real-time attendance statistics
export interface AttendanceStats {
  eventId: string;
  totalRegistered: number;
  totalCheckedIn: number;
  totalWaitlisted: number;
  capacity: number;
  checkInRate: number; // Percentage
  lastUpdated: Date | string;
}

// Transaction interfaces
export interface Transaction {
  id: string;
  amount: number;
  paymentMethod: string;
  status: TransactionStatus;
  stripePaymentId?: string;
  userId: string;
  eventId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// API error response
export interface ErrorResponse {
  error: string;
  message?: string;
  statusCode: number;
}
