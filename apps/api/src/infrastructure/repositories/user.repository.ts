/**
 * Repositório de Usuários - Camada de Infraestrutura
 *
 * Implementação concreta de IUserRepository
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { PrismaClient } from "@prisma/client";
import {
  IUserRepository,
  CreateUserData,
  UpdateUserData,
  UserFilters,
  PaginatedResult,
} from "../../domain/interfaces/repository.interface";
import {
  IUser,
  IClientProfile,
  IProfessionalProfile,
  ICompanyProfile,
} from "../../domain/interfaces/user.interface";
import { User } from "../../domain/entities/user.entity";
import { ClientProfile } from "../../domain/entities/client-profile.entity";
import { NotFoundError, BadRequestError } from "../../utils/app-error";

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  // ========================================
  // MÉTODOS BÁSICOS DE USUÁRIO
  // ========================================

  async create(data: CreateUserData): Promise<IUser> {
    try {
      const userData = await this.prisma.user.create({
        data: {
          id: data.id || undefined,
          email: data.email,
          passwordHash: data.passwordHash,
          name: data.name,
          phone: data.phone,
          userType: data.userType,
          isEmailVerified: data.isEmailVerified || false,
        },
      });

      return User.fromPersistence({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        userType: userData.userType,
        isEmailVerified: userData.isEmailVerified,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        lastLogin: userData.lastLogin,
      });
    } catch (error) {
      throw new BadRequestError(`Erro ao criar usuário: ${error}`);
    }
  }

  async findById(id: string): Promise<IUser | null> {
    try {
      const userData = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!userData) {
        return null;
      }

      return User.fromPersistence({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        userType: userData.userType,
        isEmailVerified: userData.isEmailVerified,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        lastLogin: userData.lastLogin,
      });
    } catch (error) {
      throw new BadRequestError(`Erro ao buscar usuário: ${error}`);
    }
  }

  async findMany(filters: UserFilters): Promise<PaginatedResult<IUser>> {
    try {
      const {
        page = 1,
        limit = 10,
        userType,
        search,
        isEmailVerified,
      } = filters;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (userType) {
        where.userType = userType;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      if (isEmailVerified !== undefined) {
        where.isEmailVerified = isEmailVerified;
      }

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.user.count({ where }),
      ]);

      const userEntities = users.map((user) =>
        User.fromPersistence({
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          userType: user.userType,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLogin: user.lastLogin,
        })
      );

      return {
        data: userEntities,
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
      throw new BadRequestError(`Erro ao listar usuários: ${error}`);
    }
  }

  async update(id: string, data: UpdateUserData): Promise<IUser> {
    try {
      const userData = await this.prisma.user.update({
        where: { id },
        data: {
          email: data.email,
          name: data.name,
          phone: data.phone,
          userType: data.userType,
          isEmailVerified: data.isEmailVerified,
          lastLogin: data.lastLogin,
        },
      });

      return User.fromPersistence({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        userType: userData.userType,
        isEmailVerified: userData.isEmailVerified,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        lastLogin: userData.lastLogin,
      });
    } catch (error) {
      throw new BadRequestError(`Erro ao atualizar usuário: ${error}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestError(`Erro ao deletar usuário: ${error}`);
    }
  }

  // ========================================
  // MÉTODOS DE BUSCA
  // ========================================

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      const userData = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!userData) {
        return null;
      }

      return User.fromPersistence({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        userType: userData.userType,
        isEmailVerified: userData.isEmailVerified,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        lastLogin: userData.lastLogin,
      });
    } catch (error) {
      throw new BadRequestError(`Erro ao buscar usuário por email: ${error}`);
    }
  }

  async findByUserType(userType: string): Promise<IUser[]> {
    try {
      const users = await this.prisma.user.findMany({
        where: { userType: userType as any },
        orderBy: { createdAt: "desc" },
      });

      return users.map((user) =>
        User.fromPersistence({
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          userType: user.userType,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLogin: user.lastLogin,
        })
      );
    } catch (error) {
      throw new BadRequestError(`Erro ao buscar usuários por tipo: ${error}`);
    }
  }

  // ========================================
  // MÉTODOS DE PERFIL
  // ========================================

  async createClientProfile(data: any): Promise<IClientProfile> {
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
        addresses: profileData.addresses as any[],
        paymentMethods: profileData.paymentMethods as any[],
        preferences: profileData.preferences as any,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
      });
    } catch (error) {
      throw new BadRequestError(`Erro ao criar perfil de cliente: ${error}`);
    }
  }

  async createProfessionalProfile(data: any): Promise<IProfessionalProfile> {
    try {
      const profileData = await this.prisma.professionalProfile.create({
        data: {
          userId: data.userId,
          cpf: data.cpf,
          cnpj: data.cnpj,
          address: data.address,
          city: data.city,
          serviceMode: data.serviceMode,
          specialties: data.specialties || [],
          workingHours: data.workingHours || {},
          certifications: data.certifications || [],
          portfolio: data.portfolio || [],
        },
      });

      return {
        userId: profileData.userId,
        cpf: profileData.cpf,
        cnpj: profileData.cnpj,
        address: profileData.address,
        city: profileData.city,
        serviceMode: profileData.serviceMode,
        specialties: profileData.specialties,
        workingHours: profileData.workingHours as any,
        certifications: profileData.certifications as any[],
        portfolio: profileData.portfolio,
        averageRating: profileData.averageRating,
        totalRatings: profileData.totalRatings,
        isActive: profileData.isActive,
        isVerified: profileData.isVerified,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,

        // Métodos de domínio
        addSpecialty: jest.fn(),
        removeSpecialty: jest.fn(),
        addCertification: jest.fn(),
        removeCertification: jest.fn(),
        updateCertification: jest.fn(),
        addPortfolioItem: jest.fn(),
        removePortfolioItem: jest.fn(),
        updateWorkingHours: jest.fn(),
      };
    } catch (error) {
      throw new BadRequestError(
        `Erro ao criar perfil de profissional: ${error}`
      );
    }
  }

  async createCompanyProfile(data: any): Promise<ICompanyProfile> {
    try {
      const profileData = await this.prisma.companyProfile.create({
        data: {
          userId: data.userId,
          cnpj: data.cnpj,
          address: data.address,
          city: data.city,
          businessHours: data.businessHours || {},
          description: data.description,
          photos: data.photos || [],
        },
      });

      return {
        userId: profileData.userId,
        cnpj: profileData.cnpj,
        address: profileData.address,
        city: profileData.city,
        businessHours: profileData.businessHours as any,
        description: profileData.description,
        photos: profileData.photos,
        averageRating: profileData.averageRating,
        totalRatings: profileData.totalRatings,
        isActive: profileData.isActive,
        isVerified: profileData.isVerified,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,

        // Métodos de domínio
        addPhoto: jest.fn(),
        removePhoto: jest.fn(),
        updateBusinessHours: jest.fn(),
        addEmployee: jest.fn(),
        removeEmployee: jest.fn(),
        getEmployees: jest.fn(),
      };
    } catch (error) {
      throw new BadRequestError(`Erro ao criar perfil de empresa: ${error}`);
    }
  }
}
