import { describe, expect, test, beforeEach, jest } from "@jest/globals";
import { ServicePriceType, Prisma } from "@prisma/client";
import {
  ServicesRepository,
  CategoriesRepository,
} from "../services.repository";
import { prisma } from "../../../lib/prisma";

// Mock do Prisma
jest.mock("../../../lib/prisma", () => ({
  prisma: {
    service: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    category: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("ServicesRepository", () => {
  let repository: ServicesRepository;

  beforeEach(() => {
    repository = new ServicesRepository();
    jest.clearAllMocks();
  });

  describe("create", () => {
    test("deve criar um novo serviço", async () => {
      const serviceData = {
        name: "Corte de Cabelo",
        description: "Corte masculino",
        price: 50.0,
        priceType: ServicePriceType.FIXED,
        durationMinutes: 30,
        categoryId: "category-id-123",
        professionalId: "professional-id-456",
      };

      const expectedService = {
        id: "service-id-789",
        ...serviceData,
        price: new Prisma.Decimal(50.0),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.service.create as jest.MockedFunction<any>).mockResolvedValue(
        expectedService
      );

      const result = await repository.create(serviceData);

      expect(prisma.service.create).toHaveBeenCalledWith({
        data: {
          ...serviceData,
          price: expect.any(Prisma.Decimal),
        },
      });
      expect(result).toEqual(expectedService);
    });
  });

  describe("findById", () => {
    test("deve encontrar serviço por ID", async () => {
      const serviceId = "service-id-123";
      const expectedService = {
        id: serviceId,
        name: "Corte",
        price: new Prisma.Decimal(50.0),
      };

      (prisma.service.findUnique as jest.MockedFunction<any>).mockResolvedValue(
        expectedService
      );

      const result = await repository.findById(serviceId);

      expect(prisma.service.findUnique).toHaveBeenCalledWith({
        where: { id: serviceId },
      });
      expect(result).toEqual(expectedService);
    });

    test("deve retornar null se serviço não existir", async () => {
      (prisma.service.findUnique as jest.MockedFunction<any>).mockResolvedValue(
        null
      );

      const result = await repository.findById("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("findByIdWithRelations", () => {
    test("deve encontrar serviço com relações populadas", async () => {
      const serviceId = "service-id-123";
      const expectedService = {
        id: serviceId,
        name: "Corte",
        professional: {
          user: {
            id: "user-id",
            name: "João",
            email: "joao@example.com",
            userType: "PROFESSIONAL",
          },
        },
        category: {
          id: "category-id",
          name: "Cabelo",
          slug: "cabelo",
        },
      };

      (prisma.service.findUnique as jest.MockedFunction<any>).mockResolvedValue(
        expectedService
      );

      const result = await repository.findByIdWithRelations(serviceId);

      expect(prisma.service.findUnique).toHaveBeenCalledWith({
        where: { id: serviceId },
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
      expect(result).toEqual(expectedService);
    });
  });

  describe("findMany", () => {
    test("deve listar serviços com paginação", async () => {
      const query = {
        page: 1,
        limit: 10,
        sortBy: "createdAt" as const,
        sortOrder: "desc" as const,
      };

      const mockServices = [
        {
          id: "service-1",
          name: "Corte 1",
          price: new Prisma.Decimal(50.0),
        },
        {
          id: "service-2",
          name: "Corte 2",
          price: new Prisma.Decimal(75.0),
        },
      ];

      (prisma.service.findMany as jest.MockedFunction<any>).mockResolvedValue(
        mockServices
      );
      (prisma.service.count as jest.MockedFunction<any>).mockResolvedValue(2);

      const result = await repository.findMany(query);

      expect(result.data).toEqual(mockServices);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    test("deve aplicar filtros de busca", async () => {
      const query = {
        page: 1,
        limit: 10,
        sortBy: "name" as const,
        sortOrder: "asc" as const,
        search: "corte",
        categoryId: "category-123",
        professionalId: "professional-456",
        priceType: ServicePriceType.FIXED,
        minPrice: 20,
        maxPrice: 100,
      };

      (prisma.service.findMany as jest.MockedFunction<any>).mockResolvedValue(
        []
      );
      (prisma.service.count as jest.MockedFunction<any>).mockResolvedValue(0);

      await repository.findMany(query);

      expect(prisma.service.findMany).toHaveBeenCalledWith({
        where: {
          categoryId: "category-123",
          professionalId: "professional-456",
          priceType: ServicePriceType.FIXED,
          price: {
            gte: expect.any(Prisma.Decimal),
            lte: expect.any(Prisma.Decimal),
          },
          OR: [
            { name: { contains: "corte", mode: "insensitive" } },
            { description: { contains: "corte", mode: "insensitive" } },
          ],
        },
        orderBy: { name: "asc" },
        skip: 0,
        take: 10,
        include: expect.any(Object),
      });
    });
  });

  describe("update", () => {
    test("deve atualizar um serviço", async () => {
      const serviceId = "service-id-123";
      const updateData = {
        name: "Novo Nome",
        price: 75.0,
      };

      const expectedService = {
        id: serviceId,
        ...updateData,
        price: new Prisma.Decimal(75.0),
      };

      (prisma.service.update as jest.MockedFunction<any>).mockResolvedValue(
        expectedService
      );

      const result = await repository.update(serviceId, updateData);

      expect(prisma.service.update).toHaveBeenCalledWith({
        where: { id: serviceId },
        data: {
          name: "Novo Nome",
          price: expect.any(Prisma.Decimal),
        },
      });
      expect(result).toEqual(expectedService);
    });
  });

  describe("delete", () => {
    test("deve deletar um serviço", async () => {
      const serviceId = "service-id-123";
      const expectedService = {
        id: serviceId,
        name: "Corte",
      };

      (prisma.service.delete as jest.MockedFunction<any>).mockResolvedValue(
        expectedService
      );

      const result = await repository.delete(serviceId);

      expect(prisma.service.delete).toHaveBeenCalledWith({
        where: { id: serviceId },
      });
      expect(result).toEqual(expectedService);
    });
  });

  describe("belongsToProfessional", () => {
    test("deve retornar true se serviço pertence ao profissional", async () => {
      const serviceId = "service-id-123";
      const professionalId = "professional-id-456";

      (prisma.service.findFirst as jest.MockedFunction<any>).mockResolvedValue({
        id: serviceId,
        professionalId,
      });

      const result = await repository.belongsToProfessional(
        serviceId,
        professionalId
      );

      expect(result).toBe(true);
    });

    test("deve retornar false se serviço não pertence ao profissional", async () => {
      (prisma.service.findFirst as jest.MockedFunction<any>).mockResolvedValue(
        null
      );

      const result = await repository.belongsToProfessional(
        "service-id",
        "professional-id"
      );

      expect(result).toBe(false);
    });
  });

  describe("countByProfessional", () => {
    test("deve contar serviços por profissional", async () => {
      const professionalId = "professional-id-456";
      (prisma.service.count as jest.MockedFunction<any>).mockResolvedValue(5);

      const result = await repository.countByProfessional(professionalId);

      expect(prisma.service.count).toHaveBeenCalledWith({
        where: { professionalId },
      });
      expect(result).toBe(5);
    });
  });

  describe("findMostPopular", () => {
    test("deve retornar serviços mais populares", async () => {
      const mockServices = [
        {
          id: "service-1",
          name: "Popular 1",
          _count: { appointments: 10 },
        },
        {
          id: "service-2",
          name: "Popular 2",
          _count: { appointments: 5 },
        },
      ];

      (prisma.service.findMany as jest.MockedFunction<any>).mockResolvedValue(
        mockServices
      );

      const result = await repository.findMostPopular(10);

      expect(prisma.service.findMany).toHaveBeenCalledWith({
        take: 10,
        include: expect.any(Object),
        orderBy: {
          appointments: {
            _count: "desc",
          },
        },
      });
      expect(result).toEqual(mockServices);
    });
  });
});

describe("CategoriesRepository", () => {
  let repository: CategoriesRepository;

  beforeEach(() => {
    repository = new CategoriesRepository();
    jest.clearAllMocks();
  });

  describe("create", () => {
    test("deve criar uma nova categoria", async () => {
      const categoryData = {
        name: "Cabelo",
        slug: "cabelo",
      };

      const expectedCategory = {
        id: "category-id-123",
        ...categoryData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.category.create as jest.MockedFunction<any>).mockResolvedValue(
        expectedCategory
      );

      const result = await repository.create(categoryData);

      expect(prisma.category.create).toHaveBeenCalledWith({
        data: categoryData,
      });
      expect(result).toEqual(expectedCategory);
    });
  });

  describe("findById", () => {
    test("deve encontrar categoria por ID", async () => {
      const categoryId = "category-id-123";
      const expectedCategory = {
        id: categoryId,
        name: "Cabelo",
        slug: "cabelo",
      };

      (
        prisma.category.findUnique as jest.MockedFunction<any>
      ).mockResolvedValue(expectedCategory);

      const result = await repository.findById(categoryId);

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(result).toEqual(expectedCategory);
    });
  });

  describe("findBySlug", () => {
    test("deve encontrar categoria por slug", async () => {
      const slug = "cabelo";
      const expectedCategory = {
        id: "category-id-123",
        name: "Cabelo",
        slug,
      };

      (
        prisma.category.findUnique as jest.MockedFunction<any>
      ).mockResolvedValue(expectedCategory);

      const result = await repository.findBySlug(slug);

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { slug },
      });
      expect(result).toEqual(expectedCategory);
    });
  });

  describe("findMany", () => {
    test("deve listar todas as categorias", async () => {
      const mockCategories = [
        { id: "cat-1", name: "Categoria 1", slug: "categoria-1" },
        { id: "cat-2", name: "Categoria 2", slug: "categoria-2" },
      ];

      (prisma.category.findMany as jest.MockedFunction<any>).mockResolvedValue(
        mockCategories
      );

      const result = await repository.findMany(false);

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        include: undefined,
        orderBy: { name: "asc" },
      });
      expect(result).toEqual(mockCategories);
    });

    test("deve listar categorias com serviços", async () => {
      const mockCategories = [
        {
          id: "cat-1",
          name: "Categoria 1",
          slug: "categoria-1",
          services: [],
          _count: { services: 0 },
        },
      ];

      (prisma.category.findMany as jest.MockedFunction<any>).mockResolvedValue(
        mockCategories
      );

      const result = await repository.findMany(true);

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        include: expect.any(Object),
        orderBy: { name: "asc" },
      });
      expect(result).toEqual(mockCategories);
    });
  });

  describe("update", () => {
    test("deve atualizar uma categoria", async () => {
      const categoryId = "category-id-123";
      const updateData = {
        name: "Novo Nome",
      };

      const expectedCategory = {
        id: categoryId,
        ...updateData,
        slug: "cabelo",
      };

      (prisma.category.update as jest.MockedFunction<any>).mockResolvedValue(
        expectedCategory
      );

      const result = await repository.update(categoryId, updateData);

      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: categoryId },
        data: updateData,
      });
      expect(result).toEqual(expectedCategory);
    });
  });

  describe("delete", () => {
    test("deve deletar uma categoria", async () => {
      const categoryId = "category-id-123";
      const expectedCategory = {
        id: categoryId,
        name: "Cabelo",
        slug: "cabelo",
      };

      (prisma.category.delete as jest.MockedFunction<any>).mockResolvedValue(
        expectedCategory
      );

      const result = await repository.delete(categoryId);

      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(result).toEqual(expectedCategory);
    });
  });

  describe("exists", () => {
    test("deve retornar true se categoria existir", async () => {
      (
        prisma.category.findUnique as jest.MockedFunction<any>
      ).mockResolvedValue({
        id: "category-id-123",
      });

      const result = await repository.exists("category-id-123");

      expect(result).toBe(true);
    });

    test("deve retornar false se categoria não existir", async () => {
      (
        prisma.category.findUnique as jest.MockedFunction<any>
      ).mockResolvedValue(null);

      const result = await repository.exists("non-existent-id");

      expect(result).toBe(false);
    });
  });

  describe("slugExists", () => {
    test("deve retornar true se slug existir", async () => {
      (prisma.category.findFirst as jest.MockedFunction<any>).mockResolvedValue(
        {
          id: "category-id-123",
          slug: "cabelo",
        }
      );

      const result = await repository.slugExists("cabelo");

      expect(result).toBe(true);
    });

    test("deve retornar false se slug não existir", async () => {
      (prisma.category.findFirst as jest.MockedFunction<any>).mockResolvedValue(
        null
      );

      const result = await repository.slugExists("non-existent-slug");

      expect(result).toBe(false);
    });

    test("deve excluir ID específico ao verificar slug", async () => {
      (prisma.category.findFirst as jest.MockedFunction<any>).mockResolvedValue(
        null
      );

      await repository.slugExists("cabelo", "category-id-123");

      expect(prisma.category.findFirst).toHaveBeenCalledWith({
        where: {
          slug: "cabelo",
          id: { not: "category-id-123" },
        },
      });
    });
  });

  describe("countServices", () => {
    test("deve contar serviços de uma categoria", async () => {
      const categoryId = "category-id-123";
      (prisma.service.count as jest.MockedFunction<any>).mockResolvedValue(10);

      const result = await repository.countServices(categoryId);

      expect(prisma.service.count).toHaveBeenCalledWith({
        where: { categoryId },
      });
      expect(result).toBe(10);
    });
  });
});
