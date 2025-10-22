import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { FastifyRequest, FastifyReply } from "fastify";
import { requireAdmin } from "../admin-auth.middleware";
import { AdminService } from "../../admin.service";
import { UnauthorizedError } from "../../../../utils/app-error";
import { AdminRole } from "@prisma/client";

// Mock do AdminService
jest.mock("../../admin.service");

describe("Admin Auth Middleware", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockAdminService: jest.Mocked<AdminService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      headers: {},
    };

    mockReply = {};

    mockAdminService = {
      validateToken: jest.fn(),
    } as any;

    (AdminService as jest.Mock).mockImplementation(() => mockAdminService);
  });

  describe("requireAdmin", () => {
    it("deve autenticar admin com token válido", async () => {
      // Arrange
      const token = "valid-token";
      const admin = {
        id: "admin-1",
        email: "admin@test.com",
        name: "Admin Test",
        role: AdminRole.ADMIN,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.headers!.authorization = `Bearer ${token}`;
      mockAdminService.validateToken.mockResolvedValue(admin);

      // Act
      await requireAdmin(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      // Assert
      expect(mockAdminService.validateToken).toHaveBeenCalledWith(token);
      expect((mockRequest as any).admin).toEqual(admin);
    });

    it("deve lançar UnauthorizedError se não houver header authorization", async () => {
      // Arrange
      mockRequest.headers = {};

      // Act & Assert
      await expect(
        requireAdmin(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow(UnauthorizedError);
      await expect(
        requireAdmin(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow("Token de autenticação não fornecido");
    });

    it("deve lançar UnauthorizedError se token estiver vazio", async () => {
      // Arrange
      mockRequest.headers!.authorization = "Bearer ";

      // Act & Assert
      await expect(
        requireAdmin(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow(UnauthorizedError);
      await expect(
        requireAdmin(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow("Token de autenticação não fornecido");
    });

    it("deve lançar UnauthorizedError se token for inválido", async () => {
      // Arrange
      const token = "invalid-token";
      mockRequest.headers!.authorization = `Bearer ${token}`;
      mockAdminService.validateToken.mockRejectedValue(
        new Error("Invalid token")
      );

      // Act & Assert
      await expect(
        requireAdmin(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow(UnauthorizedError);
      await expect(
        requireAdmin(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow("Token inválido ou expirado");
    });

    it("deve extrair token corretamente do header Bearer", async () => {
      // Arrange
      const token = "extracted-token";
      const admin = {
        id: "admin-1",
        email: "admin@test.com",
        name: "Admin Test",
        role: AdminRole.ADMIN,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest.headers!.authorization = `Bearer ${token}`;
      mockAdminService.validateToken.mockResolvedValue(admin);

      // Act
      await requireAdmin(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      // Assert
      expect(mockAdminService.validateToken).toHaveBeenCalledWith(token);
    });
  });
});
