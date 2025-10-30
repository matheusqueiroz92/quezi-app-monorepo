/**
 * UserService
 *
 * Serviço de aplicação para gerenciamento de usuários
 * Camada de Aplicação - Clean Architecture
 *
 * Responsabilidades:
 * - Lógica de negócio para usuários
 * - Validações de regras de negócio
 * - Gerenciamento de perfis de usuário
 */

import { IUser } from "../../domain/interfaces/user.interface";
import { IUserRepository } from "../../domain/interfaces/repository.interface";
import { NotFoundError, BadRequestError } from "../../utils/app-error";
import { User } from "../../domain/entities/user.entity";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { prisma } from "../../lib/prisma";

export class UserService {
  constructor(
    private userRepository: UserRepository = new UserRepository(prisma)
  ) {}

  // ========================================
  // MÉTODOS BÁSICOS
  // ========================================

  /**
   * Cria um novo usuário
   */
  async createUser(data: any): Promise<IUser> {
    const user = await this.userRepository.create(data);
    return user;
  }

  /**
   * Busca usuário por ID
   */
  async getUserById(id: string): Promise<IUser | null> {
    return await this.userRepository.findById(id);
  }

  /**
   * Busca usuário por email
   */
  async getUserByEmail(email: string): Promise<IUser | null> {
    return await this.userRepository.findByEmail(email);
  }

  /**
   * Atualiza usuário
   */
  async updateUser(id: string, data: any): Promise<IUser> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }

    return await this.userRepository.update(id, data);
  }

  /**
   * Deleta usuário
   */
  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }

    await this.userRepository.delete(id);
  }

  /**
   * Lista usuários com paginação
   */
  async getUsers(filters: any): Promise<any> {
    return await this.userRepository.findMany(filters);
  }

  /**
   * Busca usuários por tipo
   */
  async findUsersByType(userType: string): Promise<IUser[]> {
    return await this.userRepository.findByUserType(userType);
  }

  /**
   * Busca usuários com filtros
   */
  async searchUsers(filters: any): Promise<any> {
    return await this.userRepository.findMany(filters);
  }

  /**
   * Valida dados de criação de usuário
   */
  async validateUserCreation(
    data: any
  ): Promise<{ isValid: boolean; errors: string[] }> {
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

  // ========================================
  // MÉTODOS AUXILIARES
  // ========================================

  /**
   * Valida formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida formato de telefone
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Valida CPF
   */
  private isValidCPF(cpf: string): boolean {
    // Implementação básica de validação de CPF
    const cleanCPF = cpf.replace(/\D/g, "");
    return cleanCPF.length === 11;
  }

  /**
   * Valida CNPJ
   */
  private isValidCNPJ(cnpj: string): boolean {
    // Implementação básica de validação de CNPJ
    const cleanCNPJ = cnpj.replace(/\D/g, "");
    return cleanCNPJ.length === 14;
  }
}
