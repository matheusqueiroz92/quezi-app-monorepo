/**
 * Tipos do Frontend Quezi
 */

export type UserType = "CLIENT" | "PROFESSIONAL" | "ADMIN";

export type OrganizationRole = "OWNER" | "ADMIN" | "MEMBER";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  userType: UserType;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  session: {
    token: string;
    expiresAt: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
