import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { UserService } from "../user.service";
import { UserRepository } from "../user.repository";
import { ConflictError, NotFoundError } from "../../../utils/app-error";
import { UserType } from "@prisma/client";

// Mock do repository e password utils
jest.mock("../user.repository");
jest.mock("../../../utils/password");

describe("UserService", () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();

    // Cria uma nova instância do service para cada teste
    userService = new UserService();
    mockUserRepository = (userService as any).userRepository;
  });

  describe("createUser", () => {
    const validUserData = {
      email: "teste@example.com",
      password: "SenhaForte123",
      name: "João Silva",
      phone: "+5511999999999",
      userType: "CLIENT" as UserType,
    };

    const createdUser = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "teste@example.com",
      passwordHash: "SenhaForte123",
      name: "João Silva",
      phone: "+5511999999999",
      userType: "CLIENT" as UserType,
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      professionalProfile: null,
    };

    it("deve criar um novo usuário com senha hash", async () => {
      // Arrange
      const hashedPassword = "$2b$10$hashedpassword";
      
      // Mock do hashPassword
      const { hashPassword } = jest.requireMock("../../../utils/password");
      hashPassword.mockResolvedValue(hashedPassword);
      
      mockUserRepository.emailExists = jest.fn().mockResolvedValue(false);
      mockUserRepository.create = jest.fn().mockResolvedValue({
        ...createdUser,
        passwordHash: hashedPassword,
      });

      // Act
      const result = await userService.createUser(validUserData);

      // Assert
      expect(mockUserRepository.emailExists).toHaveBeenCalledWith(
        validUserData.email
      );
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: validUserData.email,
        passwordHash: hashedPassword,
        name: validUserData.name,
        phone: validUserData.phone,
        userType: validUserData.userType,
      });
      expect(result).not.toHaveProperty("passwordHash");
      expect(result.email).toBe(validUserData.email);
      expect(result.name).toBe(validUserData.name);
    });

    it("deve lançar ConflictError se o email já existir", async () => {
      // Arrange
      mockUserRepository.emailExists = jest.fn().mockResolvedValue(true);

      // Act & Assert
      await expect(userService.createUser(validUserData)).rejects.toThrow(
        ConflictError
      );
      await expect(userService.createUser(validUserData)).rejects.toThrow(
        "Email já cadastrado"
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it("deve remover o passwordHash da resposta", async () => {
      // Arrange
      mockUserRepository.emailExists = jest.fn().mockResolvedValue(false);
      mockUserRepository.create = jest.fn().mockResolvedValue(createdUser);

      // Act
      const result = await userService.createUser(validUserData);

      // Assert
      expect(result).not.toHaveProperty("passwordHash");
      expect(Object.keys(result)).not.toContain("passwordHash");
    });
  });

  describe("getUserById", () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const foundUser = {
      id: userId,
      email: "teste@example.com",
      passwordHash: "hashedPassword",
      name: "João Silva",
      phone: "+5511999999999",
      userType: "CLIENT" as UserType,
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      professionalProfile: null,
    };

    it("deve buscar um usuário por ID com sucesso", async () => {
      // Arrange
      mockUserRepository.findById = jest.fn().mockResolvedValue(foundUser);

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).not.toHaveProperty("passwordHash");
      expect(result.id).toBe(userId);
      expect(result.email).toBe(foundUser.email);
    });

    it("deve lançar NotFoundError se o usuário não existir", async () => {
      // Arrange
      mockUserRepository.findById = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUserById(userId)).rejects.toThrow(
        NotFoundError
      );
      await expect(userService.getUserById(userId)).rejects.toThrow("Usuário");
    });
  });

  describe("listUsers", () => {
    const mockUsers = [
      {
        id: "user1",
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
      {
        id: "user2",
        email: "user2@example.com",
        passwordHash: "hash2",
        name: "User 2",
        phone: null,
        userType: "PROFESSIONAL" as UserType,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        professionalProfile: null,
      },
    ];

    it("deve listar usuários com paginação", async () => {
      // Arrange
      mockUserRepository.findMany = jest.fn().mockResolvedValue(mockUsers);
      mockUserRepository.count = jest.fn().mockResolvedValue(2);

      const params = { page: 1, limit: 10 };

      // Act
      const result = await userService.listUsers(params);

      // Assert
      expect(mockUserRepository.findMany).toHaveBeenCalled();
      expect(mockUserRepository.count).toHaveBeenCalled();
      expect(result.data).toHaveLength(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
    });

    it("deve filtrar usuários por tipo", async () => {
      // Arrange
      const professionalUsers = [mockUsers[1]];
      mockUserRepository.findMany = jest
        .fn()
        .mockResolvedValue(professionalUsers);
      mockUserRepository.count = jest.fn().mockResolvedValue(1);

      const params = {
        page: 1,
        limit: 10,
        userType: "PROFESSIONAL" as UserType,
      };

      // Act
      const result = await userService.listUsers(params);

      // Assert
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it("deve remover passwordHash de todos os usuários", async () => {
      // Arrange
      mockUserRepository.findMany = jest.fn().mockResolvedValue(mockUsers);
      mockUserRepository.count = jest.fn().mockResolvedValue(2);

      // Act
      const result = await userService.listUsers({ page: 1, limit: 10 });

      // Assert
      result.data.forEach((user) => {
        expect(user).not.toHaveProperty("passwordHash");
      });
    });
  });

  describe("updateUser", () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const existingUser = {
      id: userId,
      email: "old@example.com",
      passwordHash: "hash",
      name: "Old Name",
      phone: null,
      userType: "CLIENT" as UserType,
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      professionalProfile: null,
    };

    const updateData = {
      name: "New Name",
      email: "new@example.com",
    };

    it("deve atualizar um usuário com sucesso", async () => {
      // Arrange
      mockUserRepository.findById = jest.fn().mockResolvedValue(existingUser);
      mockUserRepository.emailExists = jest.fn().mockResolvedValue(false);
      mockUserRepository.update = jest
        .fn()
        .mockResolvedValue({ ...existingUser, ...updateData });

      // Act
      const result = await userService.updateUser(userId, updateData);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        userId,
        updateData
      );
      expect(result).not.toHaveProperty("passwordHash");
      expect(result.name).toBe(updateData.name);
    });

    it("deve lançar NotFoundError se o usuário não existir", async () => {
      // Arrange
      mockUserRepository.findById = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(userService.updateUser(userId, updateData)).rejects.toThrow(
        NotFoundError
      );
    });

    it("deve lançar ConflictError se o novo email já existir", async () => {
      // Arrange
      mockUserRepository.findById = jest.fn().mockResolvedValue(existingUser);
      mockUserRepository.emailExists = jest.fn().mockResolvedValue(true);

      // Act & Assert
      await expect(userService.updateUser(userId, updateData)).rejects.toThrow(
        ConflictError
      );
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteUser", () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const existingUser = {
      id: userId,
      email: "user@example.com",
      passwordHash: "hash",
      name: "User",
      phone: null,
      userType: "CLIENT" as UserType,
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      professionalProfile: null,
    };

    it("deve deletar um usuário com sucesso", async () => {
      // Arrange
      mockUserRepository.findById = jest.fn().mockResolvedValue(existingUser);
      mockUserRepository.delete = jest.fn().mockResolvedValue(existingUser);

      // Act
      await userService.deleteUser(userId);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
    });

    it("deve lançar NotFoundError se o usuário não existir", async () => {
      // Arrange
      mockUserRepository.findById = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(userService.deleteUser(userId)).rejects.toThrow(
        NotFoundError
      );
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });
  });
});
