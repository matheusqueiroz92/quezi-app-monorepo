/**
 * Entidade CompanyEmployee - Camada de Domínio
 *
 * Representa um funcionário de uma empresa (não é um usuário completo)
 * Seguindo os princípios DDD e Clean Architecture
 */

import { ICompanyEmployee } from "../interfaces/user.interface";
import { BadRequestError } from "../../utils/app-error";

/**
 * Entidade CompanyEmployee
 *
 * Representa um funcionário vinculado a uma empresa
 * Não possui conta de usuário própria
 */
export class CompanyEmployee implements ICompanyEmployee {
  private constructor(
    private readonly _id: string,
    private readonly _companyId: string,
    private readonly _name: string,
    private readonly _email: string | null,
    private readonly _phone: string | null,
    private readonly _position: string,
    private readonly _specialties: string[],
    private readonly _isActive: boolean,
    private readonly _workingHours: any | null,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date
  ) {}

  // Getters
  get id(): string {
    return this._id;
  }
  get companyId(): string {
    return this._companyId;
  }
  get name(): string {
    return this._name;
  }
  get email(): string | null {
    return this._email;
  }
  get phone(): string | null {
    return this._phone;
  }
  get position(): string {
    return this._position;
  }
  get specialties(): string[] {
    return [...this._specialties];
  }
  get isActive(): boolean {
    return this._isActive;
  }
  get workingHours(): any | null {
    return this._workingHours;
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
  static create(data: CreateCompanyEmployeeData): CompanyEmployee {
    this.validateCompanyEmployeeData(data);

    const now = new Date();
    return new CompanyEmployee(
      data.id,
      data.companyId,
      data.name,
      data.email || null,
      data.phone || null,
      data.position,
      data.specialties || [],
      data.isActive !== undefined ? data.isActive : true,
      data.workingHours || null,
      data.createdAt || now,
      data.updatedAt || now
    );
  }

  /**
   * Factory method para reconstruir a partir de dados de persistência
   */
  static fromPersistence(
    data: CompanyEmployeePersistenceData
  ): CompanyEmployee {
    return new CompanyEmployee(
      data.id,
      data.companyId,
      data.name,
      data.email,
      data.phone,
      data.position,
      data.specialties,
      data.isActive,
      data.workingHours,
      data.createdAt,
      data.updatedAt
    );
  }

  /**
   * Adiciona uma especialidade
   */
  addSpecialty(specialty: string): CompanyEmployee {
    if (!specialty || specialty.trim().length === 0) {
      throw new BadRequestError("Especialidade não pode ser vazia");
    }

    if (this._specialties.includes(specialty)) {
      throw new BadRequestError("Especialidade já existe");
    }

    const newSpecialties = [...this._specialties, specialty];
    return new CompanyEmployee(
      this._id,
      this._companyId,
      this._name,
      this._email,
      this._phone,
      this._position,
      newSpecialties,
      this._isActive,
      this._workingHours,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Remove uma especialidade
   */
  removeSpecialty(specialty: string): CompanyEmployee {
    if (!this._specialties.includes(specialty)) {
      throw new BadRequestError("Especialidade não encontrada");
    }

    const newSpecialties = this._specialties.filter((s) => s !== specialty);
    return new CompanyEmployee(
      this._id,
      this._companyId,
      this._name,
      this._email,
      this._phone,
      this._position,
      newSpecialties,
      this._isActive,
      this._workingHours,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Atualiza horários de trabalho
   */
  updateWorkingHours(workingHours: any): CompanyEmployee {
    this.validateWorkingHours(workingHours);

    return new CompanyEmployee(
      this._id,
      this._companyId,
      this._name,
      this._email,
      this._phone,
      this._position,
      this._specialties,
      this._isActive,
      workingHours,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Ativa o funcionário
   */
  activate(): CompanyEmployee {
    return new CompanyEmployee(
      this._id,
      this._companyId,
      this._name,
      this._email,
      this._phone,
      this._position,
      this._specialties,
      true,
      this._workingHours,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Desativa o funcionário
   */
  deactivate(): CompanyEmployee {
    return new CompanyEmployee(
      this._id,
      this._companyId,
      this._name,
      this._email,
      this._phone,
      this._position,
      this._specialties,
      false,
      this._workingHours,
      this._createdAt,
      new Date()
    );
  }

  /**
   * Converte para JSON
   */
  toJSON(): any {
    return {
      id: this._id,
      companyId: this._companyId,
      name: this._name,
      email: this._email,
      phone: this._phone,
      position: this._position,
      specialties: this._specialties,
      isActive: this._isActive,
      workingHours: this._workingHours,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }

  /**
   * Valida dados de criação
   */
  private static validateCompanyEmployeeData(
    data: CreateCompanyEmployeeData
  ): void {
    if (!data.id) {
      throw new BadRequestError("ID é obrigatório");
    }

    if (!data.companyId) {
      throw new BadRequestError("ID da empresa é obrigatório");
    }

    if (!data.name || data.name.trim().length < 2) {
      throw new BadRequestError("Nome deve ter pelo menos 2 caracteres");
    }

    if (data.email && !this.isValidEmail(data.email)) {
      throw new BadRequestError("Email inválido");
    }

    if (data.phone && !this.isValidPhone(data.phone)) {
      throw new BadRequestError("Telefone inválido");
    }

    if (!data.position || data.position.trim().length < 2) {
      throw new BadRequestError("Cargo deve ter pelo menos 2 caracteres");
    }

    if (data.workingHours) {
      this.validateWorkingHours(data.workingHours);
    }
  }

  /**
   * Valida horários de trabalho
   */
  private static validateWorkingHours(workingHours: any): void {
    if (!workingHours || typeof workingHours !== "object") {
      throw new BadRequestError("Horários de trabalho devem ser um objeto");
    }

    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    for (const day of days) {
      if (workingHours[day]) {
        const dayHours = workingHours[day];
        if (typeof dayHours.isAvailable !== "boolean") {
          throw new BadRequestError(`isAvailable deve ser boolean para ${day}`);
        }

        if (dayHours.isAvailable) {
          if (!dayHours.start || !dayHours.end) {
            throw new BadRequestError(
              `start e end são obrigatórios para ${day}`
            );
          }

          if (
            !/^\d{2}:\d{2}$/.test(dayHours.start) ||
            !/^\d{2}:\d{2}$/.test(dayHours.end)
          ) {
            throw new BadRequestError(
              `Formato de horário inválido para ${day}`
            );
          }
        }
      }
    }
  }

  /**
   * Valida email
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida telefone
   */
  private static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
  }
}

/**
 * Interface para dados de criação
 */
export interface CreateCompanyEmployeeData {
  id: string;
  companyId: string;
  name: string;
  email?: string;
  phone?: string;
  position: string;
  specialties?: string[];
  isActive?: boolean;
  workingHours?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para dados de persistência
 */
export interface CompanyEmployeePersistenceData {
  id: string;
  companyId: string;
  name: string;
  email: string | null;
  phone: string | null;
  position: string;
  specialties: string[];
  isActive: boolean;
  workingHours: any | null;
  createdAt: Date;
  updatedAt: Date;
}
