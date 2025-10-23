/**
 * CompanyEmployeeReviewController - Camada de Apresentação
 *
 * Controller para gerenciamento de avaliações de funcionários de empresa
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { FastifyRequest, FastifyReply } from "fastify";
import { CompanyEmployeeReviewService } from "../../application/services/company-employee-review.service";
import { CompanyEmployeeReviewRepository } from "../../infrastructure/repositories/company-employee-review.repository";
import { BadRequestError, NotFoundError } from "../../utils/app-error";

/**
 * Controller para CompanyEmployeeReview
 */
export class CompanyEmployeeReviewController {
  private companyEmployeeReviewService: CompanyEmployeeReviewService;

  constructor() {
    const repository = new CompanyEmployeeReviewRepository();
    this.companyEmployeeReviewService = new CompanyEmployeeReviewService(
      repository
    );
  }

  /**
   * Cria uma nova avaliação de funcionário
   */
  async createReview(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = request.body as any;
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const review = await this.companyEmployeeReviewService.createReview({
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

      const review = await this.companyEmployeeReviewService.getReviewById(id);

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

      const review =
        await this.companyEmployeeReviewService.getReviewByAppointment(
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

      const result = await this.companyEmployeeReviewService.listReviews(
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

      const review = await this.companyEmployeeReviewService.updateReview(
        id,
        data
      );

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

      await this.companyEmployeeReviewService.deleteReview(id);

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
   * Busca avaliações por empresa
   */
  async getCompanyReviews(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { companyId } = request.params as { companyId: string };
      const filters = request.query as any;
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const result = await this.companyEmployeeReviewService.getCompanyReviews(
        companyId,
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
   * Busca avaliações por funcionário
   */
  async getEmployeeReviews(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { employeeId } = request.params as { employeeId: string };
      const filters = request.query as any;
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const result = await this.companyEmployeeReviewService.getEmployeeReviews(
        employeeId,
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

      const result = await this.companyEmployeeReviewService.getClientReviews(
        userId,
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
   * Obtém estatísticas de avaliações
   */
  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const filters = request.query as any;
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const stats = await this.companyEmployeeReviewService.getReviewStats(
        filters
      );

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
   * Obtém avaliação média de uma empresa
   */
  async getCompanyAverageRating(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { companyId } = request.params as { companyId: string };
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const averageRating =
        await this.companyEmployeeReviewService.getCompanyAverageRating(
          companyId
        );

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
   * Obtém avaliação média de um funcionário
   */
  async getEmployeeAverageRating(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { employeeId } = request.params as { employeeId: string };
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const averageRating =
        await this.companyEmployeeReviewService.getEmployeeAverageRating(
          employeeId
        );

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
   * Obtém avaliações recentes de uma empresa
   */
  async getRecentCompanyReviews(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { companyId } = request.params as { companyId: string };
      const { limit = 5 } = request.query as { limit?: number };
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const result =
        await this.companyEmployeeReviewService.getRecentCompanyReviews(
          companyId,
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

  /**
   * Obtém avaliações recentes de um funcionário
   */
  async getRecentEmployeeReviews(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { employeeId } = request.params as { employeeId: string };
      const { limit = 5 } = request.query as { limit?: number };
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const result =
        await this.companyEmployeeReviewService.getRecentEmployeeReviews(
          employeeId,
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
