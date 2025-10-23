/**
 * Repositório de Perfil de Empresa - Camada de Infraestrutura
 *
 * Implementação concreta de ICompanyProfileRepository
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { PrismaClient } from "@prisma/client";
import {
  ICompanyProfileRepository,
  CreateCompanyProfileData,
  UpdateCompanyProfileData,
  CompanyProfileFilters,
  PaginatedResult,
} from "../../domain/interfaces/repository.interface";
import {
  ICompanyProfile,
  BusinessHours,
} from "../../domain/interfaces/user.interface";
import { NotFoundError, BadRequestError } from "../../utils/app-error";

export class CompanyProfileRepository implements ICompanyProfileRepository {
  constructor(private prisma: PrismaClient) {}

  // ========================================
  // MÉTODOS BÁSICOS
  // ========================================

  async create(data: CreateCompanyProfileData): Promise<ICompanyProfile> {
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

      return this.mapToEntity(profileData);
    } catch (error) {
      throw new BadRequestError(`Erro ao criar perfil de empresa: ${error}`);
    }
  }

  async findById(id: string): Promise<ICompanyProfile | null> {
    try {
      const profileData = await this.prisma.companyProfile.findUnique({
        where: { userId: id },
      });

      if (!profileData) {
        return null;
      }

      return this.mapToEntity(profileData);
    } catch (error) {
      throw new BadRequestError(`Erro ao buscar perfil de empresa: ${error}`);
    }
  }

  async update(
    id: string,
    data: UpdateCompanyProfileData
  ): Promise<ICompanyProfile> {
    try {
      const profileData = await this.prisma.companyProfile.update({
        where: { userId: id },
        data: {
          cnpj: data.cnpj,
          address: data.address,
          city: data.city,
          businessHours: data.businessHours,
          description: data.description,
          photos: data.photos,
          isActive: data.isActive,
          isVerified: data.isVerified,
        },
      });

      return this.mapToEntity(profileData);
    } catch (error) {
      throw new BadRequestError(
        `Erro ao atualizar perfil de empresa: ${error}`
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.companyProfile.delete({
        where: { userId: id },
      });
    } catch (error) {
      throw new BadRequestError(`Erro ao deletar perfil de empresa: ${error}`);
    }
  }

  // ========================================
  // MÉTODOS DE BUSCA
  // ========================================

  async findMany(
    filters: CompanyProfileFilters
  ): Promise<PaginatedResult<ICompanyProfile>> {
    try {
      const { page = 1, limit = 10, city, isActive, isVerified } = filters;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (city) {
        where.city = { contains: city, mode: "insensitive" };
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (isVerified !== undefined) {
        where.isVerified = isVerified;
      }

      const [profiles, total] = await Promise.all([
        this.prisma.companyProfile.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.companyProfile.count({ where }),
      ]);

      const profileEntities = profiles.map((profile) =>
        this.mapToEntity(profile)
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
      throw new BadRequestError(`Erro ao listar perfis de empresa: ${error}`);
    }
  }

  async findByCNPJ(cnpj: string): Promise<ICompanyProfile | null> {
    try {
      const profileData = await this.prisma.companyProfile.findUnique({
        where: { cnpj },
      });

      if (!profileData) {
        return null;
      }

      return this.mapToEntity(profileData);
    } catch (error) {
      throw new BadRequestError(`Erro ao buscar perfil por CNPJ: ${error}`);
    }
  }

  // ========================================
  // MÉTODOS DE FOTOS
  // ========================================

  async addPhoto(
    profileId: string,
    photoUrl: string
  ): Promise<ICompanyProfile> {
    try {
      const profile = await this.prisma.companyProfile.findUnique({
        where: { userId: profileId },
      });

      if (!profile) {
        throw new NotFoundError("Perfil de empresa não encontrado");
      }

      const currentPhotos = profile.photos;
      if (!currentPhotos.includes(photoUrl)) {
        const updatedPhotos = [...currentPhotos, photoUrl];

        const profileData = await this.prisma.companyProfile.update({
          where: { userId: profileId },
          data: { photos: updatedPhotos },
        });

        return this.mapToEntity(profileData);
      }

      return this.mapToEntity(profile);
    } catch (error) {
      throw new BadRequestError(`Erro ao adicionar foto: ${error}`);
    }
  }

  async removePhoto(
    profileId: string,
    photoUrl: string
  ): Promise<ICompanyProfile> {
    try {
      const profile = await this.prisma.companyProfile.findUnique({
        where: { userId: profileId },
      });

      if (!profile) {
        throw new NotFoundError("Perfil de empresa não encontrado");
      }

      const currentPhotos = profile.photos;
      const updatedPhotos = currentPhotos.filter((photo) => photo !== photoUrl);

      const profileData = await this.prisma.companyProfile.update({
        where: { userId: profileId },
        data: { photos: updatedPhotos },
      });

      return this.mapToEntity(profileData);
    } catch (error) {
      throw new BadRequestError(`Erro ao remover foto: ${error}`);
    }
  }

  // ========================================
  // MÉTODOS DE HORÁRIOS DE FUNCIONAMENTO
  // ========================================

  async updateBusinessHours(
    profileId: string,
    businessHours: BusinessHours
  ): Promise<ICompanyProfile> {
    try {
      const profileData = await this.prisma.companyProfile.update({
        where: { userId: profileId },
        data: { businessHours: businessHours as any },
      });

      return this.mapToEntity(profileData);
    } catch (error) {
      throw new BadRequestError(
        `Erro ao atualizar horários de funcionamento: ${error}`
      );
    }
  }

  // ========================================
  // MÉTODOS DE FUNCIONÁRIOS
  // ========================================

  async getEmployees(profileId: string): Promise<any[]> {
    try {
      const employees = await this.prisma.companyEmployee.findMany({
        where: { companyId: profileId },
        orderBy: { createdAt: "desc" },
      });

      return employees;
    } catch (error) {
      throw new BadRequestError(`Erro ao buscar funcionários: ${error}`);
    }
  }

  async addEmployee(profileId: string, employeeData: any): Promise<any> {
    try {
      const employee = await this.prisma.companyEmployee.create({
        data: {
          companyId: profileId,
          name: employeeData.name,
          email: employeeData.email,
          phone: employeeData.phone,
          position: employeeData.position,
          specialties: employeeData.specialties || [],
          workingHours: employeeData.workingHours || {},
        },
      });

      return employee;
    } catch (error) {
      throw new BadRequestError(`Erro ao adicionar funcionário: ${error}`);
    }
  }

  async removeEmployee(profileId: string, employeeId: string): Promise<void> {
    try {
      await this.prisma.companyEmployee.delete({
        where: {
          id: employeeId,
          companyId: profileId,
        },
      });
    } catch (error) {
      throw new BadRequestError(`Erro ao remover funcionário: ${error}`);
    }
  }

  // ========================================
  // MÉTODOS AUXILIARES
  // ========================================

  private mapToEntity(profileData: any): ICompanyProfile {
    return {
      userId: profileData.userId,
      cnpj: profileData.cnpj,
      address: profileData.address,
      city: profileData.city,
      businessHours: profileData.businessHours as BusinessHours,
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
  }
}
