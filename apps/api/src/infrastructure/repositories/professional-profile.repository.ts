/**
 * Repositório de Perfil de Profissional - Camada de Infraestrutura
 *
 * Implementação concreta de IProfessionalProfileRepository
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { PrismaClient } from "@prisma/client";
import {
  IProfessionalProfileRepository,
  CreateProfessionalProfileData,
  UpdateProfessionalProfileData,
  ProfessionalProfileFilters,
  PaginatedResult,
} from "../../domain/interfaces/repository.interface";
import {
  IProfessionalProfile,
  WorkingHours,
  Certification,
} from "../../domain/interfaces/user.interface";
import { NotFoundError, BadRequestError } from "../../utils/app-error";

export class ProfessionalProfileRepository
  implements IProfessionalProfileRepository
{
  constructor(private prisma: PrismaClient) {}

  // ========================================
  // MÉTODOS BÁSICOS
  // ========================================

  async create(
    data: CreateProfessionalProfileData
  ): Promise<IProfessionalProfile> {
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

      return this.mapToEntity(profileData);
    } catch (error) {
      throw new BadRequestError(
        `Erro ao criar perfil de profissional: ${error}`
      );
    }
  }

  async findById(id: string): Promise<IProfessionalProfile | null> {
    try {
      const profileData = await this.prisma.professionalProfile.findUnique({
        where: { userId: id },
      });

      if (!profileData) {
        return null;
      }

      return this.mapToEntity(profileData);
    } catch (error) {
      throw new BadRequestError(
        `Erro ao buscar perfil de profissional: ${error}`
      );
    }
  }

  async update(
    id: string,
    data: UpdateProfessionalProfileData
  ): Promise<IProfessionalProfile> {
    try {
      const profileData = await this.prisma.professionalProfile.update({
        where: { userId: id },
        data: {
          cpf: data.cpf,
          cnpj: data.cnpj,
          address: data.address,
          city: data.city,
          serviceMode: data.serviceMode,
          specialties: data.specialties,
          workingHours: data.workingHours,
          certifications: data.certifications,
          portfolio: data.portfolio,
          isActive: data.isActive,
          isVerified: data.isVerified,
        },
      });

      return this.mapToEntity(profileData);
    } catch (error) {
      throw new BadRequestError(
        `Erro ao atualizar perfil de profissional: ${error}`
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.professionalProfile.delete({
        where: { userId: id },
      });
    } catch (error) {
      throw new BadRequestError(
        `Erro ao deletar perfil de profissional: ${error}`
      );
    }
  }

  // ========================================
  // MÉTODOS DE BUSCA
  // ========================================

  async findMany(
    filters: ProfessionalProfileFilters
  ): Promise<PaginatedResult<IProfessionalProfile>> {
    try {
      const {
        page = 1,
        limit = 10,
        city,
        serviceMode,
        specialties,
        isActive,
        isVerified,
      } = filters;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (city) {
        where.city = { contains: city, mode: "insensitive" };
      }

      if (serviceMode) {
        where.serviceMode = serviceMode;
      }

      if (specialties && specialties.length > 0) {
        where.specialties = {
          hasSome: specialties,
        };
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (isVerified !== undefined) {
        where.isVerified = isVerified;
      }

      const [profiles, total] = await Promise.all([
        this.prisma.professionalProfile.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.professionalProfile.count({ where }),
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
      throw new BadRequestError(
        `Erro ao listar perfis de profissional: ${error}`
      );
    }
  }

  async findByCPF(cpf: string): Promise<IProfessionalProfile | null> {
    try {
      const profileData = await this.prisma.professionalProfile.findUnique({
        where: { cpf },
      });

      if (!profileData) {
        return null;
      }

      return this.mapToEntity(profileData);
    } catch (error) {
      throw new BadRequestError(`Erro ao buscar perfil por CPF: ${error}`);
    }
  }

  async findByCNPJ(cnpj: string): Promise<IProfessionalProfile | null> {
    try {
      const profileData = await this.prisma.professionalProfile.findUnique({
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
  // MÉTODOS DE ESPECIALIDADES
  // ========================================

  async addSpecialty(
    profileId: string,
    specialty: string
  ): Promise<IProfessionalProfile> {
    try {
      const profile = await this.prisma.professionalProfile.findUnique({
        where: { userId: profileId },
      });

      if (!profile) {
        throw new NotFoundError("Perfil de profissional não encontrado");
      }

      const currentSpecialties = profile.specialties;
      if (!currentSpecialties.includes(specialty)) {
        const updatedSpecialties = [...currentSpecialties, specialty];

        const profileData = await this.prisma.professionalProfile.update({
          where: { userId: profileId },
          data: { specialties: updatedSpecialties },
        });

        return this.mapToEntity(profileData);
      }

      return this.mapToEntity(profile);
    } catch (error) {
      throw new BadRequestError(`Erro ao adicionar especialidade: ${error}`);
    }
  }

  async removeSpecialty(
    profileId: string,
    specialty: string
  ): Promise<IProfessionalProfile> {
    try {
      const profile = await this.prisma.professionalProfile.findUnique({
        where: { userId: profileId },
      });

      if (!profile) {
        throw new NotFoundError("Perfil de profissional não encontrado");
      }

      const currentSpecialties = profile.specialties;
      const updatedSpecialties = currentSpecialties.filter(
        (s) => s !== specialty
      );

      const profileData = await this.prisma.professionalProfile.update({
        where: { userId: profileId },
        data: { specialties: updatedSpecialties },
      });

      return this.mapToEntity(profileData);
    } catch (error) {
      throw new BadRequestError(`Erro ao remover especialidade: ${error}`);
    }
  }

  // ========================================
  // MÉTODOS DE CERTIFICAÇÕES
  // ========================================

  async addCertification(
    profileId: string,
    certification: Certification
  ): Promise<IProfessionalProfile> {
    try {
      const profile = await this.prisma.professionalProfile.findUnique({
        where: { userId: profileId },
      });

      if (!profile) {
        throw new NotFoundError("Perfil de profissional não encontrado");
      }

      const currentCertifications = profile.certifications as Certification[];
      const updatedCertifications = [...currentCertifications, certification];

      const profileData = await this.prisma.professionalProfile.update({
        where: { userId: profileId },
        data: { certifications: updatedCertifications },
      });

      return this.mapToEntity(profileData);
    } catch (error) {
      throw new BadRequestError(`Erro ao adicionar certificação: ${error}`);
    }
  }

  async removeCertification(
    profileId: string,
    certificationId: string
  ): Promise<IProfessionalProfile> {
    try {
      const profile = await this.prisma.professionalProfile.findUnique({
        where: { userId: profileId },
      });

      if (!profile) {
        throw new NotFoundError("Perfil de profissional não encontrado");
      }

      const currentCertifications = profile.certifications as Certification[];
      const updatedCertifications = currentCertifications.filter(
        (cert) => cert.id !== certificationId
      );

      const profileData = await this.prisma.professionalProfile.update({
        where: { userId: profileId },
        data: { certifications: updatedCertifications },
      });

      return this.mapToEntity(profileData);
    } catch (error) {
      throw new BadRequestError(`Erro ao remover certificação: ${error}`);
    }
  }

  async updateCertification(
    profileId: string,
    certificationId: string,
    certification: Certification
  ): Promise<IProfessionalProfile> {
    try {
      const profile = await this.prisma.professionalProfile.findUnique({
        where: { userId: profileId },
      });

      if (!profile) {
        throw new NotFoundError("Perfil de profissional não encontrado");
      }

      const currentCertifications = profile.certifications as Certification[];
      const updatedCertifications = currentCertifications.map((cert) =>
        cert.id === certificationId ? certification : cert
      );

      const profileData = await this.prisma.professionalProfile.update({
        where: { userId: profileId },
        data: { certifications: updatedCertifications },
      });

      return this.mapToEntity(profileData);
    } catch (error) {
      throw new BadRequestError(`Erro ao atualizar certificação: ${error}`);
    }
  }

  // ========================================
  // MÉTODOS DE PORTFÓLIO
  // ========================================

  async addPortfolioItem(
    profileId: string,
    portfolioItem: string
  ): Promise<IProfessionalProfile> {
    try {
      const profile = await this.prisma.professionalProfile.findUnique({
        where: { userId: profileId },
      });

      if (!profile) {
        throw new NotFoundError("Perfil de profissional não encontrado");
      }

      const currentPortfolio = profile.portfolio;
      if (!currentPortfolio.includes(portfolioItem)) {
        const updatedPortfolio = [...currentPortfolio, portfolioItem];

        const profileData = await this.prisma.professionalProfile.update({
          where: { userId: profileId },
          data: { portfolio: updatedPortfolio },
        });

        return this.mapToEntity(profileData);
      }

      return this.mapToEntity(profile);
    } catch (error) {
      throw new BadRequestError(
        `Erro ao adicionar item ao portfólio: ${error}`
      );
    }
  }

  async removePortfolioItem(
    profileId: string,
    portfolioItem: string
  ): Promise<IProfessionalProfile> {
    try {
      const profile = await this.prisma.professionalProfile.findUnique({
        where: { userId: profileId },
      });

      if (!profile) {
        throw new NotFoundError("Perfil de profissional não encontrado");
      }

      const currentPortfolio = profile.portfolio;
      const updatedPortfolio = currentPortfolio.filter(
        (item) => item !== portfolioItem
      );

      const profileData = await this.prisma.professionalProfile.update({
        where: { userId: profileId },
        data: { portfolio: updatedPortfolio },
      });

      return this.mapToEntity(profileData);
    } catch (error) {
      throw new BadRequestError(`Erro ao remover item do portfólio: ${error}`);
    }
  }

  // ========================================
  // MÉTODOS DE HORÁRIOS DE TRABALHO
  // ========================================

  async updateWorkingHours(
    profileId: string,
    workingHours: WorkingHours
  ): Promise<IProfessionalProfile> {
    try {
      const profileData = await this.prisma.professionalProfile.update({
        where: { userId: profileId },
        data: { workingHours: workingHours as any },
      });

      return this.mapToEntity(profileData);
    } catch (error) {
      throw new BadRequestError(
        `Erro ao atualizar horários de trabalho: ${error}`
      );
    }
  }

  // ========================================
  // MÉTODOS AUXILIARES
  // ========================================

  private mapToEntity(profileData: any): IProfessionalProfile {
    return {
      userId: profileData.userId,
      cpf: profileData.cpf,
      cnpj: profileData.cnpj,
      address: profileData.address,
      city: profileData.city,
      serviceMode: profileData.serviceMode,
      specialties: profileData.specialties,
      workingHours: profileData.workingHours as WorkingHours,
      certifications: profileData.certifications as Certification[],
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
  }
}
