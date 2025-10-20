import { PrismaClient, Prisma } from "@prisma/client";
import { AppError } from "../../utils/app-error";
import {
  CreateProfileInput,
  UpdateProfileInput,
  GetProfilesQuery,
  SearchProfilesQuery,
} from "./profiles.schema";

export class ProfilesRepository {
  constructor(private prisma: PrismaClient) {}

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  async create(data: CreateProfileInput) {
    try {
      // Verificar se usuário existe e é PROFESSIONAL
      const user = await this.prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (!user) {
        throw new AppError("Usuário não encontrado", 404);
      }

      if (user.userType !== "PROFESSIONAL") {
        throw new AppError(
          "Apenas usuários profissionais podem ter perfil",
          400
        );
      }

      // Verificar se já existe perfil para este usuário
      const existingProfile = await this.prisma.professionalProfile.findUnique({
        where: { userId: data.userId },
      });

      if (existingProfile) {
        throw new AppError("Perfil profissional já existe para este usuário", 409);
      }

      // Criar perfil
      const profile = await this.prisma.professionalProfile.create({
        data: {
          userId: data.userId,
          bio: data.bio,
          city: data.city,
          address: data.address,
          serviceMode: data.serviceMode,
          photoUrl: data.photoUrl,
          portfolioImages: data.portfolioImages || [],
          workingHours: data.workingHours
            ? (data.workingHours as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          yearsOfExperience: data.yearsOfExperience,
          specialties: data.specialties || [],
          certifications: data.certifications || [],
          languages: data.languages || [],
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          services: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      });

      return profile;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao criar perfil profissional", 500);
    }
  }

  async findById(userId: string) {
    try {
      const profile = await this.prisma.professionalProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          services: {
            include: {
              category: true,
            },
          },
        },
      });

      if (!profile) {
        throw new AppError("Perfil profissional não encontrado", 404);
      }

      return profile;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar perfil profissional", 500);
    }
  }

  async findMany(query: GetProfilesQuery) {
    try {
      const {
        page,
        limit,
        city,
        serviceMode,
        minRating,
        specialty,
        isActive,
        isVerified,
        sortBy,
        sortOrder,
      } = query;

      const where: Prisma.ProfessionalProfileWhereInput = {};

      if (city) where.city = { contains: city, mode: "insensitive" };
      if (serviceMode) where.serviceMode = serviceMode;
      if (minRating) where.averageRating = { gte: minRating };
      if (specialty) {
        where.specialties = { has: specialty };
      }
      if (isActive !== undefined) where.isActive = isActive;
      if (isVerified !== undefined) where.isVerified = isVerified;

      // Ordenação
      const orderBy: Prisma.ProfessionalProfileOrderByWithRelationInput = {};
      switch (sortBy) {
        case "rating":
          orderBy.averageRating = sortOrder;
          break;
        case "experience":
          orderBy.yearsOfExperience = sortOrder;
          break;
        case "reviews":
          orderBy.totalRatings = sortOrder;
          break;
        case "createdAt":
          orderBy.createdAt = sortOrder;
          break;
      }

      const [profiles, total] = await Promise.all([
        this.prisma.professionalProfile.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            services: {
              select: {
                id: true,
                name: true,
                price: true,
              },
              take: 5, // Apenas primeiros 5 serviços
            },
          },
        }),
        this.prisma.professionalProfile.count({ where }),
      ]);

      return {
        profiles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new AppError("Erro ao buscar perfis profissionais", 500);
    }
  }

  async search(query: SearchProfilesQuery) {
    try {
      const { query: searchQuery, city, serviceMode, page, limit } = query;

      const where: Prisma.ProfessionalProfileWhereInput = {
        isActive: true,
        OR: [
          { user: { name: { contains: searchQuery, mode: "insensitive" } } },
          { bio: { contains: searchQuery, mode: "insensitive" } },
          { specialties: { has: searchQuery } },
        ],
      };

      if (city) where.city = { contains: city, mode: "insensitive" };
      if (serviceMode) where.serviceMode = serviceMode;

      const [profiles, total] = await Promise.all([
        this.prisma.professionalProfile.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {
            averageRating: "desc",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            services: {
              select: {
                id: true,
                name: true,
                price: true,
              },
              take: 3,
            },
          },
        }),
        this.prisma.professionalProfile.count({ where }),
      ]);

      return {
        profiles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new AppError("Erro ao buscar perfis profissionais", 500);
    }
  }

  async update(userId: string, data: UpdateProfileInput) {
    try {
      const profile = await this.prisma.professionalProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        throw new AppError("Perfil profissional não encontrado", 404);
      }

      const updatedProfile = await this.prisma.professionalProfile.update({
        where: { userId },
        data: {
          bio: data.bio,
          city: data.city,
          address: data.address,
          serviceMode: data.serviceMode,
          photoUrl: data.photoUrl,
          portfolioImages: data.portfolioImages,
          workingHours: data.workingHours
            ? (data.workingHours as Prisma.InputJsonValue)
            : undefined,
          yearsOfExperience: data.yearsOfExperience,
          specialties: data.specialties,
          certifications: data.certifications,
          languages: data.languages,
          isActive: data.isActive,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          services: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      });

      return updatedProfile;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar perfil profissional", 500);
    }
  }

  async delete(userId: string) {
    try {
      const profile = await this.prisma.professionalProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        throw new AppError("Perfil profissional não encontrado", 404);
      }

      await this.prisma.professionalProfile.delete({
        where: { userId },
      });

      return { success: true };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao deletar perfil profissional", 500);
    }
  }

  // ========================================
  // SPECIFIC OPERATIONS
  // ========================================

  async updatePortfolio(userId: string, portfolioImages: string[]) {
    try {
      const profile = await this.prisma.professionalProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        throw new AppError("Perfil profissional não encontrado", 404);
      }

      const updatedProfile = await this.prisma.professionalProfile.update({
        where: { userId },
        data: { portfolioImages },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return updatedProfile;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar portfólio", 500);
    }
  }

  async updateWorkingHours(userId: string, workingHours: any) {
    try {
      const profile = await this.prisma.professionalProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        throw new AppError("Perfil profissional não encontrado", 404);
      }

      const updatedProfile = await this.prisma.professionalProfile.update({
        where: { userId },
        data: {
          workingHours: workingHours as Prisma.InputJsonValue,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return updatedProfile;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar horários de trabalho", 500);
    }
  }

  async toggleActive(userId: string, isActive: boolean) {
    try {
      const profile = await this.prisma.professionalProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        throw new AppError("Perfil profissional não encontrado", 404);
      }

      const updatedProfile = await this.prisma.professionalProfile.update({
        where: { userId },
        data: { isActive },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return updatedProfile;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao alterar status do perfil", 500);
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  async exists(userId: string): Promise<boolean> {
    try {
      const profile = await this.prisma.professionalProfile.findUnique({
        where: { userId },
        select: { userId: true },
      });

      return !!profile;
    } catch (error) {
      return false;
    }
  }

  async countByCity(city: string): Promise<number> {
    try {
      return await this.prisma.professionalProfile.count({
        where: {
          city: { contains: city, mode: "insensitive" },
          isActive: true,
        },
      });
    } catch (error) {
      return 0;
    }
  }

  async getTopRated(limit: number = 10) {
    try {
      return await this.prisma.professionalProfile.findMany({
        where: {
          isActive: true,
          totalRatings: { gte: 5 }, // Pelo menos 5 avaliações
        },
        orderBy: {
          averageRating: "desc",
        },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      throw new AppError("Erro ao buscar perfis mais bem avaliados", 500);
    }
  }
}

