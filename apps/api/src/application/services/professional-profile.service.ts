import {
  IProfessionalProfileService,
  CreateProfessionalProfileData,
  UpdateProfessionalProfileData,
  ProfessionalFilters,
  PaginatedResult,
  ValidationResult,
} from "../../domain/interfaces/repository.interface";
import {
  IProfessionalProfile,
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
    userId: string,
    data: CreateProfessionalProfileData
  ): Promise<IProfessionalProfile> {
    // Validar dados antes de criar
    const validation = await this.validateProfileCreation(data);
    if (!validation.isValid) {
      throw new BadRequestError(
        `Dados inválidos: ${validation.errors.join(", ")}`
      );
    }

    // TODO: Implementar verificação de CPF/CNPJ quando os métodos estiverem disponíveis
    // if (data.cpf) {
    //   const existingProfile = await this.professionalProfileRepository.findByCPF(data.cpf);
    //   if (existingProfile) {
    //     throw new BadRequestError("CPF já está em uso");
    //   }
    // }
    // if (data.cnpj) {
    //   const existingProfile = await this.professionalProfileRepository.findByCNPJ(data.cnpj);
    //   if (existingProfile) {
    //     throw new BadRequestError("CNPJ já está em uso");
    //   }
    // }

    return await this.professionalProfileRepository.create(data);
  }

  async getProfile(userId: string): Promise<IProfessionalProfile> {
    const profile = await this.professionalProfileRepository.findByUserId(
      userId
    );
    if (!profile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }
    return profile;
  }

  async updateProfile(
    userId: string,
    data: UpdateProfessionalProfileData
  ): Promise<IProfessionalProfile> {
    // Verificar se perfil existe
    const existingProfile =
      await this.professionalProfileRepository.findByUserId(userId);
    if (!existingProfile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }

    return await this.professionalProfileRepository.update(userId, data);
  }

  async deleteProfile(userId: string): Promise<void> {
    // Verificar se perfil existe
    const existingProfile =
      await this.professionalProfileRepository.findByUserId(userId);
    if (!existingProfile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }

    await this.professionalProfileRepository.delete(userId);
  }

  // ========================================
  // MÉTODOS DE ESPECIALIDADES - COMENTADOS (não implementados no repositório)
  // ========================================

  async addSpecialty(userId: string, specialty: string): Promise<void> {
    // TODO: Implementar quando o método estiver disponível no repositório
    throw new Error("Método addSpecialty não implementado no repositório");
  }

  async removeSpecialty(userId: string, specialty: string): Promise<void> {
    // TODO: Implementar quando o método estiver disponível no repositório
    throw new Error("Método removeSpecialty não implementado no repositório");
  }

  // ========================================
  // MÉTODOS DE CERTIFICAÇÕES - COMENTADOS (não implementados no repositório)
  // ========================================

  async addCertification(
    userId: string,
    certification: Certification
  ): Promise<void> {
    // TODO: Implementar quando o método estiver disponível no repositório
    throw new Error("Método addCertification não implementado no repositório");
  }

  async removeCertification(
    userId: string,
    certificationId: string
  ): Promise<void> {
    // TODO: Implementar quando o método estiver disponível no repositório
    throw new Error(
      "Método removeCertification não implementado no repositório"
    );
  }

  // ========================================
  // MÉTODOS DE BUSCA - COMENTADOS (não implementados no repositório)
  // ========================================

  async searchProfiles(
    filters: ProfessionalFilters
  ): Promise<PaginatedResult<IProfessionalProfile>> {
    // TODO: Implementar quando o método estiver disponível no repositório
    throw new Error("Método searchProfiles não implementado no repositório");
  }

  async getProfileByCPF(cpf: string): Promise<IProfessionalProfile> {
    // TODO: Implementar quando o método estiver disponível no repositório
    throw new Error("Método getProfileByCPF não implementado no repositório");
  }

  async getProfileByCNPJ(cnpj: string): Promise<IProfessionalProfile> {
    // TODO: Implementar quando o método estiver disponível no repositório
    throw new Error("Método getProfileByCNPJ não implementado no repositório");
  }

  // ========================================
  // MÉTODOS DE VALIDAÇÃO
  // ========================================

  async validateProfileCreation(
    data: CreateProfessionalProfileData
  ): Promise<ValidationResult> {
    const errors: string[] = [];

    // Validar CPF ou CNPJ
    if (!data.cpf && !data.cnpj) {
      errors.push("CPF ou CNPJ é obrigatório");
    }

    if (data.cpf && !this.isValidCPF(data.cpf)) {
      errors.push("CPF inválido");
    }

    if (data.cnpj && !this.isValidCNPJ(data.cnpj)) {
      errors.push("CNPJ inválido");
    }

    // Validar nome
    if (!data.name || data.name.trim().length === 0) {
      errors.push("Nome é obrigatório");
    }

    // Validar email
    if (!data.email) {
      errors.push("Email é obrigatório");
    } else if (!this.isValidEmail(data.email)) {
      errors.push("Email inválido");
    }

    // Validar telefone
    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push("Telefone inválido");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private isValidCPF(cpf: string): boolean {
    // Implementação básica de validação de CPF
    const cleanCPF = cpf.replace(/\D/g, "");
    return cleanCPF.length === 11;
  }

  private isValidCNPJ(cnpj: string): boolean {
    // Implementação básica de validação de CNPJ
    const cleanCNPJ = cnpj.replace(/\D/g, "");
    return cleanCNPJ.length === 14;
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
