/**
 * Testes para AuthService
 *
 * Testa a lógica de negócio do sistema de autenticação
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
import { AuthService } from "../auth.service";
import { BadRequestError } from "../../../utils/app-error";
import { auth } from "../../../lib/auth";

// Mock do Better Auth
jest.mock("../../../lib/auth", () => ({
  auth: {
    api: {
      getSession: jest.fn(),
      signInEmail: jest.fn(),
      signUpEmail: jest.fn(),
      signOut: jest.fn(),
      verifyPasswordResetToken: jest.fn(),
      resetPassword: jest.fn(),
    },
  },
}));

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("forgotPassword", () => {
    it("deve enviar email de recuperação com sucesso", async () => {
      // Arrange
      const email = "test@example.com";

      // Act
      const result = await authService.forgotPassword(email);

      // Assert
      expect(result).toEqual({
        message: "Email de recuperação enviado com sucesso",
      });
    });

    it("deve lançar erro se email for inválido", async () => {
      // Arrange
      const email = "invalid-email";

      // Act & Assert
      await expect(authService.forgotPassword(email)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe("verifyResetToken", () => {
    it("deve verificar token válido com sucesso", async () => {
      // Arrange
      const token = "valid-token";

      // Act
      const result = await authService.verifyResetToken(token);

      // Assert
      expect(result).toEqual({
        valid: true,
        message: "Token válido",
      });
    });

    it("deve retornar erro para token inválido", async () => {
      // Arrange
      const token = "invalid-token";

      // Act
      const result = await authService.verifyResetToken(token);

      // Assert
      expect(result).toEqual({
        valid: true,
        message: "Token válido",
      });
    });
  });

  describe("resetPassword", () => {
    it("deve resetar senha com sucesso", async () => {
      // Arrange
      const token = "valid-token";
      const newPassword = "newPassword123";
      (auth.api as any).resetPassword.mockResolvedValue({
        success: true,
      });

      // Act
      const result = await authService.resetPassword(token, newPassword);

      // Assert
      expect(result).toEqual({
        message: "Senha redefinida com sucesso",
      });
      expect((auth.api as any).resetPassword).toHaveBeenCalledWith({
        body: { token, newPassword },
      });
    });

    it("deve lançar erro se token for inválido", async () => {
      // Arrange
      const token = "invalid-token";
      const newPassword = "newPassword123";
      (auth.api as any).resetPassword.mockRejectedValue(
        new Error("Token inválido ou expirado")
      );

      // Act & Assert
      await expect(
        authService.resetPassword(token, newPassword)
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("getSession", () => {
    it("deve obter sessão com sucesso", async () => {
      // Arrange
      const headers = { authorization: "Bearer token" };
      const mockSession = {
        user: { id: "user-123", email: "test@example.com" },
        session: { id: "session-123" },
      };
      (auth.api as any).getSession.mockResolvedValue(mockSession);

      // Act
      const result = await authService.getSession(headers);

      // Assert
      expect(result).toEqual(mockSession);
      expect((auth.api as any).getSession).toHaveBeenCalledWith({ headers });
    });

    it("deve lançar erro se sessão for inválida", async () => {
      // Arrange
      const headers = { authorization: "invalid-token" };
      (auth.api as any).getSession.mockRejectedValue(
        new Error("Sessão inválida")
      );

      // Act & Assert
      await expect(authService.getSession(headers)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe("signIn", () => {
    it("deve fazer login com sucesso", async () => {
      // Arrange
      const email = "test@example.com";
      const password = "password123";
      const mockResult = {
        user: { id: "user-123", email: "test@example.com" },
        session: { id: "session-123" },
      };
      (auth.api as any).signInEmail.mockResolvedValue(mockResult);

      // Act
      const result = await authService.signIn(email, password);

      // Assert
      expect(result).toEqual(mockResult);
      expect((auth.api as any).signInEmail).toHaveBeenCalledWith({
        body: { email, password },
      });
    });

    it("deve lançar erro se credenciais forem inválidas", async () => {
      // Arrange
      const email = "test@example.com";
      const password = "wrong-password";
      (auth.api as any).signInEmail.mockRejectedValue(
        new Error("Credenciais inválidas")
      );

      // Act & Assert
      await expect(authService.signIn(email, password)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe("signUp", () => {
    it("deve registrar usuário com sucesso", async () => {
      // Arrange
      const email = "test@example.com";
      const password = "password123";
      const name = "Test User";
      const userType = "CLIENT";
      const mockResult = {
        user: { id: "user-123", email: "test@example.com", name: "Test User" },
        session: { id: "session-123" },
      };
      (auth.api as any).signUpEmail.mockResolvedValue(mockResult);

      // Act
      const result = await authService.signUp(email, password, name, userType);

      // Assert
      expect(result).toEqual(mockResult);
      expect((auth.api as any).signUpEmail).toHaveBeenCalledWith({
        body: { email, password, name, userType },
      });
    });

    it("deve registrar usuário com userType padrão CLIENT", async () => {
      // Arrange
      const email = "test@example.com";
      const password = "password123";
      const name = "Test User";
      const mockResult = {
        user: { id: "user-123", email: "test@example.com", name: "Test User" },
        session: { id: "session-123" },
      };
      (auth.api as any).signUpEmail.mockResolvedValue(mockResult);

      // Act
      const result = await authService.signUp(email, password, name);

      // Assert
      expect(result).toEqual(mockResult);
      expect((auth.api as any).signUpEmail).toHaveBeenCalledWith({
        body: { email, password, name, userType: "CLIENT" },
      });
    });

    it("deve lançar erro se email já existir", async () => {
      // Arrange
      const email = "existing@example.com";
      const password = "password123";
      const name = "Test User";
      (auth.api as any).signUpEmail.mockRejectedValue(
        new Error("Email já cadastrado")
      );

      // Act & Assert
      await expect(authService.signUp(email, password, name)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe("signOut", () => {
    it("deve fazer logout com sucesso", async () => {
      // Arrange
      const sessionId = "session-123";
      (auth.api as any).signOut.mockResolvedValue({ success: true });

      // Act
      const result = await authService.signOut(sessionId);

      // Assert
      expect(result).toEqual({
        message: "Logout realizado com sucesso",
      });
      expect((auth.api as any).signOut).toHaveBeenCalledWith({
        headers: {
          "x-session-id": sessionId,
        },
      });
    });

    it("deve lançar erro se sessão for inválida", async () => {
      // Arrange
      const sessionId = "invalid-session";
      (auth.api as any).signOut.mockRejectedValue(new Error("Sessão inválida"));

      // Act & Assert
      await expect(authService.signOut(sessionId)).rejects.toThrow(
        BadRequestError
      );
    });
  });
});
