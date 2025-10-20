import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { ProfilesController } from "../profiles.controller";
import { ProfilesService } from "../profiles.service";
import { AppError } from "../../../utils/app-error";

jest.mock("../profiles.service");

describe("ProfilesController", () => {
  let controller: ProfilesController;
  let serviceMock: any;
  let requestMock: any;
  let replyMock: any;

  beforeEach(() => {
    serviceMock = {
      createProfile: jest.fn(),
      getProfile: jest.fn(),
      getProfiles: jest.fn(),
      searchProfiles: jest.fn(),
      updateProfile: jest.fn(),
      deleteProfile: jest.fn(),
      updatePortfolio: jest.fn(),
      updateWorkingHours: jest.fn(),
      toggleActive: jest.fn(),
      getTopRated: jest.fn(),
      getMyProfile: jest.fn(),
    };

    controller = new ProfilesController(serviceMock);

    requestMock = {
      user: { id: "550e8400-e29b-41d4-a716-446655440000" },
      body: {},
      params: {},
      query: {},
    };

    replyMock = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe("createProfile", () => {
    it("deve criar perfil com sucesso", async () => {
      const userId = "clx1234567890abcdef";
      const mockProfile = {
        userId,
        city: "São Paulo",
        serviceMode: "BOTH",
      };

      requestMock.user = { id: userId };
      requestMock.body = {
        userId,
        city: "São Paulo",
        serviceMode: "BOTH",
      };

      serviceMock.createProfile.mockResolvedValue(mockProfile);

      await controller.createProfile(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(201);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        data: mockProfile,
        message: "Perfil profissional criado com sucesso",
      });
    });

    it("deve retornar 401 se não autenticado", async () => {
      requestMock.user = undefined;
      requestMock.body = {
        userId: "clx1234567890abcdef",
        city: "São Paulo",
        serviceMode: "BOTH",
      };

      await controller.createProfile(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(401);
    });
  });

  describe("getProfile", () => {
    it("deve buscar perfil com sucesso", async () => {
      const userId = "clx1234567890abcdef";
      const mockProfile = {
        userId,
        city: "São Paulo",
      };

      requestMock.params = { userId };

      serviceMock.getProfile.mockResolvedValue(mockProfile);

      await controller.getProfile(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        data: mockProfile,
      });
    });

    it("deve retornar 401 se não autenticado", async () => {
      const userId = "clx1234567890abcdef";
      requestMock.user = undefined;
      requestMock.params = { userId };

      await controller.getProfile(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(401);
    });
  });

  describe("getProfiles", () => {
    it("deve listar perfis com sucesso", async () => {
      const mockResult = {
        profiles: [{ userId: "prof-1" }],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      requestMock.query = {};

      serviceMock.getProfiles.mockResolvedValue(mockResult);

      await controller.getProfiles(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        data: mockResult.profiles,
        pagination: mockResult.pagination,
      });
    });
  });

  describe("searchProfiles", () => {
    it("deve buscar perfis com sucesso", async () => {
      const mockResult = {
        profiles: [{ userId: "prof-1" }],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      requestMock.query = { query: "barbeiro" };

      serviceMock.searchProfiles.mockResolvedValue(mockResult);

      await controller.searchProfiles(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
    });
  });

  describe("updateProfile", () => {
    it("deve atualizar perfil com sucesso", async () => {
      const userId = "clx1234567890abcdef";
      const mockProfile = {
        userId,
        bio: "Atualizado",
      };

      requestMock.params = { userId };
      requestMock.body = { bio: "Atualizado" };

      serviceMock.updateProfile.mockResolvedValue(mockProfile);

      await controller.updateProfile(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        data: mockProfile,
        message: "Perfil atualizado com sucesso",
      });
    });

    it("deve retornar 401 se não autenticado", async () => {
      const userId = "clx1234567890abcdef";
      requestMock.user = undefined;
      requestMock.params = { userId };
      requestMock.body = { bio: "Test" };

      await controller.updateProfile(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(401);
    });
  });

  describe("deleteProfile", () => {
    it("deve deletar perfil com sucesso", async () => {
      const userId = "clx1234567890abcdef";
      requestMock.params = { userId };

      serviceMock.deleteProfile.mockResolvedValue({ success: true });

      await controller.deleteProfile(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        message: "Perfil deletado com sucesso",
      });
    });

    it("deve retornar 401 se não autenticado", async () => {
      const userId = "clx1234567890abcdef";
      requestMock.user = undefined;
      requestMock.params = { userId };

      await controller.deleteProfile(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(401);
    });
  });

  describe("updatePortfolio", () => {
    it("deve atualizar portfólio com sucesso", async () => {
      const userId = "clx1234567890abcdef";
      const mockProfile = {
        userId,
        portfolioImages: ["https://example.com/img1.jpg"],
      };

      requestMock.params = { userId };
      requestMock.body = {
        portfolioImages: ["https://example.com/img1.jpg"],
      };

      serviceMock.updatePortfolio.mockResolvedValue(mockProfile);

      await controller.updatePortfolio(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        data: mockProfile,
        message: "Portfólio atualizado com sucesso",
      });
    });
  });

  describe("updateWorkingHours", () => {
    it("deve atualizar horários com sucesso", async () => {
      const userId = "clx1234567890abcdef";
      const workingHours = {
        MONDAY: { isOpen: true, slots: [{ start: "09:00", end: "18:00" }] },
      };

      const mockProfile = {
        userId,
        workingHours,
      };

      requestMock.params = { userId };
      requestMock.body = { workingHours };

      serviceMock.updateWorkingHours.mockResolvedValue(mockProfile);

      await controller.updateWorkingHours(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
    });
  });

  describe("toggleActive", () => {
    it("deve ativar perfil com sucesso", async () => {
      const userId = "clx1234567890abcdef";
      const mockProfile = {
        userId,
        isActive: true,
      };

      requestMock.params = { userId };
      requestMock.body = { isActive: true };

      serviceMock.toggleActive.mockResolvedValue(mockProfile);

      await controller.toggleActive(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        data: mockProfile,
        message: "Perfil ativado com sucesso",
      });
    });

    it("deve desativar perfil com sucesso", async () => {
      const userId = "clx1234567890abcdef";
      const mockProfile = {
        userId,
        isActive: false,
      };

      requestMock.params = { userId };
      requestMock.body = { isActive: false };

      serviceMock.toggleActive.mockResolvedValue(mockProfile);

      await controller.toggleActive(requestMock, replyMock);

      expect(replyMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Perfil desativado com sucesso",
        })
      );
    });
  });

  describe("getTopRated", () => {
    it("deve buscar top rated com sucesso", async () => {
      const mockProfiles = [
        { userId: "prof-1", averageRating: 5.0 },
        { userId: "prof-2", averageRating: 4.8 },
      ];

      requestMock.query = { limit: "5" };

      serviceMock.getTopRated.mockResolvedValue(mockProfiles);

      await controller.getTopRated(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(serviceMock.getTopRated).toHaveBeenCalledWith(5);
    });

    it("deve usar limite padrão se não fornecido", async () => {
      requestMock.query = {};

      serviceMock.getTopRated.mockResolvedValue([]);

      await controller.getTopRated(requestMock, replyMock);

      expect(serviceMock.getTopRated).toHaveBeenCalledWith(10);
    });
  });

  describe("getMyProfile", () => {
    it("deve buscar próprio perfil com sucesso", async () => {
      const mockProfile = {
        userId: "550e8400-e29b-41d4-a716-446655440000",
        city: "São Paulo",
      };

      serviceMock.getMyProfile.mockResolvedValue(mockProfile);

      await controller.getMyProfile(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        data: mockProfile,
      });
    });

    it("deve retornar 401 se não autenticado", async () => {
      requestMock.user = undefined;

      await controller.getMyProfile(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(401);
    });
  });
});

