/**
 * Entidade Review - Camada de Domínio
 *
 * Representa uma avaliação de um agendamento
 * Seguindo os princípios DDD e Clean Architecture
 */

import { BadRequestError } from "../../utils/app-error";

/**
 * Entidade Review
 *
 * Representa uma avaliação de um agendamento
 */
export class Review {
  private constructor(
    private readonly _id: string,
    private readonly _appointmentId: string,
    private readonly _clientId: string,
    private readonly _professionalId: string,
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
  get professionalId(): string {
    return this._professionalId;
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
  static create(data: CreateReviewData): Review {
    this.validateReviewData(data);

    const now = new Date();
    return new Review(
      data.id,
      data.appointmentId,
      data.clientId,
      data.professionalId,
      data.rating,
      data.comment || null,
      data.createdAt || now,
      data.updatedAt || now
    );
  }

  /**
   * Factory method para reconstruir a partir de dados de persistência
   */
  static fromPersistence(data: ReviewPersistenceData): Review {
    return new Review(
      data.id,
      data.appointmentId,
      data.clientId,
      data.professionalId,
      data.rating,
      data.comment,
      data.createdAt,
      data.updatedAt
    );
  }

  /**
   * Atualiza a avaliação
   */
  update(rating: number, comment?: string): Review {
    this.validateRating(rating);

    return new Review(
      this._id,
      this._appointmentId,
      this._clientId,
      this._professionalId,
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
      professionalId: this._professionalId,
      rating: this._rating,
      comment: this._comment,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }

  /**
   * Valida dados da avaliação
   */
  private static validateReviewData(data: CreateReviewData): void {
    if (!data.id) {
      throw new BadRequestError("ID é obrigatório");
    }

    if (!data.appointmentId) {
      throw new BadRequestError("ID do agendamento é obrigatório");
    }

    if (!data.clientId) {
      throw new BadRequestError("ID do cliente é obrigatório");
    }

    if (!data.professionalId) {
      throw new BadRequestError("ID do profissional é obrigatório");
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
export interface CreateReviewData {
  id: string;
  appointmentId: string;
  clientId: string;
  professionalId: string;
  rating: number;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para dados de persistência
 */
export interface ReviewPersistenceData {
  id: string;
  appointmentId: string;
  clientId: string;
  professionalId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}
