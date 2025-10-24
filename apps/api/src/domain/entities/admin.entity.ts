/**
 * Entidade Admin - Camada de Domínio
 *
 * Representa um administrador do sistema
 * Seguindo os princípios DDD e Clean Architecture
 */

import { BadRequestError } from "../../utils/app-error";

export type AdminRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MODERATOR"
  | "SUPPORT"
  | "ANALYST";

/**
 * Entidade Admin
 *
 * Representa um administrador do sistema
 */
export class Admin {
  private constructor(
    private readonly _id: string,
    private readonly _email: string,
    private readonly _name: string,
    private readonly _role: AdminRole,
    private readonly _permissions: Record<string, boolean>,
    private readonly _isActive: boolean,
    private readonly _lastLoginAt: Date | null,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date
  ) {}

  // Getters
  get id(): string {
    return this._id;
  }
  get email(): string {
    return this._email;
  }
  get name(): string {
    return this._name;
  }
  get role(): AdminRole {
    return this._role;
  }
  get permissions(): Record<string, boolean> {
    return this._permissions;
  }
  get isActive(): boolean {
    return this._isActive;
  }
  get lastLoginAt(): Date | null {
    return this._lastLoginAt;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Factory method para criar nova instância
   */
  static create(data: CreateAdminData): Admin {
    this.validateAdminData(data);

    const now = new Date();
    return new Admin(
      data.id,
      data.email,
      data.name,
      data.role,
      data.permissions || {},
      data.isActive !== undefined ? data.isActive : true,
      null, // lastLoginAt
      data.createdAt || now,
      data.updatedAt || now
    );
  }

  /**
   * Factory method para reconstruir a partir de dados de persistência
   */
  static fromPersistence(data: AdminPersistenceData): Admin {
    return new Admin(
      data.id,
      data.email,
      data.name,
      data.role,
      data.permissions,
      data.isActive,
      data.lastLoginAt,
      data.createdAt,
      data.updatedAt
    );
  }

  /**
   * Atualiza informações do admin
   */
  updateInfo(data: UpdateAdminData): Admin {
    const name = data.name || this._name;
    const role = data.role || this._role;
    const permissions = data.permissions || this._permissions;

    // Validar dados atualizados
    this.validateAdminData({
      id: this._id,
      email: this._email,
      name,
      role,
      permissions,
    });

    return new Admin(
      this._id,
      this._email,
      name,
      role,
      permissions,
      this._isActive,
      this._lastLoginAt,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Ativa o admin
   */
  activate(): Admin {
    return new Admin(
      this._id,
      this._email,
      this._name,
      this._role,
      this._permissions,
      true,
      this._lastLoginAt,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Desativa o admin
   */
  deactivate(): Admin {
    return new Admin(
      this._id,
      this._email,
      this._name,
      this._role,
      this._permissions,
      false,
      this._lastLoginAt,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Atualiza último login
   */
  updateLastLogin(): Admin {
    return new Admin(
      this._id,
      this._email,
      this._name,
      this._role,
      this._permissions,
      this._isActive,
      new Date(),
      this._createdAt,
      new Date()
    );
  }

  /**
   * Verifica se é SUPER_ADMIN
   */
  isSuperAdmin(): boolean {
    return this._role === "SUPER_ADMIN";
  }

  /**
   * Verifica se tem permissão específica
   */
  hasPermission(permission: string): boolean {
    return this._permissions[permission] === true;
  }

  /**
   * Verifica se pode gerenciar outros admins
   */
  canManageAdmins(): boolean {
    return this._role === "SUPER_ADMIN" || this._role === "ADMIN";
  }

  /**
   * Verifica se pode gerenciar usuários
   */
  canManageUsers(): boolean {
    return ["SUPER_ADMIN", "ADMIN", "MODERATOR"].includes(this._role);
  }

  /**
   * Converte para JSON
   */
  toJSON(): any {
    return {
      id: this._id,
      email: this._email,
      name: this._name,
      role: this._role,
      permissions: this._permissions,
      isActive: this._isActive,
      lastLoginAt: this._lastLoginAt?.toISOString() || null,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }

  /**
   * Valida dados do admin
   */
  private static validateAdminData(data: CreateAdminData): void {
    if (!data.id) {
      throw new BadRequestError("ID é obrigatório");
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      throw new BadRequestError("Email válido é obrigatório");
    }

    if (!data.name || data.name.trim().length < 2) {
      throw new BadRequestError("Nome deve ter pelo menos 2 caracteres");
    }

    if (!data.role || !this.isValidRole(data.role)) {
      throw new BadRequestError(
        "Role deve ser SUPER_ADMIN, ADMIN, MODERATOR, SUPPORT ou ANALYST"
      );
    }
  }

  /**
   * Valida email
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida role
   */
  private static isValidRole(role: string): boolean {
    const validRoles: AdminRole[] = [
      "SUPER_ADMIN",
      "ADMIN",
      "MODERATOR",
      "SUPPORT",
      "ANALYST",
    ];
    return validRoles.includes(role as AdminRole);
  }
}

/**
 * Interface para dados de criação
 */
export interface CreateAdminData {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions?: Record<string, boolean>;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para dados de atualização
 */
export interface UpdateAdminData {
  name?: string;
  role?: AdminRole;
  permissions?: Record<string, boolean>;
}

/**
 * Interface para dados de persistência
 */
export interface AdminPersistenceData {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: Record<string, boolean>;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
