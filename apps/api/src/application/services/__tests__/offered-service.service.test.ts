/**
 * Testes para OfferedServiceService
 *
 * Testa a lógica de negócio dos serviços oferecidos
 * Seguindo TDD e princípios SOLID
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { OfferedServiceService } from "../offered-service.service";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "../../../utils/app-error";

// Mock do OfferedServiceRepository
const mockOfferedServiceRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByProfessionalId: jest.fn(),
  findByCompanyEmployeeId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findMany: jest.fn(),
  findByCategory: jest.fn(),
  findByPriceRange: jest.fn(),
  search: jest.fn(),
  count: jest.fn(),
};

// Mock do UserRepository
const mockUserRepository = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
};

// Mock do ProfessionalProfileRepository
const mockProfessionalProfileRepository = {
  findByUserId: jest.fn(),
};

// Mock do CompanyEmployeeRepository
const mockCompanyEmployeeRepository = {
  findById: jest.fn(),
  findByUserId: jest.fn(),
};

jest.mock(
  "../../../infrastructure/repositories/offered-service.repository",
  () => ({
    OfferedServiceRepository: jest
      .fn()
      .mockImplementation(() => mockOfferedServiceRepository),
  })
);

jest.mock("../../../infrastructure/repositories/user.repository", () => ({
  UserRepository: jest.fn().mockImplementation(() => mockUserRepository),
}));

jest.mock(
  "../../../infrastructure/repositories/professional-profile.repository",
  () => ({
    ProfessionalProfileRepository: jest
      .fn()
      .mockImplementation(() => mockProfessionalProfileRepository),
  })
);

jest.mock(
  "../../../infrastructure/repositories/company-employee.repository",
  () => ({
    CompanyEmployeeRepository: jest
      .fn()
      .mockImplementation(() => mockCompanyEmployeeRepository),
  })
);

describe("OfferedServiceService", () => {
  let offeredServiceService: OfferedServiceService;

  beforeEach(() => {
    jest.clearAllMocks();
    offeredServiceService = new OfferedServiceService(
      mockOfferedServiceRepository as any,
      mockUserRepository as any,
      mockProfessionalProfileRepository as any,
      mockCompanyEmployeeRepository as any
    );
  });

  describe("createOfferedService", () => {
    it("deve criar serviço oferecido com sucesso", async () => {
      // Arrange
      const serviceData = {
        name: "Corte de Cabelo",
        description: "Corte de cabelo masculino e feminino",
        price: 50.0,
        duration: 60,
        category: "Cabelo",
        professionalId: "professional-123",
        isActive: true,
      };

      const mockProfessional = {
        id: "professional-123",
        userId: "professional-123",
        specialties: ["Cabelo", "Barba"],
        isActive: true,
      };

      const mockService = {
        id: "service-123",
        ...serviceData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProfessionalProfileRepository.findByUserId.mockResolvedValue(
        mockProfessional
      );
      mockOfferedServiceRepository.create.mockResolvedValue(mockService);

      // Act
      const result = await offeredServiceService.createOfferedService(
        serviceData
      );

      // Assert
      expect(result).toEqual(mockService);
      expect(
        mockProfessionalProfileRepository.findByUserId
      ).toHaveBeenCalledWith("professional-123");
      expect(mockOfferedServiceRepository.create).toHaveBeenCalledWith(
        serviceData
      );
    });

    it("deve criar serviço oferecido por funcionário de empresa", async () => {
      // Arrange
      const serviceData = {
        name: "Manicure",
        description: "Manicure completa",
        price: 30.0,
        duration: 45,
        category: "Estética",
        companyEmployeeId: "employee-123",
        isActive: true,
      };

      const mockEmployee = {
        id: "employee-123",
        name: "Maria Funcionária",
        email: "maria@empresa.com",
        isActive: true,
      };

      const mockService = {
        id: "service-123",
        ...serviceData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCompanyEmployeeRepository.findById.mockResolvedValue(mockEmployee);
      mockOfferedServiceRepository.create.mockResolvedValue(mockService);

      // Act
      const result = await offeredServiceService.createOfferedService(
        serviceData
      );

      // Assert
      expect(result).toEqual(mockService);
      expect(mockCompanyEmployeeRepository.findById).toHaveBeenCalledWith(
        "employee-123"
      );
      expect(mockOfferedServiceRepository.create).toHaveBeenCalledWith(
        serviceData
      );
    });

    it("deve lançar erro se profissional não encontrado", async () => {
      // Arrange
      const serviceData = {
        name: "Corte de Cabelo",
        description: "Corte de cabelo masculino e feminino",
        price: 50.0,
        duration: 60,
        category: "Cabelo",
        professionalId: "non-existent",
        isActive: true,
      };

      mockProfessionalProfileRepository.findByUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(
        offeredServiceService.createOfferedService(serviceData)
      ).rejects.toThrow(NotFoundError);
    });

    it("deve lançar erro se funcionário não encontrado", async () => {
      // Arrange
      const serviceData = {
        name: "Manicure",
        description: "Manicure completa",
        price: 30.0,
        duration: 45,
        category: "Estética",
        companyEmployeeId: "non-existent",
        isActive: true,
      };

      mockCompanyEmployeeRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        offeredServiceService.createOfferedService(serviceData)
      ).rejects.toThrow(NotFoundError);
    });

    it("deve lançar erro se nem profissional nem funcionário for informado", async () => {
      // Arrange
      const serviceData = {
        name: "Corte de Cabelo",
        description: "Corte de cabelo masculino e feminino",
        price: 50.0,
        duration: 60,
        category: "Cabelo",
        isActive: true,
      };

      // Act & Assert
      await expect(
        offeredServiceService.createOfferedService(serviceData)
      ).rejects.toThrow(BadRequestError);
    });

    it("deve lançar erro se preço for negativo", async () => {
      // Arrange
      const serviceData = {
        name: "Corte de Cabelo",
        description: "Corte de cabelo masculino e feminino",
        price: -10.0, // Preço negativo
        duration: 60,
        category: "Cabelo",
        professionalId: "professional-123",
        isActive: true,
      };

      // Act & Assert
      await expect(
        offeredServiceService.createOfferedService(serviceData)
      ).rejects.toThrow(BadRequestError);
    });

    it("deve lançar erro se duração for negativa", async () => {
      // Arrange
      const serviceData = {
        name: "Corte de Cabelo",
        description: "Corte de cabelo masculino e feminino",
        price: 50.0,
        duration: -30, // Duração negativa
        category: "Cabelo",
        professionalId: "professional-123",
        isActive: true,
      };

      // Act & Assert
      await expect(
        offeredServiceService.createOfferedService(serviceData)
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("getOfferedServiceById", () => {
    it("deve retornar serviço quando encontrado", async () => {
      // Arrange
      const serviceId = "service-123";
      const mockService = {
        id: serviceId,
        name: "Corte de Cabelo",
        description: "Corte de cabelo masculino e feminino",
        price: 50.0,
        duration: 60,
        category: "Cabelo",
        professionalId: "professional-123",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOfferedServiceRepository.findById.mockResolvedValue(mockService);

      // Act
      const result = await offeredServiceService.getOfferedServiceById(
        serviceId
      );

      // Assert
      expect(result).toEqual(mockService);
      expect(mockOfferedServiceRepository.findById).toHaveBeenCalledWith(
        serviceId
      );
    });

    it("deve lançar erro quando serviço não encontrado", async () => {
      // Arrange
      const serviceId = "non-existent";
      mockOfferedServiceRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        offeredServiceService.getOfferedServiceById(serviceId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("updateOfferedService", () => {
    it("deve atualizar serviço com sucesso", async () => {
      // Arrange
      const serviceId = "service-123";
      const updateData = {
        name: "Corte de Cabelo Premium",
        price: 60.0,
        description: "Corte de cabelo com lavagem e finalização",
      };

      const mockService = {
        id: serviceId,
        name: "Corte de Cabelo",
        description: "Corte de cabelo masculino e feminino",
        price: 50.0,
        duration: 60,
        category: "Cabelo",
        professionalId: "professional-123",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedService = {
        ...mockService,
        ...updateData,
        updatedAt: new Date(),
      };

      mockOfferedServiceRepository.findById.mockResolvedValue(mockService);
      mockOfferedServiceRepository.update.mockResolvedValue(updatedService);

      // Act
      const result = await offeredServiceService.updateOfferedService(
        serviceId,
        updateData
      );

      // Assert
      expect(result).toEqual(updatedService);
      expect(mockOfferedServiceRepository.findById).toHaveBeenCalledWith(
        serviceId
      );
      expect(mockOfferedServiceRepository.update).toHaveBeenCalledWith(
        serviceId,
        updateData
      );
    });

    it("deve lançar erro quando serviço não encontrado", async () => {
      // Arrange
      const serviceId = "non-existent";
      const updateData = { name: "Novo Nome" };

      mockOfferedServiceRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        offeredServiceService.updateOfferedService(serviceId, updateData)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteOfferedService", () => {
    it("deve deletar serviço com sucesso", async () => {
      // Arrange
      const serviceId = "service-123";
      const mockService = {
        id: serviceId,
        name: "Corte de Cabelo",
        professionalId: "professional-123",
        isActive: true,
      };

      mockOfferedServiceRepository.findById.mockResolvedValue(mockService);
      mockOfferedServiceRepository.delete.mockResolvedValue(undefined);

      // Act
      await offeredServiceService.deleteOfferedService(serviceId);

      // Assert
      expect(mockOfferedServiceRepository.findById).toHaveBeenCalledWith(
        serviceId
      );
      expect(mockOfferedServiceRepository.delete).toHaveBeenCalledWith(
        serviceId
      );
    });

    it("deve lançar erro quando serviço não encontrado", async () => {
      // Arrange
      const serviceId = "non-existent";
      mockOfferedServiceRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        offeredServiceService.deleteOfferedService(serviceId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("getOfferedServicesByProfessional", () => {
    it("deve retornar serviços do profissional", async () => {
      // Arrange
      const professionalId = "professional-123";
      const mockServices = [
        {
          id: "service-1",
          name: "Corte de Cabelo",
          professionalId,
          price: 50.0,
          isActive: true,
        },
        {
          id: "service-2",
          name: "Barba",
          professionalId,
          price: 30.0,
          isActive: true,
        },
      ];

      mockOfferedServiceRepository.findByProfessionalId.mockResolvedValue(
        mockServices
      );

      // Act
      const result =
        await offeredServiceService.getOfferedServicesByProfessional(
          professionalId
        );

      // Assert
      expect(result).toEqual(mockServices);
      expect(
        mockOfferedServiceRepository.findByProfessionalId
      ).toHaveBeenCalledWith(professionalId);
    });
  });

  describe("getOfferedServicesByCompanyEmployee", () => {
    it("deve retornar serviços do funcionário", async () => {
      // Arrange
      const companyEmployeeId = "employee-123";
      const mockServices = [
        {
          id: "service-1",
          name: "Manicure",
          companyEmployeeId,
          price: 30.0,
          isActive: true,
        },
      ];

      mockOfferedServiceRepository.findByCompanyEmployeeId.mockResolvedValue(
        mockServices
      );

      // Act
      const result =
        await offeredServiceService.getOfferedServicesByCompanyEmployee(
          companyEmployeeId
        );

      // Assert
      expect(result).toEqual(mockServices);
      expect(
        mockOfferedServiceRepository.findByCompanyEmployeeId
      ).toHaveBeenCalledWith(companyEmployeeId);
    });
  });

  describe("searchOfferedServices", () => {
    it("deve buscar serviços por termo", async () => {
      // Arrange
      const searchTerm = "corte";
      const mockServices = [
        {
          id: "service-1",
          name: "Corte de Cabelo",
          description: "Corte masculino",
          price: 50.0,
          isActive: true,
        },
      ];

      mockOfferedServiceRepository.search.mockResolvedValue(mockServices);

      // Act
      const result = await offeredServiceService.searchOfferedServices(
        searchTerm
      );

      // Assert
      expect(result).toEqual(mockServices);
      expect(mockOfferedServiceRepository.search).toHaveBeenCalledWith(
        searchTerm
      );
    });
  });

  describe("getOfferedServicesByCategory", () => {
    it("deve retornar serviços por categoria", async () => {
      // Arrange
      const category = "Cabelo";
      const mockServices = [
        {
          id: "service-1",
          name: "Corte de Cabelo",
          category,
          price: 50.0,
          isActive: true,
        },
      ];

      mockOfferedServiceRepository.findByCategory.mockResolvedValue(
        mockServices
      );

      // Act
      const result = await offeredServiceService.getOfferedServicesByCategory(
        category
      );

      // Assert
      expect(result).toEqual(mockServices);
      expect(mockOfferedServiceRepository.findByCategory).toHaveBeenCalledWith(
        category
      );
    });
  });

  describe("getOfferedServicesByPriceRange", () => {
    it("deve retornar serviços por faixa de preço", async () => {
      // Arrange
      const minPrice = 20.0;
      const maxPrice = 100.0;
      const mockServices = [
        {
          id: "service-1",
          name: "Corte de Cabelo",
          price: 50.0,
          isActive: true,
        },
      ];

      mockOfferedServiceRepository.findByPriceRange.mockResolvedValue(
        mockServices
      );

      // Act
      const result = await offeredServiceService.getOfferedServicesByPriceRange(
        minPrice,
        maxPrice
      );

      // Assert
      expect(result).toEqual(mockServices);
      expect(
        mockOfferedServiceRepository.findByPriceRange
      ).toHaveBeenCalledWith(minPrice, maxPrice);
    });
  });

  describe("toggleServiceStatus", () => {
    it("deve ativar serviço inativo", async () => {
      // Arrange
      const serviceId = "service-123";
      const mockService = {
        id: serviceId,
        name: "Corte de Cabelo",
        isActive: false,
      };

      const updatedService = {
        ...mockService,
        isActive: true,
        updatedAt: new Date(),
      };

      mockOfferedServiceRepository.findById.mockResolvedValue(mockService);
      mockOfferedServiceRepository.update.mockResolvedValue(updatedService);

      // Act
      const result = await offeredServiceService.toggleServiceStatus(serviceId);

      // Assert
      expect(result).toEqual(updatedService);
      expect(mockOfferedServiceRepository.update).toHaveBeenCalledWith(
        serviceId,
        { isActive: true }
      );
    });

    it("deve desativar serviço ativo", async () => {
      // Arrange
      const serviceId = "service-123";
      const mockService = {
        id: serviceId,
        name: "Corte de Cabelo",
        isActive: true,
      };

      const updatedService = {
        ...mockService,
        isActive: false,
        updatedAt: new Date(),
      };

      mockOfferedServiceRepository.findById.mockResolvedValue(mockService);
      mockOfferedServiceRepository.update.mockResolvedValue(updatedService);

      // Act
      const result = await offeredServiceService.toggleServiceStatus(serviceId);

      // Assert
      expect(result).toEqual(updatedService);
      expect(mockOfferedServiceRepository.update).toHaveBeenCalledWith(
        serviceId,
        { isActive: false }
      );
    });

    it("deve lançar erro quando serviço não encontrado", async () => {
      // Arrange
      const serviceId = "non-existent";
      mockOfferedServiceRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        offeredServiceService.toggleServiceStatus(serviceId)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
