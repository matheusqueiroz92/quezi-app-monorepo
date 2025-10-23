/**
 * Rotas para Review
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { FastifyInstance } from "fastify";
import { ReviewController } from "./review.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

/**
 * Registra as rotas de avaliações
 */
export async function reviewRoutes(fastify: FastifyInstance) {
  const controller = new ReviewController();

  // Aplicar middleware de autenticação em todas as rotas
  fastify.addHook("preHandler", authMiddleware);

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  // Criar avaliação
  fastify.post(
    "/",
    {
      schema: {
        description: "Cria uma nova avaliação",
        tags: ["Reviews"],
        body: {
          type: "object",
          required: ["appointmentId", "professionalId", "rating"],
          properties: {
            appointmentId: { type: "string", format: "uuid" },
            professionalId: { type: "string", format: "uuid" },
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
        tags: ["Reviews"],
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
        tags: ["Reviews"],
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
        tags: ["Reviews"],
        querystring: {
          type: "object",
          properties: {
            skip: { type: "integer", minimum: 0, default: 0 },
            take: { type: "integer", minimum: 1, maximum: 100, default: 10 },
            professionalId: { type: "string", format: "uuid" },
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
        tags: ["Reviews"],
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
        tags: ["Reviews"],
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
  // PROFESSIONAL OPERATIONS
  // ========================================

  // Buscar avaliações do profissional
  fastify.get(
    "/professional/:professionalId",
    {
      schema: {
        description: "Busca avaliações de um profissional",
        tags: ["Reviews"],
        params: {
          type: "object",
          required: ["professionalId"],
          properties: {
            professionalId: { type: "string", format: "uuid" },
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
    controller.getProfessionalReviews.bind(controller)
  );

  // Buscar avaliações do cliente autenticado
  fastify.get(
    "/client/my-reviews",
    {
      schema: {
        description: "Busca avaliações do cliente autenticado",
        tags: ["Reviews"],
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
        tags: ["Reviews"],
        querystring: {
          type: "object",
          properties: {
            professionalId: { type: "string", format: "uuid" },
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

  // Obter avaliação média do profissional
  fastify.get(
    "/professional/:professionalId/average-rating",
    {
      schema: {
        description: "Obtém avaliação média de um profissional",
        tags: ["Reviews"],
        params: {
          type: "object",
          required: ["professionalId"],
          properties: {
            professionalId: { type: "string", format: "uuid" },
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
    controller.getProfessionalAverageRating.bind(controller)
  );

  // Obter avaliações recentes do profissional
  fastify.get(
    "/professional/:professionalId/recent",
    {
      schema: {
        description: "Obtém avaliações recentes de um profissional",
        tags: ["Reviews"],
        params: {
          type: "object",
          required: ["professionalId"],
          properties: {
            professionalId: { type: "string", format: "uuid" },
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
    controller.getRecentProfessionalReviews.bind(controller)
  );
}
