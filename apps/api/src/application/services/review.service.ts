/**
 * ReviewService - Camada de Aplicação
 *
 * Serviço de aplicação para gerenciamento de avaliações
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { Review } from "../../domain/entities/review.entity";
import { ReviewRepository } from "../../infrastructure/repositories/review.repository";
import { BadRequestError, NotFoundError } from "../../utils/app-error";

/**
 * Serviço de aplicação para Review
 */
export class ReviewService {
  constructor(private reviewRepository: ReviewRepository) {}

  /**
   * Cria uma nova avaliação
   */
  async createReview(data: {
    appointmentId: string;
    clientId: string;
    professionalId: string;
    rating: number;
    comment?: string;
  }): Promise<Review> {
    // Validar rating (1-5)
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestError("Rating deve estar entre 1 e 5");
    }

    // Verificar se já existe avaliação para este agendamento
    const existingReview = await this.reviewRepository.existsForAppointment(
      data.appointmentId
    );
    if (existingReview) {
      throw new BadRequestError(
        "Já existe uma avaliação para este agendamento"
      );
    }

    // Criar avaliação
    const reviewData = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.reviewRepository.create(reviewData);
  }

  /**
   * Busca avaliação por ID
   */
  async getReviewById(id: string): Promise<Review> {
    const review = await this.reviewRepository.findById(id);

    if (!review) {
      throw new NotFoundError("Avaliação não encontrada");
    }

    return review;
  }

  /**
   * Busca avaliação por agendamento
   */
  async getReviewByAppointment(appointmentId: string): Promise<Review | null> {
    return await this.reviewRepository.findByAppointment(appointmentId);
  }

  /**
   * Lista avaliações com filtros
   */
  async listReviews(filters: {
    skip?: number;
    take?: number;
    professionalId?: string;
    clientId?: string;
    rating?: number;
    dateFrom?: string;
    dateTo?: string;
  }) {
    return await this.reviewRepository.findMany(filters);
  }

  /**
   * Atualiza avaliação
   */
  async updateReview(
    id: string,
    data: {
      rating?: number;
      comment?: string;
    }
  ): Promise<Review> {
    // Verificar se avaliação existe
    const existingReview = await this.reviewRepository.findById(id);
    if (!existingReview) {
      throw new NotFoundError("Avaliação não encontrada");
    }

    // Validar rating se fornecido
    if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
      throw new BadRequestError("Rating deve estar entre 1 e 5");
    }

    return await this.reviewRepository.update(id, {
      ...data,
      updatedAt: new Date(),
    });
  }

  /**
   * Remove avaliação
   */
  async deleteReview(id: string): Promise<void> {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new NotFoundError("Avaliação não encontrada");
    }

    await this.reviewRepository.delete(id);
  }

  /**
   * Busca avaliações por profissional
   */
  async getProfessionalReviews(
    professionalId: string,
    filters: {
      skip?: number;
      take?: number;
      rating?: number;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ) {
    return await this.reviewRepository.findByProfessional(
      professionalId,
      filters
    );
  }

  /**
   * Busca avaliações por cliente
   */
  async getClientReviews(
    clientId: string,
    filters: {
      skip?: number;
      take?: number;
      rating?: number;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ) {
    return await this.reviewRepository.findByClient(clientId, filters);
  }

  /**
   * Obtém estatísticas de avaliações
   */
  async getReviewStats(
    filters: {
      professionalId?: string;
      clientId?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ) {
    return await this.reviewRepository.getStats(filters);
  }

  /**
   * Obtém avaliação média de um profissional
   */
  async getProfessionalAverageRating(professionalId: string): Promise<number> {
    const stats = await this.reviewRepository.getStats({ professionalId });
    return stats.averageRating;
  }

  /**
   * Obtém distribuição de ratings de um profissional
   */
  async getProfessionalRatingDistribution(
    professionalId: string
  ): Promise<Record<number, number>> {
    const stats = await this.reviewRepository.getStats({ professionalId });
    return stats.ratingDistribution;
  }

  /**
   * Verifica se cliente pode avaliar um agendamento
   */
  async canClientReviewAppointment(
    appointmentId: string,
    clientId: string
  ): Promise<boolean> {
    // Verificar se já existe avaliação
    const existingReview = await this.reviewRepository.existsForAppointment(
      appointmentId
    );
    if (existingReview) {
      return false;
    }

    // Aqui poderia adicionar outras validações como:
    // - Verificar se o agendamento foi concluído
    // - Verificar se o cliente é o dono do agendamento
    // - Verificar se já passou tempo suficiente desde a conclusão

    return true;
  }

  /**
   * Obtém avaliações recentes de um profissional
   */
  async getRecentProfessionalReviews(
    professionalId: string,
    limit: number = 5
  ) {
    return await this.reviewRepository.findByProfessional(professionalId, {
      skip: 0,
      take: limit,
    });
  }

  /**
   * Obtém avaliações por rating específico
   */
  async getReviewsByRating(
    rating: number,
    filters: {
      skip?: number;
      take?: number;
      professionalId?: string;
      clientId?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ) {
    return await this.reviewRepository.findMany({
      ...filters,
      rating,
    });
  }
}
