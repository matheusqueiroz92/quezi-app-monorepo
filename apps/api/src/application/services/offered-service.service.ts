/**
 * OfferedServiceService - Camada de Aplicação
 *
 * Serviço de aplicação para gerenciamento de serviços oferecidos por profissionais
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { OfferedService } from "../../domain/entities/offered-service.entity";
import { OfferedServiceRepository } from "../../infrastructure/repositories/offered-service.repository";
import { BadRequestError, NotFoundError } from "../../utils/app-error";

/**
 * Serviço de aplicação para OfferedService
 */
export class OfferedServiceService {
  constructor(private offeredServiceRepository: OfferedServiceRepository) {}

  /**
   * Cria um novo serviço oferecido
   */
  async createService(data: {
    professionalId: string;
    categoryId: string;
    name: string;
    description: string;
    price: number;
    priceType: "FIXED" | "HOURLY" | "DAILY" | "NEGOTIABLE";
    duration: number;
    serviceMode: "PRESENTIAL" | "REMOTE" | "BOTH";
    isActive?: boolean;
  }): Promise<OfferedService> {
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
    return await this.offeredServiceRepository.create(data);
  }

  /**
   * Busca serviço por ID
   */
  async getServiceById(id: string): Promise<OfferedService> {
    const service = await this.offeredServiceRepository.findById(id);

    if (!service) {
      throw new NotFoundError("Serviço não encontrado");
    }

    return service;
  }

  /**
   * Lista serviços com filtros
   */
  async listServices(filters: {
    professionalId?: string;
    categoryId?: string;
    isActive?: boolean;
    minPrice?: number;
    maxPrice?: number;
    serviceMode?: "PRESENTIAL" | "REMOTE" | "BOTH";
    page?: number;
    limit?: number;
  }): Promise<{
    services: OfferedService[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;

    const services = await this.offeredServiceRepository.findMany(filters);
    const total = await this.offeredServiceRepository.count(filters);

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
      serviceMode?: "PRESENTIAL" | "REMOTE" | "BOTH";
      isActive?: boolean;
    }
  ): Promise<OfferedService> {
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
    return await this.offeredServiceRepository.update(id, data);
  }

  /**
   * Deleta serviço
   */
  async deleteService(id: string): Promise<void> {
    // Verificar se serviço existe
    await this.getServiceById(id);

    // Deletar serviço
    await this.offeredServiceRepository.delete(id);
  }

  /**
   * Busca serviços por profissional
   */
  async getServicesByProfessional(
    professionalId: string
  ): Promise<OfferedService[]> {
    return await this.offeredServiceRepository.findByProfessional(
      professionalId
    );
  }

  /**
   * Busca serviços por categoria
   */
  async getServicesByCategory(categoryId: string): Promise<OfferedService[]> {
    return await this.offeredServiceRepository.findByCategory(categoryId);
  }

  /**
   * Ativa/desativa serviço
   */
  async toggleServiceStatus(id: string): Promise<OfferedService> {
    const service = await this.getServiceById(id);
    return await this.offeredServiceRepository.update(id, {
      isActive: !service.isActive,
    });
  }

  /**
   * Busca serviços ativos
   */
  async getActiveServices(): Promise<OfferedService[]> {
    return await this.offeredServiceRepository.findMany({ isActive: true });
  }

  /**
   * Busca serviços por faixa de preço
   */
  async getServicesByPriceRange(
    minPrice: number,
    maxPrice: number
  ): Promise<OfferedService[]> {
    return await this.offeredServiceRepository.findMany({
      minPrice,
      maxPrice,
    });
  }

  /**
   * Busca serviços por modo de atendimento
   */
  async getServicesByMode(
    serviceMode: "PRESENTIAL" | "REMOTE" | "BOTH"
  ): Promise<OfferedService[]> {
    return await this.offeredServiceRepository.findMany({ serviceMode });
  }
}
