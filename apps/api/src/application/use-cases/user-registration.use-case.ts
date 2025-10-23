/**
 * Caso de Uso: Registro de Usuário
 *
 * Seguindo os princípios SOLID:
 * - S: Single Responsibility Principle
 * - D: Dependency Inversion Principle
 *
 * Orquestra o processo completo de registro de usuário
 */

import {
  IUserService,
  CreateUserData,
} from "../../domain/interfaces/repository.interface";
import {
  IClientProfileService,
  CreateClientProfileData,
} from "../../domain/interfaces/repository.interface";
import {
  IProfessionalProfileService,
  CreateProfessionalProfileData,
} from "../../domain/interfaces/repository.interface";
import {
  ICompanyProfileService,
  CreateCompanyProfileData,
} from "../../domain/interfaces/repository.interface";
import {
  IUser,
  IClientProfile,
  IProfessionalProfile,
  ICompanyProfile,
} from "../../domain/interfaces/user.interface";
import { BadRequestError } from "../../utils/app-error";

export interface UserRegistrationData {
  // Dados básicos do usuário
  email: string;
  password: string;
  name: string;
  phone?: string;
  userType: "CLIENT" | "PROFESSIONAL" | "COMPANY";

  // Dados específicos do perfil (opcionais no registro)
  profileData?: {
    // Para CLIENT
    addresses?: any[];
    paymentMethods?: any[];
    preferences?: any;

    // Para PROFESSIONAL
    cpf?: string;
    cnpj?: string;
    address?: string;
    city?: string;
    serviceMode?: "AT_LOCATION" | "AT_DOMICILE" | "BOTH";
    specialties?: string[];
    workingHours?: any;
    certifications?: any[];
    portfolio?: string[];

    // Para COMPANY
    cnpj?: string;
    address?: string;
    city?: string;
    businessHours?: any;
    description?: string;
    photos?: string[];
  };
}

export interface UserRegistrationResult {
  user: IUser;
  profile?: IClientProfile | IProfessionalProfile | ICompanyProfile;
}

export class UserRegistrationUseCase {
  constructor(
    private userService: IUserService,
    private clientProfileService: IClientProfileService,
    private professionalProfileService: IProfessionalProfileService,
    private companyProfileService: ICompanyProfileService
  ) {}

  async execute(data: UserRegistrationData): Promise<UserRegistrationResult> {
    // 1. Validar dados de entrada
    await this.validateRegistrationData(data);

    // 2. Criar usuário básico
    const userData: CreateUserData = {
      email: data.email,
      password: data.password,
      name: data.name,
      phone: data.phone,
      userType: data.userType,
    };

    const user = await this.userService.createUser(userData);

    // 3. Criar perfil específico se dados foram fornecidos
    let profile:
      | IClientProfile
      | IProfessionalProfile
      | ICompanyProfile
      | undefined;

    if (data.profileData) {
      switch (data.userType) {
        case "CLIENT":
          if (data.profileData.cpf) {
            profile = await this.createClientProfile(user.id, data.profileData);
          }
          break;
        case "PROFESSIONAL":
          if (data.profileData.address && data.profileData.city) {
            profile = await this.createProfessionalProfile(
              user.id,
              data.profileData
            );
          }
          break;
        case "COMPANY":
          if (
            data.profileData.cnpj &&
            data.profileData.address &&
            data.profileData.city
          ) {
            profile = await this.createCompanyProfile(
              user.id,
              data.profileData
            );
          }
          break;
      }
    }

    return {
      user,
      profile,
    };
  }

  private async validateRegistrationData(
    data: UserRegistrationData
  ): Promise<void> {
    const errors: string[] = [];

    // Validar dados básicos
    if (!data.email) {
      errors.push("Email é obrigatório");
    }
    if (!data.password) {
      errors.push("Senha é obrigatória");
    }
    if (!data.name) {
      errors.push("Nome é obrigatório");
    }
    if (!data.userType) {
      errors.push("Tipo de usuário é obrigatório");
    }

    // Validar dados específicos do perfil baseado no tipo
    if (data.profileData) {
      switch (data.userType) {
        case "CLIENT":
          if (data.profileData.cpf && !this.isValidCPF(data.profileData.cpf)) {
            errors.push("CPF inválido");
          }
          break;
        case "PROFESSIONAL":
          if (!data.profileData.address) {
            errors.push("Endereço é obrigatório para profissionais");
          }
          if (!data.profileData.city) {
            errors.push("Cidade é obrigatória para profissionais");
          }
          if (data.profileData.cpf && !this.isValidCPF(data.profileData.cpf)) {
            errors.push("CPF inválido");
          }
          if (
            data.profileData.cnpj &&
            !this.isValidCNPJ(data.profileData.cnpj)
          ) {
            errors.push("CNPJ inválido");
          }
          break;
        case "COMPANY":
          if (!data.profileData.cnpj) {
            errors.push("CNPJ é obrigatório para empresas");
          } else if (!this.isValidCNPJ(data.profileData.cnpj)) {
            errors.push("CNPJ inválido");
          }
          if (!data.profileData.address) {
            errors.push("Endereço é obrigatório para empresas");
          }
          if (!data.profileData.city) {
            errors.push("Cidade é obrigatória para empresas");
          }
          break;
      }
    }

    if (errors.length > 0) {
      throw new BadRequestError(
        `Dados de registro inválidos: ${errors.join(", ")}`
      );
    }
  }

  private async createClientProfile(
    userId: string,
    profileData: any
  ): Promise<IClientProfile> {
    const clientProfileData: CreateClientProfileData = {
      userId,
      cpf: profileData.cpf,
      addresses: profileData.addresses || [],
      paymentMethods: profileData.paymentMethods || [],
      preferences: profileData.preferences || {},
    };

    return await this.clientProfileService.createProfile(clientProfileData);
  }

  private async createProfessionalProfile(
    userId: string,
    profileData: any
  ): Promise<IProfessionalProfile> {
    const professionalProfileData: CreateProfessionalProfileData = {
      userId,
      cpf: profileData.cpf,
      cnpj: profileData.cnpj,
      address: profileData.address,
      city: profileData.city,
      serviceMode: profileData.serviceMode || "BOTH",
      specialties: profileData.specialties || [],
      workingHours: profileData.workingHours || {},
      certifications: profileData.certifications || [],
      portfolio: profileData.portfolio || [],
    };

    return await this.professionalProfileService.createProfile(
      professionalProfileData
    );
  }

  private async createCompanyProfile(
    userId: string,
    profileData: any
  ): Promise<ICompanyProfile> {
    const companyProfileData: CreateCompanyProfileData = {
      userId,
      cnpj: profileData.cnpj,
      address: profileData.address,
      city: profileData.city,
      businessHours: profileData.businessHours || {},
      description: profileData.description,
      photos: profileData.photos || [],
    };

    return await this.companyProfileService.createProfile(companyProfileData);
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
