import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { UserRepository } from "../user.repository";
import { prisma } from "../../../lib/prisma";
import { UserType } from "@prisma/client";

// Mock do Prisma Client
jest.mock("../../../lib/prisma", () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("UserRepository", () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepository();
  });

  describe("create", () => {
    it("deve criar um usuário no banco de dados", async () => {
      // Arrange
      const userData = {
        email: "teste@example.com",
        passwordHash: "hashedPassword",
        name: "João Silva",
        phone: "+5511999999999",
        userType: "CLIENT" as UserType,
      };

      const createdUser = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        ...userData,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        professionalProfile: null,
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(createdUser);

      // Act
      const result = await userRepository.create(userData);

      // Assert
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: userData,
        include: {
          professionalProfile: true,
        },
      });
      expect(result).toEqual(createdUser);
    });
  });

  describe("findById", () => {
    it("deve buscar um usuário por ID", async () => {
      // Arrange
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const user = {
        id: userId,
        email: "teste@example.com",
        passwordHash: "hash",
        name: "João Silva",
        phone: null,
        userType: "CLIENT" as UserType,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        professionalProfile: null,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

      // Act
      const result = await userRepository.findById(userId);

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: {
          professionalProfile: true,
        },
      });
      expect(result).toEqual(user);
    });

    it("deve retornar null se o usuário não existir", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await userRepository.findById("non-existent-id");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("findByEmail", () => {
    it("deve buscar um usuário por email", async () => {
      // Arrange
      const email = "teste@example.com";
      const user = {
        id: "123",
        email,
        passwordHash: "hash",
        name: "João",
        phone: null,
        userType: "CLIENT" as UserType,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        professionalProfile: null,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

      // Act
      const result = await userRepository.findByEmail(email);

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: {
          professionalProfile: true,
        },
      });
      expect(result).toEqual(user);
    });
  });

  describe("findMany", () => {
    it("deve listar usuários com paginação", async () => {
      // Arrange
      const users = [
        {
          id: "1",
          email: "user1@example.com",
          passwordHash: "hash1",
          name: "User 1",
          phone: null,
          userType: "CLIENT" as UserType,
          isEmailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          professionalProfile: null,
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);

      // Act
      const result = await userRepository.findMany({
        skip: 0,
        take: 10,
      });

      // Assert
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        include: {
          professionalProfile: true,
        },
      });
      expect(result).toEqual(users);
    });
  });

  describe("count", () => {
    it("deve contar usuários", async () => {
      // Arrange
      (prisma.user.count as jest.Mock).mockResolvedValue(5);

      // Act
      const result = await userRepository.count();

      // Assert
      expect(prisma.user.count).toHaveBeenCalledWith({ where: undefined });
      expect(result).toBe(5);
    });

    it("deve contar usuários com filtros", async () => {
      // Arrange
      const where = { userType: "CLIENT" as UserType };
      (prisma.user.count as jest.Mock).mockResolvedValue(3);

      // Act
      const result = await userRepository.count(where);

      // Assert
      expect(prisma.user.count).toHaveBeenCalledWith({ where });
      expect(result).toBe(3);
    });
  });

  describe("update", () => {
    it("deve atualizar um usuário", async () => {
      // Arrange
      const userId = "123";
      const updateData = { name: "Novo Nome" };
      const updatedUser = {
        id: userId,
        email: "teste@example.com",
        passwordHash: "hash",
        name: "Novo Nome",
        phone: null,
        userType: "CLIENT" as UserType,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        professionalProfile: null,
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      // Act
      const result = await userRepository.update(userId, updateData);

      // Assert
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
        include: {
          professionalProfile: true,
        },
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe("delete", () => {
    it("deve deletar um usuário", async () => {
      // Arrange
      const userId = "123";
      const deletedUser = {
        id: userId,
        email: "teste@example.com",
        passwordHash: "hash",
        name: "João",
        phone: null,
        userType: "CLIENT" as UserType,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.delete as jest.Mock).mockResolvedValue(deletedUser);

      // Act
      const result = await userRepository.delete(userId);

      // Assert
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(deletedUser);
    });
  });

  describe("emailExists", () => {
    it("deve retornar true se o email existir", async () => {
      // Arrange
      const email = "teste@example.com";
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "123",
      });

      // Act
      const result = await userRepository.emailExists(email);

      // Assert
      expect(result).toBe(true);
    });

    it("deve retornar false se o email não existir", async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await userRepository.emailExists("nao-existe@example.com");

      // Assert
      expect(result).toBe(false);
    });

    it("deve retornar false se o ID for excluído e for o mesmo usuário", async () => {
      // Arrange
      const email = "teste@example.com";
      const userId = "123";
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
      });

      // Act
      const result = await userRepository.emailExists(email, userId);

      // Assert
      expect(result).toBe(false);
    });
  });
});
