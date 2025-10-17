import { Service, Category } from "@prisma/client";
import {
  ServicesRepository,
  CategoriesRepository,
} from "./services.repository";
import type {
  CreateServiceInput,
  UpdateServiceInput,
  GetServicesQuery,
  PaginatedResponse,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./services.schema";
import { AppError } from "../../utils/app-error";

/**
 * Service layer para lógica de negócio de serviços
 */
export class ServicesService {
  constructor(
    private servicesRepository: ServicesRepository,
    private categoriesRepository: CategoriesRepository
  ) {}

  /**
   * Cria um novo serviço
   */
  async createService(
    professionalId: string,
    data: CreateServiceInput
  ): Promise<Service> {
    // Validar se a categoria existe
    const categoryExists = await this.categoriesRepository.exists(
      data.categoryId
    );
    if (!categoryExists) {
      throw new AppError("Categoria não encontrada", 404);
    }

    // Criar o serviço
    return this.servicesRepository.create({
      ...data,
      professionalId,
    });
  }

  /**
   * Busca um serviço por ID com relações
   */
  async getServiceById(id: string) {
    const service = await this.servicesRepository.findByIdWithRelations(id);

    if (!service) {
      throw new AppError("Serviço não encontrado", 404);
    }

    return service;
  }

  /**
   * Lista serviços com filtros e paginação
   */
  async getServices(
    query: GetServicesQuery
  ): Promise<PaginatedResponse<Service>> {
    return this.servicesRepository.findMany(query);
  }

  /**
   * Atualiza um serviço
   */
  async updateService(
    id: string,
    professionalId: string,
    data: UpdateServiceInput
  ): Promise<Service> {
    // Verificar se o serviço existe
    const service = await this.servicesRepository.findById(id);
    if (!service) {
      throw new AppError("Serviço não encontrado", 404);
    }

    // Verificar se o serviço pertence ao profissional
    if (service.professionalId !== professionalId) {
      throw new AppError(
        "Você não tem permissão para atualizar este serviço",
        403
      );
    }

    // Se estiver atualizando a categoria, validar se ela existe
    if (data.categoryId) {
      const categoryExists = await this.categoriesRepository.exists(
        data.categoryId
      );
      if (!categoryExists) {
        throw new AppError("Categoria não encontrada", 404);
      }
    }

    // Atualizar o serviço
    return this.servicesRepository.update(id, data);
  }

  /**
   * Remove um serviço
   */
  async deleteService(id: string, professionalId: string): Promise<void> {
    // Verificar se o serviço existe
    const service = await this.servicesRepository.findById(id);
    if (!service) {
      throw new AppError("Serviço não encontrado", 404);
    }

    // Verificar se o serviço pertence ao profissional
    if (service.professionalId !== professionalId) {
      throw new AppError(
        "Você não tem permissão para deletar este serviço",
        403
      );
    }

    // Deletar o serviço
    await this.servicesRepository.delete(id);
  }

  /**
   * Retorna serviços mais populares
   */
  async getMostPopularServices(limit: number = 10) {
    return this.servicesRepository.findMostPopular(limit);
  }

  // ==============================================
  // MÉTODOS DE CATEGORIAS
  // ==============================================

  /**
   * Cria uma nova categoria
   */
  async createCategory(data: CreateCategoryInput): Promise<Category> {
    // Verificar se o slug já existe
    const slugExists = await this.categoriesRepository.slugExists(data.slug);
    if (slugExists) {
      throw new AppError("Já existe uma categoria com este slug", 409);
    }

    return this.categoriesRepository.create(data);
  }

  /**
   * Busca uma categoria por ID
   */
  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new AppError("Categoria não encontrada", 404);
    }

    return category;
  }

  /**
   * Busca uma categoria por slug
   */
  async getCategoryBySlug(slug: string): Promise<Category> {
    const category = await this.categoriesRepository.findBySlug(slug);

    if (!category) {
      throw new AppError("Categoria não encontrada", 404);
    }

    return category;
  }

  /**
   * Lista todas as categorias
   */
  async getAllCategories(
    includeServices: boolean = false
  ): Promise<Category[]> {
    return this.categoriesRepository.findMany(includeServices);
  }

  /**
   * Atualiza uma categoria
   */
  async updateCategory(
    id: string,
    data: UpdateCategoryInput
  ): Promise<Category> {
    // Verificar se a categoria existe
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new AppError("Categoria não encontrada", 404);
    }

    // Se estiver atualizando o slug, verificar se ele já existe
    if (data.slug) {
      const slugExists = await this.categoriesRepository.slugExists(
        data.slug,
        id
      );
      if (slugExists) {
        throw new AppError("Já existe uma categoria com este slug", 409);
      }
    }

    return this.categoriesRepository.update(id, data);
  }

  /**
   * Remove uma categoria
   */
  async deleteCategory(id: string): Promise<void> {
    // Verificar se a categoria existe
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new AppError("Categoria não encontrada", 404);
    }

    // Verificar se a categoria tem serviços associados
    const servicesCount = await this.categoriesRepository.countServices(id);
    if (servicesCount > 0) {
      throw new AppError(
        "Não é possível deletar uma categoria que possui serviços associados",
        409
      );
    }

    await this.categoriesRepository.delete(id);
  }
}

// Instância do service
export const servicesService = new ServicesService(
  new ServicesRepository(),
  new CategoriesRepository()
);
