/**
 * Entidade CompanyService - Camada de Domínio
 *
 * Representa um serviço oferecido por uma empresa
 * Seguindo os princípios DDD e Clean Architecture
 */

import { ServicePriceType } from "../interfaces/user.interface";
import { BadRequestError } from "../../utils/app-error";

/**
 * Entidade CompanyService
 *
 * Representa um serviço oferecido por uma empresa
 */
export class CompanyService {
  private constructor(
    private readonly _id: string,
    private readonly _companyId: string,
    private readonly _categoryId: string,
    private readonly _name: string,
    private readonly _description: string | null,
    private readonly _price: number,
    private readonly _priceType: ServicePriceType,
    private readonly _duration: number,
    private readonly _isActive: boolean,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date
  ) {}

  // Getters
  get id(): string {
    return this._id;
  }
  get companyId(): string {
    return this._companyId;
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
  static create(data: CreateCompanyServiceData): CompanyService {
    this.validateCompanyServiceData(data);

    const now = new Date();
    return new CompanyService(
      data.id,
      data.companyId,
      data.categoryId,
      data.name,
      data.description || null,
      data.price,
      data.priceType,
      data.duration,
      data.isActive !== undefined ? data.isActive : true,
      data.createdAt || now,
      data.updatedAt || now
    );
  }

  /**
   * Factory method para reconstruir a partir de dados de persistência
   */
  static fromPersistence(data: CompanyServicePersistenceData): CompanyService {
    return new CompanyService(
      data.id,
      data.companyId,
      data.categoryId,
      data.name,
      data.description,
      data.price,
      data.priceType,
      data.duration,
      data.isActive,
      data.createdAt,
      data.updatedAt
    );
  }

  /**
   * Atualiza informações do serviço
   */
  updateInfo(data: UpdateCompanyServiceData): CompanyService {
    const name = data.name || this._name;
    const description =
      data.description !== undefined ? data.description : this._description;
    const price = data.price !== undefined ? data.price : this._price;
    const priceType = data.priceType || this._priceType;
    const duration =
      data.duration !== undefined ? data.duration : this._duration;

    // Validar dados atualizados
    this.validateCompanyServiceData({
      id: this._id,
      companyId: this._companyId,
      categoryId: this._categoryId,
      name,
      description,
      price,
      priceType,
      duration,
    });

    return new CompanyService(
      this._id,
      this._companyId,
      this._categoryId,
      name,
      description,
      price,
      priceType,
      duration,
      this._isActive,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Ativa o serviço
   */
  activate(): CompanyService {
    return new CompanyService(
      this._id,
      this._companyId,
      this._categoryId,
      this._name,
      this._description,
      this._price,
      this._priceType,
      this._duration,
      true,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Desativa o serviço
   */
  deactivate(): CompanyService {
    return new CompanyService(
      this._id,
      this._companyId,
      this._categoryId,
      this._name,
      this._description,
      this._price,
      this._priceType,
      this._duration,
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
      companyId: this._companyId,
      categoryId: this._categoryId,
      name: this._name,
      description: this._description,
      price: this._price,
      priceType: this._priceType,
      duration: this._duration,
      isActive: this._isActive,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }

  /**
   * Valida dados do serviço
   */
  private static validateCompanyServiceData(
    data: CreateCompanyServiceData
  ): void {
    if (!data.id) {
      throw new BadRequestError("ID é obrigatório");
    }

    if (!data.companyId) {
      throw new BadRequestError("ID da empresa é obrigatório");
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
export interface CreateCompanyServiceData {
  id: string;
  companyId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  priceType: ServicePriceType;
  duration: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para dados de atualização
 */
export interface UpdateCompanyServiceData {
  name?: string;
  description?: string | null;
  price?: number;
  priceType?: ServicePriceType;
  duration?: number;
}

/**
 * Interface para dados de persistência
 */
export interface CompanyServicePersistenceData {
  id: string;
  companyId: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  priceType: ServicePriceType;
  duration: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
