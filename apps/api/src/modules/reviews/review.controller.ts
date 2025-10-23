/**
 * ReviewController - Camada de Apresentação
 *
 * Controller para gerenciamento de avaliações
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { FastifyRequest, FastifyReply } from "fastify";
import { ReviewService } from "../../application/services/review.service";
import { ReviewRepository } from "../../infrastructure/repositories/review.repository";
import { BadRequestError, NotFoundError } from "../../utils/app-error";

/**
 * Controller para Review
 */
export class ReviewController {
  private reviewService: ReviewService;

  constructor() {
    const repository = new ReviewRepository();
    this.reviewService = new ReviewService(repository);
  }

  /**
   * Cria uma nova avaliação
   */
  async createReview(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = request.body as any;
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const review = await this.reviewService.createReview({
        ...data,
        clientId: userId,
      });

      return reply.status(201).send({
        success: true,
        data: review,
        message: "Avaliação criada com sucesso",
      });
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        return reply.status(error.statusCode || 400).send({
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

  /**
   * Busca avaliação por ID
   */
  async getReview(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const review = await this.reviewService.getReviewById(id);

      return reply.status(200).send({
        success: true,
        data: review,
      });
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        return reply.status(error.statusCode || 400).send({
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

  /**
   * Busca avaliação por agendamento
   */
  async getReviewByAppointment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { appointmentId } = request.params as { appointmentId: string };
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const review = await this.reviewService.getReviewByAppointment(
        appointmentId
      );

      return reply.status(200).send({
        success: true,
        data: review,
      });
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        return reply.status(error.statusCode || 400).send({
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

  /**
   * Lista avaliações com filtros
   */
  async listReviews(request: FastifyRequest, reply: FastifyReply) {
    try {
      const filters = request.query as any;
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const result = await this.reviewService.listReviews(filters);

      return reply.status(200).send({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
      });
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        return reply.status(error.statusCode || 400).send({
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

  /**
   * Atualiza avaliação
   */
  async updateReview(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const data = request.body as any;
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const review = await this.reviewService.updateReview(id, data);

      return reply.status(200).send({
        success: true,
        data: review,
        message: "Avaliação atualizada com sucesso",
      });
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        return reply.status(error.statusCode || 400).send({
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

  /**
   * Remove avaliação
   */
  async deleteReview(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      await this.reviewService.deleteReview(id);

      return reply.status(200).send({
        success: true,
        message: "Avaliação removida com sucesso",
      });
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        return reply.status(error.statusCode || 400).send({
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

  /**
   * Busca avaliações por profissional
   */
  async getProfessionalReviews(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { professionalId } = request.params as { professionalId: string };
      const filters = request.query as any;
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const result = await this.reviewService.getProfessionalReviews(
        professionalId,
        filters
      );

      return reply.status(200).send({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
      });
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        return reply.status(error.statusCode || 400).send({
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

  /**
   * Busca avaliações por cliente
   */
  async getClientReviews(request: FastifyRequest, reply: FastifyReply) {
    try {
      const filters = request.query as any;
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const result = await this.reviewService.getClientReviews(userId, filters);

      return reply.status(200).send({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
      });
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        return reply.status(error.statusCode || 400).send({
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

  /**
   * Obtém estatísticas de avaliações
   */
  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const filters = request.query as any;
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const stats = await this.reviewService.getReviewStats(filters);

      return reply.status(200).send({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        return reply.status(error.statusCode || 400).send({
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

  /**
   * Obtém avaliação média de um profissional
   */
  async getProfessionalAverageRating(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { professionalId } = request.params as { professionalId: string };
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const averageRating =
        await this.reviewService.getProfessionalAverageRating(professionalId);

      return reply.status(200).send({
        success: true,
        data: { averageRating },
      });
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        return reply.status(error.statusCode || 400).send({
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

  /**
   * Obtém avaliações recentes de um profissional
   */
  async getRecentProfessionalReviews(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { professionalId } = request.params as { professionalId: string };
      const { limit = 5 } = request.query as { limit?: number };
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const result = await this.reviewService.getRecentProfessionalReviews(
        professionalId,
        limit
      );

      return reply.status(200).send({
        success: true,
        data: result.data,
      });
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        return reply.status(error.statusCode || 400).send({
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
