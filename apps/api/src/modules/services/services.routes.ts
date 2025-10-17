import type { FastifyInstance } from "fastify";
import {
  servicesController,
  categoriesController,
} from "./services.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

/**
 * Rotas de serviços
 */
export async function servicesRoutes(
  app: FastifyInstance
): Promise<void> {
  // ========================================
  // ROTAS DE SERVIÇOS
  // ========================================

  // GET /services/popular - Deve vir antes de /services/:id
  app.get(
    "/popular",
    {
      schema: {
        tags: ["services"],
        summary: "Lista serviços mais populares",
        description: "Retorna os serviços com mais agendamentos",
        querystring: {
          type: "object",
          properties: {
            limit: {
              type: "string",
              description: "Número de serviços a retornar",
              default: "10",
            },
          },
        },
        response: {
          200: {
            type: "array",
            description: "Lista de serviços populares",
          },
        },
      },
    },
    servicesController.getMostPopularServices.bind(servicesController)
  );

  // POST /services
  app.post(
    "/",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["services"],
        summary: "Cria um novo serviço",
        description: "Cria um novo serviço para o profissional autenticado",
        body: {
          type: "object",
          required: ["name", "price", "priceType", "durationMinutes", "categoryId"],
          properties: {
            name: { type: "string", minLength: 1, maxLength: 100 },
            description: { type: "string", maxLength: 500 },
            price: { type: "number", minimum: 0.01, maximum: 999999.99 },
            priceType: { type: "string", enum: ["FIXED", "HOURLY"] },
            durationMinutes: { type: "number", minimum: 15, maximum: 480 },
            categoryId: { type: "string", minLength: 1 },
          },
        },
        response: {
          201: {
            type: "object",
            description: "Serviço criado com sucesso",
          },
        },
      },
    },
    servicesController.createService.bind(servicesController)
  );

  // GET /services
  app.get(
    "/",
    {
      schema: {
        tags: ["services"],
        summary: "Lista serviços",
        description: "Lista serviços com filtros e paginação",
        response: {
          200: {
            type: "object",
            properties: {
              data: { type: "array" },
              pagination: {
                type: "object",
                properties: {
                  page: { type: "number" },
                  limit: { type: "number" },
                  total: { type: "number" },
                  totalPages: { type: "number" },
                  hasNext: { type: "boolean" },
                  hasPrev: { type: "boolean" },
                },
              },
            },
          },
        },
      },
    },
    servicesController.getServices.bind(servicesController)
  );

  // GET /services/:id
  app.get(
    "/:id",
    {
      schema: {
        tags: ["services"],
        summary: "Busca serviço por ID",
        description: "Retorna um serviço específico com suas relações",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            description: "Serviço encontrado",
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    servicesController.getServiceById.bind(servicesController)
  );

  // PUT /services/:id
  app.put(
    "/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["services"],
        summary: "Atualiza um serviço",
        description: "Atualiza um serviço do profissional autenticado",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
          },
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 1, maxLength: 100 },
            description: { type: "string", maxLength: 500 },
            price: { type: "number", minimum: 0.01, maximum: 999999.99 },
            priceType: { type: "string", enum: ["FIXED", "HOURLY"] },
            durationMinutes: { type: "number", minimum: 15, maximum: 480 },
            categoryId: { type: "string", minLength: 1 },
          },
        },
        response: {
          200: {
            type: "object",
            description: "Serviço atualizado com sucesso",
          },
          403: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    servicesController.updateService.bind(servicesController)
  );

  // DELETE /services/:id
  app.delete(
    "/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["services"],
        summary: "Remove um serviço",
        description: "Remove um serviço do profissional autenticado",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
          },
        },
        response: {
          204: {
            type: "null",
            description: "Serviço removido com sucesso",
          },
          403: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    servicesController.deleteService.bind(servicesController)
  );
}

/**
 * Rotas de categorias
 */
export async function categoriesRoutes(
  app: FastifyInstance
): Promise<void> {
  // ========================================
  // ROTAS DE CATEGORIAS
  // ========================================

  // POST /categories
  app.post(
    "/",
    {
      preHandler: [authMiddleware], // Apenas usuários autenticados podem criar categorias
      schema: {
        tags: ["categories"],
        summary: "Cria uma nova categoria",
        description: "Cria uma nova categoria de serviços",
        body: {
          type: "object",
          required: ["name", "slug"],
          properties: {
            name: { type: "string", minLength: 1, maxLength: 50 },
            slug: { type: "string", minLength: 1, maxLength: 50, pattern: "^[a-z0-9-]+$" },
          },
        },
        response: {
          201: {
            type: "object",
            description: "Categoria criada com sucesso",
          },
          409: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    categoriesController.createCategory.bind(categoriesController)
  );

  // GET /categories
  app.get(
    "/",
    {
      schema: {
        tags: ["categories"],
        summary: "Lista todas as categorias",
        description: "Retorna todas as categorias cadastradas",
        querystring: {
          type: "object",
          properties: {
            includeServices: {
              type: "string",
              description: "Incluir serviços relacionados (true/false)",
              default: "false",
            },
          },
        },
        response: {
          200: {
            type: "array",
            description: "Lista de categorias",
          },
        },
      },
    },
    categoriesController.getAllCategories.bind(categoriesController)
  );

  // GET /categories/slug/:slug - Deve vir antes de /categories/:id
  app.get(
    "/slug/:slug",
    {
      schema: {
        tags: ["categories"],
        summary: "Busca categoria por slug",
        description: "Retorna uma categoria específica pelo slug",
        params: {
          type: "object",
          properties: {
            slug: { type: "string" },
          },
          required: ["slug"],
        },
        response: {
          200: {
            type: "object",
            description: "Categoria encontrada",
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    categoriesController.getCategoryBySlug.bind(categoriesController)
  );

  // GET /categories/:id
  app.get(
    "/:id",
    {
      schema: {
        tags: ["categories"],
        summary: "Busca categoria por ID",
        description: "Retorna uma categoria específica",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            description: "Categoria encontrada",
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    categoriesController.getCategoryById.bind(categoriesController)
  );

  // PUT /categories/:id
  app.put(
    "/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["categories"],
        summary: "Atualiza uma categoria",
        description: "Atualiza uma categoria existente",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
          },
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 1, maxLength: 50 },
            slug: { type: "string", minLength: 1, maxLength: 50, pattern: "^[a-z0-9-]+$" },
          },
        },
        response: {
          200: {
            type: "object",
            description: "Categoria atualizada com sucesso",
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          409: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    categoriesController.updateCategory.bind(categoriesController)
  );

  // DELETE /categories/:id
  app.delete(
    "/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["categories"],
        summary: "Remove uma categoria",
        description: "Remove uma categoria (se não tiver serviços associados)",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
          },
        },
        response: {
          204: {
            type: "null",
            description: "Categoria removida com sucesso",
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          409: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    categoriesController.deleteCategory.bind(categoriesController)
  );
}

