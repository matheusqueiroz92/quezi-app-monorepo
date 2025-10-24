/**
 * Entidade Service - Camada de Domínio
 *
 * Representa um serviço oferecido (pode ser por profissional ou empresa)
 * Seguindo os princípios DDD e Clean Architecture
 */

import { ServicePriceType, ServiceMode } from "../interfaces/user.interface";
import { BadRequestError } from "../../utils/app-error";

/**
 * Entidade Service
 *
 * Representa um serviço oferecido por profissional ou empresa
 */
export class Service {
  private constructor(
    private readonly _id: string,
    private readonly _ownerId: string,
    private readonly _ownerType: "PROFESSIONAL" | "COMPANY",
    private readonly _categoryId: string,
    private readonly _name: string,
    private readonly _description: string | null,
    private readonly _price: number,
    private readonly _priceType: ServicePriceType,
    private readonly _duration: number,
    private readonly _serviceMode: ServiceMode | null,
    private readonly _isActive: boolean,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date
  ) {}

  // Getters
  get id(): string {
    return this._id;
  }
  get ownerId(): string {
    return this._ownerId;
  }
  get ownerType(): "PROFESSIONAL" | "COMPANY" {
    return this._ownerType;
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
  get serviceMode(): ServiceMode | null {
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
  static create(data: CreateServiceData): Service {
    this.validateServiceData(data);

    const now = new Date();
    return new Service(
      data.id,
      data.ownerId,
      data.ownerType,
      data.categoryId,
      data.name,
      data.description || null,
      data.price,
      data.priceType,
      data.duration,
      data.serviceMode || null,
      data.isActive !== undefined ? data.isActive : true,
      data.createdAt || now,
      data.updatedAt || now
    );
  }

  /**
   * Factory method para reconstruir a partir de dados de persistência
   */
  static fromPersistence(data: ServicePersistenceData): Service {
    return new Service(
      data.id,
      data.ownerId,
      data.ownerType,
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
  updateInfo(data: UpdateServiceData): Service {
    const name = data.name || this._name;
    const description =
      data.description !== undefined ? data.description : this._description;
    const price = data.price !== undefined ? data.price : this._price;
    const priceType = data.priceType || this._priceType;
    const duration =
      data.duration !== undefined ? data.duration : this._duration;
    const serviceMode =
      data.serviceMode !== undefined ? data.serviceMode : this._serviceMode;

    // Validar dados atualizados
    this.validateServiceData({
      id: this._id,
      ownerId: this._ownerId,
      ownerType: this._ownerType,
      categoryId: this._categoryId,
      name,
      description,
      price,
      priceType,
      duration,
      serviceMode,
    });

    return new Service(
      this._id,
      this._ownerId,
      this._ownerType,
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
  activate(): Service {
    return new Service(
      this._id,
      this._ownerId,
      this._ownerType,
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
  deactivate(): Service {
    return new Service(
      this._id,
      this._ownerId,
      this._ownerType,
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
   * Verifica se é um serviço de profissional
   */
  isProfessionalService(): boolean {
    return this._ownerType === "PROFESSIONAL";
  }

  /**
   * Verifica se é um serviço de empresa
   */
  isCompanyService(): boolean {
    return this._ownerType === "COMPANY";
  }

  /**
   * Converte para JSON
   */
  toJSON(): any {
    return {
      id: this._id,
      ownerId: this._ownerId,
      ownerType: this._ownerType,
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
  private static validateServiceData(data: CreateServiceData): void {
    if (!data.id) {
      throw new BadRequestError("ID é obrigatório");
    }

    if (!data.ownerId) {
      throw new BadRequestError("ID do proprietário é obrigatório");
    }

    if (
      !data.ownerType ||
      !["PROFESSIONAL", "COMPANY"].includes(data.ownerType)
    ) {
      throw new BadRequestError(
        "Tipo de proprietário deve ser PROFESSIONAL ou COMPANY"
      );
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

    // Para serviços de profissional, serviceMode é obrigatório
    if (data.ownerType === "PROFESSIONAL" && !data.serviceMode) {
      throw new BadRequestError(
        "Modo de serviço é obrigatório para profissionais"
      );
    }

    // Para serviços de empresa, serviceMode não deve ser fornecido
    if (data.ownerType === "COMPANY" && data.serviceMode) {
      throw new BadRequestError(
        "Modo de serviço não é aplicável para empresas"
      );
    }
  }
}

/**
 * Interface para dados de criação
 */
export interface CreateServiceData {
  id: string;
  ownerId: string;
  ownerType: "PROFESSIONAL" | "COMPANY";
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  priceType: ServicePriceType;
  duration: number;
  serviceMode?: ServiceMode;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para dados de atualização
 */
export interface UpdateServiceData {
  name?: string;
  description?: string | null;
  price?: number;
  priceType?: ServicePriceType;
  duration?: number;
  serviceMode?: ServiceMode | null;
}

/**
 * Interface para dados de persistência
 */
export interface ServicePersistenceData {
  id: string;
  ownerId: string;
  ownerType: "PROFESSIONAL" | "COMPANY";
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  priceType: ServicePriceType;
  duration: number;
  serviceMode: ServiceMode | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
