/**
 * Entidade Appointment - Camada de Domínio
 *
 * Representa um agendamento entre cliente e profissional
 * Seguindo os princípios DDD e Clean Architecture
 */

import { AppointmentStatus } from "../interfaces/user.interface";
import { BadRequestError } from "../../utils/app-error";

/**
 * Entidade Appointment
 *
 * Representa um agendamento entre cliente e profissional
 */
export class Appointment {
  private constructor(
    private readonly _id: string,
    private readonly _clientId: string,
    private readonly _professionalId: string,
    private readonly _serviceId: string,
    private readonly _scheduledDate: Date,
    private readonly _scheduledTime: string,
    private readonly _status: AppointmentStatus,
    private readonly _location: string,
    private readonly _clientNotes: string | null,
    private readonly _professionalNotes: string | null,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date
  ) {}

  // Getters
  get id(): string {
    return this._id;
  }
  get clientId(): string {
    return this._clientId;
  }
  get professionalId(): string {
    return this._professionalId;
  }
  get serviceId(): string {
    return this._serviceId;
  }
  get scheduledDate(): Date {
    return this._scheduledDate;
  }
  get scheduledTime(): string {
    return this._scheduledTime;
  }
  get status(): AppointmentStatus {
    return this._status;
  }
  get location(): string {
    return this._location;
  }
  get clientNotes(): string | null {
    return this._clientNotes;
  }
  get professionalNotes(): string | null {
    return this._professionalNotes;
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
  static create(data: CreateAppointmentData): Appointment {
    this.validateAppointmentData(data);

    const now = new Date();
    return new Appointment(
      data.id,
      data.clientId,
      data.professionalId,
      data.serviceId,
      data.scheduledDate,
      data.scheduledTime,
      data.status || AppointmentStatus.PENDING,
      data.location,
      data.clientNotes || null,
      data.professionalNotes || null,
      data.createdAt || now,
      data.updatedAt || now
    );
  }

  /**
   * Factory method para reconstruir a partir de dados de persistência
   */
  static fromPersistence(data: AppointmentPersistenceData): Appointment {
    return new Appointment(
      data.id,
      data.clientId,
      data.professionalId,
      data.serviceId,
      data.scheduledDate,
      data.scheduledTime,
      data.status,
      data.location,
      data.clientNotes,
      data.professionalNotes,
      data.createdAt,
      data.updatedAt
    );
  }

  /**
   * Aceita o agendamento
   */
  accept(professionalNotes?: string): Appointment {
    if (this._status !== AppointmentStatus.PENDING) {
      throw new BadRequestError(
        "Apenas agendamentos pendentes podem ser aceitos"
      );
    }

    return new Appointment(
      this._id,
      this._clientId,
      this._professionalId,
      this._serviceId,
      this._scheduledDate,
      this._scheduledTime,
      AppointmentStatus.ACCEPTED,
      this._location,
      this._clientNotes,
      professionalNotes || this._professionalNotes,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Rejeita o agendamento
   */
  reject(professionalNotes?: string): Appointment {
    if (this._status !== AppointmentStatus.PENDING) {
      throw new BadRequestError(
        "Apenas agendamentos pendentes podem ser rejeitados"
      );
    }

    return new Appointment(
      this._id,
      this._clientId,
      this._professionalId,
      this._serviceId,
      this._scheduledDate,
      this._scheduledTime,
      AppointmentStatus.REJECTED,
      this._location,
      this._clientNotes,
      professionalNotes || this._professionalNotes,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Completa o agendamento
   */
  complete(): Appointment {
    if (this._status !== AppointmentStatus.ACCEPTED) {
      throw new BadRequestError(
        "Apenas agendamentos aceitos podem ser completados"
      );
    }

    return new Appointment(
      this._id,
      this._clientId,
      this._professionalId,
      this._serviceId,
      this._scheduledDate,
      this._scheduledTime,
      AppointmentStatus.COMPLETED,
      this._location,
      this._clientNotes,
      this._professionalNotes,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Cancela o agendamento
   */
  cancel(): Appointment {
    if (this._status === AppointmentStatus.COMPLETED) {
      throw new BadRequestError(
        "Agendamentos completados não podem ser cancelados"
      );
    }

    return new Appointment(
      this._id,
      this._clientId,
      this._professionalId,
      this._serviceId,
      this._scheduledDate,
      this._scheduledTime,
      AppointmentStatus.CANCELLED,
      this._location,
      this._clientNotes,
      this._professionalNotes,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Atualiza notas do cliente
   */
  updateClientNotes(notes: string): Appointment {
    return new Appointment(
      this._id,
      this._clientId,
      this._professionalId,
      this._serviceId,
      this._scheduledDate,
      this._scheduledTime,
      this._status,
      this._location,
      notes,
      this._professionalNotes,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Atualiza notas do profissional
   */
  updateProfessionalNotes(notes: string): Appointment {
    return new Appointment(
      this._id,
      this._clientId,
      this._professionalId,
      this._serviceId,
      this._scheduledDate,
      this._scheduledTime,
      this._status,
      this._location,
      this._clientNotes,
      notes,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Verifica se o agendamento pode ser editado
   */
  canBeEdited(): boolean {
    return this._status === AppointmentStatus.PENDING;
  }

  /**
   * Verifica se o agendamento pode ser cancelado
   */
  canBeCancelled(): boolean {
    return (
      this._status === AppointmentStatus.PENDING ||
      this._status === AppointmentStatus.ACCEPTED
    );
  }

  /**
   * Converte para JSON
   */
  toJSON(): any {
    return {
      id: this._id,
      clientId: this._clientId,
      professionalId: this._professionalId,
      serviceId: this._serviceId,
      scheduledDate: this._scheduledDate.toISOString(),
      scheduledTime: this._scheduledTime,
      status: this._status,
      location: this._location,
      clientNotes: this._clientNotes,
      professionalNotes: this._professionalNotes,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }

  /**
   * Valida dados do agendamento
   */
  private static validateAppointmentData(data: CreateAppointmentData): void {
    if (!data.id) {
      throw new BadRequestError("ID é obrigatório");
    }

    if (!data.clientId) {
      throw new BadRequestError("ID do cliente é obrigatório");
    }

    if (!data.professionalId) {
      throw new BadRequestError("ID do profissional é obrigatório");
    }

    if (!data.serviceId) {
      throw new BadRequestError("ID do serviço é obrigatório");
    }

    if (!data.scheduledDate) {
      throw new BadRequestError("Data do agendamento é obrigatória");
    }

    if (data.scheduledDate < new Date()) {
      throw new BadRequestError("Data do agendamento não pode ser no passado");
    }

    if (!data.scheduledTime || !/^\d{2}:\d{2}$/.test(data.scheduledTime)) {
      throw new BadRequestError("Horário deve estar no formato HH:MM");
    }

    if (!data.location || data.location.trim().length < 5) {
      throw new BadRequestError("Local deve ter pelo menos 5 caracteres");
    }
  }
}

/**
 * Interface para dados de criação
 */
export interface CreateAppointmentData {
  id: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  scheduledDate: Date;
  scheduledTime: string;
  status?: AppointmentStatus;
  location: string;
  clientNotes?: string;
  professionalNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para dados de persistência
 */
export interface AppointmentPersistenceData {
  id: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  scheduledDate: Date;
  scheduledTime: string;
  status: AppointmentStatus;
  location: string;
  clientNotes: string | null;
  professionalNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
