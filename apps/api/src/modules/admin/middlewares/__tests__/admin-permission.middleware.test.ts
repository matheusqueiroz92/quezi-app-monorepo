import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { FastifyRequest, FastifyReply } from "fastify";
import {
  requirePermission,
  requireSuperAdmin,
} from "../admin-permission.middleware";
import { AdminService } from "../../admin.service";
import { UnauthorizedError, ForbiddenError } from "../../../../utils/app-error";
import { AdminRole } from "@prisma/client";

// Mock do AdminService
jest.mock("../../admin.service");

describe("Admin Permission Middleware", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockAdminService: jest.Mocked<AdminService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {};
    mockReply = {};

    mockAdminService = {
      hasPermission: jest.fn(),
    } as any;

    (AdminService as jest.Mock).mockImplementation(() => mockAdminService);
  });

  describe("requirePermission", () => {
    it("deve permitir acesso se admin tem permissão", async () => {
      // Arrange
      const admin = {
        id: "admin-1",
        email: "admin@test.com",
        name: "Admin Test",
        role: AdminRole.ADMIN,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockRequest as any).admin = admin;
      mockAdminService.hasPermission.mockReturnValue(true);

      const middleware = requirePermission("USER_MANAGEMENT");

      // Act
      await middleware(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      // Assert
      expect(mockAdminService.hasPermission).toHaveBeenCalledWith(
        admin,
        "USER_MANAGEMENT"
      );
    });

    it("deve negar acesso se admin não tem permissão", async () => {
      // Arrange
      const admin = {
        id: "admin-1",
        email: "admin@test.com",
        name: "Admin Test",
        role: AdminRole.ADMIN,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockRequest as any).admin = admin;
      mockAdminService.hasPermission.mockReturnValue(false);

      const middleware = requirePermission("USER_MANAGEMENT");

      // Act & Assert
      await expect(
        middleware(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow(ForbiddenError);
      await expect(
        middleware(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow("Você não tem permissão para: USER_MANAGEMENT");
    });

    it("deve lançar UnauthorizedError se admin não estiver autenticado", async () => {
      // Arrange
      (mockRequest as any).admin = null;

      const middleware = requirePermission("USER_MANAGEMENT");

      // Act & Assert
      await expect(
        middleware(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow(UnauthorizedError);
      await expect(
        middleware(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow("Admin não autenticado");
    });
  });

  describe("requireSuperAdmin", () => {
    it("deve permitir acesso para SUPER_ADMIN", async () => {
      // Arrange
      const admin = {
        id: "admin-1",
        email: "admin@test.com",
        name: "Admin Test",
        role: AdminRole.SUPER_ADMIN,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockRequest as any).admin = admin;

      // Act
      await requireSuperAdmin(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply
      );

      // Assert - Não deve lançar erro
    });

    it("deve negar acesso para admin que não é SUPER_ADMIN", async () => {
      // Arrange
      const admin = {
        id: "admin-1",
        email: "admin@test.com",
        name: "Admin Test",
        role: AdminRole.ADMIN,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockRequest as any).admin = admin;

      // Act & Assert
      await expect(
        requireSuperAdmin(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow(ForbiddenError);
      await expect(
        requireSuperAdmin(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow("Apenas SUPER_ADMIN pode executar esta ação");
    });

    it("deve negar acesso para MODERATOR", async () => {
      // Arrange
      const admin = {
        id: "admin-1",
        email: "admin@test.com",
        name: "Admin Test",
        role: AdminRole.MODERATOR,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockRequest as any).admin = admin;

      // Act & Assert
      await expect(
        requireSuperAdmin(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it("deve lançar UnauthorizedError se admin não estiver autenticado", async () => {
      // Arrange
      (mockRequest as any).admin = null;

      // Act & Assert
      await expect(
        requireSuperAdmin(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow(UnauthorizedError);
      await expect(
        requireSuperAdmin(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow("Admin não autenticado");
    });
  });
});
