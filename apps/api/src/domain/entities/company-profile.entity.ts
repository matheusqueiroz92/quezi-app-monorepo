/**
 * Entidade CompanyProfile - Camada de Domínio
 *
 * Encapsula a lógica de negócio para perfis de empresas
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { ICompanyProfile, BusinessHours } from "../interfaces/user.interface";
import { BadRequestError } from "../../utils/app-error";

export class CompanyProfile implements ICompanyProfile {
  // ========================================
  // PROPRIEDADES
  // ========================================

  public readonly userId: string;
  public readonly cnpj: string;
  public readonly address: string;
  public readonly city: string;
  public readonly businessHours: BusinessHours;
  public readonly description: string | null;
  public readonly photos: string[];
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
    cnpj: string,
    address: string,
    city: string,
    businessHours: BusinessHours,
    description: string | null,
    photos: string[],
    averageRating: number,
    totalRatings: number,
    isActive: boolean,
    isVerified: boolean,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.userId = userId;
    this.cnpj = cnpj;
    this.address = address;
    this.city = city;
    this.businessHours = businessHours;
    this.description = description;
    this.photos = photos;
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

  static create(data: CreateCompanyProfileData): CompanyProfile {
    this.validateCompanyProfileData(data);

    return new CompanyProfile(
      data.userId,
      data.cnpj,
      data.address,
      data.city,
      data.businessHours || {},
      data.description || null,
      data.photos || [],
      0, // averageRating
      0, // totalRatings
      data.isActive !== undefined ? data.isActive : true,
      data.isVerified !== undefined ? data.isVerified : false,
      data.createdAt || new Date(),
      data.updatedAt || new Date()
    );
  }

  static fromPersistence(data: CompanyProfilePersistenceData): CompanyProfile {
    return new CompanyProfile(
      data.userId,
      data.cnpj,
      data.address,
      data.city,
      data.businessHours,
      data.description,
      data.photos,
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

  addPhoto(photoUrl: string): CompanyProfile {
    if (!photoUrl || photoUrl.trim().length === 0) {
      throw new BadRequestError("URL da foto não pode ser vazia");
    }

    if (!this.isValidUrl(photoUrl)) {
      throw new BadRequestError("URL da foto deve ser válida");
    }

    if (this.photos.includes(photoUrl)) {
      throw new BadRequestError("Foto já existe no portfólio");
    }

    return new CompanyProfile(
      this.userId,
      this.cnpj,
      this.address,
      this.city,
      this.businessHours,
      this.description,
      [...this.photos, photoUrl],
      this.averageRating,
      this.totalRatings,
      this.isActive,
      this.isVerified,
      this.createdAt,
      new Date()
    );
  }

  removePhoto(photoUrl: string): CompanyProfile {
    if (!this.photos.includes(photoUrl)) {
      throw new BadRequestError("Foto não encontrada no portfólio");
    }

    return new CompanyProfile(
      this.userId,
      this.cnpj,
      this.address,
      this.city,
      this.businessHours,
      this.description,
      this.photos.filter((photo) => photo !== photoUrl),
      this.averageRating,
      this.totalRatings,
      this.isActive,
      this.isVerified,
      this.createdAt,
      new Date()
    );
  }

  updateBusinessHours(businessHours: BusinessHours): CompanyProfile {
    this.validateBusinessHours(businessHours);

    return new CompanyProfile(
      this.userId,
      this.cnpj,
      this.address,
      this.city,
      businessHours,
      this.description,
      this.photos,
      this.averageRating,
      this.totalRatings,
      this.isActive,
      this.isVerified,
      this.createdAt,
      new Date()
    );
  }

  addEmployee(employeeData: any): CompanyProfile {
    // Este método seria implementado se necessário
    // Por enquanto, retorna a instância atual
    return this;
  }

  removeEmployee(employeeId: string): CompanyProfile {
    // Este método seria implementado se necessário
    // Por enquanto, retorna a instância atual
    return this;
  }

  getEmployees(): any[] {
    // Este método seria implementado se necessário
    // Por enquanto, retorna array vazio
    return [];
  }

  // ========================================
  // MÉTODOS DE VALIDAÇÃO PRIVADOS
  // ========================================

  private static validateCompanyProfileData(
    data: CreateCompanyProfileData
  ): void {
    if (!data.userId) {
      throw new BadRequestError("ID do usuário é obrigatório");
    }

    if (!data.cnpj || data.cnpj.trim().length === 0) {
      throw new BadRequestError("CNPJ é obrigatório");
    }

    if (!this.isValidCNPJ(data.cnpj)) {
      throw new BadRequestError("CNPJ inválido");
    }

    if (!data.address || data.address.trim().length === 0) {
      throw new BadRequestError("Endereço é obrigatório");
    }

    if (!data.city || data.city.trim().length === 0) {
      throw new BadRequestError("Cidade é obrigatória");
    }
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

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private validateBusinessHours(businessHours: BusinessHours): void {
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
      const dayHours = businessHours[day as keyof BusinessHours];
      if (dayHours && dayHours.isOpen) {
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

export interface CreateCompanyProfileData {
  userId: string;
  cnpj: string;
  address: string;
  city: string;
  businessHours?: BusinessHours;
  description?: string;
  photos?: string[];
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CompanyProfilePersistenceData {
  userId: string;
  cnpj: string;
  address: string;
  city: string;
  businessHours: BusinessHours;
  description: string | null;
  photos: string[];
  averageRating: number;
  totalRatings: number;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
