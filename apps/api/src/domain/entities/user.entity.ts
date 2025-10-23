/**
 * Entidades de Domínio - User
 *
 * Seguindo os princípios DDD e Clean Architecture:
 * - Encapsulamento de lógica de negócio
 * - Validações no domínio
 * - Agregados bem definidos
 */

import { IUser, UserType } from "../interfaces/user.interface";

export class User implements IUser {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly phone: string | undefined,
    public readonly userType: UserType,
    public readonly isEmailVerified: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  // Factory method para criar usuário
  public static create(data: CreateUserData): User {
    this.validateUserData(data);

    return new User(
      data.id,
      data.email,
      data.name,
      data.phone,
      data.userType,
      data.isEmailVerified || false,
      data.createdAt || new Date(),
      data.updatedAt || new Date()
    );
  }

  // Factory method para reconstruir usuário do banco
  public static fromPersistence(data: UserPersistenceData): User {
    return new User(
      data.id,
      data.email,
      data.name,
      data.phone,
      data.userType,
      data.isEmailVerified,
      data.createdAt,
      data.updatedAt
    );
  }

  // Métodos de domínio
  public canCreateAppointment(): boolean {
    return this.userType === UserType.CLIENT;
  }

  public canReceiveAppointments(): boolean {
    return (
      this.userType === UserType.PROFESSIONAL ||
      this.userType === UserType.COMPANY
    );
  }

  public getProfileType(): string {
    switch (this.userType) {
      case UserType.CLIENT:
        return "client";
      case UserType.PROFESSIONAL:
        return "professional";
      case UserType.COMPANY:
        return "company";
      default:
        throw new Error("Tipo de usuário inválido");
    }
  }

  public isClient(): boolean {
    return this.userType === UserType.CLIENT;
  }

  public isProfessional(): boolean {
    return this.userType === UserType.PROFESSIONAL;
  }

  public isCompany(): boolean {
    return this.userType === UserType.COMPANY;
  }

  public canManageEmployees(): boolean {
    return this.userType === UserType.COMPANY;
  }

  public canOfferServices(): boolean {
    return (
      this.userType === UserType.PROFESSIONAL ||
      this.userType === UserType.COMPANY
    );
  }

  public canBookAppointments(): boolean {
    return this.userType === UserType.CLIENT;
  }

  // Validações de domínio
  private static validateUserData(data: CreateUserData): void {
    if (!data.id) {
      throw new Error("ID do usuário é obrigatório");
    }

    if (!data.email) {
      throw new Error("Email é obrigatório");
    }

    if (!this.isValidEmail(data.email)) {
      throw new Error("Email inválido");
    }

    if (!data.name) {
      throw new Error("Nome é obrigatório");
    }

    if (data.name.length < 2) {
      throw new Error("Nome deve ter pelo menos 2 caracteres");
    }

    if (data.phone && !this.isValidPhone(data.phone)) {
      throw new Error("Telefone inválido");
    }

    if (!Object.values(UserType).includes(data.userType)) {
      throw new Error("Tipo de usuário inválido");
    }
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
  }
}

// ========================================
// TYPES E INTERFACES
// ========================================

export interface CreateUserData {
  id: string;
  email: string;
  name: string;
  phone?: string;
  userType: UserType;
  isEmailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserPersistenceData {
  id: string;
  email: string;
  name: string;
  phone?: string;
  userType: UserType;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
