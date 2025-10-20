import { FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "../../utils/app-error";
import { ReviewsService } from "./reviews.service";
import {
  CreateReviewInputSchema,
  UpdateReviewInputSchema,
  GetReviewsQuerySchema,
  ReviewParamsSchema,
  AppointmentParamsSchema,
  GetProfessionalStatsQuerySchema,
} from "./reviews.schema";

export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  async createReview(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = CreateReviewInputSchema.parse(request.body);
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const review = await this.reviewsService.createReview(data, userId);

      return reply.status(201).send({
        success: true,
        data: review,
        message: "Avaliação criada com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async getReview(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = ReviewParamsSchema.parse(request.params);
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const review = await this.reviewsService.getReview(params, userId);

      return reply.status(200).send({
        success: true,
        data: review,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async getReviews(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = GetReviewsQuerySchema.parse(request.query);
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const result = await this.reviewsService.getReviews(query, userId);

      return reply.status(200).send({
        success: true,
        data: result.reviews,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async updateReview(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = ReviewParamsSchema.parse(request.params);
      const data = UpdateReviewInputSchema.parse(request.body);
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const review = await this.reviewsService.updateReview(params, data, userId);

      return reply.status(200).send({
        success: true,
        data: review,
        message: "Avaliação atualizada com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async deleteReview(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = ReviewParamsSchema.parse(request.params);
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      await this.reviewsService.deleteReview(params, userId);

      return reply.status(200).send({
        success: true,
        message: "Avaliação deletada com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  // ========================================
  // SPECIFIC OPERATIONS
  // ========================================

  async getReviewByAppointment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = AppointmentParamsSchema.parse(request.params);
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const review = await this.reviewsService.getReviewByAppointment(
        params,
        userId
      );

      return reply.status(200).send({
        success: true,
        data: review,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async getProfessionalStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = GetProfessionalStatsQuerySchema.parse(request.query);
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const stats = await this.reviewsService.getProfessionalStats(query, userId);

      return reply.status(200).send({
        success: true,
        data: stats,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }
}

