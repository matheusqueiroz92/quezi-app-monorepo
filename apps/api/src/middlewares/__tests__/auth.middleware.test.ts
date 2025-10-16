import { describe, it, expect, jest } from "@jest/globals";
import { requireAuth } from "../auth.middleware";
import { UnauthorizedError } from "../../utils/app-error";
import type { FastifyRequest, FastifyReply } from "fastify";

/**
 * TDD - Testes para Middleware de Autenticação
 */

describe("Auth Middleware", () => {
  describe("requireAuth", () => {
    it("deve permitir requisição com token válido", async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: "Bearer valid-token-123",
        },
        user: null,
      } as unknown as FastifyRequest;

      const mockReply = {} as FastifyReply;

      // Mock da validação de sessão
      const mockValidateSession = jest.fn().mockResolvedValue({
        id: "user-123",
        email: "usuario@teste.com",
        name: "Usuário",
      });

      // Act
      await requireAuth(mockRequest, mockReply, mockValidateSession);

      // Assert
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user).toHaveProperty("id", "user-123");
    });

    it("deve lançar UnauthorizedError sem token", async () => {
      // Arrange
      const mockRequest = {
        headers: {},
        user: null,
      } as unknown as FastifyRequest;

      const mockReply = {} as FastifyReply;
      const mockValidateSession = jest.fn();

      // Act & Assert
      await expect(
        requireAuth(mockRequest, mockReply, mockValidateSession)
      ).rejects.toThrow(UnauthorizedError);
      expect(mockValidateSession).not.toHaveBeenCalled();
    });

    it("deve lançar UnauthorizedError com token inválido", async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: "Bearer invalid-token",
        },
        user: null,
      } as unknown as FastifyRequest;

      const mockReply = {} as FastifyReply;

      const mockValidateSession = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(
        requireAuth(mockRequest, mockReply, mockValidateSession)
      ).rejects.toThrow(UnauthorizedError);
    });

    it("deve lançar UnauthorizedError com formato de token incorreto", async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: "invalid-format",
        },
        user: null,
      } as unknown as FastifyRequest;

      const mockReply = {} as FastifyReply;
      const mockValidateSession = jest.fn();

      // Act & Assert
      await expect(
        requireAuth(mockRequest, mockReply, mockValidateSession)
      ).rejects.toThrow(UnauthorizedError);
      expect(mockValidateSession).not.toHaveBeenCalled();
    });
  });
});
