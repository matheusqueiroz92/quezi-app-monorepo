import { FastifyInstance } from "fastify";
import { z } from "zod";
import { CompanyEmployeeReviewService } from "../../application/services/company-employee-review.service";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { rbacMiddleware } from "../../middlewares/rbac.middleware";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../../utils/app-error";

// Zod Schemas
const IdParamSchema = z.object({ id: z.string().min(1) });
const AppointmentParamSchema = z.object({ appointmentId: z.string().min(1) });
const CompanyIdParamSchema = z.object({ companyId: z.string().min(1) });
const EmployeeIdParamSchema = z.object({
  companyEmployeeId: z.string().min(1),
});
const ClientIdParamSchema = z.object({ clientId: z.string().min(1) });

const CreateReviewSchema = z.object({
  appointmentId: z.string().min(1),
  reviewerId: z.string().min(1),
  employeeId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

const UpdateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(2000).optional(),
});

const ListQuerySchema = z.object({
  companyId: z.string().optional(),
  companyEmployeeId: z.string().optional(),
  clientId: z.string().optional(),
  rating: z
    .string()
    .transform((v) => (v ? parseInt(v) : undefined))
    .optional(),
  page: z
    .string()
    .default("1")
    .transform((v) => parseInt(v)),
  limit: z
    .string()
    .default("10")
    .transform((v) => parseInt(v)),
});

export async function reviewRoutes(app: FastifyInstance): Promise<void> {
  const reviewService = new CompanyEmployeeReviewService();

  app.addHook("preHandler", authMiddleware);

  // Criar avaliação
  app.post("/reviews", {
    preHandler: rbacMiddleware(["CLIENT"]),
    schema: {
      tags: ["reviews"],
      body: { type: "object" },
      response: {
        201: { type: "object" },
        400: { type: "object" },
        404: { type: "object" },
        500: { type: "object" },
      },
    },
    handler: async (request, reply) => {
      try {
        const data = CreateReviewSchema.parse(request.body);
        const review = await reviewService.createReview(data as any);
        return reply.status(201).send(review);
      } catch (error) {
        if (error instanceof BadRequestError) {
          return reply.status(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: error.message,
          });
        }
        throw error;
      }
    },
  });

  // Obter avaliação por ID
  app.get("/reviews/:id", {
    preHandler: rbacMiddleware(["CLIENT", "PROFESSIONAL", "COMPANY", "ADMIN"]),
    schema: {
      tags: ["reviews"],
      params: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const { id } = IdParamSchema.parse(request.params);
      try {
        const review = await reviewService.getReviewById(id);
        if (!review) {
          throw new NotFoundError("Avaliação não encontrada");
        }
        return reply.status(200).send(review);
      } catch (error) {
        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            statusCode: 404,
            error: "Not Found",
            message: error.message,
          });
        }
        throw error;
      }
    },
  });

  // Atualizar avaliação
  app.put("/reviews/:id", {
    preHandler: rbacMiddleware(["CLIENT", "ADMIN"]),
    schema: {
      tags: ["reviews"],
      params: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
      body: { type: "object" },
    },
    handler: async (request, reply) => {
      const { id } = IdParamSchema.parse(request.params);
      try {
        const data = UpdateReviewSchema.parse(request.body ?? {});
        const updatedReview = await reviewService.updateReview(id, data as any);
        return reply.status(200).send(updatedReview);
      } catch (error) {
        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            statusCode: 404,
            error: "Not Found",
            message: error.message,
          });
        }
        if (error instanceof BadRequestError) {
          return reply.status(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: error.message,
          });
        }
        throw error;
      }
    },
  });

  // Deletar avaliação
  app.delete("/reviews/:id", {
    preHandler: rbacMiddleware(["CLIENT", "ADMIN"]),
    schema: {
      tags: ["reviews"],
      params: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const { id } = IdParamSchema.parse(request.params);
      try {
        await reviewService.deleteReview(id);
        return reply.status(204).send();
      } catch (error) {
        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            statusCode: 404,
            error: "Not Found",
            message: error.message,
          });
        }
        if (error instanceof BadRequestError) {
          return reply.status(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: error.message,
          });
        }
        throw error;
      }
    },
  });

  // Obter avaliação por agendamento
  app.get("/reviews/appointment/:appointmentId", {
    preHandler: rbacMiddleware(["CLIENT", "PROFESSIONAL", "COMPANY", "ADMIN"]),
    schema: {
      tags: ["reviews"],
      params: {
        type: "object",
        properties: { appointmentId: { type: "string" } },
        required: ["appointmentId"],
      },
    },
    handler: async (request, reply) => {
      const { appointmentId } = AppointmentParamSchema.parse(request.params);
      try {
        const review = await reviewService.getReviewByAppointment(
          appointmentId
        );
        return reply.status(200).send(review);
      } catch (error) {
        if (error instanceof BadRequestError) {
          return reply.status(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: error.message,
          });
        }
        throw error;
      }
    },
  });

  // Listar avaliações com filtros
  app.get("/reviews", {
    preHandler: rbacMiddleware(["CLIENT", "PROFESSIONAL", "COMPANY", "ADMIN"]),
    schema: { tags: ["reviews"], querystring: { type: "object" } },
    handler: async (request, reply) => {
      const { companyId, companyEmployeeId, clientId, rating, page, limit } =
        ListQuerySchema.parse(request.query as any);
      try {
        const filters = {
          companyId,
          companyEmployeeId,
          clientId,
          rating,
          page,
          limit,
        };
        const result = await reviewService.listReviews(filters);
        return reply.status(200).send(result);
      } catch (error) {
        if (error instanceof BadRequestError) {
          return reply.status(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: error.message,
          });
        }
        throw error;
      }
    },
  });

  // Obter avaliações da empresa
  app.get("/reviews/company/:companyId", {
    preHandler: rbacMiddleware(["CLIENT", "PROFESSIONAL", "COMPANY", "ADMIN"]),
    schema: {
      tags: ["reviews"],
      params: {
        type: "object",
        properties: { companyId: { type: "string" } },
        required: ["companyId"],
      },
    },
    handler: async (request, reply) => {
      const { companyId } = CompanyIdParamSchema.parse(request.params);
      try {
        const reviews = await reviewService.listReviews({
          employeeId: companyId,
        });
        return reply.status(200).send(reviews);
      } catch (error) {
        if (error instanceof BadRequestError) {
          return reply.status(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: error.message,
          });
        }
        throw error;
      }
    },
  });

  // Obter avaliações do funcionário
  app.get("/reviews/employee/:companyEmployeeId", {
    preHandler: rbacMiddleware(["CLIENT", "PROFESSIONAL", "COMPANY", "ADMIN"]),
    schema: {
      tags: ["reviews"],
      params: {
        type: "object",
        properties: { companyEmployeeId: { type: "string" } },
        required: ["companyEmployeeId"],
      },
    },
    handler: async (request, reply) => {
      const { companyEmployeeId } = EmployeeIdParamSchema.parse(request.params);
      try {
        const reviews = await reviewService.getEmployeeReviews(
          companyEmployeeId
        );
        return reply.status(200).send(reviews);
      } catch (error) {
        if (error instanceof BadRequestError) {
          return reply.status(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: error.message,
          });
        }
        throw error;
      }
    },
  });

  // Obter avaliações do cliente
  app.get("/reviews/client/:clientId", {
    preHandler: rbacMiddleware(["CLIENT", "ADMIN"]),
    schema: {
      tags: ["reviews"],
      params: {
        type: "object",
        properties: { clientId: { type: "string" } },
        required: ["clientId"],
      },
    },
    handler: async (request, reply) => {
      const { clientId } = ClientIdParamSchema.parse(request.params);
      try {
        const reviews = await reviewService.getClientReviews(clientId);
        return reply.status(200).send(reviews);
      } catch (error) {
        if (error instanceof BadRequestError) {
          return reply.status(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: error.message,
          });
        }
        throw error;
      }
    },
  });

  // Obter estatísticas de avaliações
  app.get("/reviews/stats", {
    preHandler: rbacMiddleware(["CLIENT", "PROFISSIONAL", "COMPANY", "ADMIN"]),
    schema: { tags: ["reviews"], querystring: { type: "object" } },
    handler: async (request, reply) => {
      const qs = z
        .object({
          companyId: z.string().optional(),
          companyEmployeeId: z.string().optional(),
        })
        .parse(request.query as any);
      try {
        const stats = await reviewService.getReviewStats(
          qs.companyId,
          qs.companyEmployeeId
        );
        return reply.status(200).send(stats);
      } catch (error) {
        if (error instanceof BadRequestError) {
          return reply.status(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: error.message,
          });
        }
        throw error;
      }
    },
  });

  // Obter avaliação média da empresa
  app.get("/reviews/company/:companyId/average", {
    preHandler: rbacMiddleware(["CLIENT", "PROFESSIONAL", "COMPANY", "ADMIN"]),
    schema: {
      tags: ["reviews"],
      params: {
        type: "object",
        properties: { companyId: { type: "string" } },
        required: ["companyId"],
      },
    },
    handler: async (request, reply) => {
      const { companyId } = CompanyIdParamSchema.parse(request.params);
      try {
        const stats = await reviewService.getReviewStats(companyId);
        const average = stats.average;
        return reply.status(200).send({ average });
      } catch (error) {
        if (error instanceof BadRequestError) {
          return reply.status(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: error.message,
          });
        }
        throw error;
      }
    },
  });

  // Obter avaliação média do funcionário
  app.get("/reviews/employee/:companyEmployeeId/average", {
    preHandler: rbacMiddleware(["CLIENT", "PROFESSIONAL", "COMPANY", "ADMIN"]),
    schema: {
      tags: ["reviews"],
      params: {
        type: "object",
        properties: { companyEmployeeId: { type: "string" } },
        required: ["companyEmployeeId"],
      },
    },
    handler: async (request, reply) => {
      const { companyEmployeeId } = EmployeeIdParamSchema.parse(request.params);
      try {
        const average = await reviewService.getEmployeeAverageRating(
          companyEmployeeId
        );
        return reply.status(200).send({ average });
      } catch (error) {
        if (error instanceof BadRequestError) {
          return reply.status(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: error.message,
          });
        }
        throw error;
      }
    },
  });
}
