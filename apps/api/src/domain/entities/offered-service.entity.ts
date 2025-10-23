/**
 * Entidade OfferedService - Camada de Domínio
 *
 * Representa um serviço oferecido por um profissional
 * Seguindo os princípios DDD e Clean Architecture
 */

import { ServicePriceType, ServiceMode } from "../interfaces/user.interface";
import { BadRequestError } from "../../utils/app-error";

/**
 * Entidade OfferedService
 *
 * Representa um serviço oferecido por um profissional
 */
export class OfferedService {
  private constructor(
    private readonly _id: string,
    private readonly _professionalId: string,
    private readonly _categoryId: string,
    private readonly _name: string,
    private readonly _description: string | null,
    private readonly _price: number,
    private readonly _priceType: ServicePriceType,
    private readonly _duration: number,
    private readonly _serviceMode: ServiceMode,
    private readonly _isActive: boolean,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date
  ) {}

  // Getters
  get id(): string {
    return this._id;
  }
  get professionalId(): string {
    return this._professionalId;
  }
  get categoryId(): string {
    return this._categoryId;
  }
  get name(): string {
    return this._name;
  }
  get description(): string | null {
    return this._description;
  }
  get price(): number {
    return this._price;
  }
  get priceType(): ServicePriceType {
    return this._priceType;
  }
  get duration(): number {
    return this._duration;
  }
  get serviceMode(): ServiceMode {
    return this._serviceMode;
  }
  get isActive(): boolean {
    return this._isActive;
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
  static create(data: CreateOfferedServiceData): OfferedService {
    this.validateOfferedServiceData(data);

    const now = new Date();
    return new OfferedService(
      data.id,
      data.professionalId,
      data.categoryId,
      data.name,
      data.description || null,
      data.price,
      data.priceType,
      data.duration,
      data.serviceMode,
      data.isActive !== undefined ? data.isActive : true,
      data.createdAt || now,
      data.updatedAt || now
    );
  }

  /**
   * Factory method para reconstruir a partir de dados de persistência
   */
  static fromPersistence(data: OfferedServicePersistenceData): OfferedService {
    return new OfferedService(
      data.id,
      data.professionalId,
      data.categoryId,
      data.name,
      data.description,
      data.price,
      data.priceType,
      data.duration,
      data.serviceMode,
      data.isActive,
      data.createdAt,
      data.updatedAt
    );
  }

  /**
   * Atualiza informações do serviço
   */
  updateInfo(data: UpdateOfferedServiceData): OfferedService {
    const name = data.name || this._name;
    const description =
      data.description !== undefined ? data.description : this._description;
    const price = data.price !== undefined ? data.price : this._price;
    const priceType = data.priceType || this._priceType;
    const duration =
      data.duration !== undefined ? data.duration : this._duration;
    const serviceMode = data.serviceMode || this._serviceMode;

    // Validar dados atualizados
    this.validateOfferedServiceData({
      id: this._id,
      professionalId: this._professionalId,
      categoryId: this._categoryId,
      name,
      description,
      price,
      priceType,
      duration,
      serviceMode,
    });

    return new OfferedService(
      this._id,
      this._professionalId,
      this._categoryId,
      name,
      description,
      price,
      priceType,
      duration,
      serviceMode,
      this._isActive,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Ativa o serviço
   */
  activate(): OfferedService {
    return new OfferedService(
      this._id,
      this._professionalId,
      this._categoryId,
      this._name,
      this._description,
      this._price,
      this._priceType,
      this._duration,
      this._serviceMode,
      true,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Desativa o serviço
   */
  deactivate(): OfferedService {
    return new OfferedService(
      this._id,
      this._professionalId,
      this._categoryId,
      this._name,
      this._description,
      this._price,
      this._priceType,
      this._duration,
      this._serviceMode,
      false,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Converte para JSON
   */
  toJSON(): any {
    return {
      id: this._id,
      professionalId: this._professionalId,
      categoryId: this._categoryId,
      name: this._name,
      description: this._description,
      price: this._price,
      priceType: this._priceType,
      duration: this._duration,
      serviceMode: this._serviceMode,
      isActive: this._isActive,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }

  /**
   * Valida dados do serviço
   */
  private static validateOfferedServiceData(
    data: CreateOfferedServiceData
  ): void {
    if (!data.id) {
      throw new BadRequestError("ID é obrigatório");
    }

    if (!data.professionalId) {
      throw new BadRequestError("ID do profissional é obrigatório");
    }

    if (!data.categoryId) {
      throw new BadRequestError("ID da categoria é obrigatório");
    }

    if (!data.name || data.name.trim().length < 2) {
      throw new BadRequestError("Nome deve ter pelo menos 2 caracteres");
    }

    if (data.price < 0) {
      throw new BadRequestError("Preço não pode ser negativo");
    }

    if (data.duration < 15) {
      throw new BadRequestError("Duração deve ser pelo menos 15 minutos");
    }

    if (data.duration > 480) {
      throw new BadRequestError("Duração não pode ser maior que 8 horas");
    }
  }
}

/**
 * Interface para dados de criação
 */
export interface CreateOfferedServiceData {
  id: string;
  professionalId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  priceType: ServicePriceType;
  duration: number;
  serviceMode: ServiceMode;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para dados de atualização
 */
export interface UpdateOfferedServiceData {
  name?: string;
  description?: string | null;
  price?: number;
  priceType?: ServicePriceType;
  duration?: number;
  serviceMode?: ServiceMode;
}

/**
 * Interface para dados de persistência
 */
export interface OfferedServicePersistenceData {
  id: string;
  professionalId: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  priceType: ServicePriceType;
  duration: number;
  serviceMode: ServiceMode;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
