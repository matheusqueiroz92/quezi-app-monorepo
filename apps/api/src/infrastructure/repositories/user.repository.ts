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

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  // ========================================
  // MÉTODOS BÁSICOS DE USUÁRIO
  // ========================================

  async create(data: CreateUserData): Promise<IUser> {
    try {
      const userData = await this.prisma.user.create({
        data: {
          // id: data.id || undefined, // ID é gerado automaticamente pelo Prisma
          email: data.email,
          passwordHash: data.password, // Usar password em vez de passwordHash
          name: data.name,
          phone: data.phone,
          userType: data.userType as any,
          // isEmailVerified: data.isEmailVerified || false, // Campo não existe no schema
        },
      });

      return User.fromPersistence({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone || undefined,
        userType: userData.userType as any,
        isEmailVerified: userData.isEmailVerified,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        // lastLogin: null, // Campo não existe no schema atual
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
        phone: userData.phone || undefined,
        userType: userData.userType as any,
        isEmailVerified: userData.isEmailVerified,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        // lastLogin: null, // Campo não existe no schema atual
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
        // isEmailVerified, // Campo não existe no schema
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

      // if (isEmailVerified !== undefined) {
      //   where.isEmailVerified = isEmailVerified;
      // }

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
          phone: user.phone || undefined,
          userType: user.userType as any,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          // lastLogin: null, // Campo não existe no schema atual
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
          // email: data.email, // Email não pode ser alterado
          name: data.name,
          phone: data.phone,
          // userType: data.userType, // UserType não pode ser alterado
          // isEmailVerified: data.isEmailVerified, // Campo não existe no schema
          // lastLogin: data.lastLogin, // Campo não existe no schema
        },
      });

      return User.fromPersistence({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone || undefined,
        userType: userData.userType as any,
        isEmailVerified: userData.isEmailVerified,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        // lastLogin: null, // Campo não existe no schema atual
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
        phone: userData.phone || undefined,
        userType: userData.userType as any,
        isEmailVerified: userData.isEmailVerified,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        // lastLogin: null, // Campo não existe no schema atual
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
          phone: user.phone || undefined,
          userType: user.userType as any,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          // lastLogin: null, // Campo não existe no schema atual
        })
      );
    } catch (error) {
      throw new BadRequestError(`Erro ao buscar usuários por tipo: ${error}`);
    }
  }

  // ========================================
  // MÉTODOS DE PERFIL
  // ========================================

  // async createClientProfile(data: any): Promise<IClientProfile> {
  //   // TODO: Implementar quando o modelo clientProfile estiver disponível no schema
  //   throw new Error("Modelo clientProfile não está disponível no schema atual");
  // }

  // async createProfessionalProfile(data: any): Promise<IProfessionalProfile> {
  //   // TODO: Implementar quando o modelo professionalProfile estiver disponível no schema
  //   throw new Error("Modelo professionalProfile não está disponível no schema atual");
  // }

  // async createCompanyProfile(data: any): Promise<ICompanyProfile> {
  //   // TODO: Implementar quando o modelo companyProfile estiver disponível no schema
  //   throw new Error("Modelo companyProfile não está disponível no schema atual");
  // }
}
