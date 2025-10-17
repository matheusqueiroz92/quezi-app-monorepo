import { Prisma, Service, Category } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import type {
  CreateServiceInput,
  UpdateServiceInput,
  GetServicesQuery,
  PaginatedResponse,
} from "./services.schema";

/**
 * Repository para operações de banco de dados relacionadas a serviços
 */
export class ServicesRepository {
  /**
   * Cria um novo serviço
   */
  async create(data: CreateServiceInput & { professionalId: string }): Promise<Service> {
    return prisma.service.create({
      data: {
        ...data,
        price: new Prisma.Decimal(data.price),
      },
    });
  }

  /**
   * Busca um serviço por ID
   */
  async findById(id: string): Promise<Service | null> {
    return prisma.service.findUnique({
      where: { id },
    });
  }

  /**
   * Busca um serviço por ID com relações populadas
   */
  async findByIdWithRelations(id: string) {
    return prisma.service.findUnique({
      where: { id },
      include: {
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true,
              },
            },
          },
        },
        category: true,
      },
    });
  }

  /**
   * Lista serviços com filtros e paginação
   */
  async findMany(query: GetServicesQuery): Promise<PaginatedResponse<Service>> {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      categoryId,
      professionalId,
      priceType,
      minPrice,
      maxPrice,
      search,
    } = query;

    // Construir filtros
    const where: Prisma.ServiceWhereInput = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (professionalId) {
      where.professionalId = professionalId;
    }

    if (priceType) {
      where.priceType = priceType;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = new Prisma.Decimal(minPrice);
      }
      if (maxPrice !== undefined) {
        where.price.lte = new Prisma.Decimal(maxPrice);
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Construir ordenação
    const orderBy: Prisma.ServiceOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    // Executar consulta com paginação
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          professional: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  userType: true,
                },
              },
            },
          },
          category: true,
        },
      }),
      prisma.service.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: services,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Atualiza um serviço
   */
  async update(id: string, data: UpdateServiceInput): Promise<Service> {
    const updateData: Prisma.ServiceUpdateInput = { ...data };
    
    if (data.price !== undefined) {
      updateData.price = new Prisma.Decimal(data.price);
    }

    return prisma.service.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Remove um serviço
   */
  async delete(id: string): Promise<Service> {
    return prisma.service.delete({
      where: { id },
    });
  }

  /**
   * Verifica se um serviço pertence a um profissional
   */
  async belongsToProfessional(serviceId: string, professionalId: string): Promise<boolean> {
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        professionalId,
      },
    });

    return !!service;
  }

  /**
   * Conta serviços por profissional
   */
  async countByProfessional(professionalId: string): Promise<number> {
    return prisma.service.count({
      where: { professionalId },
    });
  }

  /**
   * Busca serviços mais populares (por número de agendamentos)
   */
  async findMostPopular(limit: number = 10) {
    return prisma.service.findMany({
      take: limit,
      include: {
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                userType: true,
              },
            },
          },
        },
        category: true,
        _count: {
          select: {
            appointments: true,
          },
        },
      },
      orderBy: {
        appointments: {
          _count: "desc",
        },
      },
    });
  }
}

/**
 * Repository para operações de banco de dados relacionadas a categorias
 */
export class CategoriesRepository {
  /**
   * Cria uma nova categoria
   */
  async create(data: { name: string; slug: string }): Promise<Category> {
    return prisma.category.create({
      data,
    });
  }

  /**
   * Busca uma categoria por ID
   */
  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  /**
   * Busca uma categoria por slug
   */
  async findBySlug(slug: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { slug },
    });
  }

  /**
   * Lista todas as categorias
   */
  async findMany(includeServices: boolean = false): Promise<Category[]> {
    return prisma.category.findMany({
      include: includeServices ? {
        services: {
          include: {
            professional: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    userType: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            services: true,
          },
        },
      } : undefined,
      orderBy: {
        name: "asc",
      },
    });
  }

  /**
   * Atualiza uma categoria
   */
  async update(id: string, data: { name?: string; slug?: string }): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  /**
   * Remove uma categoria
   */
  async delete(id: string): Promise<Category> {
    return prisma.category.delete({
      where: { id },
    });
  }

  /**
   * Verifica se uma categoria existe
   */
  async exists(id: string): Promise<boolean> {
    const category = await prisma.category.findUnique({
      where: { id },
    });
    return !!category;
  }

  /**
   * Verifica se um slug já existe
   */
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const category = await prisma.category.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    return !!category;
  }

  /**
   * Conta quantos serviços uma categoria tem
   */
  async countServices(categoryId: string): Promise<number> {
    return prisma.service.count({
      where: { categoryId },
    });
  }
}

// Instâncias dos repositories
export const servicesRepository = new ServicesRepository();
export const categoriesRepository = new CategoriesRepository();
