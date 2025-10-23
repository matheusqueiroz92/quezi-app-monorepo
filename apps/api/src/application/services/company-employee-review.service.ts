/**
 * CompanyEmployeeReviewService - Camada de Aplicação
 *
 * Serviço de aplicação para gerenciamento de avaliações de funcionários de empresa
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { CompanyEmployeeReview } from "../../domain/entities/company-employee-review.entity";
import { CompanyEmployeeReviewRepository } from "../../infrastructure/repositories/company-employee-review.repository";
import { BadRequestError, NotFoundError } from "../../utils/app-error";

/**
 * Serviço de aplicação para CompanyEmployeeReview
 */
export class CompanyEmployeeReviewService {
  constructor(
    private companyEmployeeReviewRepository: CompanyEmployeeReviewRepository
  ) {}

  /**
   * Cria uma nova avaliação de funcionário
   */
  async createReview(data: {
    appointmentId: string;
    clientId: string;
    companyId: string;
    employeeId: string;
    rating: number;
    comment?: string;
  }): Promise<CompanyEmployeeReview> {
    // Validar rating (1-5)
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestError("Rating deve estar entre 1 e 5");
    }

    // Verificar se já existe avaliação para este agendamento
    const existingReview =
      await this.companyEmployeeReviewRepository.existsForAppointment(
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

    return await this.companyEmployeeReviewRepository.create(reviewData);
  }

  /**
   * Busca avaliação por ID
   */
  async getReviewById(id: string): Promise<CompanyEmployeeReview> {
    const review = await this.companyEmployeeReviewRepository.findById(id);

    if (!review) {
      throw new NotFoundError("Avaliação não encontrada");
    }

    return review;
  }

  /**
   * Busca avaliação por agendamento
   */
  async getReviewByAppointment(
    appointmentId: string
  ): Promise<CompanyEmployeeReview | null> {
    return await this.companyEmployeeReviewRepository.findByAppointment(
      appointmentId
    );
  }

  /**
   * Lista avaliações com filtros
   */
  async listReviews(filters: {
    skip?: number;
    take?: number;
    companyId?: string;
    employeeId?: string;
    clientId?: string;
    rating?: number;
    dateFrom?: string;
    dateTo?: string;
  }) {
    return await this.companyEmployeeReviewRepository.findMany(filters);
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
  ): Promise<CompanyEmployeeReview> {
    // Verificar se avaliação existe
    const existingReview = await this.companyEmployeeReviewRepository.findById(
      id
    );
    if (!existingReview) {
      throw new NotFoundError("Avaliação não encontrada");
    }

    // Validar rating se fornecido
    if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
      throw new BadRequestError("Rating deve estar entre 1 e 5");
    }

    return await this.companyEmployeeReviewRepository.update(id, {
      ...data,
      updatedAt: new Date(),
    });
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
   * Busca avaliações por empresa
   */
  async getCompanyReviews(
    companyId: string,
    filters: {
      skip?: number;
      take?: number;
      rating?: number;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ) {
    return await this.companyEmployeeReviewRepository.findByCompany(
      companyId,
      filters
    );
  }

  /**
   * Busca avaliações por funcionário
   */
  async getEmployeeReviews(
    employeeId: string,
    filters: {
      skip?: number;
      take?: number;
      rating?: number;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ) {
    return await this.companyEmployeeReviewRepository.findByEmployee(
      employeeId,
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
    return await this.companyEmployeeReviewRepository.findByClient(
      clientId,
      filters
    );
  }

  /**
   * Obtém estatísticas de avaliações
   */
  async getReviewStats(
    filters: {
      companyId?: string;
      employeeId?: string;
      clientId?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ) {
    return await this.companyEmployeeReviewRepository.getStats(filters);
  }

  /**
   * Obtém avaliação média de uma empresa
   */
  async getCompanyAverageRating(companyId: string): Promise<number> {
    const stats = await this.companyEmployeeReviewRepository.getStats({
      companyId,
    });
    return stats.averageRating;
  }

  /**
   * Obtém avaliação média de um funcionário
   */
  async getEmployeeAverageRating(employeeId: string): Promise<number> {
    const stats = await this.companyEmployeeReviewRepository.getStats({
      employeeId,
    });
    return stats.averageRating;
  }

  /**
   * Obtém distribuição de ratings de uma empresa
   */
  async getCompanyRatingDistribution(
    companyId: string
  ): Promise<Record<number, number>> {
    const stats = await this.companyEmployeeReviewRepository.getStats({
      companyId,
    });
    return stats.ratingDistribution;
  }

  /**
   * Obtém distribuição de ratings de um funcionário
   */
  async getEmployeeRatingDistribution(
    employeeId: string
  ): Promise<Record<number, number>> {
    const stats = await this.companyEmployeeReviewRepository.getStats({
      employeeId,
    });
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
    const existingReview =
      await this.companyEmployeeReviewRepository.existsForAppointment(
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
   * Obtém avaliações recentes de uma empresa
   */
  async getRecentCompanyReviews(companyId: string, limit: number = 5) {
    return await this.companyEmployeeReviewRepository.findByCompany(companyId, {
      skip: 0,
      take: limit,
    });
  }

  /**
   * Obtém avaliações recentes de um funcionário
   */
  async getRecentEmployeeReviews(employeeId: string, limit: number = 5) {
    return await this.companyEmployeeReviewRepository.findByEmployee(
      employeeId,
      {
        skip: 0,
        take: limit,
      }
    );
  }

  /**
   * Obtém avaliações por rating específico
   */
  async getReviewsByRating(
    rating: number,
    filters: {
      skip?: number;
      take?: number;
      companyId?: string;
      employeeId?: string;
      clientId?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ) {
    return await this.companyEmployeeReviewRepository.findMany({
      ...filters,
      rating,
    });
  }

  /**
   * Busca avaliações por empresa e funcionário
   */
  async getCompanyEmployeeReviews(
    companyId: string,
    employeeId: string,
    filters: {
      skip?: number;
      take?: number;
      rating?: number;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ) {
    return await this.companyEmployeeReviewRepository.findMany({
      ...filters,
      companyId,
      employeeId,
    });
  }
}
