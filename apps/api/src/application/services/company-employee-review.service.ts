/**
 * Serviço de aplicação para gerenciamento de avaliações de funcionários de empresa
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { CompanyEmployeeReview } from "../../domain/entities/company-employee-review.entity";
import { CompanyEmployeeReviewRepository } from "../../infrastructure/repositories/company-employee-review.repository";
import { BadRequestError, NotFoundError } from "../../utils/app-error";
import { prisma } from "../../lib/prisma";

/**
 * Serviço de aplicação para CompanyEmployeeReview
 */
export class CompanyEmployeeReviewService {
  constructor(
    private companyEmployeeReviewRepository: CompanyEmployeeReviewRepository = new CompanyEmployeeReviewRepository(
      prisma
    )
  ) {}

  /**
   * Cria uma nova avaliação de funcionário
   */
  async createReview(data: {
    appointmentId: string;
    reviewerId: string;
    employeeId: string;
    rating: number;
    comment?: string;
  }): Promise<CompanyEmployeeReview> {
    // Validar rating
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestError("Rating deve estar entre 1 e 5");
    }

    // Verificar se já existe avaliação para este agendamento
    const existingReview =
      await this.companyEmployeeReviewRepository.findByAppointmentId(
        data.appointmentId
      );
    if (existingReview) {
      throw new BadRequestError(
        "Já existe uma avaliação para este agendamento"
      );
    }

    // Criar avaliação
    const review = await this.companyEmployeeReviewRepository.create(data);
    return review;
  }

  /**
   * Busca avaliação por ID
   */
  async getReviewById(id: string): Promise<CompanyEmployeeReview | null> {
    return await this.companyEmployeeReviewRepository.findById(id);
  }

  /**
   * Busca avaliação por agendamento
   */
  async getReviewByAppointment(
    appointmentId: string
  ): Promise<CompanyEmployeeReview | null> {
    return await this.companyEmployeeReviewRepository.findByAppointmentId(
      appointmentId
    );
  }

  /**
   * Atualiza avaliação
   */
  async updateReview(
    id: string,
    data: { rating?: number; comment?: string }
  ): Promise<CompanyEmployeeReview> {
    if (data.rating) {
      if (data.rating < 1 || data.rating > 5) {
        throw new BadRequestError("Rating deve estar entre 1 e 5");
      }
    }

    const review = await this.companyEmployeeReviewRepository.update(id, data);
    if (!review) {
      throw new NotFoundError("Avaliação não encontrada");
    }

    return review;
  }

  /**
   * Remove avaliação
   */
  async deleteReview(id: string): Promise<void> {
    const review = await this.companyEmployeeReviewRepository.findById(id);
    if (!review) {
      throw new NotFoundError("Avaliação não encontrada");
    }

    await this.companyEmployeeReviewRepository.delete(id);
  }

  /**
   * Lista avaliações de um funcionário
   */
  async getEmployeeReviews(
    employeeId: string
  ): Promise<CompanyEmployeeReview[]> {
    return await this.companyEmployeeReviewRepository.findByEmployeeId(
      employeeId
    );
  }

  /**
   * Lista avaliações de um cliente
   */
  async getClientReviews(clientId: string): Promise<CompanyEmployeeReview[]> {
    return await this.companyEmployeeReviewRepository.findByReviewerId(
      clientId
    );
  }

  /**
   * Obtém estatísticas de avaliações
   */
  async getReviewStats(companyId?: string, employeeId?: string) {
    const filters: any = {};
    if (companyId) filters.companyId = companyId;
    if (employeeId) filters.employeeId = employeeId;

    // Implementação simplificada
    const reviews = await this.companyEmployeeReviewRepository.findMany(
      filters
    );
    const total = reviews.length;
    const average =
      total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;

    return {
      total,
      average: Math.round(average * 100) / 100,
      distribution: this.getRatingDistribution(reviews),
    };
  }

  /**
   * Obtém avaliação média de um funcionário
   */
  async getEmployeeAverageRating(employeeId: string): Promise<number> {
    return await this.companyEmployeeReviewRepository.getAverageRating(
      employeeId
    );
  }

  /**
   * Obtém distribuição de avaliações
   */
  async getEmployeeRatingDistribution(employeeId: string): Promise<any[]> {
    return await this.companyEmployeeReviewRepository.getRatingDistribution(
      employeeId
    );
  }

  /**
   * Lista avaliações com filtros
   */
  async listReviews(filters: {
    employeeId?: string;
    reviewerId?: string;
    rating?: number;
    skip?: number;
    take?: number;
  }): Promise<CompanyEmployeeReview[]> {
    return await this.companyEmployeeReviewRepository.findMany(filters);
  }

  /**
   * Conta avaliações com filtros
   */
  async countReviews(filters: {
    employeeId?: string;
    reviewerId?: string;
    rating?: number;
  }): Promise<number> {
    return await this.companyEmployeeReviewRepository.count(filters);
  }

  /**
   * Método auxiliar para calcular distribuição de ratings
   */
  private getRatingDistribution(reviews: any[]): any[] {
    const distribution = [0, 0, 0, 0, 0]; // 1-5 estrelas

    reviews.forEach((review) => {
      if (review.rating && review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating - 1] =
          (distribution[review.rating - 1] || 0) + 1;
      }
    });

    return distribution.map((count, index) => ({
      rating: index + 1,
      count,
    }));
  }
}
