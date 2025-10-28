/**
 * Entidade de Domínio - ClientProfile
 *
 * Seguindo os princípios DDD e Clean Architecture:
 * - Encapsulamento de lógica de negócio
 * - Validações no domínio
 * - Agregados bem definidos
 */

import {
  IClientProfile,
  Address,
  PaymentMethod,
  ClientPreferences,
} from "../interfaces/user.interface";

export class ClientProfile implements IClientProfile {
  private constructor(
    public readonly userId: string,
    public readonly cpf: string,
    public readonly addresses: Address[],
    public readonly paymentMethods: PaymentMethod[],
    public readonly favoriteServices: string[],
    public readonly preferences: ClientPreferences
  ) {}

  // Factory method para criar perfil de cliente
  public static create(data: CreateClientProfileData): ClientProfile {
    this.validateClientProfileData(data);

    return new ClientProfile(
      data.userId,
      data.cpf,
      data.addresses || [],
      data.paymentMethods || [],
      data.favoriteServices || [],
      data.preferences || this.getDefaultPreferences()
    );
  }

  // Factory method para reconstruir perfil do banco
  public static fromPersistence(
    data: ClientProfilePersistenceData
  ): ClientProfile {
    return new ClientProfile(
      data.userId,
      data.cpf,
      data.addresses,
      data.paymentMethods,
      data.favoriteServices,
      data.preferences
    );
  }

  // Métodos de domínio
  public addAddress(address: Address): void {
    ClientProfile.validateAddress(address);

    // Se é o primeiro endereço, torna-o padrão
    if (this.addresses.length === 0) {
      address.isDefault = true;
    }

    // Se este endereço é padrão, remove o padrão dos outros
    if (address.isDefault) {
      this.addresses.forEach((addr) => {
        if (addr.id !== address.id) {
          addr.isDefault = false;
        }
      });
    }

    this.addresses.push(address);
  }

  public removeAddress(addressId: string): void {
    const addressIndex = this.addresses.findIndex(
      (addr) => addr.id === addressId
    );

    if (addressIndex === -1) {
      throw new Error("Endereço não encontrado");
    }

    const address = this.addresses[addressIndex];

    // Se é o endereço padrão, torna outro como padrão
    if (address?.isDefault && this.addresses.length > 1) {
      const nextAddress = this.addresses.find((addr) => addr.id !== addressId);
      if (nextAddress) {
        nextAddress.isDefault = true;
      }
    }

    this.addresses.splice(addressIndex, 1);
  }

  public addPaymentMethod(method: PaymentMethod): void {
    ClientProfile.validatePaymentMethod(method);

    // Se é o primeiro método de pagamento, torna-o padrão
    if (this.paymentMethods.length === 0) {
      method.isDefault = true;
    }

    // Se este método é padrão, remove o padrão dos outros
    if (method.isDefault) {
      this.paymentMethods.forEach((pm) => {
        if (pm.id !== method.id) {
          pm.isDefault = false;
        }
      });
    }

    this.paymentMethods.push(method);
  }

  public removePaymentMethod(methodId: string): void {
    const methodIndex = this.paymentMethods.findIndex(
      (pm) => pm.id === methodId
    );

    if (methodIndex === -1) {
      throw new Error("Método de pagamento não encontrado");
    }

    const method = this.paymentMethods[methodIndex];

    // Se é o método padrão, torna outro como padrão
    if (method?.isDefault && this.paymentMethods.length > 1) {
      const nextMethod = this.paymentMethods.find((pm) => pm.id !== methodId);
      if (nextMethod) {
        nextMethod.isDefault = true;
      }
    }

    this.paymentMethods.splice(methodIndex, 1);
  }

  public addFavoriteService(serviceId: string): void {
    if (!serviceId) {
      throw new Error("ID do serviço é obrigatório");
    }

    if (this.favoriteServices.includes(serviceId)) {
      throw new Error("Serviço já está nos favoritos");
    }

    this.favoriteServices.push(serviceId);
  }

  public removeFavoriteService(serviceId: string): void {
    const serviceIndex = this.favoriteServices.indexOf(serviceId);

    if (serviceIndex === -1) {
      throw new Error("Serviço não está nos favoritos");
    }

    this.favoriteServices.splice(serviceIndex, 1);
  }

  public getDefaultAddress(): Address | null {
    return this.addresses.find((addr) => addr.isDefault) || null;
  }

  public getDefaultPaymentMethod(): PaymentMethod | null {
    return this.paymentMethods.find((pm) => pm.isDefault) || null;
  }

  public hasAddress(addressId: string): boolean {
    return this.addresses.some((addr) => addr.id === addressId);
  }

  public hasPaymentMethod(methodId: string): boolean {
    return this.paymentMethods.some((pm) => pm.id === methodId);
  }

  public isFavoriteService(serviceId: string): boolean {
    return this.favoriteServices.includes(serviceId);
  }

  // Validações de domínio
  private static validateClientProfileData(
    data: CreateClientProfileData
  ): void {
    if (!data.userId) {
      throw new Error("ID do usuário é obrigatório");
    }

    if (!data.cpf) {
      throw new Error("CPF é obrigatório");
    }

    if (!this.isValidCPF(data.cpf)) {
      throw new Error("CPF inválido");
    }

    if (data.addresses && data.addresses.length > 0) {
      data.addresses.forEach((address) => this.validateAddress(address));
    }

    if (data.paymentMethods && data.paymentMethods.length > 0) {
      data.paymentMethods.forEach((method) =>
        this.validatePaymentMethod(method)
      );
    }
  }

  private static validateAddress(address: Address): void {
    if (!address.id) {
      throw new Error("ID do endereço é obrigatório");
    }

    if (!address.street) {
      throw new Error("Rua é obrigatória");
    }

    if (!address.number) {
      throw new Error("Número é obrigatório");
    }

    if (!address.neighborhood) {
      throw new Error("Bairro é obrigatório");
    }

    if (!address.city) {
      throw new Error("Cidade é obrigatória");
    }

    if (!address.state) {
      throw new Error("Estado é obrigatório");
    }

    if (!address.zipCode) {
      throw new Error("CEP é obrigatório");
    }

    if (!this.isValidZipCode(address.zipCode)) {
      throw new Error("CEP inválido");
    }
  }

  private static validatePaymentMethod(method: PaymentMethod): void {
    if (!method.id) {
      throw new Error("ID do método de pagamento é obrigatório");
    }

    if (!method.type) {
      throw new Error("Tipo do método de pagamento é obrigatório");
    }

    if (!method.name) {
      throw new Error("Nome do método de pagamento é obrigatório");
    }

    const validTypes = ["credit_card", "debit_card", "pix", "bank_transfer"];
    if (!validTypes.includes(method.type)) {
      throw new Error("Tipo de método de pagamento inválido");
    }
  }

  private static isValidCPF(cpf: string): boolean {
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, "");

    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11) {
      return false;
    }

    // Verifica se todos os dígitos são iguais
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

  private static isValidZipCode(zipCode: string): boolean {
    const cleanZipCode = zipCode.replace(/\D/g, "");
    return cleanZipCode.length === 8;
  }

  private static getDefaultPreferences(): ClientPreferences {
    return {
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      marketing: false,
      language: "pt-BR",
      timezone: "America/Sao_Paulo",
    };
  }
}

// ========================================
// TYPES E INTERFACES
// ========================================

export interface CreateClientProfileData {
  userId: string;
  cpf: string;
  addresses?: Address[];
  paymentMethods?: PaymentMethod[];
  favoriteServices?: string[];
  preferences?: ClientPreferences;
}

export interface ClientProfilePersistenceData {
  userId: string;
  cpf: string;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  favoriteServices: string[];
  preferences: ClientPreferences;
}
