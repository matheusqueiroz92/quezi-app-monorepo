import { AppError } from "../../utils/app-error";
import { ReviewsRepository } from "./reviews.repository";
import {
  CreateReviewInput,
  UpdateReviewInput,
  GetReviewsQuery,
  ReviewParams,
  AppointmentParams,
  GetProfessionalStatsQuery,
} from "./reviews.schema";

export class ReviewsService {
  constructor(private reviewsRepository: ReviewsRepository) {}

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  async createReview(data: CreateReviewInput, userId: string) {
    try {
      // TODO: Buscar o agendamento para validar
      // Por enquanto, vamos assumir que reviewerId e professionalId virão do agendamento
      
      // Validações de negócio
      await this.validateReviewCreation(data, userId);

      // Criar a review com dados completos
      const review = await this.reviewsRepository.create({
        ...data,
        reviewerId: userId,
        professionalId: "temp-prof-id", // TODO: Obter do agendamento
      });

      return review;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao criar avaliação", 500);
    }
  }

  async getReview(params: ReviewParams, userId: string) {
    try {
      const review = await this.reviewsRepository.findById(params.id);

      // Verificar se o usuário tem permissão para ver esta review
      this.validateReviewAccess(review, userId);

      return review;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar avaliação", 500);
    }
  }

  async getReviews(query: GetReviewsQuery, userId: string) {
    try {
      const result = await this.reviewsRepository.findMany(query);
      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar avaliações", 500);
    }
  }

  async updateReview(
    params: ReviewParams,
    data: UpdateReviewInput,
    userId: string
  ) {
    try {
      const review = await this.reviewsRepository.findById(params.id);

      // Verificar se o usuário é o autor da review
      this.validateReviewOwnership(review, userId);

      // Validações específicas de edição
      await this.validateReviewUpdate(review, data, userId);

      const updatedReview = await this.reviewsRepository.update(params.id, data);

      return updatedReview;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar avaliação", 500);
    }
  }

  async deleteReview(params: ReviewParams, userId: string) {
    try {
      const review = await this.reviewsRepository.findById(params.id);

      // Verificar se o usuário é o autor da review
      this.validateReviewOwnership(review, userId);

      // Validações específicas de deleção
      await this.validateReviewDeletion(review, userId);

      const result = await this.reviewsRepository.delete(params.id);

      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao deletar avaliação", 500);
    }
  }

  // ========================================
  // SPECIFIC OPERATIONS
  // ========================================

  async getReviewByAppointment(params: AppointmentParams, userId: string) {
    try {
      const review = await this.reviewsRepository.findByAppointment(
        params.appointmentId
      );

      if (!review) {
        throw new AppError("Avaliação não encontrada para este agendamento", 404);
      }

      // Verificar permissão
      this.validateReviewAccess(review, userId);

      return review;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar avaliação do agendamento", 500);
    }
  }

  async getProfessionalStats(query: GetProfessionalStatsQuery, userId: string) {
    try {
      // Qualquer usuário pode ver estatísticas públicas de profissionais
      const stats = await this.reviewsRepository.getProfessionalStats(query);

      return stats;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar estatísticas", 500);
    }
  }

  // ========================================
  // VALIDATION METHODS
  // ========================================

  private async validateReviewCreation(
    data: CreateReviewInput,
    userId: string
  ) {
    // TODO: Validar que o usuário é o cliente do agendamento
    // TODO: Validar que o agendamento está concluído
    // TODO: Validar que não existe review para este agendamento
  }

  private validateReviewAccess(review: any, userId: string) {
    // Permitir acesso ao autor da review ou ao profissional avaliado
    if (review.reviewerId !== userId && review.professionalId !== userId) {
      throw new AppError(
        "Você não tem permissão para acessar esta avaliação",
        403
      );
    }
  }

  private validateReviewOwnership(review: any, userId: string) {
    // Apenas o autor pode editar/deletar a review
    if (review.reviewerId !== userId) {
      throw new AppError(
        "Apenas o autor pode modificar esta avaliação",
        403
      );
    }
  }

  private async validateReviewUpdate(
    review: any,
    data: UpdateReviewInput,
    userId: string
  ) {
    // Verificar se a review não é muito antiga (limite de 30 dias para edição)
    const createdAt = new Date(review.createdAt);
    const now = new Date();
    const daysDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff > 30) {
      throw new AppError(
        "Avaliações só podem ser editadas até 30 dias após criação",
        400
      );
    }
  }

  private async validateReviewDeletion(review: any, userId: string) {
    // Verificar se a review não é muito antiga (limite de 7 dias para deleção)
    const createdAt = new Date(review.createdAt);
    const now = new Date();
    const daysDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff > 7) {
      throw new AppError(
        "Avaliações só podem ser deletadas até 7 dias após criação",
        400
      );
    }
  }
}

