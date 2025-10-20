import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";
import { ReviewsRepository } from "./reviews.repository";
import { authMiddleware } from "../../middlewares/auth.middleware";

export async function reviewsRoutes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();
  const reviewsRepository = new ReviewsRepository(prisma);
  const reviewsService = new ReviewsService(reviewsRepository);
  const reviewsController = new ReviewsController(reviewsService);

  // ========================================
  // CRUD ROUTES
  // ========================================

  // POST /api/v1/reviews
  fastify.post(
    "/",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Reviews"],
        summary: "Criar avaliação",
        description: "Cria uma nova avaliação para um agendamento concluído",
        body: {
          type: "object",
          required: ["appointmentId", "rating"],
          properties: {
            appointmentId: {
              type: "string",
              description: "ID do agendamento",
              example: "clx1234567890abcdef",
            },
            rating: {
              type: "integer",
              minimum: 1,
              maximum: 5,
              description: "Nota de 1 a 5 estrelas",
              example: 5,
            },
            comment: {
              type: "string",
              maxLength: 1000,
              description: "Comentário opcional",
              example: "Excelente profissional, muito atencioso!",
            },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object" },
              message: { type: "string", example: "Avaliação criada com sucesso" },
            },
          },
          400: {
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              message: { type: "string" },
            },
          },
        },
      },
    },
    reviewsController.createReview.bind(reviewsController) as any
  );

  // GET /api/v1/reviews/:id
  fastify.get(
    "/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Reviews"],
        summary: "Buscar avaliação por ID",
        description: "Busca uma avaliação específica",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description: "ID da avaliação",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object" },
            },
          },
        },
      },
    },
    reviewsController.getReview.bind(reviewsController) as any
  );

  // GET /api/v1/reviews
  fastify.get(
    "/",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Reviews"],
        summary: "Listar avaliações",
        description: "Lista avaliações com filtros e paginação",
        querystring: {
          type: "object",
          properties: {
            page: { type: "string", default: "1" },
            limit: { type: "string", default: "10" },
            professionalId: { type: "string", description: "Filtrar por profissional" },
            reviewerId: { type: "string", description: "Filtrar por avaliador" },
            minRating: { type: "string", description: "Rating mínimo (1-5)" },
            maxRating: { type: "string", description: "Rating máximo (1-5)" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "array", items: { type: "object" } },
              pagination: { type: "object" },
            },
          },
        },
      },
    },
    reviewsController.getReviews.bind(reviewsController) as any
  );

  // PUT /api/v1/reviews/:id
  fastify.put(
    "/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Reviews"],
        summary: "Atualizar avaliação",
        description: "Atualiza uma avaliação existente (apenas autor, até 30 dias)",
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
            rating: {
              type: "integer",
              minimum: 1,
              maximum: 5,
            },
            comment: {
              type: "string",
              maxLength: 1000,
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object" },
              message: { type: "string", example: "Avaliação atualizada com sucesso" },
            },
          },
        },
      },
    },
    reviewsController.updateReview.bind(reviewsController) as any
  );

  // DELETE /api/v1/reviews/:id
  fastify.delete(
    "/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Reviews"],
        summary: "Deletar avaliação",
        description: "Deleta uma avaliação (apenas autor, até 7 dias)",
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
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string", example: "Avaliação deletada com sucesso" },
            },
          },
        },
      },
    },
    reviewsController.deleteReview.bind(reviewsController) as any
  );

  // ========================================
  // SPECIFIC ROUTES
  // ========================================

  // GET /api/v1/reviews/appointment/:appointmentId
  fastify.get(
    "/appointment/:appointmentId",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Reviews"],
        summary: "Buscar avaliação por agendamento",
        description: "Busca a avaliação de um agendamento específico",
        params: {
          type: "object",
          required: ["appointmentId"],
          properties: {
            appointmentId: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object" },
            },
          },
        },
      },
    },
    reviewsController.getReviewByAppointment.bind(reviewsController) as any
  );

  // GET /api/v1/reviews/stats/professional
  fastify.get(
    "/stats/professional",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Reviews"],
        summary: "Estatísticas do profissional",
        description: "Retorna estatísticas de avaliações de um profissional",
        querystring: {
          type: "object",
          required: ["professionalId"],
          properties: {
            professionalId: {
              type: "string",
              description: "ID do profissional",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  professionalId: { type: "string" },
                  totalReviews: { type: "number", example: 50 },
                  averageRating: { type: "number", example: 4.5 },
                  ratingDistribution: {
                    type: "object",
                    properties: {
                      "1": { type: "number" },
                      "2": { type: "number" },
                      "3": { type: "number" },
                      "4": { type: "number" },
                      "5": { type: "number" },
                    },
                  },
                  recentReviews: { type: "array", items: { type: "object" } },
                },
              },
            },
          },
        },
      },
    },
    reviewsController.getProfessionalStats.bind(reviewsController) as any
  );
}

