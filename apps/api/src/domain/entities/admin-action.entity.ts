/**
 * Entidade AdminAction - Camada de Domínio
 *
 * Representa uma ação administrativa registrada no sistema
 * Seguindo os princípios DDD e Clean Architecture
 */

import { BadRequestError } from "../../utils/app-error";

export type ActionType =
  | "USER_SUSPENDED"
  | "USER_ACTIVATED"
  | "USER_DELETED"
  | "ADMIN_CREATED"
  | "ADMIN_UPDATED"
  | "ADMIN_DELETED"
  | "SERVICE_CREATED"
  | "SERVICE_UPDATED"
  | "SERVICE_DELETED"
  | "APPOINTMENT_CANCELLED"
  | "REVIEW_MODERATED"
  | "SYSTEM_CONFIGURED"
  | "DATA_EXPORTED"
  | "OTHER";

/**
 * Entidade AdminAction
 *
 * Representa uma ação administrativa registrada
 */
export class AdminAction {
  private constructor(
    private readonly _id: string,
    private readonly _adminId: string,
    private readonly _actionType: ActionType,
    private readonly _description: string,
    private readonly _targetId: string | null,
    private readonly _targetType: string | null,
    private readonly _metadata: Record<string, any> | null,
    private readonly _ipAddress: string | null,
    private readonly _userAgent: string | null,
    private readonly _createdAt: Date
  ) {}

  // Getters
  get id(): string {
    return this._id;
  }
  get adminId(): string {
    return this._adminId;
  }
  get actionType(): ActionType {
    return this._actionType;
  }
  get description(): string {
    return this._description;
  }
  get targetId(): string | null {
    return this._targetId;
  }
  get targetType(): string | null {
    return this._targetType;
  }
  get metadata(): Record<string, any> | null {
    return this._metadata;
  }
  get ipAddress(): string | null {
    return this._ipAddress;
  }
  get userAgent(): string | null {
    return this._userAgent;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * Factory method para criar nova instância
   */
  static create(data: CreateAdminActionData): AdminAction {
    this.validateAdminActionData(data);

    const now = new Date();
    return new AdminAction(
      data.id,
      data.adminId,
      data.actionType,
      data.description,
      data.targetId || null,
      data.targetType || null,
      data.metadata || null,
      data.ipAddress || null,
      data.userAgent || null,
      data.createdAt || now
    );
  }

  /**
   * Factory method para reconstruir a partir de dados de persistência
   */
  static fromPersistence(data: AdminActionPersistenceData): AdminAction {
    return new AdminAction(
      data.id,
      data.adminId,
      data.actionType,
      data.description,
      data.targetId,
      data.targetType,
      data.metadata,
      data.ipAddress,
      data.userAgent,
      data.createdAt
    );
  }

  /**
   * Verifica se é ação relacionada a usuário
   */
  isUserAction(): boolean {
    return ["USER_SUSPENDED", "USER_ACTIVATED", "USER_DELETED"].includes(
      this._actionType
    );
  }

  /**
   * Verifica se é ação relacionada a admin
   */
  isAdminAction(): boolean {
    return ["ADMIN_CREATED", "ADMIN_UPDATED", "ADMIN_DELETED"].includes(
      this._actionType
    );
  }

  /**
   * Verifica se é ação relacionada a serviço
   */
  isServiceAction(): boolean {
    return ["SERVICE_CREATED", "SERVICE_UPDATED", "SERVICE_DELETED"].includes(
      this._actionType
    );
  }

  /**
   * Converte para JSON
   */
  toJSON(): any {
    return {
      id: this._id,
      adminId: this._adminId,
      actionType: this._actionType,
      description: this._description,
      targetId: this._targetId,
      targetType: this._targetType,
      metadata: this._metadata,
      ipAddress: this._ipAddress,
      userAgent: this._userAgent,
      createdAt: this._createdAt.toISOString(),
    };
  }

  /**
   * Valida dados da ação administrativa
   */
  private static validateAdminActionData(data: CreateAdminActionData): void {
    if (!data.id) {
      throw new BadRequestError("ID é obrigatório");
    }

    if (!data.adminId) {
      throw new BadRequestError("ID do admin é obrigatório");
    }

    if (!data.actionType || !this.isValidActionType(data.actionType)) {
      throw new BadRequestError("Tipo de ação inválido");
    }

    if (!data.description || data.description.trim().length === 0) {
      throw new BadRequestError("Descrição é obrigatória");
    }
  }

  /**
   * Valida tipo de ação
   */
  private static isValidActionType(actionType: string): boolean {
    const validTypes: ActionType[] = [
      "USER_SUSPENDED",
      "USER_ACTIVATED",
      "USER_DELETED",
      "ADMIN_CREATED",
      "ADMIN_UPDATED",
      "ADMIN_DELETED",
      "SERVICE_CREATED",
      "SERVICE_UPDATED",
      "SERVICE_DELETED",
      "APPOINTMENT_CANCELLED",
      "REVIEW_MODERATED",
      "SYSTEM_CONFIGURED",
      "DATA_EXPORTED",
      "OTHER",
    ];
    return validTypes.includes(actionType as ActionType);
  }
}

/**
 * Interface para dados de criação
 */
export interface CreateAdminActionData {
  id: string;
  adminId: string;
  actionType: ActionType;
  description: string;
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
}

/**
 * Interface para dados de persistência
 */
export interface AdminActionPersistenceData {
  id: string;
  adminId: string;
  actionType: ActionType;
  description: string;
  targetId: string | null;
  targetType: string | null;
  metadata: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}
