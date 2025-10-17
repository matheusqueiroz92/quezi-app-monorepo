import type { FastifyRequest, FastifyReply } from "fastify";
import { servicesService } from "./services.service";
import type {
  CreateServiceInput,
  UpdateServiceInput,
  GetServicesQuery,
  ServiceParams,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryParams,
} from "./services.schema";

/**
 * Controller para gerenciar serviços
 */
export class ServicesController {
  /**
   * POST /services
   * Cria um novo serviço
   */
  async createService(
    request: FastifyRequest<{ Body: CreateServiceInput }>,
    reply: FastifyReply
  ) {
    // @ts-ignore - user será adicionado pelo middleware de autenticação
    const professionalId = request.user?.id;

    const service = await servicesService.createService(
      professionalId,
      request.body
    );

    return reply.status(201).send(service);
  }

  /**
   * GET /services/:id
   * Busca um serviço por ID
   */
  async getServiceById(
    request: FastifyRequest<{ Params: ServiceParams }>,
    reply: FastifyReply
  ) {
    const service = await servicesService.getServiceById(request.params.id);
    return reply.send(service);
  }

  /**
   * GET /services
   * Lista serviços com filtros
   */
  async getServices(
    request: FastifyRequest<{ Querystring: GetServicesQuery }>,
    reply: FastifyReply
  ) {
    const services = await servicesService.getServices(
      request.query as GetServicesQuery
    );
    return reply.send(services);
  }

  /**
   * PUT /services/:id
   * Atualiza um serviço
   */
  async updateService(
    request: FastifyRequest<{ Params: ServiceParams; Body: UpdateServiceInput }>,
    reply: FastifyReply
  ) {
    // @ts-ignore - user será adicionado pelo middleware de autenticação
    const professionalId = request.user?.id;

    const service = await servicesService.updateService(
      request.params.id,
      professionalId,
      request.body
    );

    return reply.send(service);
  }

  /**
   * DELETE /services/:id
   * Remove um serviço
   */
  async deleteService(
    request: FastifyRequest<{ Params: ServiceParams }>,
    reply: FastifyReply
  ) {
    // @ts-ignore - user será adicionado pelo middleware de autenticação
    const professionalId = request.user?.id;

    await servicesService.deleteService(request.params.id, professionalId);

    return reply.status(204).send();
  }

  /**
   * GET /services/popular
   * Retorna serviços mais populares
   */
  async getMostPopularServices(
    request: FastifyRequest<{ Querystring: { limit?: string } }>,
    reply: FastifyReply
  ) {
    const limit = request.query.limit ? parseInt(request.query.limit) : 10;
    const services = await servicesService.getMostPopularServices(limit);
    return reply.send(services);
  }
}

/**
 * Controller para gerenciar categorias
 */
export class CategoriesController {
  /**
   * POST /categories
   * Cria uma nova categoria
   */
  async createCategory(
    request: FastifyRequest<{ Body: CreateCategoryInput }>,
    reply: FastifyReply
  ) {
    const category = await servicesService.createCategory(request.body);
    return reply.status(201).send(category);
  }

  /**
   * GET /categories/:id
   * Busca uma categoria por ID
   */
  async getCategoryById(
    request: FastifyRequest<{ Params: CategoryParams }>,
    reply: FastifyReply
  ) {
    const category = await servicesService.getCategoryById(request.params.id);
    return reply.send(category);
  }

  /**
   * GET /categories/slug/:slug
   * Busca uma categoria por slug
   */
  async getCategoryBySlug(
    request: FastifyRequest<{ Params: { slug: string } }>,
    reply: FastifyReply
  ) {
    const category = await servicesService.getCategoryBySlug(
      request.params.slug
    );
    return reply.send(category);
  }

  /**
   * GET /categories
   * Lista todas as categorias
   */
  async getAllCategories(
    request: FastifyRequest<{ Querystring: { includeServices?: string } }>,
    reply: FastifyReply
  ) {
    const includeServices = request.query.includeServices === "true";
    const categories = await servicesService.getAllCategories(includeServices);
    return reply.send(categories);
  }

  /**
   * PUT /categories/:id
   * Atualiza uma categoria
   */
  async updateCategory(
    request: FastifyRequest<{
      Params: CategoryParams;
      Body: UpdateCategoryInput;
    }>,
    reply: FastifyReply
  ) {
    const category = await servicesService.updateCategory(
      request.params.id,
      request.body
    );
    return reply.send(category);
  }

  /**
   * DELETE /categories/:id
   * Remove uma categoria
   */
  async deleteCategory(
    request: FastifyRequest<{ Params: CategoryParams }>,
    reply: FastifyReply
  ) {
    await servicesService.deleteCategory(request.params.id);
    return reply.status(204).send();
  }
}

// Instâncias dos controllers
export const servicesController = new ServicesController();
export const categoriesController = new CategoriesController();

