/**
 * Testes para UserService - Camada de Aplicação
 *
 * Seguindo TDD e princípios SOLID
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { UserService } from "../user.service";
import { IUserRepository } from "../../../domain/interfaces/repository.interface";
import { IUser } from "../../../domain/interfaces/user.interface";
import { BadRequestError, NotFoundError } from "../../../utils/app-error";

// Mock do repositório
const mockUserRepository: jest.Mocked<IUserRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findMany: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByEmail: jest.fn(),
  findByUserType: jest.fn(),
  createClientProfile: jest.fn(),
  createProfessionalProfile: jest.fn(),
  createCompanyProfile: jest.fn(),
};

// Mock do usuário
const mockUser: IUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  phone: "(11) 99999-9999",
  userType: "CLIENT",
  isEmailVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLogin: null,

  // Métodos de domínio
  canCreateAppointment: jest.fn(() => true),
  canReceiveAppointments: jest.fn(() => false),
  getProfileType: jest.fn(() => "CLIENT"),
  isClient: jest.fn(() => true),
  isProfessional: jest.fn(() => false),
  isCompany: jest.fn(() => false),
  canManageEmployees: jest.fn(() => false),
  canOfferServices: jest.fn(() => false),
  canBookAppointments: jest.fn(() => true),
};

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService(mockUserRepository);
  });

  describe("createUser", () => {
    it("deve criar usuário com dados válidos", async () => {
      // Arrange
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        phone: "(11) 99999-9999",
        userType: "CLIENT" as const,
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toBe(mockUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        userData.email
      );
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
    });

    it("deve lançar erro se email já existe", async () => {
      // Arrange
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        userType: "CLIENT" as const,
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow(
        new BadRequestError("Email já está em uso")
      );
    });

    it("deve lançar erro se dados são inválidos", async () => {
      // Arrange
      const userData = {
        email: "invalid-email",
        password: "123",
        name: "A",
        userType: "CLIENT" as const,
      };

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe("getUserById", () => {
    it("deve retornar usuário se encontrado", async () => {
      // Arrange
      const userId = "user-123";
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(result).toBe(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it("deve lançar erro se usuário não encontrado", async () => {
      // Arrange
      const userId = "user-123";
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUserById(userId)).rejects.toThrow(
        new NotFoundError("Usuário não encontrado")
      );
    });
  });

  describe("updateUser", () => {
    it("deve atualizar usuário existente", async () => {
      // Arrange
      const userId = "user-123";
      const updateData = { name: "Updated Name" };
      const updatedUser = { ...mockUser, name: "Updated Name" };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      // Act
      const result = await userService.updateUser(userId, updateData);

      // Assert
      expect(result).toBe(updatedUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        userId,
        updateData
      );
    });

    it("deve lançar erro se usuário não encontrado", async () => {
      // Arrange
      const userId = "user-123";
      const updateData = { name: "Updated Name" };

      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.updateUser(userId, updateData)).rejects.toThrow(
        new NotFoundError("Usuário não encontrado")
      );
    });
  });

  describe("deleteUser", () => {
    it("deve deletar usuário existente", async () => {
      // Arrange
      const userId = "user-123";
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue();

      // Act
      await userService.deleteUser(userId);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
    });

    it("deve lançar erro se usuário não encontrado", async () => {
      // Arrange
      const userId = "user-123";
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.deleteUser(userId)).rejects.toThrow(
        new NotFoundError("Usuário não encontrado")
      );
    });
  });

  describe("createClientProfile", () => {
    it("deve criar perfil de cliente para usuário CLIENT", async () => {
      // Arrange
      const userId = "user-123";
      const profileData = { cpf: "11144477735" };
      const clientProfile = { id: "profile-123", userId, cpf: "11144477735" };

      // Configurar mock para retornar usuário CLIENT
      const clientUser = { ...mockUser, userType: "CLIENT" as const };
      clientUser.isClient = jest.fn(() => true);

      mockUserRepository.findById.mockResolvedValue(clientUser);
      mockUserRepository.createClientProfile.mockResolvedValue(
        clientProfile as any
      );

      // Act
      const result = await userService.createClientProfile(userId, profileData);

      // Assert
      expect(result).toBe(clientProfile);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.createClientProfile).toHaveBeenCalledWith({
        userId,
        ...profileData,
      });
    });

    it("deve lançar erro se usuário não é CLIENT", async () => {
      // Arrange
      const userId = "user-123";
      const profileData = { cpf: "11144477735" };
      const professionalUser = {
        ...mockUser,
        userType: "PROFESSIONAL" as const,
      };
      professionalUser.isClient = jest.fn(() => false);

      mockUserRepository.findById.mockResolvedValue(professionalUser);

      // Act & Assert
      await expect(
        userService.createClientProfile(userId, profileData)
      ).rejects.toThrow(
        new BadRequestError(
          "Apenas usuários do tipo CLIENT podem ter perfil de cliente"
        )
      );
    });
  });

  describe("validateUserCreation", () => {
    it("deve validar dados válidos", async () => {
      // Arrange
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        userType: "CLIENT" as const,
      };

      // Act
      const result = await userService.validateUserCreation(userData);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("deve retornar erros para dados inválidos", async () => {
      // Arrange
      const userData = {
        email: "invalid-email",
        password: "123",
        name: "A",
        userType: "INVALID" as any,
      };

      // Act
      const result = await userService.validateUserCreation(userData);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
