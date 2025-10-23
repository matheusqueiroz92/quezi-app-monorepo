/**
 * Entidade CompanyEmployeeAppointment - Camada de Domínio
 *
 * Representa um agendamento entre cliente e funcionário de empresa
 * Seguindo os princípios DDD e Clean Architecture
 */

import { AppointmentStatus } from "../interfaces/user.interface";
import { BadRequestError } from "../../utils/app-error";

/**
 * Entidade CompanyEmployeeAppointment
 *
 * Representa um agendamento entre cliente e funcionário de empresa
 */
export class CompanyEmployeeAppointment {
  private constructor(
    private readonly _id: string,
    private readonly _clientId: string,
    private readonly _companyId: string,
    private readonly _employeeId: string,
    private readonly _serviceId: string,
    private readonly _scheduledDate: Date,
    private readonly _scheduledTime: string,
    private readonly _status: AppointmentStatus,
    private readonly _location: string,
    private readonly _clientNotes: string | null,
    private readonly _employeeNotes: string | null,
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
  get companyId(): string {
    return this._companyId;
  }
  get employeeId(): string {
    return this._employeeId;
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
  get employeeNotes(): string | null {
    return this._employeeNotes;
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
  static create(
    data: CreateCompanyEmployeeAppointmentData
  ): CompanyEmployeeAppointment {
    this.validateCompanyEmployeeAppointmentData(data);

    const now = new Date();
    return new CompanyEmployeeAppointment(
      data.id,
      data.clientId,
      data.companyId,
      data.employeeId,
      data.serviceId,
      data.scheduledDate,
      data.scheduledTime,
      data.status || AppointmentStatus.PENDING,
      data.location,
      data.clientNotes || null,
      data.employeeNotes || null,
      data.createdAt || now,
      data.updatedAt || now
    );
  }

  /**
   * Factory method para reconstruir a partir de dados de persistência
   */
  static fromPersistence(
    data: CompanyEmployeeAppointmentPersistenceData
  ): CompanyEmployeeAppointment {
    return new CompanyEmployeeAppointment(
      data.id,
      data.clientId,
      data.companyId,
      data.employeeId,
      data.serviceId,
      data.scheduledDate,
      data.scheduledTime,
      data.status,
      data.location,
      data.clientNotes,
      data.employeeNotes,
      data.createdAt,
      data.updatedAt
    );
  }

  /**
   * Aceita o agendamento
   */
  accept(employeeNotes?: string): CompanyEmployeeAppointment {
    if (this._status !== AppointmentStatus.PENDING) {
      throw new BadRequestError(
        "Apenas agendamentos pendentes podem ser aceitos"
      );
    }

    return new CompanyEmployeeAppointment(
      this._id,
      this._clientId,
      this._companyId,
      this._employeeId,
      this._serviceId,
      this._scheduledDate,
      this._scheduledTime,
      AppointmentStatus.ACCEPTED,
      this._location,
      this._clientNotes,
      employeeNotes || this._employeeNotes,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Rejeita o agendamento
   */
  reject(employeeNotes?: string): CompanyEmployeeAppointment {
    if (this._status !== AppointmentStatus.PENDING) {
      throw new BadRequestError(
        "Apenas agendamentos pendentes podem ser rejeitados"
      );
    }

    return new CompanyEmployeeAppointment(
      this._id,
      this._clientId,
      this._companyId,
      this._employeeId,
      this._serviceId,
      this._scheduledDate,
      this._scheduledTime,
      AppointmentStatus.REJECTED,
      this._location,
      this._clientNotes,
      employeeNotes || this._employeeNotes,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Completa o agendamento
   */
  complete(): CompanyEmployeeAppointment {
    if (this._status !== AppointmentStatus.ACCEPTED) {
      throw new BadRequestError(
        "Apenas agendamentos aceitos podem ser completados"
      );
    }

    return new CompanyEmployeeAppointment(
      this._id,
      this._clientId,
      this._companyId,
      this._employeeId,
      this._serviceId,
      this._scheduledDate,
      this._scheduledTime,
      AppointmentStatus.COMPLETED,
      this._location,
      this._clientNotes,
      this._employeeNotes,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Cancela o agendamento
   */
  cancel(): CompanyEmployeeAppointment {
    if (this._status === AppointmentStatus.COMPLETED) {
      throw new BadRequestError(
        "Agendamentos completados não podem ser cancelados"
      );
    }

    return new CompanyEmployeeAppointment(
      this._id,
      this._clientId,
      this._companyId,
      this._employeeId,
      this._serviceId,
      this._scheduledDate,
      this._scheduledTime,
      AppointmentStatus.CANCELLED,
      this._location,
      this._clientNotes,
      this._employeeNotes,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Atualiza notas do cliente
   */
  updateClientNotes(notes: string): CompanyEmployeeAppointment {
    return new CompanyEmployeeAppointment(
      this._id,
      this._clientId,
      this._companyId,
      this._employeeId,
      this._serviceId,
      this._scheduledDate,
      this._scheduledTime,
      this._status,
      this._location,
      notes,
      this._employeeNotes,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Atualiza notas do funcionário
   */
  updateEmployeeNotes(notes: string): CompanyEmployeeAppointment {
    return new CompanyEmployeeAppointment(
      this._id,
      this._clientId,
      this._companyId,
      this._employeeId,
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
      companyId: this._companyId,
      employeeId: this._employeeId,
      serviceId: this._serviceId,
      scheduledDate: this._scheduledDate.toISOString(),
      scheduledTime: this._scheduledTime,
      status: this._status,
      location: this._location,
      clientNotes: this._clientNotes,
      employeeNotes: this._employeeNotes,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }

  /**
   * Valida dados do agendamento
   */
  private static validateCompanyEmployeeAppointmentData(
    data: CreateCompanyEmployeeAppointmentData
  ): void {
    if (!data.id) {
      throw new BadRequestError("ID é obrigatório");
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
export interface CreateCompanyEmployeeAppointmentData {
  id: string;
  clientId: string;
  companyId: string;
  employeeId: string;
  serviceId: string;
  scheduledDate: Date;
  scheduledTime: string;
  status?: AppointmentStatus;
  location: string;
  clientNotes?: string;
  employeeNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para dados de persistência
 */
export interface CompanyEmployeeAppointmentPersistenceData {
  id: string;
  clientId: string;
  companyId: string;
  employeeId: string;
  serviceId: string;
  scheduledDate: Date;
  scheduledTime: string;
  status: AppointmentStatus;
  location: string;
  clientNotes: string | null;
  employeeNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
