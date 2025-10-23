/**
 * Serviço de Perfil de Profissional - Camada de Aplicação
 *
 * Seguindo os princípios SOLID:
 * - S: Single Responsibility Principle
 * - D: Dependency Inversion Principle
 *
 * Implementa IProfessionalProfileService usando repositórios
 */

import {
  IProfessionalProfileService,
  CreateProfessionalProfileData,
  UpdateProfessionalProfileData,
  ProfessionalProfileFilters,
  PaginatedResult,
  ValidationResult,
} from "../../domain/interfaces/repository.interface";
import {
  IProfessionalProfile,
  WorkingHours,
  Certification,
} from "../../domain/interfaces/user.interface";
import { IProfessionalProfileRepository } from "../../domain/interfaces/repository.interface";
import { NotFoundError, BadRequestError } from "../../utils/app-error";

export class ProfessionalProfileService implements IProfessionalProfileService {
  constructor(
    private professionalProfileRepository: IProfessionalProfileRepository
  ) {}

  // ========================================
  // MÉTODOS BÁSICOS
  // ========================================

  async createProfile(
    data: CreateProfessionalProfileData
  ): Promise<IProfessionalProfile> {
    // Validar dados antes de criar
    const validation = await this.validateProfileCreation(data);
    if (!validation.isValid) {
      throw new BadRequestError(
        `Dados inválidos: ${validation.errors.join(", ")}`
      );
    }

    // Verificar se CPF já existe (se fornecido)
    if (data.cpf) {
      const existingProfile =
        await this.professionalProfileRepository.findByCPF(data.cpf);
      if (existingProfile) {
        throw new BadRequestError("CPF já está em uso");
      }
    }

    // Verificar se CNPJ já existe (se fornecido)
    if (data.cnpj) {
      const existingProfile =
        await this.professionalProfileRepository.findByCNPJ(data.cnpj);
      if (existingProfile) {
        throw new BadRequestError("CNPJ já está em uso");
      }
    }

    return await this.professionalProfileRepository.create(data);
  }

  async getProfileById(id: string): Promise<IProfessionalProfile> {
    const profile = await this.professionalProfileRepository.findById(id);
    if (!profile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }
    return profile;
  }

  async updateProfile(
    id: string,
    data: UpdateProfessionalProfileData
  ): Promise<IProfessionalProfile> {
    // Verificar se perfil existe
    const existingProfile = await this.professionalProfileRepository.findById(
      id
    );
    if (!existingProfile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }

    return await this.professionalProfileRepository.update(id, data);
  }

  async deleteProfile(id: string): Promise<void> {
    // Verificar se perfil existe
    const existingProfile = await this.professionalProfileRepository.findById(
      id
    );
    if (!existingProfile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }

    await this.professionalProfileRepository.delete(id);
  }

  // ========================================
  // MÉTODOS DE ESPECIALIDADES
  // ========================================

  async addSpecialty(
    profileId: string,
    specialty: string
  ): Promise<IProfessionalProfile> {
    // Verificar se perfil existe
    const profile = await this.professionalProfileRepository.findById(
      profileId
    );
    if (!profile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }

    // Validar especialidade
    if (!specialty || specialty.trim().length === 0) {
      throw new BadRequestError("Especialidade não pode ser vazia");
    }

    return await this.professionalProfileRepository.addSpecialty(
      profileId,
      specialty
    );
  }

  async removeSpecialty(
    profileId: string,
    specialty: string
  ): Promise<IProfessionalProfile> {
    // Verificar se perfil existe
    const profile = await this.professionalProfileRepository.findById(
      profileId
    );
    if (!profile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }

    // Verificar se especialidade existe
    if (!profile.specialties.includes(specialty)) {
      throw new NotFoundError("Especialidade não encontrada");
    }

    return await this.professionalProfileRepository.removeSpecialty(
      profileId,
      specialty
    );
  }

  // ========================================
  // MÉTODOS DE CERTIFICAÇÕES
  // ========================================

  async addCertification(
    profileId: string,
    certification: Certification
  ): Promise<IProfessionalProfile> {
    // Verificar se perfil existe
    const profile = await this.professionalProfileRepository.findById(
      profileId
    );
    if (!profile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }

    // Validar certificação
    const validation = this.validateCertification(certification);
    if (!validation.isValid) {
      throw new BadRequestError(
        `Certificação inválida: ${validation.errors.join(", ")}`
      );
    }

    return await this.professionalProfileRepository.addCertification(
      profileId,
      certification
    );
  }

  async removeCertification(
    profileId: string,
    certificationId: string
  ): Promise<IProfessionalProfile> {
    // Verificar se perfil existe
    const profile = await this.professionalProfileRepository.findById(
      profileId
    );
    if (!profile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }

    // Verificar se certificação existe
    const certification = profile.certifications.find(
      (cert) => cert.id === certificationId
    );
    if (!certification) {
      throw new NotFoundError("Certificação não encontrada");
    }

    return await this.professionalProfileRepository.removeCertification(
      profileId,
      certificationId
    );
  }

  async updateCertification(
    profileId: string,
    certificationId: string,
    certification: Certification
  ): Promise<IProfessionalProfile> {
    // Verificar se perfil existe
    const profile = await this.professionalProfileRepository.findById(
      profileId
    );
    if (!profile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }

    // Verificar se certificação existe
    const existingCertification = profile.certifications.find(
      (cert) => cert.id === certificationId
    );
    if (!existingCertification) {
      throw new NotFoundError("Certificação não encontrada");
    }

    // Validar certificação
    const validation = this.validateCertification(certification);
    if (!validation.isValid) {
      throw new BadRequestError(
        `Certificação inválida: ${validation.errors.join(", ")}`
      );
    }

    return await this.professionalProfileRepository.updateCertification(
      profileId,
      certificationId,
      certification
    );
  }

  // ========================================
  // MÉTODOS DE PORTFÓLIO
  // ========================================

  async addPortfolioItem(
    profileId: string,
    portfolioItem: string
  ): Promise<IProfessionalProfile> {
    // Verificar se perfil existe
    const profile = await this.professionalProfileRepository.findById(
      profileId
    );
    if (!profile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }

    // Validar item do portfólio
    if (!portfolioItem || portfolioItem.trim().length === 0) {
      throw new BadRequestError("Item do portfólio não pode ser vazio");
    }

    return await this.professionalProfileRepository.addPortfolioItem(
      profileId,
      portfolioItem
    );
  }

  async removePortfolioItem(
    profileId: string,
    portfolioItem: string
  ): Promise<IProfessionalProfile> {
    // Verificar se perfil existe
    const profile = await this.professionalProfileRepository.findById(
      profileId
    );
    if (!profile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }

    // Verificar se item do portfólio existe
    if (!profile.portfolio.includes(portfolioItem)) {
      throw new NotFoundError("Item do portfólio não encontrado");
    }

    return await this.professionalProfileRepository.removePortfolioItem(
      profileId,
      portfolioItem
    );
  }

  // ========================================
  // MÉTODOS DE HORÁRIOS DE TRABALHO
  // ========================================

  async updateWorkingHours(
    profileId: string,
    workingHours: WorkingHours
  ): Promise<IProfessionalProfile> {
    // Verificar se perfil existe
    const profile = await this.professionalProfileRepository.findById(
      profileId
    );
    if (!profile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }

    // Validar horários de trabalho
    const validation = this.validateWorkingHours(workingHours);
    if (!validation.isValid) {
      throw new BadRequestError(
        `Horários de trabalho inválidos: ${validation.errors.join(", ")}`
      );
    }

    return await this.professionalProfileRepository.updateWorkingHours(
      profileId,
      workingHours
    );
  }

  // ========================================
  // MÉTODOS DE BUSCA
  // ========================================

  async searchProfiles(
    filters: ProfessionalProfileFilters
  ): Promise<PaginatedResult<IProfessionalProfile>> {
    return await this.professionalProfileRepository.findMany(filters);
  }

  async getProfileByCPF(cpf: string): Promise<IProfessionalProfile> {
    const profile = await this.professionalProfileRepository.findByCPF(cpf);
    if (!profile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }
    return profile;
  }

  async getProfileByCNPJ(cnpj: string): Promise<IProfessionalProfile> {
    const profile = await this.professionalProfileRepository.findByCNPJ(cnpj);
    if (!profile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }
    return profile;
  }

  // ========================================
  // MÉTODOS DE VALIDAÇÃO
  // ========================================

  async validateProfileCreation(
    data: CreateProfessionalProfileData
  ): Promise<ValidationResult> {
    const errors: string[] = [];

    // Validar CPF se fornecido
    if (data.cpf && !this.isValidCPF(data.cpf)) {
      errors.push("CPF inválido");
    }

    // Validar CNPJ se fornecido
    if (data.cnpj && !this.isValidCNPJ(data.cnpj)) {
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

    // Validar modo de serviço
    const validServiceModes = ["AT_LOCATION", "AT_DOMICILE", "BOTH"];
    if (!validServiceModes.includes(data.serviceMode)) {
      errors.push("Modo de serviço inválido");
    }

    // Validar especialidades
    if (!data.specialties || data.specialties.length === 0) {
      errors.push("Especialidades são obrigatórias");
    }

    // Validar horários de trabalho se fornecidos
    if (data.workingHours) {
      const validation = this.validateWorkingHours(data.workingHours);
      if (!validation.isValid) {
        errors.push(...validation.errors);
      }
    }

    // Validar certificações se fornecidas
    if (data.certifications && data.certifications.length > 0) {
      for (const certification of data.certifications) {
        const validation = this.validateCertification(certification);
        if (!validation.isValid) {
          errors.push(...validation.errors);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private validateWorkingHours(workingHours: WorkingHours): ValidationResult {
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
      const dayHours = workingHours[day as keyof WorkingHours];
      if (dayHours) {
        if (dayHours.isAvailable && (!dayHours.start || !dayHours.end)) {
          errors.push(`Horários de ${day} são obrigatórios quando disponível`);
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

  private validateCertification(
    certification: Certification
  ): ValidationResult {
    const errors: string[] = [];

    if (!certification.name) {
      errors.push("Nome da certificação é obrigatório");
    }
    if (!certification.institution) {
      errors.push("Instituição é obrigatória");
    }
    if (!certification.date) {
      errors.push("Data da certificação é obrigatória");
    } else if (certification.date > new Date()) {
      errors.push("Data da certificação não pode ser no futuro");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // ========================================
  // MÉTODOS AUXILIARES
  // ========================================

  private isValidCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, "");

    if (cleanCPF.length !== 11) {
      return false;
    }

    if (/^(\d)\1{10}$/.test(cleanCPF)) {
      return false;
    }

    // Validação do CPF
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
}
