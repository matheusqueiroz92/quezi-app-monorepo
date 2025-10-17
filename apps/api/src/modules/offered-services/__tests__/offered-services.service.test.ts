import { describe, expect, test, beforeEach, jest } from "@jest/globals";
import { ServicePriceType, Prisma } from "@prisma/client";
import { OfferedServicesService } from "../offered-services.service";
import {
  OfferedServicesRepository,
  CategoriesRepository,
} from "../offered-services.repository";

// Mock dos repositories
jest.mock("../offered-services.repository");

describe("OfferedServicesService", () => {
  let service: OfferedServicesService;
  let mockOfferedServicesRepository: jest.Mocked<OfferedServicesRepository>;
  let mockCategoriesRepository: jest.Mocked<CategoriesRepository>;

  beforeEach(() => {
    mockOfferedServicesRepository =
      new OfferedServicesRepository() as jest.Mocked<OfferedServicesRepository>;
    mockCategoriesRepository =
      new CategoriesRepository() as jest.Mocked<CategoriesRepository>;
    service = new OfferedServicesService(
      mockOfferedServicesRepository,
      mockCategoriesRepository
    );
    jest.clearAllMocks();
  });

  describe("createService", () => {
    test("deve criar um serviço com sucesso", async () => {
      const professionalId = "professional-id-123";
      const serviceData = {
        name: "Corte de Cabelo",
        description: "Corte masculino",
        price: 50.0,
        priceType: ServicePriceType.FIXED,
        durationMinutes: 30,
        categoryId: "category-id-456",
      };

      const expectedService = {
        id: "service-id-789",
        ...serviceData,
        professionalId,
        price: new Prisma.Decimal(50.0),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCategoriesRepository.exists = jest.fn().mockResolvedValue(true);
      mockOfferedServicesRepository.create = jest
        .fn()
        .mockResolvedValue(expectedService);

      const result = await service.createService(professionalId, serviceData);

      expect(mockCategoriesRepository.exists).toHaveBeenCalledWith(
        serviceData.categoryId
      );
      expect(mockOfferedServicesRepository.create).toHaveBeenCalledWith({
        ...serviceData,
        professionalId,
      });
      expect(result).toEqual(expectedService);
    });

    test("deve lançar erro se categoria não existir", async () => {
      const professionalId = "professional-id-123";
      const serviceData = {
        name: "Corte",
        price: 50.0,
        priceType: ServicePriceType.FIXED,
        durationMinutes: 30,
        categoryId: "non-existent-category",
      };

      mockCategoriesRepository.exists = jest.fn().mockResolvedValue(false);

      await expect(
        service.createService(professionalId, serviceData)
      ).rejects.toThrow("Categoria não encontrada");

      expect(mockOfferedServicesRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("getServiceById", () => {
    test("deve retornar serviço por ID", async () => {
      const serviceId = "service-id-123";
      const expectedService = {
        id: serviceId,
        name: "Corte",
        price: new Prisma.Decimal(50.0),
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

      mockOfferedServicesRepository.findByIdWithRelations = jest
        .fn()
        .mockResolvedValue(expectedService);

      const result = await service.getServiceById(serviceId);

      expect(mockOfferedServicesRepository.findByIdWithRelations).toHaveBeenCalledWith(
        serviceId
      );
      expect(result).toEqual(expectedService);
    });

    test("deve lançar erro se serviço não existir", async () => {
      mockOfferedServicesRepository.findByIdWithRelations = jest
        .fn()
        .mockResolvedValue(null);

      await expect(service.getServiceById("non-existent-id")).rejects.toThrow(
        "Serviço não encontrado"
      );
    });
  });

  describe("getServices", () => {
    test("deve listar serviços com filtros", async () => {
      const query = {
        page: 1,
        limit: 10,
        sortBy: "createdAt" as const,
        sortOrder: "desc" as const,
      };

      const expectedResult = {
        data: [
          { id: "service-1", name: "Corte 1" },
          { id: "service-2", name: "Corte 2" },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      mockOfferedServicesRepository.findMany = jest
        .fn()
        .mockResolvedValue(expectedResult);

      const result = await service.getServices(query);

      expect(mockOfferedServicesRepository.findMany).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("updateService", () => {
    test("deve atualizar serviço com sucesso", async () => {
      const serviceId = "service-id-123";
      const professionalId = "professional-id-456";
      const updateData = {
        name: "Novo Nome",
        price: 75.0,
      };

      const existingService = {
        id: serviceId,
        name: "Nome Antigo",
        professionalId,
      };

      const updatedService = {
        ...existingService,
        ...updateData,
        price: new Prisma.Decimal(75.0),
      };

      mockOfferedServicesRepository.findById = jest
        .fn()
        .mockResolvedValue(existingService);
      mockOfferedServicesRepository.update = jest
        .fn()
        .mockResolvedValue(updatedService);

      const result = await service.updateService(
        serviceId,
        professionalId,
        updateData
      );

      expect(mockOfferedServicesRepository.findById).toHaveBeenCalledWith(serviceId);
      expect(mockOfferedServicesRepository.update).toHaveBeenCalledWith(
        serviceId,
        updateData
      );
      expect(result).toEqual(updatedService);
    });

    test("deve lançar erro se serviço não existir", async () => {
      mockOfferedServicesRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(
        service.updateService("non-existent-id", "professional-id", {
          name: "Nome",
        })
      ).rejects.toThrow("Serviço não encontrado");
    });

    test("deve lançar erro se serviço não pertencer ao profissional", async () => {
      const existingService = {
        id: "service-id",
        name: "Corte",
        professionalId: "other-professional-id",
      };

      mockOfferedServicesRepository.findById = jest
        .fn()
        .mockResolvedValue(existingService);

      await expect(
        service.updateService("service-id", "professional-id", { name: "Nome" })
      ).rejects.toThrow("Você não tem permissão para atualizar este serviço");
    });

    test("deve validar categoria se estiver sendo atualizada", async () => {
      const existingService = {
        id: "service-id",
        name: "Corte",
        professionalId: "professional-id",
      };

      mockOfferedServicesRepository.findById = jest
        .fn()
        .mockResolvedValue(existingService);
      mockCategoriesRepository.exists = jest.fn().mockResolvedValue(false);

      await expect(
        service.updateService("service-id", "professional-id", {
          categoryId: "invalid-category",
        })
      ).rejects.toThrow("Categoria não encontrada");
    });
  });

  describe("deleteService", () => {
    test("deve deletar serviço com sucesso", async () => {
      const serviceId = "service-id-123";
      const professionalId = "professional-id-456";

      const existingService = {
        id: serviceId,
        name: "Corte",
        professionalId,
      };

      mockOfferedServicesRepository.findById = jest
        .fn()
        .mockResolvedValue(existingService);
      mockOfferedServicesRepository.delete = jest
        .fn()
        .mockResolvedValue(existingService);

      await service.deleteService(serviceId, professionalId);

      expect(mockOfferedServicesRepository.findById).toHaveBeenCalledWith(serviceId);
      expect(mockOfferedServicesRepository.delete).toHaveBeenCalledWith(serviceId);
    });

    test("deve lançar erro se serviço não existir", async () => {
      mockOfferedServicesRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(
        service.deleteService("non-existent-id", "professional-id")
      ).rejects.toThrow("Serviço não encontrado");
    });

    test("deve lançar erro se serviço não pertencer ao profissional", async () => {
      const existingService = {
        id: "service-id",
        name: "Corte",
        professionalId: "other-professional-id",
      };

      mockOfferedServicesRepository.findById = jest
        .fn()
        .mockResolvedValue(existingService);

      await expect(
        service.deleteService("service-id", "professional-id")
      ).rejects.toThrow("Você não tem permissão para deletar este serviço");
    });
  });

  describe("getMostPopularServices", () => {
    test("deve retornar serviços mais populares", async () => {
      const expectedServices = [
        { id: "service-1", name: "Popular 1", _count: { appointments: 10 } },
        { id: "service-2", name: "Popular 2", _count: { appointments: 5 } },
      ];

      mockOfferedServicesRepository.findMostPopular = jest
        .fn()
        .mockResolvedValue(expectedServices);

      const result = await service.getMostPopularServices(10);

      expect(mockOfferedServicesRepository.findMostPopular).toHaveBeenCalledWith(10);
      expect(result).toEqual(expectedServices);
    });
  });

  // ==============================================
  // TESTES DE CATEGORIAS
  // ==============================================

  describe("createCategory", () => {
    test("deve criar uma categoria com sucesso", async () => {
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

      mockCategoriesRepository.slugExists = jest.fn().mockResolvedValue(false);
      mockCategoriesRepository.create = jest
        .fn()
        .mockResolvedValue(expectedCategory);

      const result = await service.createCategory(categoryData);

      expect(mockCategoriesRepository.slugExists).toHaveBeenCalledWith(
        categoryData.slug
      );
      expect(mockCategoriesRepository.create).toHaveBeenCalledWith(
        categoryData
      );
      expect(result).toEqual(expectedCategory);
    });

    test("deve lançar erro se slug já existir", async () => {
      const categoryData = {
        name: "Cabelo",
        slug: "cabelo",
      };

      mockCategoriesRepository.slugExists = jest.fn().mockResolvedValue(true);

      await expect(service.createCategory(categoryData)).rejects.toThrow(
        "Já existe uma categoria com este slug"
      );

      expect(mockCategoriesRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("getCategoryById", () => {
    test("deve retornar categoria por ID", async () => {
      const categoryId = "category-id-123";
      const expectedCategory = {
        id: categoryId,
        name: "Cabelo",
        slug: "cabelo",
      };

      mockCategoriesRepository.findById = jest
        .fn()
        .mockResolvedValue(expectedCategory);

      const result = await service.getCategoryById(categoryId);

      expect(mockCategoriesRepository.findById).toHaveBeenCalledWith(
        categoryId
      );
      expect(result).toEqual(expectedCategory);
    });

    test("deve lançar erro se categoria não existir", async () => {
      mockCategoriesRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(service.getCategoryById("non-existent-id")).rejects.toThrow(
        "Categoria não encontrada"
      );
    });
  });

  describe("getAllCategories", () => {
    test("deve retornar todas as categorias", async () => {
      const expectedCategories = [
        { id: "cat-1", name: "Categoria 1", slug: "categoria-1" },
        { id: "cat-2", name: "Categoria 2", slug: "categoria-2" },
      ];

      mockCategoriesRepository.findMany = jest
        .fn()
        .mockResolvedValue(expectedCategories);

      const result = await service.getAllCategories(false);

      expect(mockCategoriesRepository.findMany).toHaveBeenCalledWith(false);
      expect(result).toEqual(expectedCategories);
    });
  });

  describe("updateCategory", () => {
    test("deve atualizar categoria com sucesso", async () => {
      const categoryId = "category-id-123";
      const updateData = {
        name: "Novo Nome",
      };

      const existingCategory = {
        id: categoryId,
        name: "Nome Antigo",
        slug: "nome-antigo",
      };

      const updatedCategory = {
        ...existingCategory,
        ...updateData,
      };

      mockCategoriesRepository.findById = jest
        .fn()
        .mockResolvedValue(existingCategory);
      mockCategoriesRepository.update = jest
        .fn()
        .mockResolvedValue(updatedCategory);

      const result = await service.updateCategory(categoryId, updateData);

      expect(mockCategoriesRepository.findById).toHaveBeenCalledWith(
        categoryId
      );
      expect(mockCategoriesRepository.update).toHaveBeenCalledWith(
        categoryId,
        updateData
      );
      expect(result).toEqual(updatedCategory);
    });

    test("deve lançar erro se categoria não existir", async () => {
      mockCategoriesRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(
        service.updateCategory("non-existent-id", { name: "Nome" })
      ).rejects.toThrow("Categoria não encontrada");
    });

    test("deve validar slug se estiver sendo atualizado", async () => {
      const existingCategory = {
        id: "category-id",
        name: "Nome",
        slug: "nome",
      };

      mockCategoriesRepository.findById = jest
        .fn()
        .mockResolvedValue(existingCategory);
      mockCategoriesRepository.slugExists = jest.fn().mockResolvedValue(true);

      await expect(
        service.updateCategory("category-id", { slug: "existing-slug" })
      ).rejects.toThrow("Já existe uma categoria com este slug");
    });
  });

  describe("deleteCategory", () => {
    test("deve deletar categoria com sucesso", async () => {
      const categoryId = "category-id-123";

      const existingCategory = {
        id: categoryId,
        name: "Categoria",
        slug: "categoria",
      };

      mockCategoriesRepository.findById = jest
        .fn()
        .mockResolvedValue(existingCategory);
      mockCategoriesRepository.countServices = jest.fn().mockResolvedValue(0);
      mockCategoriesRepository.delete = jest
        .fn()
        .mockResolvedValue(existingCategory);

      await service.deleteCategory(categoryId);

      expect(mockCategoriesRepository.findById).toHaveBeenCalledWith(
        categoryId
      );
      expect(mockCategoriesRepository.countServices).toHaveBeenCalledWith(
        categoryId
      );
      expect(mockCategoriesRepository.delete).toHaveBeenCalledWith(categoryId);
    });

    test("deve lançar erro se categoria não existir", async () => {
      mockCategoriesRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(service.deleteCategory("non-existent-id")).rejects.toThrow(
        "Categoria não encontrada"
      );
    });

    test("deve lançar erro se categoria tiver serviços associados", async () => {
      const existingCategory = {
        id: "category-id",
        name: "Categoria",
        slug: "categoria",
      };

      mockCategoriesRepository.findById = jest
        .fn()
        .mockResolvedValue(existingCategory);
      mockCategoriesRepository.countServices = jest.fn().mockResolvedValue(5);

      await expect(service.deleteCategory("category-id")).rejects.toThrow(
        "Não é possível deletar uma categoria que possui serviços associados"
      );

      expect(mockCategoriesRepository.delete).not.toHaveBeenCalled();
    });
  });
});
