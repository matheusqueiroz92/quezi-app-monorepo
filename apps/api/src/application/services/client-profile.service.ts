/**
 * Serviço de Perfil de Cliente - Camada de Aplicação
 *
 * Seguindo os princípios SOLID:
 * - S: Single Responsibility Principle
 * - D: Dependency Inversion Principle
 *
 * Implementa IClientProfileService usando repositórios
 */

import {
  IClientProfileService,
  CreateClientProfileData,
  UpdateClientProfileData,
  ClientProfileFilters,
  PaginatedResult,
  ValidationResult,
} from "../../domain/interfaces/repository.interface";
import {
  IClientProfile,
  Address,
  PaymentMethod,
  ClientPreferences,
} from "../../domain/interfaces/user.interface";
import { IClientProfileRepository } from "../../domain/interfaces/repository.interface";
import { NotFoundError, BadRequestError } from "../../utils/app-error";

export class ClientProfileService implements IClientProfileService {
  constructor(private clientProfileRepository: IClientProfileRepository) {}

  // ========================================
  // MÉTODOS BÁSICOS
  // ========================================

  async createProfile(data: CreateClientProfileData): Promise<IClientProfile> {
    // Validar dados antes de criar
    const validation = await this.validateProfileCreation(data);
    if (!validation.isValid) {
      throw new BadRequestError(
        `Dados inválidos: ${validation.errors.join(", ")}`
      );
    }

    // Verificar se CPF já existe
    const existingProfile = await this.clientProfileRepository.findByCPF(
      data.cpf
    );
    if (existingProfile) {
      throw new BadRequestError("CPF já está em uso");
    }

    return await this.clientProfileRepository.create(data);
  }

  async getProfileById(id: string): Promise<IClientProfile> {
    const profile = await this.clientProfileRepository.findById(id);
    if (!profile) {
      throw new NotFoundError("Perfil de cliente não encontrado");
    }
    return profile;
  }

  async updateProfile(
    id: string,
    data: UpdateClientProfileData
  ): Promise<IClientProfile> {
    // Verificar se perfil existe
    const existingProfile = await this.clientProfileRepository.findById(id);
    if (!existingProfile) {
      throw new NotFoundError("Perfil de cliente não encontrado");
    }

    return await this.clientProfileRepository.update(id, data);
  }

  async deleteProfile(id: string): Promise<void> {
    // Verificar se perfil existe
    const existingProfile = await this.clientProfileRepository.findById(id);
    if (!existingProfile) {
      throw new NotFoundError("Perfil de cliente não encontrado");
    }

    await this.clientProfileRepository.delete(id);
  }

  // ========================================
  // MÉTODOS DE ENDEREÇOS
  // ========================================

  async addAddress(
    profileId: string,
    address: Address
  ): Promise<IClientProfile> {
    // Verificar se perfil existe
    const profile = await this.clientProfileRepository.findById(profileId);
    if (!profile) {
      throw new NotFoundError("Perfil de cliente não encontrado");
    }

    // Validar endereço
    const validation = this.validateAddress(address);
    if (!validation.isValid) {
      throw new BadRequestError(
        `Endereço inválido: ${validation.errors.join(", ")}`
      );
    }

    return await this.clientProfileRepository.addAddress(profileId, address);
  }

  async removeAddress(
    profileId: string,
    addressId: string
  ): Promise<IClientProfile> {
    // Verificar se perfil existe
    const profile = await this.clientProfileRepository.findById(profileId);
    if (!profile) {
      throw new NotFoundError("Perfil de cliente não encontrado");
    }

    // Verificar se endereço existe
    const address = profile.addresses.find((addr) => addr.id === addressId);
    if (!address) {
      throw new NotFoundError("Endereço não encontrado");
    }

    return await this.clientProfileRepository.removeAddress(
      profileId,
      addressId
    );
  }

  async updateAddress(
    profileId: string,
    addressId: string,
    address: Address
  ): Promise<IClientProfile> {
    // Verificar se perfil existe
    const profile = await this.clientProfileRepository.findById(profileId);
    if (!profile) {
      throw new NotFoundError("Perfil de cliente não encontrado");
    }

    // Verificar se endereço existe
    const existingAddress = profile.addresses.find(
      (addr) => addr.id === addressId
    );
    if (!existingAddress) {
      throw new NotFoundError("Endereço não encontrado");
    }

    // Validar endereço
    const validation = this.validateAddress(address);
    if (!validation.isValid) {
      throw new BadRequestError(
        `Endereço inválido: ${validation.errors.join(", ")}`
      );
    }

    return await this.clientProfileRepository.updateAddress(
      profileId,
      addressId,
      address
    );
  }

  // ========================================
  // MÉTODOS DE MÉTODOS DE PAGAMENTO
  // ========================================

  async addPaymentMethod(
    profileId: string,
    paymentMethod: PaymentMethod
  ): Promise<IClientProfile> {
    // Verificar se perfil existe
    const profile = await this.clientProfileRepository.findById(profileId);
    if (!profile) {
      throw new NotFoundError("Perfil de cliente não encontrado");
    }

    // Validar método de pagamento
    const validation = this.validatePaymentMethod(paymentMethod);
    if (!validation.isValid) {
      throw new BadRequestError(
        `Método de pagamento inválido: ${validation.errors.join(", ")}`
      );
    }

    return await this.clientProfileRepository.addPaymentMethod(
      profileId,
      paymentMethod
    );
  }

  async removePaymentMethod(
    profileId: string,
    paymentMethodId: string
  ): Promise<IClientProfile> {
    // Verificar se perfil existe
    const profile = await this.clientProfileRepository.findById(profileId);
    if (!profile) {
      throw new NotFoundError("Perfil de cliente não encontrado");
    }

    // Verificar se método de pagamento existe
    const paymentMethod = profile.paymentMethods.find(
      (pm) => pm.id === paymentMethodId
    );
    if (!paymentMethod) {
      throw new NotFoundError("Método de pagamento não encontrado");
    }

    return await this.clientProfileRepository.removePaymentMethod(
      profileId,
      paymentMethodId
    );
  }

  async updatePaymentMethod(
    profileId: string,
    paymentMethodId: string,
    paymentMethod: PaymentMethod
  ): Promise<IClientProfile> {
    // Verificar se perfil existe
    const profile = await this.clientProfileRepository.findById(profileId);
    if (!profile) {
      throw new NotFoundError("Perfil de cliente não encontrado");
    }

    // Verificar se método de pagamento existe
    const existingPaymentMethod = profile.paymentMethods.find(
      (pm) => pm.id === paymentMethodId
    );
    if (!existingPaymentMethod) {
      throw new NotFoundError("Método de pagamento não encontrado");
    }

    // Validar método de pagamento
    const validation = this.validatePaymentMethod(paymentMethod);
    if (!validation.isValid) {
      throw new BadRequestError(
        `Método de pagamento inválido: ${validation.errors.join(", ")}`
      );
    }

    return await this.clientProfileRepository.updatePaymentMethod(
      profileId,
      paymentMethodId,
      paymentMethod
    );
  }

  // ========================================
  // MÉTODOS DE BUSCA
  // ========================================

  async searchProfiles(
    filters: ClientProfileFilters
  ): Promise<PaginatedResult<IClientProfile>> {
    return await this.clientProfileRepository.findMany(filters);
  }

  async getProfileByCPF(cpf: string): Promise<IClientProfile> {
    const profile = await this.clientProfileRepository.findByCPF(cpf);
    if (!profile) {
      throw new NotFoundError("Perfil de cliente não encontrado");
    }
    return profile;
  }

  // ========================================
  // MÉTODOS DE VALIDAÇÃO
  // ========================================

  async validateProfileCreation(
    data: CreateClientProfileData
  ): Promise<ValidationResult> {
    const errors: string[] = [];

    // Validar CPF
    if (!data.cpf) {
      errors.push("CPF é obrigatório");
    } else if (!this.isValidCPF(data.cpf)) {
      errors.push("CPF inválido");
    }

    // Validar endereços se fornecidos
    if (data.addresses && data.addresses.length > 0) {
      for (const address of data.addresses) {
        const validation = this.validateAddress(address);
        if (!validation.isValid) {
          errors.push(...validation.errors);
        }
      }
    }

    // Validar métodos de pagamento se fornecidos
    if (data.paymentMethods && data.paymentMethods.length > 0) {
      for (const paymentMethod of data.paymentMethods) {
        const validation = this.validatePaymentMethod(paymentMethod);
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

  private validateAddress(address: Address): ValidationResult {
    const errors: string[] = [];

    if (!address.street) {
      errors.push("Rua é obrigatória");
    }
    if (!address.number) {
      errors.push("Número é obrigatório");
    }
    if (!address.neighborhood) {
      errors.push("Bairro é obrigatório");
    }
    if (!address.city) {
      errors.push("Cidade é obrigatória");
    }
    if (!address.state) {
      errors.push("Estado é obrigatório");
    }
    if (!address.zipCode) {
      errors.push("CEP é obrigatório");
    } else if (!this.isValidZipCode(address.zipCode)) {
      errors.push("CEP inválido");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private validatePaymentMethod(
    paymentMethod: PaymentMethod
  ): ValidationResult {
    const errors: string[] = [];

    if (!paymentMethod.type) {
      errors.push("Tipo de pagamento é obrigatório");
    }
    if (!paymentMethod.name) {
      errors.push("Nome do método de pagamento é obrigatório");
    }

    // Validar detalhes específicos baseado no tipo
    if (
      paymentMethod.type === "CREDIT_CARD" ||
      paymentMethod.type === "DEBIT_CARD"
    ) {
      if (!paymentMethod.details) {
        errors.push("Detalhes do cartão são obrigatórios");
      } else {
        const details = paymentMethod.details as any;
        if (!details.last4) {
          errors.push("Últimos 4 dígitos do cartão são obrigatórios");
        }
        if (!details.brand) {
          errors.push("Bandeira do cartão é obrigatória");
        }
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

  private isValidZipCode(zipCode: string): boolean {
    const cleanZipCode = zipCode.replace(/\D/g, "");
    return cleanZipCode.length === 8;
  }
}
