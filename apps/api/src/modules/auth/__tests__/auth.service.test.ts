import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { AuthService } from "../auth.service";
import { UserRepository } from "../../users/user.repository";
import { ConflictError, UnauthorizedError } from "../../../utils/app-error";
import { hashPassword } from "../../../utils/password";

/**
 * TDD - Testes para AuthService
 *
 * Testes PRIMEIRO, implementação DEPOIS
 */

// Mock do repository
jest.mock("../../users/user.repository");
jest.mock("../../../utils/password");

describe("AuthService", () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
    mockUserRepository = (authService as any).userRepository;
  });

  describe("register", () => {
    const registerData = {
      email: "novo@teste.com",
      password: "SenhaForte123",
      name: "Novo Usuário",
      userType: "CLIENT" as const,
    };

    it("deve registrar novo usuário com senha hash", async () => {
      // Arrange
      const hashedPassword = "$2b$10$hashedpassword";
      // @ts-ignore - Mock do Jest
      mockUserRepository.emailExists = jest.fn().mockResolvedValue(false);
      // @ts-ignore - Mock do Jest
      mockUserRepository.create = jest.fn().mockResolvedValue({
        id: "123",
        email: registerData.email,
        passwordHash: hashedPassword,
        name: registerData.name,
        userType: registerData.userType,
        isEmailVerified: false,
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        professionalProfile: null,
      });
      // @ts-ignore - Mock do Jest
      (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);

      // Act
      const result = await authService.register(registerData);

      // Assert
      expect(mockUserRepository.emailExists).toHaveBeenCalledWith(
        registerData.email
      );
      expect(hashPassword).toHaveBeenCalledWith(registerData.password);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: registerData.email,
        passwordHash: hashedPassword,
        name: registerData.name,
        phone: undefined,
        userType: registerData.userType,
      });
      expect(result).not.toHaveProperty("passwordHash");
      expect(result.email).toBe(registerData.email);
    });

    it("deve lançar ConflictError se email já existe", async () => {
      // Arrange
      // @ts-ignore - Mock do Jest
      mockUserRepository.emailExists = jest.fn().mockResolvedValue(true);

      // Act & Assert
      await expect(authService.register(registerData)).rejects.toThrow(
        ConflictError
      );
      expect(hashPassword).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    const loginData = {
      email: "usuario@teste.com",
      password: "SenhaForte123",
    };

    const userFromDb = {
      id: "123",
      email: loginData.email,
      passwordHash: "$2b$10$hashedpassword",
      name: "Usuário Teste",
      userType: "CLIENT" as const,
      isEmailVerified: false,
      phone: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      professionalProfile: null,
    };

    it("deve fazer login com credenciais corretas", async () => {
      // Arrange
      // @ts-ignore - Mock do Jest
      mockUserRepository.findByEmail = jest.fn().mockResolvedValue(userFromDb);
      // @ts-ignore - Mock do Jest
      const mockVerifyPassword = jest.requireMock("../../../utils/password")
        .verifyPassword as jest.Mock;
      // @ts-ignore - Mock do Jest
      mockVerifyPassword.mockResolvedValue(true);

      // Act
      const result = await authService.login(loginData);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        loginData.email
      );
      expect(mockVerifyPassword).toHaveBeenCalledWith(
        loginData.password,
        userFromDb.passwordHash
      );
      expect(result).not.toHaveProperty("passwordHash");
      expect(result.email).toBe(loginData.email);
    });

    it("deve lançar UnauthorizedError se usuário não existe", async () => {
      // Arrange
      // @ts-ignore - Mock do Jest
      mockUserRepository.findByEmail = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(
        UnauthorizedError
      );
      await expect(authService.login(loginData)).rejects.toThrow(
        "Email ou senha inválidos"
      );
    });

    it("deve lançar UnauthorizedError se senha incorreta", async () => {
      // Arrange
      // @ts-ignore - Mock do Jest
      mockUserRepository.findByEmail = jest.fn().mockResolvedValue(userFromDb);
      // @ts-ignore - Mock do Jest
      const mockVerifyPassword = jest.requireMock("../../../utils/password")
        .verifyPassword as jest.Mock;
      // @ts-ignore - Mock do Jest
      mockVerifyPassword.mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(
        UnauthorizedError
      );
      await expect(authService.login(loginData)).rejects.toThrow(
        "Email ou senha inválidos"
      );
    });
  });
});
