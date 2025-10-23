/**
 * Serviço de Perfil de Empresa - Camada de Aplicação
 *
 * Seguindo os princípios SOLID:
 * - S: Single Responsibility Principle
 * - D: Dependency Inversion Principle
 *
 * Implementa ICompanyProfileService usando repositórios
 */

import {
  ICompanyProfileService,
  CreateCompanyProfileData,
  UpdateCompanyProfileData,
  CompanyProfileFilters,
  PaginatedResult,
  ValidationResult,
} from "../../domain/interfaces/repository.interface";
import {
  ICompanyProfile,
  BusinessHours,
} from "../../domain/interfaces/user.interface";
import { ICompanyProfileRepository } from "../../domain/interfaces/repository.interface";
import { NotFoundError, BadRequestError } from "../../utils/app-error";

export class CompanyProfileService implements ICompanyProfileService {
  constructor(private companyProfileRepository: ICompanyProfileRepository) {}

  // ========================================
  // MÉTODOS BÁSICOS
  // ========================================

  async createProfile(
    data: CreateCompanyProfileData
  ): Promise<ICompanyProfile> {
    // Validar dados antes de criar
    const validation = await this.validateProfileCreation(data);
    if (!validation.isValid) {
      throw new BadRequestError(
        `Dados inválidos: ${validation.errors.join(", ")}`
      );
    }

    // Verificar se CNPJ já existe
    const existingProfile = await this.companyProfileRepository.findByCNPJ(
      data.cnpj
    );
    if (existingProfile) {
      throw new BadRequestError("CNPJ já está em uso");
    }

    return await this.companyProfileRepository.create(data);
  }

  async getProfileById(id: string): Promise<ICompanyProfile> {
    const profile = await this.companyProfileRepository.findById(id);
    if (!profile) {
      throw new NotFoundError("Perfil de empresa não encontrado");
    }
    return profile;
  }

  async updateProfile(
    id: string,
    data: UpdateCompanyProfileData
  ): Promise<ICompanyProfile> {
    // Verificar se perfil existe
    const existingProfile = await this.companyProfileRepository.findById(id);
    if (!existingProfile) {
      throw new NotFoundError("Perfil de empresa não encontrado");
    }

    return await this.companyProfileRepository.update(id, data);
  }

  async deleteProfile(id: string): Promise<void> {
    // Verificar se perfil existe
    const existingProfile = await this.companyProfileRepository.findById(id);
    if (!existingProfile) {
      throw new NotFoundError("Perfil de empresa não encontrado");
    }

    await this.companyProfileRepository.delete(id);
  }

  // ========================================
  // MÉTODOS DE FOTOS
  // ========================================

  async addPhoto(
    profileId: string,
    photoUrl: string
  ): Promise<ICompanyProfile> {
    // Verificar se perfil existe
    const profile = await this.companyProfileRepository.findById(profileId);
    if (!profile) {
      throw new NotFoundError("Perfil de empresa não encontrado");
    }

    // Validar URL da foto
    if (!photoUrl || photoUrl.trim().length === 0) {
      throw new BadRequestError("URL da foto não pode ser vazia");
    }

    if (!this.isValidUrl(photoUrl)) {
      throw new BadRequestError("URL da foto inválida");
    }

    return await this.companyProfileRepository.addPhoto(profileId, photoUrl);
  }

  async removePhoto(
    profileId: string,
    photoUrl: string
  ): Promise<ICompanyProfile> {
    // Verificar se perfil existe
    const profile = await this.companyProfileRepository.findById(profileId);
    if (!profile) {
      throw new NotFoundError("Perfil de empresa não encontrado");
    }

    // Verificar se foto existe
    if (!profile.photos.includes(photoUrl)) {
      throw new NotFoundError("Foto não encontrada");
    }

    return await this.companyProfileRepository.removePhoto(profileId, photoUrl);
  }

  // ========================================
  // MÉTODOS DE HORÁRIOS DE FUNCIONAMENTO
  // ========================================

  async updateBusinessHours(
    profileId: string,
    businessHours: BusinessHours
  ): Promise<ICompanyProfile> {
    // Verificar se perfil existe
    const profile = await this.companyProfileRepository.findById(profileId);
    if (!profile) {
      throw new NotFoundError("Perfil de empresa não encontrado");
    }

    // Validar horários de funcionamento
    const validation = this.validateBusinessHours(businessHours);
    if (!validation.isValid) {
      throw new BadRequestError(
        `Horários de funcionamento inválidos: ${validation.errors.join(", ")}`
      );
    }

    return await this.companyProfileRepository.updateBusinessHours(
      profileId,
      businessHours
    );
  }

  // ========================================
  // MÉTODOS DE FUNCIONÁRIOS
  // ========================================

  async getEmployees(profileId: string): Promise<any[]> {
    // Verificar se perfil existe
    const profile = await this.companyProfileRepository.findById(profileId);
    if (!profile) {
      throw new NotFoundError("Perfil de empresa não encontrado");
    }

    return await this.companyProfileRepository.getEmployees(profileId);
  }

  async addEmployee(profileId: string, employeeData: any): Promise<any> {
    // Verificar se perfil existe
    const profile = await this.companyProfileRepository.findById(profileId);
    if (!profile) {
      throw new NotFoundError("Perfil de empresa não encontrado");
    }

    // Validar dados do funcionário
    const validation = this.validateEmployeeData(employeeData);
    if (!validation.isValid) {
      throw new BadRequestError(
        `Dados do funcionário inválidos: ${validation.errors.join(", ")}`
      );
    }

    return await this.companyProfileRepository.addEmployee(
      profileId,
      employeeData
    );
  }

  async removeEmployee(profileId: string, employeeId: string): Promise<void> {
    // Verificar se perfil existe
    const profile = await this.companyProfileRepository.findById(profileId);
    if (!profile) {
      throw new NotFoundError("Perfil de empresa não encontrado");
    }

    // Verificar se funcionário existe
    const employees = await this.companyProfileRepository.getEmployees(
      profileId
    );
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee) {
      throw new NotFoundError("Funcionário não encontrado");
    }

    await this.companyProfileRepository.removeEmployee(profileId, employeeId);
  }

  // ========================================
  // MÉTODOS DE BUSCA
  // ========================================

  async searchProfiles(
    filters: CompanyProfileFilters
  ): Promise<PaginatedResult<ICompanyProfile>> {
    return await this.companyProfileRepository.findMany(filters);
  }

  async getProfileByCNPJ(cnpj: string): Promise<ICompanyProfile> {
    const profile = await this.companyProfileRepository.findByCNPJ(cnpj);
    if (!profile) {
      throw new NotFoundError("Perfil de empresa não encontrado");
    }
    return profile;
  }

  // ========================================
  // MÉTODOS DE VALIDAÇÃO
  // ========================================

  async validateProfileCreation(
    data: CreateCompanyProfileData
  ): Promise<ValidationResult> {
    const errors: string[] = [];

    // Validar CNPJ
    if (!data.cnpj) {
      errors.push("CNPJ é obrigatório");
    } else if (!this.isValidCNPJ(data.cnpj)) {
      errors.push("CNPJ inválido");
    }

    // Validar endereço
    if (!data.address) {
      errors.push("Endereço é obrigatório");
    }

    // Validar cidade
    if (!data.city) {
      errors.push("Cidade é obrigatória");
    }

    // Validar horários de funcionamento se fornecidos
    if (data.businessHours) {
      const validation = this.validateBusinessHours(data.businessHours);
      if (!validation.isValid) {
        errors.push(...validation.errors);
      }
    }

    // Validar fotos se fornecidas
    if (data.photos && data.photos.length > 0) {
      for (const photo of data.photos) {
        if (!this.isValidUrl(photo)) {
          errors.push(`URL da foto inválida: ${photo}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private validateBusinessHours(
    businessHours: BusinessHours
  ): ValidationResult {
    const errors: string[] = [];
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
      if (dayHours) {
        if (dayHours.isOpen && (!dayHours.start || !dayHours.end)) {
          errors.push(`Horários de ${day} são obrigatórios quando aberto`);
        }
        if (dayHours.start && dayHours.end && dayHours.start >= dayHours.end) {
          errors.push(
            `Horário de início deve ser menor que o de fim em ${day}`
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private validateEmployeeData(employeeData: any): ValidationResult {
    const errors: string[] = [];

    if (!employeeData.name) {
      errors.push("Nome do funcionário é obrigatório");
    }
    if (!employeeData.position) {
      errors.push("Cargo do funcionário é obrigatório");
    }

    // Validar email se fornecido
    if (employeeData.email && !this.isValidEmail(employeeData.email)) {
      errors.push("Email do funcionário inválido");
    }

    // Validar telefone se fornecido
    if (employeeData.phone && !this.isValidPhone(employeeData.phone)) {
      errors.push("Telefone do funcionário inválido");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // ========================================
  // MÉTODOS AUXILIARES
  // ========================================

  private isValidCNPJ(cnpj: string): boolean {
    const cleanCNPJ = cnpj.replace(/\D/g, "");

    if (cleanCNPJ.length !== 14) {
      return false;
    }

    if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
      return false;
    }

    // Validação do CNPJ
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

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
  }
}
