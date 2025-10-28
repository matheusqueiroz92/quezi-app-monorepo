import {
  ICompanyProfileService,
  CreateCompanyProfileData,
  UpdateCompanyProfileData,
  CompanyFilters,
  PaginatedResult,
  ValidationResult,
} from "../../domain/interfaces/repository.interface";
import {
  ICompanyProfile,
  // BusinessHours,
} from "../../domain/interfaces/user.interface";
import { ICompanyProfileRepository } from "../../domain/interfaces/repository.interface";
import { NotFoundError, BadRequestError } from "../../utils/app-error";

export class CompanyProfileService implements ICompanyProfileService {
  constructor(private companyProfileRepository: ICompanyProfileRepository) {}

  // ========================================
  // MÉTODOS BÁSICOS
  // ========================================

  async createProfile(
    userId: string,
    data: CreateCompanyProfileData
  ): Promise<ICompanyProfile> {
    // Validar dados antes de criar
    const validation = await this.validateProfileCreation(data);
    if (!validation.isValid) {
      throw new BadRequestError(
        `Dados inválidos: ${validation.errors.join(", ")}`
      );
    }

    // TODO: Implementar verificação de CNPJ quando o método estiver disponível
    // const existingProfile = await this.companyProfileRepository.findByCNPJ(data.cnpj);
    // if (existingProfile) {
    //   throw new BadRequestError("CNPJ já está em uso");
    // }

    return await this.companyProfileRepository.create(data);
  }

  async getProfile(userId: string): Promise<ICompanyProfile> {
    const profile = await this.companyProfileRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError("Perfil de empresa não encontrado");
    }
    return profile;
  }

  async updateProfile(
    userId: string,
    data: UpdateCompanyProfileData
  ): Promise<ICompanyProfile> {
    // Verificar se perfil existe
    const existingProfile = await this.companyProfileRepository.findByUserId(
      userId
    );
    if (!existingProfile) {
      throw new NotFoundError("Perfil de empresa não encontrado");
    }

    return await this.companyProfileRepository.update(userId, data);
  }

  async deleteProfile(userId: string): Promise<void> {
    // Verificar se perfil existe
    const existingProfile = await this.companyProfileRepository.findByUserId(
      userId
    );
    if (!existingProfile) {
      throw new NotFoundError("Perfil de empresa não encontrado");
    }

    await this.companyProfileRepository.delete(userId);
  }

  // ========================================
  // MÉTODOS DE FOTOS - COMENTADOS (não implementados no repositório)
  // ========================================

  async addPhoto(userId: string, photoUrl: string): Promise<void> {
    // TODO: Implementar quando o método estiver disponível no repositório
    throw new Error("Método addPhoto não implementado no repositório");
  }

  async removePhoto(userId: string, photoUrl: string): Promise<void> {
    // TODO: Implementar quando o método estiver disponível no repositório
    throw new Error("Método removePhoto não implementado no repositório");
  }

  // ========================================
  // MÉTODOS DE HORÁRIOS - COMENTADOS (não implementados no repositório)
  // ========================================

  // async updateBusinessHours(
  //   userId: string,
  //   hours: BusinessHours
  // ): Promise<void> {
  //   // TODO: Implementar quando o método estiver disponível no repositório
  //   throw new Error(
  //     "Método updateBusinessHours não implementado no repositório"
  //   );
  // }

  // ========================================
  // MÉTODOS DE FUNCIONÁRIOS - COMENTADOS (não implementados no repositório)
  // ========================================

  async getEmployees(userId: string): Promise<any[]> {
    // TODO: Implementar quando o método estiver disponível no repositório
    throw new Error("Método getEmployees não implementado no repositório");
  }

  async addEmployee(userId: string, employeeData: any): Promise<any> {
    // TODO: Implementar quando o método estiver disponível no repositório
    throw new Error("Método addEmployee não implementado no repositório");
  }

  async removeEmployee(userId: string, employeeId: string): Promise<void> {
    // TODO: Implementar quando o método estiver disponível no repositório
    throw new Error("Método removeEmployee não implementado no repositório");
  }

  // ========================================
  // MÉTODOS DE BUSCA - COMENTADOS (não implementados no repositório)
  // ========================================

  async searchProfiles(
    filters: CompanyFilters
  ): Promise<PaginatedResult<ICompanyProfile>> {
    // TODO: Implementar quando o método estiver disponível no repositório
    throw new Error("Método searchProfiles não implementado no repositório");
  }

  async getProfileByCNPJ(cnpj: string): Promise<ICompanyProfile> {
    // TODO: Implementar quando o método estiver disponível no repositório
    throw new Error("Método getProfileByCNPJ não implementado no repositório");
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

    // Validar nome da empresa
    if (!data.companyName || data.companyName.trim().length === 0) {
      errors.push("Nome da empresa é obrigatório");
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
