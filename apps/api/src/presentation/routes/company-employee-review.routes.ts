/**
 * Rotas para CompanyEmployeeReview
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { FastifyInstance } from "fastify";
import { CompanyEmployeeReviewController } from "../controllers/company-employee-review.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

/**
 * Registra as rotas de avaliações de funcionários de empresa
 */
export async function companyEmployeeReviewRoutes(fastify: FastifyInstance) {
  const controller = new CompanyEmployeeReviewController();

  // Aplicar middleware de autenticação em todas as rotas
  fastify.addHook("preHandler", authMiddleware);

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  // Criar avaliação de funcionário
  fastify.post(
    "/",
    {
      schema: {
        description: "Cria uma nova avaliação de funcionário",
        tags: ["Company Employee Reviews"],
        body: {
          type: "object",
          required: ["appointmentId", "companyId", "employeeId", "rating"],
          properties: {
            appointmentId: { type: "string", format: "uuid" },
            companyId: { type: "string", format: "uuid" },
            employeeId: { type: "string", format: "uuid" },
            rating: { type: "integer", minimum: 1, maximum: 5 },
            comment: { type: "string", maxLength: 1000 },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object" },
              message: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    controller.createReview.bind(controller)
  );

  // Buscar avaliação por ID
  fastify.get(
    "/:id",
    {
      schema: {
        description: "Busca avaliação por ID",
        tags: ["Company Employee Reviews"],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object" },
            },
          },
          404: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    controller.getReview.bind(controller)
  );

  // Buscar avaliação por agendamento
  fastify.get(
    "/appointment/:appointmentId",
    {
      schema: {
        description: "Busca avaliação por agendamento",
        tags: ["Company Employee Reviews"],
        params: {
          type: "object",
          required: ["appointmentId"],
          properties: {
            appointmentId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object" },
            },
          },
        },
      },
    },
    controller.getReviewByAppointment.bind(controller)
  );

  // Listar avaliações com filtros
  fastify.get(
    "/",
    {
      schema: {
        description: "Lista avaliações com filtros",
        tags: ["Company Employee Reviews"],
        querystring: {
          type: "object",
          properties: {
            skip: { type: "integer", minimum: 0, default: 0 },
            take: { type: "integer", minimum: 1, maximum: 100, default: 10 },
            companyId: { type: "string", format: "uuid" },
            employeeId: { type: "string", format: "uuid" },
            clientId: { type: "string", format: "uuid" },
            rating: { type: "integer", minimum: 1, maximum: 5 },
            dateFrom: { type: "string", format: "date" },
            dateTo: { type: "string", format: "date" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "array", items: { type: "object" } },
              pagination: {
                type: "object",
                properties: {
                  total: { type: "integer" },
                  page: { type: "integer" },
                  limit: { type: "integer" },
                  hasNext: { type: "boolean" },
                  hasPrev: { type: "boolean" },
                },
              },
            },
          },
        },
      },
    },
    controller.listReviews.bind(controller)
  );

  // Atualizar avaliação
  fastify.put(
    "/:id",
    {
      schema: {
        description: "Atualiza avaliação",
        tags: ["Company Employee Reviews"],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          properties: {
            rating: { type: "integer", minimum: 1, maximum: 5 },
            comment: { type: "string", maxLength: 1000 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object" },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    controller.updateReview.bind(controller)
  );

  // Deletar avaliação
  fastify.delete(
    "/:id",
    {
      schema: {
        description: "Remove avaliação",
        tags: ["Company Employee Reviews"],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    controller.deleteReview.bind(controller)
  );

  // ========================================
  // COMPANY OPERATIONS
  // ========================================

  // Buscar avaliações da empresa
  fastify.get(
    "/company/:companyId",
    {
      schema: {
        description: "Busca avaliações de uma empresa",
        tags: ["Company Employee Reviews"],
        params: {
          type: "object",
          required: ["companyId"],
          properties: {
            companyId: { type: "string", format: "uuid" },
          },
        },
        querystring: {
          type: "object",
          properties: {
            skip: { type: "integer", minimum: 0, default: 0 },
            take: { type: "integer", minimum: 1, maximum: 100, default: 10 },
            rating: { type: "integer", minimum: 1, maximum: 5 },
            dateFrom: { type: "string", format: "date" },
            dateTo: { type: "string", format: "date" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "array", items: { type: "object" } },
              pagination: {
                type: "object",
                properties: {
                  total: { type: "integer" },
                  page: { type: "integer" },
                  limit: { type: "integer" },
                  hasNext: { type: "boolean" },
                  hasPrev: { type: "boolean" },
                },
              },
            },
          },
        },
      },
    },
    controller.getCompanyReviews.bind(controller)
  );

  // ========================================
  // EMPLOYEE OPERATIONS
  // ========================================

  // Buscar avaliações do funcionário
  fastify.get(
    "/employee/:employeeId",
    {
      schema: {
        description: "Busca avaliações de um funcionário",
        tags: ["Company Employee Reviews"],
        params: {
          type: "object",
          required: ["employeeId"],
          properties: {
            employeeId: { type: "string", format: "uuid" },
          },
        },
        querystring: {
          type: "object",
          properties: {
            skip: { type: "integer", minimum: 0, default: 0 },
            take: { type: "integer", minimum: 1, maximum: 100, default: 10 },
            rating: { type: "integer", minimum: 1, maximum: 5 },
            dateFrom: { type: "string", format: "date" },
            dateTo: { type: "string", format: "date" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "array", items: { type: "object" } },
              pagination: {
                type: "object",
                properties: {
                  total: { type: "integer" },
                  page: { type: "integer" },
                  limit: { type: "integer" },
                  hasNext: { type: "boolean" },
                  hasPrev: { type: "boolean" },
                },
              },
            },
          },
        },
      },
    },
    controller.getEmployeeReviews.bind(controller)
  );

  // Buscar avaliações do cliente autenticado
  fastify.get(
    "/client/my-reviews",
    {
      schema: {
        description: "Busca avaliações do cliente autenticado",
        tags: ["Company Employee Reviews"],
        querystring: {
          type: "object",
          properties: {
            skip: { type: "integer", minimum: 0, default: 0 },
            take: { type: "integer", minimum: 1, maximum: 100, default: 10 },
            rating: { type: "integer", minimum: 1, maximum: 5 },
            dateFrom: { type: "string", format: "date" },
            dateTo: { type: "string", format: "date" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "array", items: { type: "object" } },
              pagination: {
                type: "object",
                properties: {
                  total: { type: "integer" },
                  page: { type: "integer" },
                  limit: { type: "integer" },
                  hasNext: { type: "boolean" },
                  hasPrev: { type: "boolean" },
                },
              },
            },
          },
        },
      },
    },
    controller.getClientReviews.bind(controller)
  );

  // ========================================
  // STATISTICS OPERATIONS
  // ========================================

  // Obter estatísticas de avaliações
  fastify.get(
    "/stats",
    {
      schema: {
        description: "Obtém estatísticas de avaliações",
        tags: ["Company Employee Reviews"],
        querystring: {
          type: "object",
          properties: {
            companyId: { type: "string", format: "uuid" },
            employeeId: { type: "string", format: "uuid" },
            clientId: { type: "string", format: "uuid" },
            dateFrom: { type: "string", format: "date" },
            dateTo: { type: "string", format: "date" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object" },
            },
          },
        },
      },
    },
    controller.getStats.bind(controller)
  );

  // Obter avaliação média da empresa
  fastify.get(
    "/company/:companyId/average-rating",
    {
      schema: {
        description: "Obtém avaliação média de uma empresa",
        tags: ["Company Employee Reviews"],
        params: {
          type: "object",
          required: ["companyId"],
          properties: {
            companyId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  averageRating: { type: "number" },
                },
              },
            },
          },
        },
      },
    },
    controller.getCompanyAverageRating.bind(controller)
  );

  // Obter avaliação média do funcionário
  fastify.get(
    "/employee/:employeeId/average-rating",
    {
      schema: {
        description: "Obtém avaliação média de um funcionário",
        tags: ["Company Employee Reviews"],
        params: {
          type: "object",
          required: ["employeeId"],
          properties: {
            employeeId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  averageRating: { type: "number" },
                },
              },
            },
          },
        },
      },
    },
    controller.getEmployeeAverageRating.bind(controller)
  );

  // Obter avaliações recentes da empresa
  fastify.get(
    "/company/:companyId/recent",
    {
      schema: {
        description: "Obtém avaliações recentes de uma empresa",
        tags: ["Company Employee Reviews"],
        params: {
          type: "object",
          required: ["companyId"],
          properties: {
            companyId: { type: "string", format: "uuid" },
          },
        },
        querystring: {
          type: "object",
          properties: {
            limit: { type: "integer", minimum: 1, maximum: 50, default: 5 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "array", items: { type: "object" } },
            },
          },
        },
      },
    },
    controller.getRecentCompanyReviews.bind(controller)
  );

  // Obter avaliações recentes do funcionário
  fastify.get(
    "/employee/:employeeId/recent",
    {
      schema: {
        description: "Obtém avaliações recentes de um funcionário",
        tags: ["Company Employee Reviews"],
        params: {
          type: "object",
          required: ["employeeId"],
          properties: {
            employeeId: { type: "string", format: "uuid" },
          },
        },
        querystring: {
          type: "object",
          properties: {
            limit: { type: "integer", minimum: 1, maximum: 50, default: 5 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "array", items: { type: "object" } },
            },
          },
        },
      },
    },
    controller.getRecentEmployeeReviews.bind(controller)
  );
}
