import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { FastifyInstance } from "fastify";
import { buildApp } from "../../../app";
import { prisma } from "../../../lib/prisma";
import { hashPassword } from "../../../utils/password";
import { AuthService } from "../auth.service";

describe("Auth - Forgot Password", () => {
  let app: FastifyInstance;
  let authService: AuthService;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
    authService = new AuthService();
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
    await prisma.verification.deleteMany();
  });

  describe("POST /api/v1/auth/forgot-password", () => {
    it("should send reset password email for existing user", async () => {
      // Arrange
      const user = await prisma.user.create({
        data: {
          email: "test@example.com",
          name: "Test User",
          passwordHash: await hashPassword("password123"),
          userType: "CLIENT",
        },
      });

      // Act
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/forgot-password",
        payload: {
          email: "test@example.com",
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        message: "Email de recuperação enviado com sucesso",
      });

      // Verificar se token foi criado
      const verification = await prisma.verification.findFirst({
        where: {
          identifier: "test@example.com",
        },
      });

      expect(verification).toBeTruthy();
      expect(verification?.value).toBeTruthy();
    });

    it("should return success even for non-existing user (security)", async () => {
      // Act
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/forgot-password",
        payload: {
          email: "nonexistent@example.com",
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        message: "Email de recuperação enviado com sucesso",
      });
    });

    it("should validate email format", async () => {
      // Act
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/forgot-password",
        payload: {
          email: "invalid-email",
        },
      });

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty("error");
    });

    it("should require email field", async () => {
      // Act
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/forgot-password",
        payload: {},
      });

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty("error");
    });
  });

  describe("POST /api/v1/auth/reset-password", () => {
    it("should reset password with valid token", async () => {
      // Arrange
      const user = await prisma.user.create({
        data: {
          email: "test@example.com",
          name: "Test User",
          passwordHash: await hashPassword("oldpassword123"),
          userType: "CLIENT",
        },
      });

      // Criar token de reset
      const resetToken = "valid-reset-token";
      await prisma.verification.create({
        data: {
          identifier: "test@example.com",
          value: resetToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        },
      });

      // Act
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/reset-password",
        payload: {
          token: resetToken,
          newPassword: "newpassword123",
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        message: "Senha alterada com sucesso",
      });

      // Verificar se senha foi alterada
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(updatedUser?.passwordHash).not.toBe(user.passwordHash);
    });

    it("should reject invalid token", async () => {
      // Act
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/reset-password",
        payload: {
          token: "invalid-token",
          newPassword: "newpassword123",
        },
      });

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty("error");
    });

    it("should reject expired token", async () => {
      // Arrange
      const user = await prisma.user.create({
        data: {
          email: "test@example.com",
          name: "Test User",
          passwordHash: await hashPassword("oldpassword123"),
          userType: "CLIENT",
        },
      });

      // Criar token expirado
      const expiredToken = "expired-token";
      await prisma.verification.create({
        data: {
          identifier: "test@example.com",
          value: expiredToken,
          expiresAt: new Date(Date.now() - 1000), // Expirado
        },
      });

      // Act
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/reset-password",
        payload: {
          token: expiredToken,
          newPassword: "newpassword123",
        },
      });

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty("error");
    });

    it("should validate new password format", async () => {
      // Arrange
      const resetToken = "valid-reset-token";
      await prisma.verification.create({
        data: {
          identifier: "test@example.com",
          value: resetToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      // Act
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/reset-password",
        payload: {
          token: resetToken,
          newPassword: "123", // Senha muito curta
        },
      });

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty("error");
    });

    it("should require both token and newPassword", async () => {
      // Act
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/reset-password",
        payload: {
          token: "some-token",
        },
      });

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty("error");
    });
  });

  describe("GET /api/v1/auth/verify-reset-token", () => {
    it("should verify valid reset token", async () => {
      // Arrange
      const resetToken = "valid-reset-token";
      await prisma.verification.create({
        data: {
          identifier: "test@example.com",
          value: resetToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      // Act
      const response = await app.inject({
        method: "GET",
        url: `/api/v1/auth/verify-reset-token?token=${resetToken}`,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        valid: true,
        message: "Token válido",
      });
    });

    it("should reject invalid token", async () => {
      // Act
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/auth/verify-reset-token?token=invalid-token",
      });

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({
        valid: false,
        error: "Token inválido ou expirado",
      });
    });

    it("should reject expired token", async () => {
      // Arrange
      const expiredToken = "expired-token";
      await prisma.verification.create({
        data: {
          identifier: "test@example.com",
          value: expiredToken,
          expiresAt: new Date(Date.now() - 1000), // Expirado
        },
      });

      // Act
      const response = await app.inject({
        method: "GET",
        url: `/api/v1/auth/verify-reset-token?token=${expiredToken}`,
      });

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({
        valid: false,
        error: "Token inválido ou expirado",
      });
    });

    it("should require token parameter", async () => {
      // Act
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/auth/verify-reset-token",
      });

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty("error");
    });
  });

  // ========================================
  // TESTES UNITÁRIOS DO AUTH SERVICE
  // ========================================

  describe("AuthService - Forgot Password", () => {
    it("should send reset password email for existing user", async () => {
      // Arrange
      const user = await prisma.user.create({
        data: {
          email: "test@example.com",
          name: "Test User",
          passwordHash: await hashPassword("password123"),
          userType: "CLIENT",
        },
      });

      // Act
      const result = await authService.forgotPassword("test@example.com");

      // Assert
      expect(result).toEqual({
        message: "Email de recuperação enviado com sucesso",
      });

      // Verificar se token foi criado
      const verification = await prisma.verification.findFirst({
        where: {
          identifier: "test@example.com",
        },
      });

      expect(verification).toBeTruthy();
      expect(verification?.value).toBeTruthy();
    });

    it("should return success even for non-existing user (security)", async () => {
      // Act
      const result = await authService.forgotPassword(
        "nonexistent@example.com"
      );

      // Assert
      expect(result).toEqual({
        message: "Email de recuperação enviado com sucesso",
      });
    });

    it("should verify valid reset token", async () => {
      // Arrange
      const resetToken = "valid-reset-token";
      await prisma.verification.create({
        data: {
          identifier: "test@example.com",
          value: resetToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      // Act
      const result = await authService.verifyResetToken(resetToken);

      // Assert
      expect(result).toEqual({
        valid: true,
        message: "Token válido",
      });
    });

    it("should reject invalid token", async () => {
      // Act
      const result = await authService.verifyResetToken("invalid-token");

      // Assert
      expect(result).toEqual({
        valid: false,
        error: "Token inválido ou expirado",
      });
    });

    it("should reset password with valid token", async () => {
      // Arrange
      const user = await prisma.user.create({
        data: {
          email: "test@example.com",
          name: "Test User",
          passwordHash: await hashPassword("oldpassword123"),
          userType: "CLIENT",
        },
      });

      // Criar token de reset
      const resetToken = "valid-reset-token";
      await prisma.verification.create({
        data: {
          identifier: "test@example.com",
          value: resetToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        },
      });

      // Act
      const result = await authService.resetPassword(
        resetToken,
        "newpassword123"
      );

      // Assert
      expect(result).toEqual({
        message: "Senha alterada com sucesso",
      });

      // Verificar se senha foi alterada
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(updatedUser?.passwordHash).not.toBe(user.passwordHash);
    });

    it("should reject invalid token for reset", async () => {
      // Act & Assert
      await expect(
        authService.resetPassword("invalid-token", "newpassword123")
      ).rejects.toThrow("Token inválido ou expirado");
    });
  });
});
