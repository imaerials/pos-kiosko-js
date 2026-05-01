import { Request } from 'express';

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'cashier' | 'manager' | 'admin';
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}