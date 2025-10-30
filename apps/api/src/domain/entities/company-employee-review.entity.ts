/**
 * Entidade CompanyEmployeeReview - Camada de Domínio
 *
 * Representa uma avaliação de um agendamento com funcionário de empresa
 * Seguindo os princípios DDD e Clean Architecture
 */

import { BadRequestError } from "../../utils/app-error";

/**
 * Entidade CompanyEmployeeReview
 *
 * Representa uma avaliação de um agendamento com funcionário de empresa
 */
export class CompanyEmployeeReview {
  private constructor(
    private readonly _id: string,
    private readonly _appointmentId: string,
    private readonly _clientId: string,
    private readonly _companyId: string,
    private readonly _employeeId: string,
    private readonly _rating: number,
    private readonly _comment: string | null,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date
  ) {}

  // Getters
  get id(): string {
    return this._id;
  }
  get appointmentId(): string {
    return this._appointmentId;
  }
  get clientId(): string {
    return this._clientId;
  }
  get companyId(): string {
    return this._companyId;
  }
  get employeeId(): string {
    return this._employeeId;
  }
  get rating(): number {
    return this._rating;
  }
  get comment(): string | null {
    return this._comment;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Factory method para criar nova instância
   */
  static create(data: CreateCompanyEmployeeReviewData): CompanyEmployeeReview {
    this.validateCompanyEmployeeReviewData(data);

    const now = new Date();
    return new CompanyEmployeeReview(
      data.id,
      data.appointmentId,
      data.clientId,
      data.companyId,
      data.employeeId,
      data.rating,
      data.comment || null,
      data.createdAt || now,
      data.updatedAt || now
    );
  }

  /**
   * Factory method para reconstruir a partir de dados de persistência
   */
  static fromPersistence(
    data: CompanyEmployeeReviewPersistenceData
  ): CompanyEmployeeReview {
    return new CompanyEmployeeReview(
      data.id,
      data.appointmentId,
      data.clientId,
      data.companyId,
      data.employeeId,
      data.rating,
      data.comment,
      data.createdAt,
      data.updatedAt
    );
  }

  /**
   * Atualiza a avaliação
   */
  update(rating: number, comment?: string): CompanyEmployeeReview {
    CompanyEmployeeReview.validateRating(rating);

    return new CompanyEmployeeReview(
      this._id,
      this._appointmentId,
      this._clientId,
      this._companyId,
      this._employeeId,
      rating,
      comment || this._comment,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Verifica se a avaliação pode ser editada
   */
  canBeEdited(): boolean {
    // Avaliações podem ser editadas por 24 horas após criação
    const hoursSinceCreation =
      (Date.now() - this._createdAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceCreation < 24;
  }

  /**
   * Converte para JSON
   */
  toJSON(): any {
    return {
      id: this._id,
      appointmentId: this._appointmentId,
      clientId: this._clientId,
      companyId: this._companyId,
      employeeId: this._employeeId,
      rating: this._rating,
      comment: this._comment,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }

  /**
   * Valida dados da avaliação
   */
  private static validateCompanyEmployeeReviewData(
    data: CreateCompanyEmployeeReviewData
  ): void {
    if (!data.id) {
      throw new BadRequestError("ID é obrigatório");
    }

    if (!data.appointmentId) {
      throw new BadRequestError("ID do agendamento é obrigatório");
    }

    if (!data.clientId) {
      throw new BadRequestError("ID do cliente é obrigatório");
    }

    if (!data.companyId) {
      throw new BadRequestError("ID da empresa é obrigatório");
    }

    if (!data.employeeId) {
      throw new BadRequestError("ID do funcionário é obrigatório");
    }

    this.validateRating(data.rating);
  }

  /**
   * Valida rating
   */
  private static validateRating(rating: number): void {
    if (!Number.isInteger(rating)) {
      throw new BadRequestError("Avaliação deve ser um número inteiro");
    }

    if (rating < 1 || rating > 5) {
      throw new BadRequestError("Avaliação deve ser entre 1 e 5");
    }
  }
}

/**
 * Interface para dados de criação
 */
export interface CreateCompanyEmployeeReviewData {
  id: string;
  appointmentId: string;
  clientId: string;
  companyId: string;
  employeeId: string;
  rating: number;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para dados de persistência
 */
export interface CompanyEmployeeReviewPersistenceData {
  id: string;
  appointmentId: string;
  clientId: string;
  companyId: string;
  employeeId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}
