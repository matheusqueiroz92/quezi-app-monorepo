import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import {
  OfferedServicesController,
  CategoriesController,
} from "../offered-services.controller";
import { offeredServicesService } from "../offered-services.service";

// Mock do service
jest.mock("../offered-services.service", () => ({
  offeredServicesService: {
    createService: jest.fn(),
    getServiceById: jest.fn(),
    getServices: jest.fn(),
    updateService: jest.fn(),
    deleteService: jest.fn(),
    getMostPopularServices: jest.fn(),
    createCategory: jest.fn(),
    getCategoryById: jest.fn(),
    getCategoryBySlug: jest.fn(),
    getAllCategories: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
  },
}));

describe("OfferedServicesController", () => {
  let controller: OfferedServicesController;
  let requestMock: any;
  let replyMock: any;

  beforeEach(() => {
    controller = new OfferedServicesController();

    requestMock = {
      user: { id: "prof-1" },
      body: {},
      params: {},
      query: {},
    };

    replyMock = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe("createService", () => {
    it("deve criar serviço com sucesso", async () => {
      const mockService = {
        id: "service-1",
        professionalId: "prof-1",
        categoryId: "cat-1",
        name: "Corte de Cabelo",
        price: 50.0,
        priceType: "FIXED",
        durationMinutes: 60,
      };

      requestMock.body = {
        categoryId: "cat-1",
        name: "Corte de Cabelo",
        description: "Corte masculino",
        price: 50.0,
        priceType: "FIXED",
        durationMinutes: 60,
      };

      (offeredServicesService.createService as jest.Mock).mockResolvedValue(
        mockService
      );

      await controller.createService(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(201);
      expect(replyMock.send).toHaveBeenCalledWith(mockService);
      expect(offeredServicesService.createService).toHaveBeenCalledWith(
        "prof-1",
        requestMock.body
      );
    });

    it("deve retornar 400 se professionalId não fornecido", async () => {
      requestMock.user = undefined;

      await controller.createService(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(400);
      expect(replyMock.send).toHaveBeenCalledWith({
        message: "ID do profissional não encontrado.",
      });
    });

    it("deve retornar 400 se professionalId não for string", async () => {
      requestMock.user = { id: 123 }; // número em vez de string

      await controller.createService(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(400);
    });
  });

  describe("getServiceById", () => {
    it("deve buscar serviço por ID com sucesso", async () => {
      const mockService = {
        id: "service-1",
        name: "Corte de Cabelo",
        price: 50.0,
      };

      requestMock.params = { id: "service-1" };

      (offeredServicesService.getServiceById as jest.Mock).mockResolvedValue(
        mockService
      );

      await controller.getServiceById(requestMock, replyMock);

      expect(replyMock.send).toHaveBeenCalledWith(mockService);
      expect(offeredServicesService.getServiceById).toHaveBeenCalledWith(
        "service-1"
      );
    });
  });

  describe("getServices", () => {
    it("deve listar serviços com filtros", async () => {
      const mockResponse = {
        services: [
          { id: "service-1", name: "Serviço 1" },
          { id: "service-2", name: "Serviço 2" },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      requestMock.query = {
        page: "1",
        limit: "10",
        search: "corte",
      };

      (offeredServicesService.getServices as jest.Mock).mockResolvedValue(
        mockResponse
      );

      await controller.getServices(requestMock, replyMock);

      expect(replyMock.send).toHaveBeenCalledWith(mockResponse);
      expect(offeredServicesService.getServices).toHaveBeenCalledWith(
        requestMock.query
      );
    });
  });

  describe("updateService", () => {
    it("deve atualizar serviço com sucesso", async () => {
      const mockService = {
        id: "service-1",
        name: "Corte Atualizado",
        price: 60.0,
      };

      requestMock.params = { id: "service-1" };
      requestMock.body = {
        name: "Corte Atualizado",
        price: 60.0,
      };
      requestMock.user = { id: "prof-1" };

      (offeredServicesService.updateService as jest.Mock).mockResolvedValue(
        mockService
      );

      await controller.updateService(requestMock, replyMock);

      expect(replyMock.send).toHaveBeenCalledWith(mockService);
      expect(offeredServicesService.updateService).toHaveBeenCalledWith(
        "service-1",
        "prof-1",
        requestMock.body
      );
    });

    it("deve retornar 400 se professionalId não fornecido", async () => {
      requestMock.user = undefined;
      requestMock.params = { id: "service-1" };

      await controller.updateService(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(400);
      expect(replyMock.send).toHaveBeenCalledWith({
        message: "ID do profissional não encontrado.",
      });
    });
  });

  describe("deleteService", () => {
    it("deve deletar serviço com sucesso", async () => {
      requestMock.params = { id: "service-1" };
      requestMock.user = { id: "prof-1" };

      (offeredServicesService.deleteService as jest.Mock).mockResolvedValue(
        undefined
      );

      await controller.deleteService(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(204);
      expect(replyMock.send).toHaveBeenCalled();
      expect(offeredServicesService.deleteService).toHaveBeenCalledWith(
        "service-1",
        "prof-1"
      );
    });

    it("deve retornar 400 se professionalId não fornecido", async () => {
      requestMock.user = undefined;
      requestMock.params = { id: "service-1" };

      await controller.deleteService(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(400);
      expect(replyMock.send).toHaveBeenCalledWith({
        message: "ID do profissional não encontrado.",
      });
    });

    it("deve retornar 400 se serviceId não fornecido", async () => {
      requestMock.user = { id: "prof-1" };
      requestMock.params = {};

      await controller.deleteService(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(400);
      expect(replyMock.send).toHaveBeenCalledWith({
        message: "ID do serviço não encontrado.",
      });
    });
  });

  describe("getMostPopularServices", () => {
    it("deve retornar serviços mais populares com limite padrão", async () => {
      const mockServices = [
        { id: "service-1", name: "Serviço 1", appointmentCount: 100 },
        { id: "service-2", name: "Serviço 2", appointmentCount: 50 },
      ];

      requestMock.query = {};

      (
        offeredServicesService.getMostPopularServices as jest.Mock
      ).mockResolvedValue(mockServices);

      await controller.getMostPopularServices(requestMock, replyMock);

      expect(replyMock.send).toHaveBeenCalledWith(mockServices);
      expect(
        offeredServicesService.getMostPopularServices
      ).toHaveBeenCalledWith(10);
    });

    it("deve retornar serviços com limite customizado", async () => {
      const mockServices = [
        { id: "service-1", name: "Top 1" },
        { id: "service-2", name: "Top 2" },
        { id: "service-3", name: "Top 3" },
      ];

      requestMock.query = { limit: "3" };

      (
        offeredServicesService.getMostPopularServices as jest.Mock
      ).mockResolvedValue(mockServices);

      await controller.getMostPopularServices(requestMock, replyMock);

      expect(
        offeredServicesService.getMostPopularServices
      ).toHaveBeenCalledWith(3);
    });
  });
});

describe("CategoriesController", () => {
  let controller: CategoriesController;
  let requestMock: any;
  let replyMock: any;

  beforeEach(() => {
    controller = new CategoriesController();

    requestMock = {
      user: { id: "admin-1" },
      body: {},
      params: {},
      query: {},
    };

    replyMock = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe("createCategory", () => {
    it("deve criar categoria com sucesso", async () => {
      const mockCategory = {
        id: "cat-1",
        name: "Cabelo",
        slug: "cabelo",
      };

      requestMock.body = {
        name: "Cabelo",
        slug: "cabelo",
      };

      (offeredServicesService.createCategory as jest.Mock).mockResolvedValue(
        mockCategory
      );

      await controller.createCategory(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(201);
      expect(replyMock.send).toHaveBeenCalledWith(mockCategory);
      expect(offeredServicesService.createCategory).toHaveBeenCalledWith(
        requestMock.body
      );
    });
  });

  describe("getCategoryById", () => {
    it("deve buscar categoria por ID com sucesso", async () => {
      const mockCategory = {
        id: "cat-1",
        name: "Cabelo",
        slug: "cabelo",
      };

      requestMock.params = { id: "cat-1" };

      (offeredServicesService.getCategoryById as jest.Mock).mockResolvedValue(
        mockCategory
      );

      await controller.getCategoryById(requestMock, replyMock);

      expect(replyMock.send).toHaveBeenCalledWith(mockCategory);
      expect(offeredServicesService.getCategoryById).toHaveBeenCalledWith(
        "cat-1"
      );
    });
  });

  describe("getCategoryBySlug", () => {
    it("deve buscar categoria por slug com sucesso", async () => {
      const mockCategory = {
        id: "cat-1",
        name: "Cabelo",
        slug: "cabelo",
      };

      requestMock.params = { slug: "cabelo" };

      (offeredServicesService.getCategoryBySlug as jest.Mock).mockResolvedValue(
        mockCategory
      );

      await controller.getCategoryBySlug(requestMock, replyMock);

      expect(replyMock.send).toHaveBeenCalledWith(mockCategory);
      expect(offeredServicesService.getCategoryBySlug).toHaveBeenCalledWith(
        "cabelo"
      );
    });
  });

  describe("getAllCategories", () => {
    it("deve listar categorias sem incluir serviços", async () => {
      const mockCategories = [
        { id: "cat-1", name: "Cabelo", slug: "cabelo" },
        { id: "cat-2", name: "Barba", slug: "barba" },
      ];

      requestMock.query = {};

      (offeredServicesService.getAllCategories as jest.Mock).mockResolvedValue(
        mockCategories
      );

      await controller.getAllCategories(requestMock, replyMock);

      expect(replyMock.send).toHaveBeenCalledWith(mockCategories);
      expect(offeredServicesService.getAllCategories).toHaveBeenCalledWith(
        false
      );
    });

    it("deve listar categorias incluindo serviços", async () => {
      const mockCategories = [
        {
          id: "cat-1",
          name: "Cabelo",
          slug: "cabelo",
          services: [{ id: "service-1", name: "Corte" }],
        },
      ];

      requestMock.query = { includeServices: "true" };

      (offeredServicesService.getAllCategories as jest.Mock).mockResolvedValue(
        mockCategories
      );

      await controller.getAllCategories(requestMock, replyMock);

      expect(offeredServicesService.getAllCategories).toHaveBeenCalledWith(
        true
      );
    });

    it("deve interpretar includeServices=false corretamente", async () => {
      requestMock.query = { includeServices: "false" };

      (offeredServicesService.getAllCategories as jest.Mock).mockResolvedValue(
        []
      );

      await controller.getAllCategories(requestMock, replyMock);

      expect(offeredServicesService.getAllCategories).toHaveBeenCalledWith(
        false
      );
    });
  });

  describe("updateCategory", () => {
    it("deve atualizar categoria com sucesso", async () => {
      const mockCategory = {
        id: "cat-1",
        name: "Cabelo e Barba",
        slug: "cabelo-barba",
      };

      requestMock.params = { id: "cat-1" };
      requestMock.body = {
        name: "Cabelo e Barba",
      };

      (offeredServicesService.updateCategory as jest.Mock).mockResolvedValue(
        mockCategory
      );

      await controller.updateCategory(requestMock, replyMock);

      expect(replyMock.send).toHaveBeenCalledWith(mockCategory);
      expect(offeredServicesService.updateCategory).toHaveBeenCalledWith(
        "cat-1",
        requestMock.body
      );
    });
  });

  describe("deleteCategory", () => {
    it("deve deletar categoria com sucesso", async () => {
      requestMock.params = { id: "cat-1" };

      (offeredServicesService.deleteCategory as jest.Mock).mockResolvedValue(
        undefined
      );

      await controller.deleteCategory(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(204);
      expect(replyMock.send).toHaveBeenCalled();
      expect(offeredServicesService.deleteCategory).toHaveBeenCalledWith(
        "cat-1"
      );
    });
  });
});
