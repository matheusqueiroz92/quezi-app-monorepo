/**
 * Entidade ProfessionalProfile - Camada de Domínio
 *
 * Encapsula a lógica de negócio para perfis de profissionais
 * Seguindo os princípios SOLID e Clean Architecture
 */

import {
  IProfessionalProfile,
  WorkingHours,
  Certification,
} from "../interfaces/user.interface";
import { BadRequestError } from "../../utils/app-error";

export class ProfessionalProfile implements IProfessionalProfile {
  // ========================================
  // PROPRIEDADES
  // ========================================

  public readonly userId: string;
  public readonly cpf: string | null;
  public readonly cnpj: string | null;
  public readonly address: string;
  public readonly city: string;
  public readonly serviceMode: string;
  public readonly specialties: string[];
  public readonly workingHours: WorkingHours;
  public readonly certifications: Certification[];
  public readonly portfolio: string[];
  public readonly averageRating: number;
  public readonly totalRatings: number;
  public readonly isActive: boolean;
  public readonly isVerified: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  // ========================================
  // CONSTRUTOR PRIVADO
  // ========================================

  private constructor(
    userId: string,
    cpf: string | null,
    cnpj: string | null,
    address: string,
    city: string,
    serviceMode: string,
    specialties: string[],
    workingHours: WorkingHours,
    certifications: Certification[],
    portfolio: string[],
    averageRating: number,
    totalRatings: number,
    isActive: boolean,
    isVerified: boolean,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.userId = userId;
    this.cpf = cpf;
    this.cnpj = cnpj;
    this.address = address;
    this.city = city;
    this.serviceMode = serviceMode;
    this.specialties = specialties;
    this.workingHours = workingHours;
    this.certifications = certifications;
    this.portfolio = portfolio;
    this.averageRating = averageRating;
    this.totalRatings = totalRatings;
    this.isActive = isActive;
    this.isVerified = isVerified;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // ========================================
  // MÉTODOS DE FÁBRICA
  // ========================================

  static create(data: CreateProfessionalProfileData): ProfessionalProfile {
    this.validateProfessionalProfileData(data);

    return new ProfessionalProfile(
      data.userId,
      data.cpf || null,
      data.cnpj || null,
      data.address,
      data.city,
      data.serviceMode,
      data.specialties || [],
      data.workingHours || {},
      data.certifications || [],
      data.portfolio || [],
      0, // averageRating
      0, // totalRatings
      data.isActive !== undefined ? data.isActive : true,
      data.isVerified !== undefined ? data.isVerified : false,
      data.createdAt || new Date(),
      data.updatedAt || new Date()
    );
  }

  static fromPersistence(
    data: ProfessionalProfilePersistenceData
  ): ProfessionalProfile {
    return new ProfessionalProfile(
      data.userId,
      data.cpf,
      data.cnpj,
      data.address,
      data.city,
      data.serviceMode,
      data.specialties,
      data.workingHours,
      data.certifications,
      data.portfolio,
      data.averageRating,
      data.totalRatings,
      data.isActive,
      data.isVerified,
      data.createdAt,
      data.updatedAt
    );
  }

  // ========================================
  // MÉTODOS DE DOMÍNIO
  // ========================================

  addSpecialty(specialty: string): ProfessionalProfile {
    if (!specialty || specialty.trim().length === 0) {
      throw new BadRequestError("Especialidade não pode ser vazia");
    }

    if (this.specialties.includes(specialty)) {
      throw new BadRequestError("Especialidade já existe");
    }

    return new ProfessionalProfile(
      this.userId,
      this.cpf,
      this.cnpj,
      this.address,
      this.city,
      this.serviceMode,
      [...this.specialties, specialty],
      this.workingHours,
      this.certifications,
      this.portfolio,
      this.averageRating,
      this.totalRatings,
      this.isActive,
      this.isVerified,
      this.createdAt,
      new Date()
    );
  }

  removeSpecialty(specialty: string): ProfessionalProfile {
    if (!this.specialties.includes(specialty)) {
      throw new BadRequestError("Especialidade não encontrada");
    }

    return new ProfessionalProfile(
      this.userId,
      this.cpf,
      this.cnpj,
      this.address,
      this.city,
      this.serviceMode,
      this.specialties.filter((s) => s !== specialty),
      this.workingHours,
      this.certifications,
      this.portfolio,
      this.averageRating,
      this.totalRatings,
      this.isActive,
      this.isVerified,
      this.createdAt,
      new Date()
    );
  }

  addCertification(certification: Certification): ProfessionalProfile {
    this.validateCertification(certification);

    if (this.certifications.some((cert) => cert.id === certification.id)) {
      throw new BadRequestError("Certificação já existe");
    }

    return new ProfessionalProfile(
      this.userId,
      this.cpf,
      this.cnpj,
      this.address,
      this.city,
      this.serviceMode,
      this.specialties,
      this.workingHours,
      [...this.certifications, certification],
      this.portfolio,
      this.averageRating,
      this.totalRatings,
      this.isActive,
      this.isVerified,
      this.createdAt,
      new Date()
    );
  }

  removeCertification(certificationId: string): ProfessionalProfile {
    if (!this.certifications.some((cert) => cert.id === certificationId)) {
      throw new BadRequestError("Certificação não encontrada");
    }

    return new ProfessionalProfile(
      this.userId,
      this.cpf,
      this.cnpj,
      this.address,
      this.city,
      this.serviceMode,
      this.specialties,
      this.workingHours,
      this.certifications.filter((cert) => cert.id !== certificationId),
      this.portfolio,
      this.averageRating,
      this.totalRatings,
      this.isActive,
      this.isVerified,
      this.createdAt,
      new Date()
    );
  }

  updateCertification(
    certificationId: string,
    certification: Certification
  ): ProfessionalProfile {
    this.validateCertification(certification);

    if (!this.certifications.some((cert) => cert.id === certificationId)) {
      throw new BadRequestError("Certificação não encontrada");
    }

    const updatedCertifications = this.certifications.map((cert) =>
      cert.id === certificationId ? certification : cert
    );

    return new ProfessionalProfile(
      this.userId,
      this.cpf,
      this.cnpj,
      this.address,
      this.city,
      this.serviceMode,
      this.specialties,
      this.workingHours,
      updatedCertifications,
      this.portfolio,
      this.averageRating,
      this.totalRatings,
      this.isActive,
      this.isVerified,
      this.createdAt,
      new Date()
    );
  }

  addPortfolioItem(portfolioItem: string): ProfessionalProfile {
    if (!portfolioItem || portfolioItem.trim().length === 0) {
      throw new BadRequestError("Item do portfólio não pode ser vazio");
    }

    if (this.portfolio.includes(portfolioItem)) {
      throw new BadRequestError("Item já existe no portfólio");
    }

    return new ProfessionalProfile(
      this.userId,
      this.cpf,
      this.cnpj,
      this.address,
      this.city,
      this.serviceMode,
      this.specialties,
      this.workingHours,
      this.certifications,
      [...this.portfolio, portfolioItem],
      this.averageRating,
      this.totalRatings,
      this.isActive,
      this.isVerified,
      this.createdAt,
      new Date()
    );
  }

  removePortfolioItem(portfolioItem: string): ProfessionalProfile {
    if (!this.portfolio.includes(portfolioItem)) {
      throw new BadRequestError("Item não encontrado no portfólio");
    }

    return new ProfessionalProfile(
      this.userId,
      this.cpf,
      this.cnpj,
      this.address,
      this.city,
      this.serviceMode,
      this.specialties,
      this.workingHours,
      this.certifications,
      this.portfolio.filter((item) => item !== portfolioItem),
      this.averageRating,
      this.totalRatings,
      this.isActive,
      this.isVerified,
      this.createdAt,
      new Date()
    );
  }

  updateWorkingHours(workingHours: WorkingHours): ProfessionalProfile {
    this.validateWorkingHours(workingHours);

    return new ProfessionalProfile(
      this.userId,
      this.cpf,
      this.cnpj,
      this.address,
      this.city,
      this.serviceMode,
      this.specialties,
      workingHours,
      this.certifications,
      this.portfolio,
      this.averageRating,
      this.totalRatings,
      this.isActive,
      this.isVerified,
      this.createdAt,
      new Date()
    );
  }

  // ========================================
  // MÉTODOS DE VALIDAÇÃO PRIVADOS
  // ========================================

  private static validateProfessionalProfileData(
    data: CreateProfessionalProfileData
  ): void {
    if (!data.userId) {
      throw new BadRequestError("ID do usuário é obrigatório");
    }

    if (!data.address || data.address.trim().length === 0) {
      throw new BadRequestError("Endereço é obrigatório");
    }

    if (!data.city || data.city.trim().length === 0) {
      throw new BadRequestError("Cidade é obrigatória");
    }

    if (
      !data.serviceMode ||
      !["AT_LOCATION", "AT_DOMICILE", "BOTH"].includes(data.serviceMode)
    ) {
      throw new BadRequestError("Modo de serviço inválido");
    }

    if (data.cpf && !this.isValidCPF(data.cpf)) {
      throw new BadRequestError("CPF inválido");
    }

    if (data.cnpj && !this.isValidCNPJ(data.cnpj)) {
      throw new BadRequestError("CNPJ inválido");
    }
  }

  private static isValidCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, "");
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

    return true;
  }

  private static isValidCNPJ(cnpj: string): boolean {
    const cleanCNPJ = cnpj.replace(/\D/g, "");
    if (cleanCNPJ.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cleanCNPJ.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let remainder = sum % 11;
    const firstDigit = remainder < 2 ? 0 : 11 - remainder;
    if (firstDigit !== parseInt(cleanCNPJ.charAt(12))) return false;

    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cleanCNPJ.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    remainder = sum % 11;
    const secondDigit = remainder < 2 ? 0 : 11 - remainder;
    if (secondDigit !== parseInt(cleanCNPJ.charAt(13))) return false;

    return true;
  }

  private validateCertification(certification: Certification): void {
    if (!certification.id || certification.id.trim().length === 0) {
      throw new BadRequestError("ID da certificação é obrigatório");
    }

    if (!certification.name || certification.name.trim().length === 0) {
      throw new BadRequestError("Nome da certificação é obrigatório");
    }

    if (
      !certification.institution ||
      certification.institution.trim().length === 0
    ) {
      throw new BadRequestError("Instituição da certificação é obrigatória");
    }

    if (!certification.date || certification.date > new Date()) {
      throw new BadRequestError(
        "Data da certificação deve ser válida e não pode ser futura"
      );
    }
  }

  private validateWorkingHours(workingHours: WorkingHours): void {
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
      const dayHours = workingHours[day as keyof WorkingHours];
      if (dayHours && dayHours.isAvailable) {
        if (!dayHours.start || !dayHours.end) {
          throw new BadRequestError(`Horário de ${day} deve ter início e fim`);
        }

        const startTime = new Date(`2000-01-01T${dayHours.start}`);
        const endTime = new Date(`2000-01-01T${dayHours.end}`);

        if (startTime >= endTime) {
          throw new BadRequestError(
            `Horário de ${day}: início deve ser anterior ao fim`
          );
        }
      }
    }
  }
}

// ========================================
// INTERFACES E TIPOS
// ========================================

export interface CreateProfessionalProfileData {
  userId: string;
  cpf?: string;
  cnpj?: string;
  address: string;
  city: string;
  serviceMode: string;
  specialties?: string[];
  workingHours?: WorkingHours;
  certifications?: Certification[];
  portfolio?: string[];
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProfessionalProfilePersistenceData {
  userId: string;
  cpf: string | null;
  cnpj: string | null;
  address: string;
  city: string;
  serviceMode: string;
  specialties: string[];
  workingHours: WorkingHours;
  certifications: Certification[];
  portfolio: string[];
  averageRating: number;
  totalRatings: number;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
