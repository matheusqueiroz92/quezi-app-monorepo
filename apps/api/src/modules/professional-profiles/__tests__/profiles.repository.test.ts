import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { ProfilesRepository } from "../profiles.repository";
import { AppError } from "../../../utils/app-error";

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(),
  Prisma: {
    JsonNull: null,
  },
}));

describe("ProfilesRepository", () => {
  let repository: ProfilesRepository;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: jest.fn(),
      },
      professionalProfile: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    repository = new ProfilesRepository(prismaMock as any);
  });

  describe("create", () => {
    it("deve criar perfil com sucesso", async () => {
      const mockUser = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        userType: "PROFESSIONAL",
      };

      const mockProfile = {
        userId: "550e8400-e29b-41d4-a716-446655440000",
        bio: "Profissional experiente",
        city: "São Paulo",
        serviceMode: "BOTH",
        user: { id: "550e8400-e29b-41d4-a716-446655440000", name: "Prof" },
        services: [],
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.professionalProfile.findUnique.mockResolvedValue(null);
      prismaMock.professionalProfile.create.mockResolvedValue(mockProfile);

      const input = {
        userId: "550e8400-e29b-41d4-a716-446655440000",
        city: "São Paulo",
        serviceMode: "BOTH" as const,
      };

      const result = await repository.create(input);

      expect(result).toEqual(mockProfile);
    });

    it("deve criar perfil com todos os campos opcionais", async () => {
      const mockUser = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        userType: "PROFESSIONAL",
      };

      const mockProfile = {
        userId: "550e8400-e29b-41d4-a716-446655440000",
        bio: "Bio",
        city: "São Paulo",
        serviceMode: "BOTH",
        portfolioImages: ["https://example.com/img1.jpg"],
        specialties: ["Corte", "Barba"],
        certifications: ["Cert 1"],
        languages: ["Português"],
        yearsOfExperience: 5,
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.professionalProfile.findUnique.mockResolvedValue(null);
      prismaMock.professionalProfile.create.mockResolvedValue(mockProfile);

      const input = {
        userId: "550e8400-e29b-41d4-a716-446655440000",
        city: "São Paulo",
        serviceMode: "BOTH" as const,
        bio: "Bio",
        portfolioImages: ["https://example.com/img1.jpg"],
        specialties: ["Corte", "Barba"],
        certifications: ["Cert 1"],
        languages: ["Português"],
        yearsOfExperience: 5,
      };

      const result = await repository.create(input);

      expect(result).toEqual(mockProfile);
    });

    it("deve lançar erro se usuário não existir", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const input = {
        userId: "non-existent",
        city: "São Paulo",
        serviceMode: "BOTH" as const,
      };

      await expect(repository.create(input)).rejects.toThrow(AppError);
      await expect(repository.create(input)).rejects.toThrow(
        "Usuário não encontrado"
      );
    });

    it("deve lançar erro se usuário não for PROFESSIONAL", async () => {
      const mockUser = {
        id: "user-1",
        userType: "CLIENT",
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const input = {
        userId: "user-1",
        city: "São Paulo",
        serviceMode: "BOTH" as const,
      };

      await expect(repository.create(input)).rejects.toThrow(AppError);
      await expect(repository.create(input)).rejects.toThrow(
        "Apenas usuários profissionais podem ter perfil"
      );
    });

    it("deve lançar erro se perfil já existir", async () => {
      const mockUser = {
        id: "user-1",
        userType: "PROFESSIONAL",
      };

      const existingProfile = {
        userId: "user-1",
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.professionalProfile.findUnique.mockResolvedValue(
        existingProfile
      );

      const input = {
        userId: "user-1",
        city: "São Paulo",
        serviceMode: "BOTH" as const,
      };

      await expect(repository.create(input)).rejects.toThrow(AppError);
      await expect(repository.create(input)).rejects.toThrow(
        "Perfil profissional já existe para este usuário"
      );
    });
  });

  describe("findById", () => {
    it("deve buscar perfil por ID", async () => {
      const mockProfile = {
        userId: "550e8400-e29b-41d4-a716-446655440000",
        city: "São Paulo",
        user: { id: "550e8400-e29b-41d4-a716-446655440000", name: "Prof" },
        services: [],
      };

      prismaMock.professionalProfile.findUnique.mockResolvedValue(mockProfile);

      const result = await repository.findById(
        "550e8400-e29b-41d4-a716-446655440000"
      );

      expect(result).toEqual(mockProfile);
    });

    it("deve lançar erro se perfil não encontrado", async () => {
      prismaMock.professionalProfile.findUnique.mockResolvedValue(null);

      await expect(repository.findById("non-existent")).rejects.toThrow(
        AppError
      );
      await expect(repository.findById("non-existent")).rejects.toThrow(
        "Perfil profissional não encontrado"
      );
    });
  });

  describe("findMany", () => {
    it("deve listar perfis com paginação", async () => {
      const mockProfiles = [
        { userId: "prof-1", city: "São Paulo" },
        { userId: "prof-2", city: "Rio de Janeiro" },
      ];

      prismaMock.professionalProfile.findMany.mockResolvedValue(mockProfiles);
      prismaMock.professionalProfile.count.mockResolvedValue(2);

      const query = {
        page: 1,
        limit: 10,
        sortBy: "rating" as const,
        sortOrder: "desc" as const,
      };

      const result = await repository.findMany(query);

      expect(result.profiles).toEqual(mockProfiles);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it("deve filtrar por cidade", async () => {
      prismaMock.professionalProfile.findMany.mockResolvedValue([]);
      prismaMock.professionalProfile.count.mockResolvedValue(0);

      const query = {
        page: 1,
        limit: 10,
        city: "São Paulo",
        sortBy: "rating" as const,
        sortOrder: "desc" as const,
      };

      await repository.findMany(query);

      expect(prismaMock.professionalProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            city: { contains: "São Paulo", mode: "insensitive" },
          }),
        })
      );
    });

    it("deve filtrar por minRating", async () => {
      prismaMock.professionalProfile.findMany.mockResolvedValue([]);
      prismaMock.professionalProfile.count.mockResolvedValue(0);

      const query = {
        page: 1,
        limit: 10,
        minRating: 4.5,
        sortBy: "rating" as const,
        sortOrder: "desc" as const,
      };

      await repository.findMany(query);

      expect(prismaMock.professionalProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            averageRating: { gte: 4.5 },
          }),
        })
      );
    });

    it("deve ordenar por experience", async () => {
      prismaMock.professionalProfile.findMany.mockResolvedValue([]);
      prismaMock.professionalProfile.count.mockResolvedValue(0);

      const query = {
        page: 1,
        limit: 10,
        sortBy: "experience" as const,
        sortOrder: "asc" as const,
      };

      await repository.findMany(query);

      expect(prismaMock.professionalProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { yearsOfExperience: "asc" },
        })
      );
    });

    it("deve ordenar por reviews", async () => {
      prismaMock.professionalProfile.findMany.mockResolvedValue([]);
      prismaMock.professionalProfile.count.mockResolvedValue(0);

      const query = {
        page: 1,
        limit: 10,
        sortBy: "reviews" as const,
        sortOrder: "desc" as const,
      };

      await repository.findMany(query);

      expect(prismaMock.professionalProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { totalRatings: "desc" },
        })
      );
    });

    it("deve ordenar por createdAt", async () => {
      prismaMock.professionalProfile.findMany.mockResolvedValue([]);
      prismaMock.professionalProfile.count.mockResolvedValue(0);

      const query = {
        page: 1,
        limit: 10,
        sortBy: "createdAt" as const,
        sortOrder: "asc" as const,
      };

      await repository.findMany(query);

      expect(prismaMock.professionalProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: "asc" },
        })
      );
    });
  });

  describe("search", () => {
    it("deve buscar perfis por texto", async () => {
      const mockProfiles = [{ userId: "prof-1", city: "São Paulo" }];

      prismaMock.professionalProfile.findMany.mockResolvedValue(mockProfiles);
      prismaMock.professionalProfile.count.mockResolvedValue(1);

      const query = {
        query: "barbeiro",
        page: 1,
        limit: 10,
      };

      const result = await repository.search(query);

      expect(result.profiles).toEqual(mockProfiles);
    });

    it("deve filtrar apenas perfis ativos", async () => {
      prismaMock.professionalProfile.findMany.mockResolvedValue([]);
      prismaMock.professionalProfile.count.mockResolvedValue(0);

      const query = {
        query: "cabeleireiro",
        page: 1,
        limit: 10,
      };

      await repository.search(query);

      expect(prismaMock.professionalProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      );
    });
  });

  describe("update", () => {
    it("deve atualizar perfil com sucesso", async () => {
      const existingProfile = {
        userId: "550e8400-e29b-41d4-a716-446655440000",
        city: "São Paulo",
      };

      const updatedProfile = {
        ...existingProfile,
        bio: "Nova bio",
      };

      prismaMock.professionalProfile.findUnique.mockResolvedValue(
        existingProfile
      );
      prismaMock.professionalProfile.update.mockResolvedValue(updatedProfile);

      const result = await repository.update(
        "550e8400-e29b-41d4-a716-446655440000",
        { bio: "Nova bio" }
      );

      expect(result.bio).toBe("Nova bio");
    });

    it("deve lançar erro se perfil não encontrado", async () => {
      prismaMock.professionalProfile.findUnique.mockResolvedValue(null);

      await expect(
        repository.update("non-existent", { bio: "Test" })
      ).rejects.toThrow("Perfil profissional não encontrado");
    });
  });

  describe("delete", () => {
    it("deve deletar perfil com sucesso", async () => {
      const mockProfile = {
        userId: "550e8400-e29b-41d4-a716-446655440000",
      };

      prismaMock.professionalProfile.findUnique.mockResolvedValue(mockProfile);
      prismaMock.professionalProfile.delete.mockResolvedValue(mockProfile);

      const result = await repository.delete(
        "550e8400-e29b-41d4-a716-446655440000"
      );

      expect(result).toEqual({ success: true });
    });

    it("deve lançar erro se perfil não encontrado", async () => {
      prismaMock.professionalProfile.findUnique.mockResolvedValue(null);

      await expect(repository.delete("non-existent")).rejects.toThrow(
        "Perfil profissional não encontrado"
      );
    });
  });

  describe("updatePortfolio", () => {
    it("deve atualizar portfólio com sucesso", async () => {
      const mockProfile = {
        userId: "550e8400-e29b-41d4-a716-446655440000",
      };

      const updatedProfile = {
        ...mockProfile,
        portfolioImages: ["https://example.com/img1.jpg"],
      };

      prismaMock.professionalProfile.findUnique.mockResolvedValue(mockProfile);
      prismaMock.professionalProfile.update.mockResolvedValue(updatedProfile);

      const result = await repository.updatePortfolio(
        "550e8400-e29b-41d4-a716-446655440000",
        ["https://example.com/img1.jpg"]
      );

      expect(result.portfolioImages).toHaveLength(1);
    });

    it("deve lançar erro se perfil não encontrado", async () => {
      prismaMock.professionalProfile.findUnique.mockResolvedValue(null);

      await expect(
        repository.updatePortfolio("non-existent", ["https://example.com/img.jpg"])
      ).rejects.toThrow("Perfil profissional não encontrado");
    });
  });

  describe("updateWorkingHours", () => {
    it("deve atualizar horários com sucesso", async () => {
      const mockProfile = {
        userId: "550e8400-e29b-41d4-a716-446655440000",
      };

      const workingHours = {
        MONDAY: { isOpen: true, slots: [{ start: "09:00", end: "18:00" }] },
      };

      const updatedProfile = {
        ...mockProfile,
        workingHours,
      };

      prismaMock.professionalProfile.findUnique.mockResolvedValue(mockProfile);
      prismaMock.professionalProfile.update.mockResolvedValue(updatedProfile);

      const result = await repository.updateWorkingHours(
        "550e8400-e29b-41d4-a716-446655440000",
        workingHours
      );

      expect(result.workingHours).toEqual(workingHours);
    });
  });

  describe("toggleActive", () => {
    it("deve ativar perfil", async () => {
      const mockProfile = {
        userId: "550e8400-e29b-41d4-a716-446655440000",
        isActive: false,
      };

      const updatedProfile = {
        ...mockProfile,
        isActive: true,
      };

      prismaMock.professionalProfile.findUnique.mockResolvedValue(mockProfile);
      prismaMock.professionalProfile.update.mockResolvedValue(updatedProfile);

      const result = await repository.toggleActive(
        "550e8400-e29b-41d4-a716-446655440000",
        true
      );

      expect(result.isActive).toBe(true);
    });

    it("deve desativar perfil", async () => {
      const mockProfile = {
        userId: "550e8400-e29b-41d4-a716-446655440000",
        isActive: true,
      };

      const updatedProfile = {
        ...mockProfile,
        isActive: false,
      };

      prismaMock.professionalProfile.findUnique.mockResolvedValue(mockProfile);
      prismaMock.professionalProfile.update.mockResolvedValue(updatedProfile);

      const result = await repository.toggleActive(
        "550e8400-e29b-41d4-a716-446655440000",
        false
      );

      expect(result.isActive).toBe(false);
    });

    it("deve lançar erro se perfil não encontrado", async () => {
      prismaMock.professionalProfile.findUnique.mockResolvedValue(null);

      await expect(repository.toggleActive("non-existent", true)).rejects.toThrow(
        "Perfil profissional não encontrado"
      );
    });

    it("deve lançar erro genérico em caso de falha no update", async () => {
      prismaMock.professionalProfile.findUnique.mockResolvedValue({ userId: "user-1" });
      prismaMock.professionalProfile.update.mockRejectedValue(new Error("DB error"));

      await expect(repository.toggleActive("user-1", true)).rejects.toThrow(
        "Erro ao alterar status do perfil"
      );
    });
  });

  describe("exists", () => {
    it("deve retornar true se perfil existe", async () => {
      prismaMock.professionalProfile.findUnique.mockResolvedValue({
        userId: "550e8400-e29b-41d4-a716-446655440000",
      });

      const result = await repository.exists(
        "550e8400-e29b-41d4-a716-446655440000"
      );

      expect(result).toBe(true);
    });

    it("deve retornar false se perfil não existe", async () => {
      prismaMock.professionalProfile.findUnique.mockResolvedValue(null);

      const result = await repository.exists("non-existent");

      expect(result).toBe(false);
    });

    it("deve retornar false em caso de erro", async () => {
      prismaMock.professionalProfile.findUnique.mockRejectedValue(new Error("DB error"));

      const result = await repository.exists("user-1");

      expect(result).toBe(false);
    });
  });

  describe("countByCity", () => {
    it("deve contar perfis por cidade", async () => {
      prismaMock.professionalProfile.count.mockResolvedValue(15);

      const result = await repository.countByCity("São Paulo");

      expect(result).toBe(15);
    });

    it("deve retornar 0 em caso de erro", async () => {
      prismaMock.professionalProfile.count.mockRejectedValue(new Error("DB error"));

      const result = await repository.countByCity("São Paulo");

      expect(result).toBe(0);
    });
  });

  describe("getTopRated", () => {
    it("deve retornar perfis mais bem avaliados", async () => {
      const mockProfiles = [
        { userId: "prof-1", averageRating: 5.0, totalRatings: 10 },
        { userId: "prof-2", averageRating: 4.8, totalRatings: 8 },
      ];

      prismaMock.professionalProfile.findMany.mockResolvedValue(mockProfiles);

      const result = await repository.getTopRated(10);

      expect(result).toEqual(mockProfiles);
    });

    it("deve filtrar apenas perfis com pelo menos 5 avaliações", async () => {
      prismaMock.professionalProfile.findMany.mockResolvedValue([]);

      await repository.getTopRated();

      expect(prismaMock.professionalProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            totalRatings: { gte: 5 },
          }),
        })
      );
    });
  });
});

