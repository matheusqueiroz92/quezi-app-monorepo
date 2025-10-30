/**
 * Repositório de Perfil de Profissional - Camada de Infraestrutura
 * 
 * Implementação concreta seguindo Clean Architecture
 * Compatível com o schema Prisma atual
 */

import { PrismaClient } from "@prisma/client";

export interface CreateProfessionalProfileData {
  userId: string;
  bio?: string;
  city: string;
  address?: string;
  serviceMode: "AT_LOCATION" | "AT_DOMICILE" | "BOTH";
  photoUrl?: string;
  portfolioImages?: string[];
  workingHours?: any;
  yearsOfExperience?: number;
  specialties?: string[];
  certifications?: string[];
  languages?: string[];
  isActive?: boolean;
  isVerified?: boolean;
}

export interface UpdateProfessionalProfileData {
  bio?: string;
  city?: string;
  address?: string;
  serviceMode?: "AT_LOCATION" | "AT_DOMICILE" | "BOTH";
  photoUrl?: string;
  portfolioImages?: string[];
  workingHours?: any;
  yearsOfExperience?: number;
  specialties?: string[];
  certifications?: string[];
  languages?: string[];
  isActive?: boolean;
  isVerified?: boolean;
}

export interface ProfessionalProfileFilters {
  city?: string;
  specialties?: string[];
  serviceMode?: "AT_LOCATION" | "AT_DOMICILE" | "BOTH";
  isActive?: boolean;
  isVerified?: boolean;
  minRating?: number;
}

export class ProfessionalProfileRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Cria perfil de profissional
   */
  async create(data: CreateProfessionalProfileData) {
    const profile = await this.prisma.professionalProfile.create({
      data: {
        userId: data.userId,
        bio: data.bio,
        city: data.city,
        address: data.address,
        serviceMode: data.serviceMode,
        photoUrl: data.photoUrl,
        portfolioImages: data.portfolioImages || [],
        workingHours: data.workingHours,
        yearsOfExperience: data.yearsOfExperience,
        specialties: data.specialties || [],
        certifications: data.certifications || [],
        languages: data.languages || [],
        isActive: data.isActive ?? true,
        isVerified: data.isVerified ?? false,
      },
    });

    return profile;
  }

  /**
   * Busca perfil por ID do usuário
   */
  async findByUserId(userId: string) {
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        services: true,
      },
    });

    return profile;
  }

  /**
   * Atualiza perfil de profissional
   */
  async updateByUserId(userId: string, data: UpdateProfessionalProfileData) {
    const profile = await this.prisma.professionalProfile.update({
      where: { userId },
      data: {
        bio: data.bio,
        city: data.city,
        address: data.address,
        serviceMode: data.serviceMode,
        photoUrl: data.photoUrl,
        portfolioImages: data.portfolioImages,
        workingHours: data.workingHours,
        yearsOfExperience: data.yearsOfExperience,
        specialties: data.specialties,
        certifications: data.certifications,
        languages: data.languages,
        isActive: data.isActive,
        isVerified: data.isVerified,
      },
      include: {
        user: true,
        services: true,
      },
    });

    return profile;
  }

  /**
   * Deleta perfil de profissional
   */
  async deleteByUserId(userId: string) {
    await this.prisma.professionalProfile.delete({
      where: { userId },
    });
  }

  /**
   * Lista perfis com filtros
   */
  async findMany(filters: ProfessionalProfileFilters & { skip?: number; take?: number }) {
    const where: any = {};

    if (filters.city) {
      where.city = { contains: filters.city, mode: "insensitive" };
    }

    if (filters.specialties && filters.specialties.length > 0) {
      where.specialties = { hasSome: filters.specialties };
    }

    if (filters.serviceMode) {
      where.serviceMode = filters.serviceMode;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.isVerified !== undefined) {
      where.isVerified = filters.isVerified;
    }

    if (filters.minRating !== undefined) {
      where.averageRating = { gte: filters.minRating };
    }

    const [profiles, total] = await Promise.all([
      this.prisma.professionalProfile.findMany({
        where,
        skip: filters.skip || 0,
        take: filters.take || 10,
        include: {
          user: true,
          services: true,
        },
        orderBy: { averageRating: "desc" },
      }),
      this.prisma.professionalProfile.count({ where }),
    ]);

    return {
      data: profiles,
      total,
      skip: filters.skip || 0,
      take: filters.take || 10,
    };
  }

  /**
   * Busca perfis por cidade
   */
  async findByCity(city: string) {
    return await this.prisma.professionalProfile.findMany({
      where: {
        city: { contains: city, mode: "insensitive" },
        isActive: true,
      },
      include: {
        user: true,
        services: true,
      },
      orderBy: { averageRating: "desc" },
    });
  }

  /**
   * Busca perfis por especialidade
   */
  async findBySpecialty(specialty: string) {
    return await this.prisma.professionalProfile.findMany({
      where: {
        specialties: { has: specialty },
        isActive: true,
      },
      include: {
        user: true,
        services: true,
      },
      orderBy: { averageRating: "desc" },
    });
  }

  /**
   * Atualiza rating do profissional
   */
  async updateRating(userId: string, newRating: number) {
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new Error("Perfil não encontrado");
    }

    const totalRatings = profile.totalRatings + 1;
    const averageRating = 
      (profile.averageRating * profile.totalRatings + newRating) / totalRatings;

    return await this.prisma.professionalProfile.update({
      where: { userId },
      data: {
        averageRating,
        totalRatings,
      },
    });
  }
}
