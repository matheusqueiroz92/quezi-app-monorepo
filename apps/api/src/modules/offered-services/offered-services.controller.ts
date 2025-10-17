import type { FastifyRequest, FastifyReply } from "fastify";
import { offeredServicesService } from "./offered-services.service";
import type {
  CreateServiceInput,
  UpdateServiceInput,
  GetServicesQuery,
  ServiceParams,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryParams,
} from "./offered-services.schema";

/**
 * Controller para gerenciar serviços oferecidos
 */
export class OfferedServicesController {
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

    if (typeof professionalId !== "string") {
      return reply
        .status(400)
        .send({ message: "ID do profissional não encontrado." });
    }

    const service = await offeredServicesService.createService(
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
    const service = await offeredServicesService.getServiceById(
      request.params.id
    );
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
    const services = await offeredServicesService.getServices(
      request.query as GetServicesQuery
    );
    return reply.send(services);
  }

  /**
   * PUT /services/:id
   * Atualiza um serviço
   */
  async updateService(
    request: FastifyRequest<{
      Params: ServiceParams;
      Body: UpdateServiceInput;
    }>,
    reply: FastifyReply
  ) {
    // @ts-ignore - user será adicionado pelo middleware de autenticação
    const professionalId = request.user?.id;

    if (typeof professionalId !== "string") {
      return reply
        .status(400)
        .send({ message: "ID do profissional não encontrado." });
    }

    const service = await offeredServicesService.updateService(
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
    // @ts-ignore - user será adicionado pelo middleware de autenticação
    const professionalId = request.user?.id;

    if (typeof professionalId !== "string") {
      return reply
        .status(400)
        .send({ message: "ID do profissional não encontrado." });
    }

    const serviceId = request.params.id;
    if (typeof serviceId !== "string") {
      return reply
        .status(400)
        .send({ message: "ID do serviço não encontrado." });
    }

    await offeredServicesService.deleteService(serviceId, professionalId);

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
    const services = await offeredServicesService.getMostPopularServices(limit);
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
    const category = await offeredServicesService.createCategory(request.body);
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
    const category = await offeredServicesService.getCategoryById(
      request.params.id
    );
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
    const category = await offeredServicesService.getCategoryBySlug(
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
    const categories = await offeredServicesService.getAllCategories(
      includeServices
    );
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
    const category = await offeredServicesService.updateCategory(
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
    await offeredServicesService.deleteCategory(request.params.id);
    return reply.status(204).send();
  }
}

// Instâncias dos controllers
export const offeredServicesController = new OfferedServicesController();
export const categoriesController = new CategoriesController();
