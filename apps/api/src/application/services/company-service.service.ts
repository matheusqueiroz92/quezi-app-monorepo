/**
 * CompanyServiceService - Camada de Aplicação
 *
 * Serviço de aplicação para gerenciamento de serviços oferecidos por empresas
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { CompanyService } from "../../domain/entities/company-service.entity";
import { CompanyServiceRepository } from "../../infrastructure/repositories/company-service.repository";
import { BadRequestError, NotFoundError } from "../../utils/app-error";

/**
 * Serviço de aplicação para CompanyService
 */
export class CompanyServiceService {
  constructor(private companyServiceRepository: CompanyServiceRepository) {}

  /**
   * Cria um novo serviço de empresa
   */
  async createService(data: {
    companyId: string;
    categoryId: string;
    name: string;
    description: string;
    price: number;
    priceType: "FIXED" | "HOURLY" | "DAILY" | "NEGOTIABLE";
    duration: number;
    isActive?: boolean;
  }): Promise<CompanyService> {
    // Validar dados
    if (!data.name || data.name.trim().length < 3) {
      throw new BadRequestError(
        "Nome do serviço deve ter no mínimo 3 caracteres"
      );
    }

    if (!data.description || data.description.trim().length < 10) {
      throw new BadRequestError(
        "Descrição do serviço deve ter no mínimo 10 caracteres"
      );
    }

    if (data.price < 0) {
      throw new BadRequestError("Preço não pode ser negativo");
    }

    if (data.duration <= 0) {
      throw new BadRequestError("Duração deve ser maior que zero");
    }

    // Criar serviço
    return await this.companyServiceRepository.create(data);
  }

  /**
   * Busca serviço por ID
   */
  async getServiceById(id: string): Promise<CompanyService> {
    const service = await this.companyServiceRepository.findById(id);

    if (!service) {
      throw new NotFoundError("Serviço não encontrado");
    }

    return service;
  }

  /**
   * Lista serviços com filtros
   */
  async listServices(filters: {
    companyId?: string;
    categoryId?: string;
    isActive?: boolean;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }): Promise<{
    services: CompanyService[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;

    const services = await this.companyServiceRepository.findMany(filters);
    const total = await this.companyServiceRepository.count(filters);

    return {
      services,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Atualiza serviço
   */
  async updateService(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      priceType?: "FIXED" | "HOURLY" | "DAILY" | "NEGOTIABLE";
      duration?: number;
      isActive?: boolean;
    }
  ): Promise<CompanyService> {
    // Verificar se serviço existe
    await this.getServiceById(id);

    // Validar dados
    if (data.name && data.name.trim().length < 3) {
      throw new BadRequestError(
        "Nome do serviço deve ter no mínimo 3 caracteres"
      );
    }

    if (data.description && data.description.trim().length < 10) {
      throw new BadRequestError(
        "Descrição do serviço deve ter no mínimo 10 caracteres"
      );
    }

    if (data.price !== undefined && data.price < 0) {
      throw new BadRequestError("Preço não pode ser negativo");
    }

    if (data.duration !== undefined && data.duration <= 0) {
      throw new BadRequestError("Duração deve ser maior que zero");
    }

    // Atualizar serviço
    return await this.companyServiceRepository.update(id, data);
  }

  /**
   * Deleta serviço
   */
  async deleteService(id: string): Promise<void> {
    // Verificar se serviço existe
    await this.getServiceById(id);

    // Deletar serviço
    await this.companyServiceRepository.delete(id);
  }

  /**
   * Busca serviços por empresa
   */
  async getServicesByCompany(companyId: string): Promise<CompanyService[]> {
    return await this.companyServiceRepository.findByCompany(companyId);
  }

  /**
   * Busca serviços por categoria
   */
  async getServicesByCategory(categoryId: string): Promise<CompanyService[]> {
    return await this.companyServiceRepository.findByCategory(categoryId);
  }

  /**
   * Ativa/desativa serviço
   */
  async toggleServiceStatus(id: string): Promise<CompanyService> {
    const service = await this.getServiceById(id);
    return await this.companyServiceRepository.update(id, {
      isActive: !service.isActive,
    });
  }

  /**
   * Busca serviços ativos
   */
  async getActiveServices(): Promise<CompanyService[]> {
    return await this.companyServiceRepository.findMany({ isActive: true });
  }

  /**
   * Busca serviços por faixa de preço
   */
  async getServicesByPriceRange(
    minPrice: number,
    maxPrice: number
  ): Promise<CompanyService[]> {
    return await this.companyServiceRepository.findMany({
      minPrice,
      maxPrice,
    });
  }
}
