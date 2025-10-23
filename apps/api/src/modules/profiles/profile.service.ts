/**
 * Service de Perfis - Camada de Aplicação
 *
 * Gerencia a lógica de negócio para perfis específicos
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { IUserService } from "../../domain/interfaces/repository.interface";
import { UserService } from "../users/user.service";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { ClientProfileRepository } from "../../infrastructure/repositories/client-profile.repository";
import { ProfessionalProfileRepository } from "../../infrastructure/repositories/professional-profile.repository";
import { CompanyProfileRepository } from "../../infrastructure/repositories/company-profile.repository";
import { UserType } from "../../domain/interfaces/user.interface";
import { BadRequestError, NotFoundError } from "../../utils/app-error";

/**
 * Service para gerenciar perfis específicos
 */
export class ProfileService {
  private userService: IUserService;

  constructor() {
    // Injeção de dependência seguindo o princípio DIP
    const userRepository = new UserRepository();
    const clientProfileRepository = new ClientProfileRepository();
    const professionalProfileRepository = new ProfessionalProfileRepository();
    const companyProfileRepository = new CompanyProfileRepository();

    this.userService = new UserService(
      userRepository,
      clientProfileRepository,
      professionalProfileRepository,
      companyProfileRepository
    );
  }

  /**
   * Cria perfil de cliente
   */
  async createClientProfile(userId: string, data: any): Promise<any> {
    // Verificar se o usuário existe e é do tipo CLIENT
    const user = await this.userService.getUserById(userId);
    if (user.getUserType() !== UserType.CLIENT) {
      throw new BadRequestError(
        "Apenas usuários do tipo CLIENT podem ter perfil de cliente"
      );
    }

    // Criar perfil de cliente
    const profile = await this.userService.createClientProfile(userId, data);
    return profile.toJSON();
  }

  /**
   * Cria perfil de profissional
   */
  async createProfessionalProfile(userId: string, data: any): Promise<any> {
    // Verificar se o usuário existe e é do tipo PROFESSIONAL
    const user = await this.userService.getUserById(userId);
    if (user.getUserType() !== UserType.PROFESSIONAL) {
      throw new BadRequestError(
        "Apenas usuários do tipo PROFESSIONAL podem ter perfil de profissional"
      );
    }

    // Criar perfil de profissional
    const profile = await this.userService.createProfessionalProfile(
      userId,
      data
    );
    return profile.toJSON();
  }

  /**
   * Cria perfil de empresa
   */
  async createCompanyProfile(userId: string, data: any): Promise<any> {
    // Verificar se o usuário existe e é do tipo COMPANY
    const user = await this.userService.getUserById(userId);
    if (user.getUserType() !== UserType.COMPANY) {
      throw new BadRequestError(
        "Apenas usuários do tipo COMPANY podem ter perfil de empresa"
      );
    }

    // Criar perfil de empresa
    const profile = await this.userService.createCompanyProfile(userId, data);
    return profile.toJSON();
  }

  /**
   * Busca perfil de cliente
   */
  async getClientProfile(userId: string): Promise<any> {
    const user = await this.userService.getUserById(userId);
    if (user.getUserType() !== UserType.CLIENT) {
      throw new NotFoundError("Perfil de cliente não encontrado");
    }

    // Buscar perfil específico do cliente
    const profile = await this.userService.getClientProfile(userId);
    return profile.toJSON();
  }

  /**
   * Busca perfil de profissional
   */
  async getProfessionalProfile(userId: string): Promise<any> {
    const user = await this.userService.getUserById(userId);
    if (user.getUserType() !== UserType.PROFESSIONAL) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }

    // Buscar perfil específico do profissional
    const profile = await this.userService.getProfessionalProfile(userId);
    return profile.toJSON();
  }

  /**
   * Busca perfil de empresa
   */
  async getCompanyProfile(userId: string): Promise<any> {
    const user = await this.userService.getUserById(userId);
    if (user.getUserType() !== UserType.COMPANY) {
      throw new NotFoundError("Perfil de empresa não encontrado");
    }

    // Buscar perfil específico da empresa
    const profile = await this.userService.getCompanyProfile(userId);
    return profile.toJSON();
  }
}
