/**
 * Serviço de Usuários - Camada de Aplicação
 *
 * Seguindo os princípios SOLID:
 * - S: Single Responsibility Principle
 * - D: Dependency Inversion Principle
 *
 * Implementa IUserService usando repositórios
 */

import {
  IUserService,
  CreateUserData,
  UpdateUserData,
  UserFilters,
  PaginatedResult,
  ValidationResult,
} from "../../domain/interfaces/repository.interface";
import {
  IUser,
  IClientProfile,
  IProfessionalProfile,
  ICompanyProfile,
} from "../../domain/interfaces/user.interface";
import { IUserRepository } from "../../domain/interfaces/repository.interface";
import { NotFoundError, BadRequestError } from "../../utils/app-error";
import { User } from "../../domain/entities/user.entity";

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  // ========================================
  // MÉTODOS BÁSICOS
  // ========================================

  async createUser(data: CreateUserData): Promise<IUser> {
    // Validar dados antes de criar
    const validation = await this.validateUserCreation(data);
    if (!validation.isValid) {
      throw new BadRequestError(
        `Dados inválidos: ${validation.errors.join(", ")}`
      );
    }

    // Verificar se email já existe
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new BadRequestError("Email já está em uso");
    }

    return await this.userRepository.create(data);
  }

  async getUserById(id: string): Promise<IUser> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }
    return user;
  }

  async updateUser(id: string, data: UpdateUserData): Promise<IUser> {
    // Verificar se usuário existe
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError("Usuário não encontrado");
    }

    return await this.userRepository.update(id, data);
  }

  async deleteUser(id: string): Promise<void> {
    // Verificar se usuário existe
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError("Usuário não encontrado");
    }

    await this.userRepository.delete(id);
  }

  // ========================================
  // MÉTODOS DE PERFIL
  // ========================================

  async createClientProfile(
    userId: string,
    data: any
  ): Promise<IClientProfile> {
    // Verificar se usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }

    // Verificar se é do tipo CLIENT
    if (user.userType !== "CLIENT") {
      throw new BadRequestError(
        "Apenas usuários do tipo CLIENT podem ter perfil de cliente"
      );
    }

    return await this.userRepository.createClientProfile({
      userId,
      ...data,
    });
  }

  async createProfessionalProfile(
    userId: string,
    data: any
  ): Promise<IProfessionalProfile> {
    // Verificar se usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }

    // Verificar se é do tipo PROFESSIONAL
    if (user.userType !== "PROFESSIONAL") {
      throw new BadRequestError(
        "Apenas usuários do tipo PROFESSIONAL podem ter perfil de profissional"
      );
    }

    return await this.userRepository.createProfessionalProfile({
      userId,
      ...data,
    });
  }

  async createCompanyProfile(
    userId: string,
    data: any
  ): Promise<ICompanyProfile> {
    // Verificar se usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }

    // Verificar se é do tipo COMPANY
    if (user.userType !== "COMPANY") {
      throw new BadRequestError(
        "Apenas usuários do tipo COMPANY podem ter perfil de empresa"
      );
    }

    return await this.userRepository.createCompanyProfile({
      userId,
      ...data,
    });
  }

  // ========================================
  // MÉTODOS DE BUSCA
  // ========================================

  async findUsersByType(userType: string): Promise<IUser[]> {
    return await this.userRepository.findByUserType(userType);
  }

  async searchUsers(filters: UserFilters): Promise<PaginatedResult<IUser>> {
    return await this.userRepository.findMany(filters);
  }

  // ========================================
  // MÉTODOS DE VALIDAÇÃO
  // ========================================

  async validateUserCreation(data: CreateUserData): Promise<ValidationResult> {
    const errors: string[] = [];

    // Validar email
    if (!data.email) {
      errors.push("Email é obrigatório");
    } else if (!this.isValidEmail(data.email)) {
      errors.push("Email inválido");
    }

    // Validar nome
    if (!data.name) {
      errors.push("Nome é obrigatório");
    } else if (data.name.length < 2) {
      errors.push("Nome deve ter pelo menos 2 caracteres");
    }

    // Validar telefone se fornecido
    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push("Telefone inválido");
    }

    // Validar tipo de usuário
    const validUserTypes = ["CLIENT", "PROFESSIONAL", "COMPANY"];
    if (!validUserTypes.includes(data.userType)) {
      errors.push("Tipo de usuário inválido");
    }

    // Validar senha
    if (!data.password) {
      errors.push("Senha é obrigatória");
    } else if (data.password.length < 6) {
      errors.push("Senha deve ter pelo menos 6 caracteres");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async validateProfileCreation(
    userId: string,
    profileData: any
  ): Promise<ValidationResult> {
    const errors: string[] = [];

    // Verificar se usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      errors.push("Usuário não encontrado");
      return { isValid: false, errors };
    }

    // Validar dados específicos do perfil baseado no tipo de usuário
    if (user.userType === "CLIENT") {
      if (!profileData.cpf) {
        errors.push("CPF é obrigatório para clientes");
      } else if (!this.isValidCPF(profileData.cpf)) {
        errors.push("CPF inválido");
      }
    }

    if (user.userType === "PROFESSIONAL") {
      if (!profileData.address) {
        errors.push("Endereço é obrigatório para profissionais");
      }
      if (!profileData.city) {
        errors.push("Cidade é obrigatória para profissionais");
      }
      if (!profileData.specialties || profileData.specialties.length === 0) {
        errors.push("Especialidades são obrigatórias para profissionais");
      }
    }

    if (user.userType === "COMPANY") {
      if (!profileData.cnpj) {
        errors.push("CNPJ é obrigatório para empresas");
      } else if (!this.isValidCNPJ(profileData.cnpj)) {
        errors.push("CNPJ inválido");
      }
      if (!profileData.address) {
        errors.push("Endereço é obrigatório para empresas");
      }
      if (!profileData.city) {
        errors.push("Cidade é obrigatória para empresas");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // ========================================
  // MÉTODOS AUXILIARES
  // ========================================

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
  }

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
