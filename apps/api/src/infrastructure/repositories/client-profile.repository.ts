/**
 * Repositório de Perfil de Cliente - Camada de Infraestrutura
 *
 * Implementação concreta de IClientProfileRepository
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { PrismaClient } from "@prisma/client";
import {
  IClientProfileRepository,
  CreateClientProfileData,
  UpdateClientProfileData,
  ClientProfileFilters,
  PaginatedResult,
} from "../../domain/interfaces/repository.interface";
import {
  IClientProfile,
  Address,
  PaymentMethod,
} from "../../domain/interfaces/user.interface";
import { ClientProfile } from "../../domain/entities/client-profile.entity";
import { NotFoundError, BadRequestError } from "../../utils/app-error";

export class ClientProfileRepository implements IClientProfileRepository {
  constructor(private prisma: PrismaClient) {}

  // ========================================
  // MÉTODOS BÁSICOS
  // ========================================

  async create(data: CreateClientProfileData): Promise<IClientProfile> {
    try {
      const profileData = await this.prisma.clientProfile.create({
        data: {
          userId: data.userId,
          cpf: data.cpf,
          addresses: data.addresses || [],
          paymentMethods: data.paymentMethods || [],
          preferences: data.preferences || {},
        },
      });

      return ClientProfile.fromPersistence({
        userId: profileData.userId,
        cpf: profileData.cpf,
        addresses: profileData.addresses as Address[],
        paymentMethods: profileData.paymentMethods as PaymentMethod[],
        preferences: profileData.preferences as any,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
      });
    } catch (error) {
      throw new BadRequestError(`Erro ao criar perfil de cliente: ${error}`);
    }
  }

  async findById(id: string): Promise<IClientProfile | null> {
    try {
      const profileData = await this.prisma.clientProfile.findUnique({
        where: { userId: id },
      });

      if (!profileData) {
        return null;
      }

      return ClientProfile.fromPersistence({
        userId: profileData.userId,
        cpf: profileData.cpf,
        addresses: profileData.addresses as Address[],
        paymentMethods: profileData.paymentMethods as PaymentMethod[],
        preferences: profileData.preferences as any,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
      });
    } catch (error) {
      throw new BadRequestError(`Erro ao buscar perfil de cliente: ${error}`);
    }
  }

  async update(
    id: string,
    data: UpdateClientProfileData
  ): Promise<IClientProfile> {
    try {
      const profileData = await this.prisma.clientProfile.update({
        where: { userId: id },
        data: {
          cpf: data.cpf,
          addresses: data.addresses,
          paymentMethods: data.paymentMethods,
          preferences: data.preferences,
        },
      });

      return ClientProfile.fromPersistence({
        userId: profileData.userId,
        cpf: profileData.cpf,
        addresses: profileData.addresses as Address[],
        paymentMethods: profileData.paymentMethods as PaymentMethod[],
        preferences: profileData.preferences as any,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
      });
    } catch (error) {
      throw new BadRequestError(
        `Erro ao atualizar perfil de cliente: ${error}`
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.clientProfile.delete({
        where: { userId: id },
      });
    } catch (error) {
      throw new BadRequestError(`Erro ao deletar perfil de cliente: ${error}`);
    }
  }

  // ========================================
  // MÉTODOS DE BUSCA
  // ========================================

  async findMany(
    filters: ClientProfileFilters
  ): Promise<PaginatedResult<IClientProfile>> {
    try {
      const {
        page = 1,
        limit = 10,
        city,
        hasAddress,
        hasPaymentMethod,
      } = filters;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (city) {
        where.addresses = {
          some: {
            city: { contains: city, mode: "insensitive" },
          },
        };
      }

      if (hasAddress !== undefined) {
        if (hasAddress) {
          where.addresses = { some: {} };
        } else {
          where.addresses = { none: {} };
        }
      }

      if (hasPaymentMethod !== undefined) {
        if (hasPaymentMethod) {
          where.paymentMethods = { some: {} };
        } else {
          where.paymentMethods = { none: {} };
        }
      }

      const [profiles, total] = await Promise.all([
        this.prisma.clientProfile.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.clientProfile.count({ where }),
      ]);

      const profileEntities = profiles.map((profile) =>
        ClientProfile.fromPersistence({
          userId: profile.userId,
          cpf: profile.cpf,
          addresses: profile.addresses as Address[],
          paymentMethods: profile.paymentMethods as PaymentMethod[],
          preferences: profile.preferences as any,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        })
      );

      return {
        data: profileEntities,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new BadRequestError(`Erro ao listar perfis de cliente: ${error}`);
    }
  }

  async findByCPF(cpf: string): Promise<IClientProfile | null> {
    try {
      const profileData = await this.prisma.clientProfile.findUnique({
        where: { cpf },
      });

      if (!profileData) {
        return null;
      }

      return ClientProfile.fromPersistence({
        userId: profileData.userId,
        cpf: profileData.cpf,
        addresses: profileData.addresses as Address[],
        paymentMethods: profileData.paymentMethods as PaymentMethod[],
        preferences: profileData.preferences as any,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
      });
    } catch (error) {
      throw new BadRequestError(`Erro ao buscar perfil por CPF: ${error}`);
    }
  }

  // ========================================
  // MÉTODOS DE ENDEREÇOS
  // ========================================

  async addAddress(
    profileId: string,
    address: Address
  ): Promise<IClientProfile> {
    try {
      const profile = await this.prisma.clientProfile.findUnique({
        where: { userId: profileId },
      });

      if (!profile) {
        throw new NotFoundError("Perfil de cliente não encontrado");
      }

      const currentAddresses = profile.addresses as Address[];
      const updatedAddresses = [...currentAddresses, address];

      const profileData = await this.prisma.clientProfile.update({
        where: { userId: profileId },
        data: { addresses: updatedAddresses },
      });

      return ClientProfile.fromPersistence({
        userId: profileData.userId,
        cpf: profileData.cpf,
        addresses: profileData.addresses as Address[],
        paymentMethods: profileData.paymentMethods as PaymentMethod[],
        preferences: profileData.preferences as any,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
      });
    } catch (error) {
      throw new BadRequestError(`Erro ao adicionar endereço: ${error}`);
    }
  }

  async removeAddress(
    profileId: string,
    addressId: string
  ): Promise<IClientProfile> {
    try {
      const profile = await this.prisma.clientProfile.findUnique({
        where: { userId: profileId },
      });

      if (!profile) {
        throw new NotFoundError("Perfil de cliente não encontrado");
      }

      const currentAddresses = profile.addresses as Address[];
      const updatedAddresses = currentAddresses.filter(
        (addr) => addr.id !== addressId
      );

      const profileData = await this.prisma.clientProfile.update({
        where: { userId: profileId },
        data: { addresses: updatedAddresses },
      });

      return ClientProfile.fromPersistence({
        userId: profileData.userId,
        cpf: profileData.cpf,
        addresses: profileData.addresses as Address[],
        paymentMethods: profileData.paymentMethods as PaymentMethod[],
        preferences: profileData.preferences as any,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
      });
    } catch (error) {
      throw new BadRequestError(`Erro ao remover endereço: ${error}`);
    }
  }

  async updateAddress(
    profileId: string,
    addressId: string,
    address: Address
  ): Promise<IClientProfile> {
    try {
      const profile = await this.prisma.clientProfile.findUnique({
        where: { userId: profileId },
      });

      if (!profile) {
        throw new NotFoundError("Perfil de cliente não encontrado");
      }

      const currentAddresses = profile.addresses as Address[];
      const updatedAddresses = currentAddresses.map((addr) =>
        addr.id === addressId ? address : addr
      );

      const profileData = await this.prisma.clientProfile.update({
        where: { userId: profileId },
        data: { addresses: updatedAddresses },
      });

      return ClientProfile.fromPersistence({
        userId: profileData.userId,
        cpf: profileData.cpf,
        addresses: profileData.addresses as Address[],
        paymentMethods: profileData.paymentMethods as PaymentMethod[],
        preferences: profileData.preferences as any,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
      });
    } catch (error) {
      throw new BadRequestError(`Erro ao atualizar endereço: ${error}`);
    }
  }

  // ========================================
  // MÉTODOS DE MÉTODOS DE PAGAMENTO
  // ========================================

  async addPaymentMethod(
    profileId: string,
    paymentMethod: PaymentMethod
  ): Promise<IClientProfile> {
    try {
      const profile = await this.prisma.clientProfile.findUnique({
        where: { userId: profileId },
      });

      if (!profile) {
        throw new NotFoundError("Perfil de cliente não encontrado");
      }

      const currentPaymentMethods = profile.paymentMethods as PaymentMethod[];
      const updatedPaymentMethods = [...currentPaymentMethods, paymentMethod];

      const profileData = await this.prisma.clientProfile.update({
        where: { userId: profileId },
        data: { paymentMethods: updatedPaymentMethods },
      });

      return ClientProfile.fromPersistence({
        userId: profileData.userId,
        cpf: profileData.cpf,
        addresses: profileData.addresses as Address[],
        paymentMethods: profileData.paymentMethods as PaymentMethod[],
        preferences: profileData.preferences as any,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
      });
    } catch (error) {
      throw new BadRequestError(
        `Erro ao adicionar método de pagamento: ${error}`
      );
    }
  }

  async removePaymentMethod(
    profileId: string,
    paymentMethodId: string
  ): Promise<IClientProfile> {
    try {
      const profile = await this.prisma.clientProfile.findUnique({
        where: { userId: profileId },
      });

      if (!profile) {
        throw new NotFoundError("Perfil de cliente não encontrado");
      }

      const currentPaymentMethods = profile.paymentMethods as PaymentMethod[];
      const updatedPaymentMethods = currentPaymentMethods.filter(
        (pm) => pm.id !== paymentMethodId
      );

      const profileData = await this.prisma.clientProfile.update({
        where: { userId: profileId },
        data: { paymentMethods: updatedPaymentMethods },
      });

      return ClientProfile.fromPersistence({
        userId: profileData.userId,
        cpf: profileData.cpf,
        addresses: profileData.addresses as Address[],
        paymentMethods: profileData.paymentMethods as PaymentMethod[],
        preferences: profileData.preferences as any,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
      });
    } catch (error) {
      throw new BadRequestError(
        `Erro ao remover método de pagamento: ${error}`
      );
    }
  }

  async updatePaymentMethod(
    profileId: string,
    paymentMethodId: string,
    paymentMethod: PaymentMethod
  ): Promise<IClientProfile> {
    try {
      const profile = await this.prisma.clientProfile.findUnique({
        where: { userId: profileId },
      });

      if (!profile) {
        throw new NotFoundError("Perfil de cliente não encontrado");
      }

      const currentPaymentMethods = profile.paymentMethods as PaymentMethod[];
      const updatedPaymentMethods = currentPaymentMethods.map((pm) =>
        pm.id === paymentMethodId ? paymentMethod : pm
      );

      const profileData = await this.prisma.clientProfile.update({
        where: { userId: profileId },
        data: { paymentMethods: updatedPaymentMethods },
      });

      return ClientProfile.fromPersistence({
        userId: profileData.userId,
        cpf: profileData.cpf,
        addresses: profileData.addresses as Address[],
        paymentMethods: profileData.paymentMethods as PaymentMethod[],
        preferences: profileData.preferences as any,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
      });
    } catch (error) {
      throw new BadRequestError(
        `Erro ao atualizar método de pagamento: ${error}`
      );
    }
  }
}
