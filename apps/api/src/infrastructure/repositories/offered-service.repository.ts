import { PrismaClient } from "@prisma/client";
import { IOfferedServiceRepository } from "../../domain/interfaces/repository.interface";

export class OfferedServiceRepository implements IOfferedServiceRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: any): Promise<any> {
    const service = await this.prisma.service.create({
      data: {
        professionalId: data.professionalId,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        priceType: data.priceType || "FIXED",
        durationMinutes: data.durationMinutes || 60,
      },
      include: {
        professional: {
          select: {
            userId: true,
            bio: true,
            city: true,
            serviceMode: true,
            averageRating: true,
            specialties: true,
            isActive: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return service;
  }

  async findById(id: string): Promise<any | null> {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        professional: {
          select: {
            userId: true,
            bio: true,
            city: true,
            serviceMode: true,
            averageRating: true,
            specialties: true,
            isActive: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return service;
  }

  async findByUserId(userId: string): Promise<any[]> {
    const services = await this.prisma.service.findMany({
      where: { professionalId: userId },
      include: {
        professional: {
          select: {
            userId: true,
            bio: true,
            city: true,
            serviceMode: true,
            averageRating: true,
            specialties: true,
            isActive: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return services;
  }

  async findByProfessionalId(professionalId: string): Promise<any[]> {
    const services = await this.prisma.service.findMany({
      where: { professionalId },
      include: {
        professional: {
          select: {
            userId: true,
            bio: true,
            city: true,
            serviceMode: true,
            averageRating: true,
            specialties: true,
            isActive: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return services;
  }

  async findByCompanyEmployeeId(companyEmployeeId: string): Promise<any[]> {
    // Para funcionários da empresa, usamos CompanyService
    const services = await this.prisma.companyService.findMany({
      where: { companyId: companyEmployeeId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return services;
  }

  async update(id: string, data: any): Promise<any> {
    const service = await this.prisma.service.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        priceType: data.priceType,
        durationMinutes: data.durationMinutes,
      },
      include: {
        professional: {
          select: {
            userId: true,
            bio: true,
            city: true,
            serviceMode: true,
            averageRating: true,
            specialties: true,
            isActive: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return service;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.service.delete({
      where: { id },
    });
  }

  async findByCategory(categoryId: string): Promise<any[]> {
    const services = await this.prisma.service.findMany({
      where: { categoryId },
      include: {
        professional: {
          select: {
            userId: true,
            bio: true,
            city: true,
            serviceMode: true,
            averageRating: true,
            specialties: true,
            isActive: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return services;
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<any[]> {
    const services = await this.prisma.service.findMany({
      where: {
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
      },
      include: {
        professional: {
          select: {
            userId: true,
            bio: true,
            city: true,
            serviceMode: true,
            averageRating: true,
            specialties: true,
            isActive: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { price: "asc" },
    });

    return services;
  }

  async search(query: string): Promise<any[]> {
    const services = await this.prisma.service.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        professional: {
          select: {
            userId: true,
            bio: true,
            city: true,
            serviceMode: true,
            averageRating: true,
            specialties: true,
            isActive: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return services;
  }

  async findMany(filters: any = {}): Promise<any[]> {
    const where: any = {};

    if (filters.professionalId) {
      where.professionalId = filters.professionalId;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.minPrice && filters.maxPrice) {
      where.price = {
        gte: filters.minPrice,
        lte: filters.maxPrice,
      };
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const services = await this.prisma.service.findMany({
      where,
      include: {
        professional: {
          select: {
            userId: true,
            bio: true,
            city: true,
            serviceMode: true,
            averageRating: true,
            specialties: true,
            isActive: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: filters.skip || 0,
      take: filters.take || 10,
    });

    return services;
  }

  async count(filters: any = {}): Promise<number> {
    const where: any = {};

    if (filters.professionalId) {
      where.professionalId = filters.professionalId;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.minPrice && filters.maxPrice) {
      where.price = {
        gte: filters.minPrice,
        lte: filters.maxPrice,
      };
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return await this.prisma.service.count({ where });
  }
}
