import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { ProfilesService } from "../profiles.service";
import { ProfilesRepository } from "../profiles.repository";
import { AppError } from "../../../utils/app-error";

jest.mock("../profiles.repository");

describe("ProfilesService", () => {
  let service: ProfilesService;
  let repositoryMock: any;

  beforeEach(() => {
    repositoryMock = {
      create: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      search: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updatePortfolio: jest.fn(),
      updateWorkingHours: jest.fn(),
      toggleActive: jest.fn(),
      exists: jest.fn(),
      countByCity: jest.fn(),
      getTopRated: jest.fn(),
    };

    service = new ProfilesService(repositoryMock);
  });

  describe("createProfile", () => {
    it("deve criar perfil com sucesso", async () => {
      const mockProfile = {
        userId: "user-1",
        city: "São Paulo",
        serviceMode: "BOTH",
      };

      repositoryMock.create.mockResolvedValue(mockProfile);

      const input = {
        userId: "user-1",
        city: "São Paulo",
        serviceMode: "BOTH" as const,
      };

      const result = await service.createProfile(input, "user-1");

      expect(result).toEqual(mockProfile);
    });

    it("deve lançar erro se tentar criar perfil para outro usuário", async () => {
      const input = {
        userId: "user-1",
        city: "São Paulo",
        serviceMode: "BOTH" as const,
      };

      await expect(service.createProfile(input, "other-user")).rejects.toThrow(
        AppError
      );
      await expect(service.createProfile(input, "other-user")).rejects.toThrow(
        "Você só pode criar perfil para sua própria conta"
      );
    });

    it("deve propagar erro do repository", async () => {
      const input = {
        userId: "user-1",
        city: "São Paulo",
        serviceMode: "BOTH" as const,
      };

      repositoryMock.create.mockRejectedValue(new Error("DB error"));

      await expect(service.createProfile(input, "user-1")).rejects.toThrow(
        "Erro ao criar perfil profissional"
      );
    });
  });

  describe("getProfile", () => {
    it("deve buscar perfil ativo com sucesso", async () => {
      const mockProfile = {
        userId: "prof-1",
        isActive: true,
        city: "São Paulo",
      };

      repositoryMock.findById.mockResolvedValue(mockProfile);

      const result = await service.getProfile({ userId: "prof-1" }, "any-user");

      expect(result).toEqual(mockProfile);
    });

    it("deve permitir dono ver perfil inativo", async () => {
      const mockProfile = {
        userId: "prof-1",
        isActive: false,
        city: "São Paulo",
      };

      repositoryMock.findById.mockResolvedValue(mockProfile);

      const result = await service.getProfile({ userId: "prof-1" }, "prof-1");

      expect(result).toEqual(mockProfile);
    });

    it("deve lançar erro se perfil inativo e não for o dono", async () => {
      const mockProfile = {
        userId: "prof-1",
        isActive: false,
      };

      repositoryMock.findById.mockResolvedValue(mockProfile);

      await expect(
        service.getProfile({ userId: "prof-1" }, "other-user")
      ).rejects.toThrow("Perfil não está ativo");
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

      repositoryMock.findMany.mockResolvedValue(mockResult);

      const result = await service.getProfiles({
        page: 1,
        limit: 10,
        sortBy: "rating",
        sortOrder: "desc",
      });

      expect(result).toEqual(mockResult);
    });

    it("deve propagar erro do repository", async () => {
      repositoryMock.findMany.mockRejectedValue(new Error("DB error"));

      await expect(
        service.getProfiles({
          page: 1,
          limit: 10,
          sortBy: "rating",
          sortOrder: "desc",
        })
      ).rejects.toThrow("Erro ao buscar perfis profissionais");
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

      repositoryMock.search.mockResolvedValue(mockResult);

      const result = await service.searchProfiles({
        query: "barbeiro",
        page: 1,
        limit: 10,
      });

      expect(result).toEqual(mockResult);
    });
  });

  describe("updateProfile", () => {
    it("deve atualizar perfil com sucesso", async () => {
      const mockProfile = {
        userId: "user-1",
        bio: "Atualizado",
      };

      repositoryMock.update.mockResolvedValue(mockProfile);

      const result = await service.updateProfile(
        { userId: "user-1" },
        { bio: "Atualizado" },
        "user-1"
      );

      expect(result).toEqual(mockProfile);
    });

    it("deve lançar erro se tentar atualizar perfil de outro", async () => {
      await expect(
        service.updateProfile(
          { userId: "user-1" },
          { bio: "Test" },
          "other-user"
        )
      ).rejects.toThrow("Você só pode atualizar seu próprio perfil");
    });
  });

  describe("deleteProfile", () => {
    it("deve deletar perfil com sucesso", async () => {
      repositoryMock.delete.mockResolvedValue({ success: true });

      const result = await service.deleteProfile({ userId: "user-1" }, "user-1");

      expect(result).toEqual({ success: true });
    });

    it("deve lançar erro se tentar deletar perfil de outro", async () => {
      await expect(
        service.deleteProfile({ userId: "user-1" }, "other-user")
      ).rejects.toThrow("Você só pode deletar seu próprio perfil");
    });
  });

  describe("updatePortfolio", () => {
    it("deve atualizar portfólio com sucesso", async () => {
      const mockProfile = {
        userId: "user-1",
        portfolioImages: ["https://example.com/img1.jpg"],
      };

      repositoryMock.updatePortfolio.mockResolvedValue(mockProfile);

      const result = await service.updatePortfolio(
        { userId: "user-1" },
        { portfolioImages: ["https://example.com/img1.jpg"] },
        "user-1"
      );

      expect(result).toEqual(mockProfile);
    });

    it("deve lançar erro se tentar atualizar portfólio de outro", async () => {
      await expect(
        service.updatePortfolio(
          { userId: "user-1" },
          { portfolioImages: ["https://example.com/img.jpg"] },
          "other-user"
        )
      ).rejects.toThrow("Você só pode atualizar seu próprio portfólio");
    });
  });

  describe("updateWorkingHours", () => {
    it("deve atualizar horários com sucesso", async () => {
      const workingHours = {
        MONDAY: { isOpen: true, slots: [{ start: "09:00", end: "18:00" }] },
      };

      const mockProfile = {
        userId: "user-1",
        workingHours,
      };

      repositoryMock.updateWorkingHours.mockResolvedValue(mockProfile);

      const result = await service.updateWorkingHours(
        { userId: "user-1" },
        { workingHours },
        "user-1"
      );

      expect(result).toEqual(mockProfile);
    });

    it("deve lançar erro se tentar atualizar horários de outro", async () => {
      await expect(
        service.updateWorkingHours(
          { userId: "user-1" },
          { workingHours: {} },
          "other-user"
        )
      ).rejects.toThrow("Você só pode atualizar seus próprios horários");
    });
  });

  describe("toggleActive", () => {
    it("deve ativar perfil com sucesso", async () => {
      const mockProfile = {
        userId: "user-1",
        isActive: true,
      };

      repositoryMock.toggleActive.mockResolvedValue(mockProfile);

      const result = await service.toggleActive(
        { userId: "user-1" },
        { isActive: true },
        "user-1"
      );

      expect(result.isActive).toBe(true);
    });

    it("deve lançar erro se tentar alterar status de outro perfil", async () => {
      await expect(
        service.toggleActive(
          { userId: "user-1" },
          { isActive: false },
          "other-user"
        )
      ).rejects.toThrow("Você só pode alterar status do seu próprio perfil");
    });
  });

  describe("getTopRated", () => {
    it("deve buscar perfis mais bem avaliados", async () => {
      const mockProfiles = [
        { userId: "prof-1", averageRating: 5.0 },
        { userId: "prof-2", averageRating: 4.8 },
      ];

      repositoryMock.getTopRated.mockResolvedValue(mockProfiles);

      const result = await service.getTopRated(10);

      expect(result).toEqual(mockProfiles);
    });
  });

  describe("getMyProfile", () => {
    it("deve buscar próprio perfil com sucesso", async () => {
      const mockProfile = {
        userId: "user-1",
        city: "São Paulo",
      };

      repositoryMock.findById.mockResolvedValue(mockProfile);

      const result = await service.getMyProfile("user-1");

      expect(result).toEqual(mockProfile);
    });
  });
});

