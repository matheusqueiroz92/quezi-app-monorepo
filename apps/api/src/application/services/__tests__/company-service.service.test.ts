/**
 * CompanyService Tests
 *
 * Testes unitários para o serviço de serviços de empresa
 */

import { CompanyServiceService } from "../company-service.service";
import { CompanyServiceRepository } from "../../../infrastructure/repositories/company-service.repository";
import { UserRepository } from "../../../infrastructure/repositories/user.repository";
import { NotFoundError, BadRequestError } from "../../../utils/app-error";

// Mock dos repositórios
const mockCompanyServiceRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByCompanyId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findMany: jest.fn(),
  findByCategory: jest.fn(),
  findByPriceRange: jest.fn(),
  search: jest.fn(),
  count: jest.fn(),
  toggleActive: jest.fn(),
};

const mockUserRepository = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findMany: jest.fn(),
  exists: jest.fn(),
};

describe("CompanyServiceService", () => {
  let service: CompanyServiceService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CompanyServiceService(mockCompanyServiceRepository as any);
  });

  describe("createService", () => {
    it("deve criar serviço de empresa com sucesso", async () => {
      // Arrange
      const companyId = "company-123";
      const serviceData = {
        categoryId: "category-123",
        name: "Corte de Cabelo",
        description: "Corte moderno e estiloso",
        price: 50.0,
        priceType: "FIXED",
        durationMinutes: 60,
        isActive: true,
      };

      const mockCompany = {
        id: companyId,
        userType: "COMPANY",
        name: "Barbearia Silva",
      };

      const mockService = {
        id: "service-123",
        companyId,
        ...serviceData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findById.mockResolvedValue(mockCompany);
      mockCompanyServiceRepository.create.mockResolvedValue(mockService);

      // Act
      const result = await service.createService({
        companyId,
        ...serviceData,
      });

      // Assert
      expect(result).toEqual(mockService);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(companyId);
      expect(mockCompanyServiceRepository.create).toHaveBeenCalledWith({
        companyId,
        ...serviceData,
      });
    });

    it("deve lançar erro quando empresa não for encontrada", async () => {
      // Arrange
      const companyId = "company-123";
      const serviceData = {
        categoryId: "category-123",
        name: "Corte de Cabelo",
        price: 50.0,
        priceType: "FIXED",
        durationMinutes: 60,
      };

      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.createService({ companyId, ...serviceData })
      ).rejects.toThrow(NotFoundError);
    });

    it("deve lançar erro quando empresa não for do tipo COMPANY", async () => {
      // Arrange
      const companyId = "company-123";
      const serviceData = {
        categoryId: "category-123",
        name: "Corte de Cabelo",
        price: 50.0,
        priceType: "FIXED",
        durationMinutes: 60,
      };

      const mockCompany = {
        id: companyId,
        userType: "CLIENT",
        name: "Cliente",
      };

      mockUserRepository.findById.mockResolvedValue(mockCompany);

      // Act & Assert
      await expect(
        service.createService({ companyId, ...serviceData })
      ).rejects.toThrow(BadRequestError);
    });

    it("deve lançar erro quando preço for negativo", async () => {
      // Arrange
      const companyId = "company-123";
      const serviceData = {
        categoryId: "category-123",
        name: "Corte de Cabelo",
        price: -10.0, // Preço negativo
        priceType: "FIXED",
        durationMinutes: 60,
      };

      const mockCompany = {
        id: companyId,
        userType: "COMPANY",
        name: "Barbearia Silva",
      };

      mockUserRepository.findById.mockResolvedValue(mockCompany);

      // Act & Assert
      await expect(
        service.createService({ companyId, ...serviceData })
      ).rejects.toThrow(BadRequestError);
    });

    it("deve lançar erro quando duração for inválida", async () => {
      // Arrange
      const companyId = "company-123";
      const serviceData = {
        categoryId: "category-123",
        name: "Corte de Cabelo",
        price: 50.0,
        priceType: "FIXED",
        durationMinutes: 0, // Duração inválida
      };

      const mockCompany = {
        id: companyId,
        userType: "COMPANY",
        name: "Barbearia Silva",
      };

      mockUserRepository.findById.mockResolvedValue(mockCompany);

      // Act & Assert
      await expect(
        service.createService({ companyId, ...serviceData })
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("getServiceById", () => {
    it("deve retornar serviço quando encontrado", async () => {
      // Arrange
      const serviceId = "service-123";
      const mockService = {
        id: serviceId,
        name: "Corte de Cabelo",
        price: 50.0,
      };

      mockCompanyServiceRepository.findById.mockResolvedValue(mockService);

      // Act
      const result = await service.getServiceById(serviceId);

      // Assert
      expect(result).toEqual(mockService);
      expect(mockCompanyServiceRepository.findById).toHaveBeenCalledWith(
        serviceId
      );
    });

    it("deve lançar erro quando serviço não for encontrado", async () => {
      // Arrange
      const serviceId = "service-123";
      mockCompanyServiceRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getServiceById(serviceId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("getServicesByCompanyId", () => {
    it("deve retornar serviços da empresa", async () => {
      // Arrange
      const companyId = "company-123";
      const mockCompany = {
        id: companyId,
        userType: "COMPANY",
        name: "Barbearia Silva",
      };

      const mockServices = [
        { id: "service1", name: "Corte de Cabelo" },
        { id: "service2", name: "Barba" },
      ];

      mockUserRepository.findById.mockResolvedValue(mockCompany);
      mockCompanyServiceRepository.findByCompanyId.mockResolvedValue(
        mockServices
      );

      // Act
      const result = await service.getServicesByCompanyId(companyId);

      // Assert
      expect(result).toEqual(mockServices);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(companyId);
      expect(mockCompanyServiceRepository.findByCompanyId).toHaveBeenCalledWith(
        companyId
      );
    });

    it("deve lançar erro quando empresa não for encontrada", async () => {
      // Arrange
      const companyId = "company-123";
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getServicesByCompanyId(companyId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("updateService", () => {
    it("deve atualizar serviço com sucesso", async () => {
      // Arrange
      const serviceId = "service-123";
      const updateData = {
        name: "Corte de Cabelo Atualizado",
        price: 60.0,
      };

      const existingService = {
        id: serviceId,
        companyId: "company-123",
        name: "Corte de Cabelo",
        price: 50.0,
      };

      const updatedService = {
        ...existingService,
        ...updateData,
      };

      mockCompanyServiceRepository.findById.mockResolvedValue(existingService);
      mockCompanyServiceRepository.update.mockResolvedValue(updatedService);

      // Act
      const result = await service.updateService(serviceId, updateData);

      // Assert
      expect(result).toEqual(updatedService);
      expect(mockCompanyServiceRepository.update).toHaveBeenCalledWith(
        serviceId,
        updateData
      );
    });

    it("deve lançar erro quando serviço não for encontrado", async () => {
      // Arrange
      const serviceId = "service-123";
      const updateData = { name: "Novo Nome" };

      mockCompanyServiceRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateService(serviceId, updateData)
      ).rejects.toThrow(NotFoundError);
    });

    it("deve lançar erro quando preço for negativo", async () => {
      // Arrange
      const serviceId = "service-123";
      const updateData = {
        price: -10.0, // Preço negativo
      };

      const existingService = {
        id: serviceId,
        companyId: "company-123",
        price: 50.0,
      };

      mockCompanyServiceRepository.findById.mockResolvedValue(existingService);

      // Act & Assert
      await expect(
        service.updateService(serviceId, updateData)
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("deleteService", () => {
    it("deve deletar serviço com sucesso", async () => {
      // Arrange
      const serviceId = "service-123";
      const existingService = {
        id: serviceId,
        companyId: "company-123",
        name: "Corte de Cabelo",
      };

      mockCompanyServiceRepository.findById.mockResolvedValue(existingService);
      mockCompanyServiceRepository.delete.mockResolvedValue(undefined);

      // Act
      await service.deleteService(serviceId);

      // Assert
      expect(mockCompanyServiceRepository.delete).toHaveBeenCalledWith(
        serviceId
      );
    });

    it("deve lançar erro quando serviço não for encontrado", async () => {
      // Arrange
      const serviceId = "service-123";
      mockCompanyServiceRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteService(serviceId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("searchServices", () => {
    it("deve buscar serviços com sucesso", async () => {
      // Arrange
      const searchParams = {
        query: "corte",
        categoryId: "category-123",
        minPrice: 30,
        maxPrice: 100,
        page: 1,
        limit: 10,
      };

      const mockServices = [
        { id: "service1", name: "Corte de Cabelo" },
        { id: "service2", name: "Corte + Barba" },
      ];

      const mockResult = {
        data: mockServices,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      mockCompanyServiceRepository.findMany.mockResolvedValue(mockServices);
      mockCompanyServiceRepository.count.mockResolvedValue(2);

      // Act
      const result = await service.searchServices(searchParams);

      // Assert
      expect(result).toEqual(mockResult);
      expect(mockCompanyServiceRepository.findMany).toHaveBeenCalledWith({
        search: searchParams.query,
        categoryId: searchParams.categoryId,
        minPrice: searchParams.minPrice,
        maxPrice: searchParams.maxPrice,
        skip: 0,
        take: 10,
      });
    });

    it("deve lançar erro quando termo de busca for muito curto", async () => {
      // Arrange
      const searchParams = {
        query: "a", // Muito curto
        page: 1,
        limit: 10,
      };

      // Act & Assert
      await expect(service.searchServices(searchParams)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe("toggleServiceStatus", () => {
    it("deve alternar status do serviço com sucesso", async () => {
      // Arrange
      const serviceId = "service-123";
      const existingService = {
        id: serviceId,
        isActive: true,
      };

      const updatedService = {
        ...existingService,
        isActive: false,
      };

      mockCompanyServiceRepository.findById.mockResolvedValue(existingService);
      mockCompanyServiceRepository.toggleActive.mockResolvedValue(
        updatedService
      );

      // Act
      const result = await service.toggleServiceStatus(serviceId);

      // Assert
      expect(result).toEqual(updatedService);
      expect(mockCompanyServiceRepository.toggleActive).toHaveBeenCalledWith(
        serviceId
      );
    });

    it("deve lançar erro quando serviço não for encontrado", async () => {
      // Arrange
      const serviceId = "service-123";
      mockCompanyServiceRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.toggleServiceStatus(serviceId)).rejects.toThrow(
        NotFoundError
      );
    });
  });
});
