/**
 * Testes para UserService
 *
 * Testa a lógica de negócio do módulo de usuários
 * Seguindo TDD e princípios SOLID
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { UserService } from "../user.service";
import { UserRepository } from "../../../infrastructure/repositories/user.repository";
import { ProfessionalProfileRepository } from "../../../infrastructure/repositories/professional-profile.repository";
import { BadRequestError, NotFoundError } from "../../../utils/app-error";

// Mock dos repositórios
const mockUserRepository = {
  findMany: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByEmail: jest.fn(),
  findByUserType: jest.fn(),
  searchUsers: jest.fn(),
};

const mockProfessionalProfileRepository = {
  create: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

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

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService(
      mockUserRepository as any,
      mockProfessionalProfileRepository as any
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("searchUsers", () => {
    it("deve buscar usuários com filtros", async () => {
      // Arrange
      const filters = {
        search: "test",
        userType: "CLIENT",
        page: 1,
        limit: 10,
      };
      const mockUsers = {
        data: [{ id: "user-1", email: "test@example.com", userType: "CLIENT" }],
        total: 1,
        page: 1,
        limit: 10,
      };
      mockUserRepository.findMany.mockResolvedValue(mockUsers);

      // Act
      const result = await userService.searchUsers(filters);

      // Assert
      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.findMany).toHaveBeenCalledWith(filters);
    });

    it("deve buscar todos os usuários sem filtros", async () => {
      // Arrange
      const filters = { page: 1, limit: 10 };
      const mockUsers = {
        data: [
          { id: "user-1", email: "user1@example.com", userType: "CLIENT" },
          {
            id: "user-2",
            email: "user2@example.com",
            userType: "PROFESSIONAL",
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
      };
      mockUserRepository.findMany.mockResolvedValue(mockUsers);

      // Act
      const result = await userService.searchUsers(filters);

      // Assert
      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.findMany).toHaveBeenCalledWith(filters);
    });
  });

  describe("getUserById", () => {
    it("deve retornar usuário por ID", async () => {
      // Arrange
      const userId = "user-123";
      const mockUser = {
        id: userId,
        email: "user@example.com",
        name: "Test User",
        userType: "CLIENT",
      };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it("deve lançar erro se usuário não encontrado", async () => {
      // Arrange
      const userId = "non-existent";
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUserById(userId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("updateUser", () => {
    it("deve atualizar usuário com sucesso", async () => {
      // Arrange
      const userId = "user-123";
      const updateData = { name: "Updated Name" };
      const mockUser = {
        id: userId,
        email: "user@example.com",
        name: "Updated Name",
        userType: "CLIENT",
      };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(mockUser);

      // Act
      const result = await userService.updateUser(userId, updateData);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        userId,
        updateData
      );
    });

    it("deve lançar erro se usuário não encontrado", async () => {
      // Arrange
      const userId = "non-existent";
      const updateData = { name: "Updated Name" };
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.updateUser(userId, updateData)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("deleteUser", () => {
    it("deve deletar usuário com sucesso", async () => {
      // Arrange
      const userId = "user-123";
      const mockUser = {
        id: userId,
        email: "user@example.com",
        name: "Test User",
        userType: "CLIENT",
      };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(true);

      // Act
      const result = await userService.deleteUser(userId);

      // Assert
      expect(result).toBeUndefined();
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
    });

    it("deve lançar erro se usuário não encontrado", async () => {
      // Arrange
      const userId = "non-existent";
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.deleteUser(userId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("createClientProfile", () => {
    it("deve criar perfil de cliente com sucesso", async () => {
      // Arrange
      const userId = "user-123";
      const profileData = {
        bio: "Cliente interessado em serviços",
        city: "São Paulo",
        preferences: {
          notifications: true,
          marketing: false,
        },
      };
      const mockUser = {
        id: userId,
        email: "user@example.com",
        name: "Test User",
        userType: "CLIENT",
      };
      const mockProfile = {
        id: "profile-123",
        userId,
        ...profileData,
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockClientProfileRepository.create.mockResolvedValue(mockProfile);

      // Act
      const result = await userService.createClientProfile(userId, profileData);

      // Assert
      expect(result).toEqual(mockProfile);
      expect(mockClientProfileRepository.create).toHaveBeenCalledWith({
        userId,
        ...profileData,
      });
    });

    it("deve lançar erro se usuário não for do tipo CLIENT", async () => {
      // Arrange
      const userId = "user-123";
      const profileData = { bio: "Test bio" };
      const mockUser = {
        id: userId,
        email: "user@example.com",
        name: "Test User",
        userType: "PROFESSIONAL", // Tipo incorreto
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(
        userService.createClientProfile(userId, profileData)
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("getClientProfile", () => {
    it("deve retornar perfil de cliente", async () => {
      // Arrange
      const userId = "user-123";
      const mockProfile = {
        id: "profile-123",
        userId,
        bio: "Cliente interessado em serviços",
        city: "São Paulo",
      };
      mockClientProfileRepository.findByUserId.mockResolvedValue(mockProfile);

      // Act
      const result = await userService.getClientProfile(userId);

      // Assert
      expect(result).toEqual(mockProfile);
      expect(mockClientProfileRepository.findByUserId).toHaveBeenCalledWith(
        userId
      );
    });

    it("deve lançar erro se perfil não encontrado", async () => {
      // Arrange
      const userId = "user-123";
      mockClientProfileRepository.findByUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getClientProfile(userId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("createProfessionalProfile", () => {
    it("deve criar perfil de profissional com sucesso", async () => {
      // Arrange
      const userId = "user-123";
      const profileData = {
        bio: "Profissional experiente",
        specialties: ["Corte", "Barba"],
        experience: 5,
        city: "São Paulo",
      };
      const mockUser = {
        id: userId,
        email: "user@example.com",
        name: "Test User",
        userType: "PROFESSIONAL",
      };
      const mockProfile = {
        id: "profile-123",
        userId,
        ...profileData,
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockProfessionalProfileRepository.create.mockResolvedValue(mockProfile);

      // Act
      const result = await userService.createProfessionalProfile(
        userId,
        profileData
      );

      // Assert
      expect(result).toEqual(mockProfile);
      expect(mockProfessionalProfileRepository.create).toHaveBeenCalledWith({
        userId,
        ...profileData,
      });
    });

    it("deve lançar erro se usuário não for do tipo PROFESSIONAL", async () => {
      // Arrange
      const userId = "user-123";
      const profileData = { bio: "Test bio" };
      const mockUser = {
        id: userId,
        email: "user@example.com",
        name: "Test User",
        userType: "CLIENT", // Tipo incorreto
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(
        userService.createProfessionalProfile(userId, profileData)
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("createCompanyProfile", () => {
    it("deve criar perfil de empresa com sucesso", async () => {
      // Arrange
      const userId = "user-123";
      const profileData = {
        companyName: "Empresa Teste",
        cnpj: "12345678000199",
        description: "Empresa de serviços",
        city: "São Paulo",
      };
      const mockUser = {
        id: userId,
        email: "user@example.com",
        name: "Test User",
        userType: "COMPANY",
      };
      const mockProfile = {
        id: "profile-123",
        userId,
        ...profileData,
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockCompanyProfileRepository.create.mockResolvedValue(mockProfile);

      // Act
      const result = await userService.createCompanyProfile(
        userId,
        profileData
      );

      // Assert
      expect(result).toEqual(mockProfile);
      expect(mockCompanyProfileRepository.create).toHaveBeenCalledWith({
        userId,
        ...profileData,
      });
    });

    it("deve lançar erro se usuário não for do tipo COMPANY", async () => {
      // Arrange
      const userId = "user-123";
      const profileData = { companyName: "Test Company" };
      const mockUser = {
        id: userId,
        email: "user@example.com",
        name: "Test User",
        userType: "CLIENT", // Tipo incorreto
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(
        userService.createCompanyProfile(userId, profileData)
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("updateNotificationPreferences", () => {
    it("deve lançar erro de funcionalidade não implementada", async () => {
      // Arrange
      const userId = "user-123";
      const preferences = { email: true, sms: false };

      // Act & Assert
      await expect(
        userService.updateNotificationPreferences(userId, preferences)
      ).rejects.toThrow("Funcionalidade não implementada");
    });
  });
});
