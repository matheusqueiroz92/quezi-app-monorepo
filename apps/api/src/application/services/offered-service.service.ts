import { OfferedServiceRepository } from "../../infrastructure/repositories/offered-service.repository";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { ProfessionalProfileRepository } from "../../infrastructure/repositories/professional-profile.repository";
import { CompanyEmployeeRepository } from "../../infrastructure/repositories/company-employee.repository";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "../../utils/app-error";
import { prisma } from "../../lib/prisma";

export interface CreateOfferedServiceData {
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  professionalId?: string;
  companyEmployeeId?: string;
  isActive?: boolean;
}

export interface UpdateOfferedServiceData {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  category?: string;
  isActive?: boolean;
}

export interface OfferedServiceFilters {
  category?: string;
  professionalId?: string;
  companyEmployeeId?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Serviço de Serviços Oferecidos
 *
 * Gerencia a lógica de negócio dos serviços oferecidos por profissionais e empresas
 */
export class OfferedServiceService {
  private offeredServiceRepository: OfferedServiceRepository;
  private userRepository: UserRepository;
  private professionalProfileRepository: ProfessionalProfileRepository;
  private companyEmployeeRepository: CompanyEmployeeRepository;

  constructor(
    offeredServiceRepository: OfferedServiceRepository = new OfferedServiceRepository(
      prisma
    ),
    userRepository: UserRepository = new UserRepository(prisma),
    professionalProfileRepository: ProfessionalProfileRepository = new ProfessionalProfileRepository(
      prisma
    ),
    companyEmployeeRepository: CompanyEmployeeRepository = new CompanyEmployeeRepository(
      prisma
    )
  ) {
    this.offeredServiceRepository = offeredServiceRepository;
    this.userRepository = userRepository;
    this.professionalProfileRepository = professionalProfileRepository;
    this.companyEmployeeRepository = companyEmployeeRepository;
  }

  /**
   * Cria um novo serviço oferecido
   */
  async createOfferedService(data: CreateOfferedServiceData): Promise<any> {
    // Validar preço
    if (data.price < 0) {
      throw new BadRequestError("O preço não pode ser negativo");
    }

    // Validar duração
    if (data.duration <= 0) {
      throw new BadRequestError("A duração deve ser maior que zero");
    }

    // Validar se o profissional ou funcionário da empresa existe
    if (data.professionalId) {
      const professional =
        await this.professionalProfileRepository.findByUserId(
          data.professionalId
        );
      if (!professional || !professional.isActive) {
        throw new NotFoundError("Profissional não encontrado ou inativo");
      }
    } else if (data.companyEmployeeId) {
      const employee = await this.companyEmployeeRepository.findById(
        data.companyEmployeeId
      );
      if (!employee || !employee.isActive) {
        throw new NotFoundError("Funcionário não encontrado ou inativo");
      }
    } else {
      throw new BadRequestError(
        "É necessário informar um profissional ou funcionário"
      );
    }

    // Criar o serviço
    return await this.offeredServiceRepository.create({
      ...data,
      isActive: data.isActive ?? true,
    });
  }

  /**
   * Busca um serviço oferecido por ID
   */
  async getOfferedServiceById(id: string): Promise<any> {
    const service = await this.offeredServiceRepository.findById(id);
    if (!service) {
      throw new NotFoundError("Serviço não encontrado");
    }
    return service;
  }

  /**
   * Atualiza um serviço oferecido
   */
  async updateOfferedService(
    id: string,
    data: UpdateOfferedServiceData
  ): Promise<any> {
    const service = await this.offeredServiceRepository.findById(id);
    if (!service) {
      throw new NotFoundError("Serviço não encontrado");
    }

    // Validar preço se fornecido
    if (data.price !== undefined && data.price < 0) {
      throw new BadRequestError("O preço não pode ser negativo");
    }

    // Validar duração se fornecida
    if (data.duration !== undefined && data.duration <= 0) {
      throw new BadRequestError("A duração deve ser maior que zero");
    }

    return await this.offeredServiceRepository.update(id, data);
  }

  /**
   * Deleta um serviço oferecido
   */
  async deleteOfferedService(id: string): Promise<void> {
    const service = await this.offeredServiceRepository.findById(id);
    if (!service) {
      throw new NotFoundError("Serviço não encontrado");
    }

    await this.offeredServiceRepository.delete(id);
  }

  /**
   * Busca serviços oferecidos por profissional
   */
  async getOfferedServicesByProfessional(
    professionalId: string
  ): Promise<any[]> {
    return await this.offeredServiceRepository.findByProfessionalId(
      professionalId
    );
  }

  /**
   * Busca serviços oferecidos por funcionário de empresa
   */
  async getOfferedServicesByCompanyEmployee(
    companyEmployeeId: string
  ): Promise<any[]> {
    return await this.offeredServiceRepository.findByCompanyEmployeeId(
      companyEmployeeId
    );
  }

  /**
   * Busca serviços por categoria
   */
  async getOfferedServicesByCategory(category: string): Promise<any[]> {
    return await this.offeredServiceRepository.findByCategory(category);
  }

  /**
   * Busca serviços por faixa de preço
   */
  async getOfferedServicesByPriceRange(
    minPrice: number,
    maxPrice: number
  ): Promise<any[]> {
    if (minPrice < 0 || maxPrice < 0) {
      throw new BadRequestError("Os preços não podem ser negativos");
    }

    if (minPrice > maxPrice) {
      throw new BadRequestError(
        "O preço mínimo não pode ser maior que o preço máximo"
      );
    }

    return await this.offeredServiceRepository.findByPriceRange(
      minPrice,
      maxPrice
    );
  }

  /**
   * Busca serviços por termo de pesquisa
   */
  async searchOfferedServices(searchParams: {
    query?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }): Promise<any> {
    if (searchParams.query && searchParams.query.trim().length < 2) {
      throw new BadRequestError(
        "O termo de pesquisa deve ter pelo menos 2 caracteres"
      );
    }

    const services = await this.offeredServiceRepository.findMany({
      search: searchParams.query,
      categoryId: searchParams.category,
      minPrice: searchParams.minPrice,
      maxPrice: searchParams.maxPrice,
      skip: ((searchParams.page || 1) - 1) * (searchParams.limit || 10),
      take: searchParams.limit || 10,
    });

    const total = await this.offeredServiceRepository.count({
      search: searchParams.query,
      categoryId: searchParams.category,
      minPrice: searchParams.minPrice,
      maxPrice: searchParams.maxPrice,
    });

    return {
      data: services,
      pagination: {
        page: searchParams.page || 1,
        limit: searchParams.limit || 10,
        total,
        totalPages: Math.ceil(total / (searchParams.limit || 10)),
      },
    };
  }

  /**
   * Lista serviços com filtros
   */
  async getOfferedServices(filters: OfferedServiceFilters = {}): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, ...otherFilters } = filters;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.offeredServiceRepository.findMany({
        ...otherFilters,
        skip,
        take: limit,
      }),
      this.offeredServiceRepository.count(otherFilters),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Alterna o status ativo/inativo de um serviço
   */
  async toggleServiceStatus(id: string): Promise<any> {
    const service = await this.offeredServiceRepository.findById(id);
    if (!service) {
      throw new NotFoundError("Serviço não encontrado");
    }

    return await this.offeredServiceRepository.update(id, {
      isActive: !service.isActive,
    });
  }

  /**
   * Ativa um serviço
   */
  async activateService(id: string): Promise<any> {
    const service = await this.offeredServiceRepository.findById(id);
    if (!service) {
      throw new NotFoundError("Serviço não encontrado");
    }

    if (service.isActive) {
      throw new BadRequestError("Serviço já está ativo");
    }

    return await this.offeredServiceRepository.update(id, {
      isActive: true,
    });
  }

  /**
   * Desativa um serviço
   */
  async deactivateService(id: string): Promise<any> {
    const service = await this.offeredServiceRepository.findById(id);
    if (!service) {
      throw new NotFoundError("Serviço não encontrado");
    }

    if (!service.isActive) {
      throw new BadRequestError("Serviço já está inativo");
    }

    return await this.offeredServiceRepository.update(id, {
      isActive: false,
    });
  }

  /**
   * Busca serviços por usuário (profissional ou funcionário)
   */
  async getOfferedServicesByUser(userId: string): Promise<any[]> {
    return await this.offeredServiceRepository.findByUserId(userId);
  }

  /**
   * Obtém estatísticas dos serviços
   */
  async getServiceStats(filters: OfferedServiceFilters = {}): Promise<{
    total: number;
    active: number;
    inactive: number;
    averagePrice: number;
    categories: { [key: string]: number };
  }> {
    const [total, active, inactive, averagePrice, categories] =
      await Promise.all([
        this.offeredServiceRepository.count(filters),
        this.offeredServiceRepository.count({ ...filters, isActive: true }),
        this.offeredServiceRepository.count({ ...filters, isActive: false }),
        this.calculateAveragePrice(filters),
        this.getCategoryDistribution(filters),
      ]);

    return {
      total,
      active,
      inactive,
      averagePrice,
      categories,
    };
  }

  /**
   * Calcula o preço médio dos serviços
   */
  private async calculateAveragePrice(
    filters: OfferedServiceFilters
  ): Promise<number> {
    const services = await this.offeredServiceRepository.findMany(filters);
    if (services.length === 0) return 0;

    const totalPrice = services.reduce(
      (sum, service) => sum + service.price,
      0
    );
    return totalPrice / services.length;
  }

  /**
   * Obtém distribuição por categoria
   */
  private async getCategoryDistribution(
    filters: OfferedServiceFilters
  ): Promise<{ [key: string]: number }> {
    const services = await this.offeredServiceRepository.findMany(filters);
    const distribution: { [key: string]: number } = {};

    services.forEach((service) => {
      const category = service.category || "Sem categoria";
      distribution[category] = (distribution[category] || 0) + 1;
    });

    return distribution;
  }
}
