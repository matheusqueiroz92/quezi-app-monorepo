/**
 * Testes para UserRepository - Camada de Infraestrutura
 *
 * Seguindo TDD e princípios SOLID
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { UserRepository } from "../user.repository";
import { PrismaClient } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../../../utils/app-error";

// Mock do Prisma
const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  clientProfile: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  professionalProfile: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  companyProfile: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
} as unknown as PrismaClient;

describe("UserRepository", () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepository(mockPrisma);
  });

  describe("create", () => {
    it("deve criar usuário com dados válidos", async () => {
      // Arrange
      const userData = {
        id: "user-123",
        email: "test@example.com",
        passwordHash: "hashed-password",
        name: "Test User",
        phone: "(11) 99999-9999",
        userType: "CLIENT" as const,
        isEmailVerified: false,
      };

      const prismaUser = {
        id: "user-123",
        email: "test@example.com",
        passwordHash: "hashed-password",
        name: "Test User",
        phone: "(11) 99999-9999",
        userType: "CLIENT",
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null,
      };

      mockPrisma.user.create.mockResolvedValue(prismaUser);

      // Act
      const result = await userRepository.create(userData);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe("user-123");
      expect(result.email).toBe("test@example.com");
      expect(result.userType).toBe("CLIENT");
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: userData.email,
          passwordHash: userData.password,
          name: userData.name,
          phone: userData.phone,
          userType: userData.userType,
        },
      });
    });

    it("deve lançar erro se criação falhar", async () => {
      // Arrange
      const userData = {
        email: "test@example.com",
        passwordHash: "hashed-password",
        name: "Test User",
        userType: "CLIENT" as const,
      };

      mockPrisma.user.create.mockRejectedValue(new Error("Database error"));

      // Act & Assert
      await expect(userRepository.create(userData)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe("findById", () => {
    it("deve retornar usuário se encontrado", async () => {
      // Arrange
      const userId = "user-123";
      const prismaUser = {
        id: "user-123",
        email: "test@example.com",
        passwordHash: "hashed-password",
        name: "Test User",
        phone: "(11) 99999-9999",
        userType: "CLIENT",
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null,
      };

      mockPrisma.user.findUnique.mockResolvedValue(prismaUser);

      // Act
      const result = await userRepository.findById(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result!.id).toBe("user-123");
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it("deve retornar null se usuário não encontrado", async () => {
      // Arrange
      const userId = "user-123";
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await userRepository.findById(userId);

      // Assert
      expect(result).toBeNull();
    });

    it("deve lançar erro se busca falhar", async () => {
      // Arrange
      const userId = "user-123";
      mockPrisma.user.findUnique.mockRejectedValue(new Error("Database error"));

      // Act & Assert
      await expect(userRepository.findById(userId)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe("findMany", () => {
    it("deve listar usuários com paginação", async () => {
      // Arrange
      const filters = {
        page: 1,
        limit: 10,
        userType: "CLIENT" as const,
      };

      const prismaUsers = [
        {
          id: "user-1",
          email: "user1@example.com",
          passwordHash: "hash1",
          name: "User 1",
          phone: "(11) 11111-1111",
          userType: "CLIENT",
          isEmailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLogin: null,
        },
        {
          id: "user-2",
          email: "user2@example.com",
          passwordHash: "hash2",
          name: "User 2",
          phone: "(11) 22222-2222",
          userType: "CLIENT",
          isEmailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLogin: null,
        },
      ];

      mockPrisma.user.findMany.mockResolvedValue(prismaUsers);
      mockPrisma.user.count.mockResolvedValue(2);

      // Act
      const result = await userRepository.findMany(filters);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(2);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { userType: "CLIENT" },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });
    });

    it("deve aplicar filtros de busca", async () => {
      // Arrange
      const filters = {
        page: 1,
        limit: 10,
        search: "test",
        isEmailVerified: true,
      };

      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);

      // Act
      await userRepository.findMany(filters);

      // Assert
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: "test", mode: "insensitive" } },
            { email: { contains: "test", mode: "insensitive" } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("update", () => {
    it("deve atualizar usuário existente", async () => {
      // Arrange
      const userId = "user-123";
      const updateData = {
        name: "Updated Name",
        phone: "(11) 88888-8888",
      };

      const updatedUser = {
        id: "user-123",
        email: "test@example.com",
        passwordHash: "hashed-password",
        name: "Updated Name",
        phone: "(11) 88888-8888",
        userType: "CLIENT",
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null,
      };

      mockPrisma.user.update.mockResolvedValue(updatedUser);

      // Act
      const result = await userRepository.update(userId, updateData);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe("Updated Name");
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
      });
    });

    it("deve lançar erro se atualização falhar", async () => {
      // Arrange
      const userId = "user-123";
      const updateData = { name: "Updated Name" };

      mockPrisma.user.update.mockRejectedValue(new Error("Database error"));

      // Act & Assert
      await expect(userRepository.update(userId, updateData)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe("delete", () => {
    it("deve deletar usuário existente", async () => {
      // Arrange
      const userId = "user-123";
      mockPrisma.user.delete.mockResolvedValue({} as any);

      // Act
      await userRepository.delete(userId);

      // Assert
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it("deve lançar erro se deleção falhar", async () => {
      // Arrange
      const userId = "user-123";
      mockPrisma.user.delete.mockRejectedValue(new Error("Database error"));

      // Act & Assert
      await expect(userRepository.delete(userId)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe("findByEmail", () => {
    it("deve retornar usuário se email encontrado", async () => {
      // Arrange
      const email = "test@example.com";
      const prismaUser = {
        id: "user-123",
        email: "test@example.com",
        passwordHash: "hashed-password",
        name: "Test User",
        phone: "(11) 99999-9999",
        userType: "CLIENT",
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null,
      };

      mockPrisma.user.findUnique.mockResolvedValue(prismaUser);

      // Act
      const result = await userRepository.findByEmail(email);

      // Assert
      expect(result).toBeDefined();
      expect(result!.email).toBe("test@example.com");
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it("deve retornar null se email não encontrado", async () => {
      // Arrange
      const email = "notfound@example.com";
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await userRepository.findByEmail(email);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("findByUserType", () => {
    it("deve retornar usuários do tipo especificado", async () => {
      // Arrange
      const userType = "CLIENT";
      const prismaUsers = [
        {
          id: "user-1",
          email: "user1@example.com",
          passwordHash: "hash1",
          name: "User 1",
          phone: "(11) 11111-1111",
          userType: "CLIENT",
          isEmailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLogin: null,
        },
      ];

      mockPrisma.user.findMany.mockResolvedValue(prismaUsers);

      // Act
      const result = await userRepository.findByUserType(userType);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].userType).toBe("CLIENT");
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { userType: "CLIENT" },
        orderBy: { createdAt: "desc" },
      });
    });
  });
});
