import { FastifyInstance } from "fastify";
import { CompanyEmployeeReviewService } from "../../application/services/company-employee-review.service";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { rbacMiddleware } from "../../middlewares/rbac.middleware";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../../utils/app-error";

export async function reviewRoutes(app: FastifyInstance): Promise<void> {
  const reviewService = new CompanyEmployeeReviewService();

  app.addHook("preHandler", authMiddleware);

  // Criar avaliação
  app.post("/reviews", {
    preHandler: rbacMiddleware(["CLIENT"]),
    handler: async (request, reply) => {
      try {
        const review = await reviewService.createReview(request.body as any);
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
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
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
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        const updatedReview = await reviewService.updateReview(
          id,
          request.body as any
        );
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
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
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
    handler: async (request, reply) => {
      const { appointmentId } = request.params as { appointmentId: string };
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
    handler: async (request, reply) => {
      const {
        companyId,
        companyEmployeeId,
        clientId,
        rating,
        page = "1",
        limit = "10",
      } = request.query as any;
      try {
        const filters = {
          companyId,
          companyEmployeeId,
          clientId,
          rating: rating ? parseInt(rating) : undefined,
          page: parseInt(page),
          limit: parseInt(limit),
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
    handler: async (request, reply) => {
      const { companyId } = request.params as { companyId: string };
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
    handler: async (request, reply) => {
      const { companyEmployeeId } = request.params as {
        companyEmployeeId: string;
      };
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
    handler: async (request, reply) => {
      const { clientId } = request.params as { clientId: string };
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
    preHandler: rbacMiddleware(["CLIENT", "PROFESSIONAL", "COMPANY", "ADMIN"]),
    handler: async (request, reply) => {
      const { companyId, companyEmployeeId } = request.query as any;
      try {
        const stats = await reviewService.getReviewStats(
          companyId,
          companyEmployeeId
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
    handler: async (request, reply) => {
      const { companyId } = request.params as { companyId: string };
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
    handler: async (request, reply) => {
      const { companyEmployeeId } = request.params as {
        companyEmployeeId: string;
      };
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
