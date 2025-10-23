import { FastifyRequest, FastifyReply } from "fastify";
import {
  requireCompany,
  requireCompanyOwnership,
  requireAppointmentAccess,
  requireReviewAccess,
} from "../company-auth.middleware";
import { ForbiddenError } from "../../utils/app-error";

// Mock do FastifyRequest
const createMockRequest = (user?: any): Partial<FastifyRequest> => ({
  user,
});

// Mock do FastifyReply
const createMockReply = (): Partial<FastifyReply> => ({
  code: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
});

describe("Company Auth Middleware", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockRequest = createMockRequest();
    mockReply = createMockReply();
  });

  describe("requireCompany", () => {
    it("should allow COMPANY user type", async () => {
      // Arrange
      mockRequest.user = {
        id: "company-123",
        email: "empresa@example.com",
        name: "Empresa Teste",
        userType: "COMPANY",
      };

      // Act & Assert
      await expect(
        requireCompany(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).resolves.not.toThrow();
    });

    it("should reject CLIENT user type", async () => {
      // Arrange
      mockRequest.user = {
        id: "client-123",
        email: "cliente@example.com",
        name: "Cliente Teste",
        userType: "CLIENT",
      };

      // Act & Assert
      await expect(
        requireCompany(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow(ForbiddenError);
    });

    it("should reject PROFESSIONAL user type", async () => {
      // Arrange
      mockRequest.user = {
        id: "professional-123",
        email: "profissional@example.com",
        name: "Profissional Teste",
        userType: "PROFESSIONAL",
      };

      // Act & Assert
      await expect(
        requireCompany(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow(ForbiddenError);
    });

    it("should reject unauthenticated user", async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act & Assert
      await expect(
        requireCompany(mockRequest as FastifyRequest, mockReply as FastifyReply)
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("requireCompanyOwnership", () => {
    it("should allow COMPANY user accessing their own resources", async () => {
      // Arrange
      mockRequest.user = {
        id: "company-123",
        email: "empresa@example.com",
        name: "Empresa Teste",
        userType: "COMPANY",
      };
      mockRequest.params = { id: "company-123" };

      // Act & Assert
      await expect(
        requireCompanyOwnership(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).resolves.not.toThrow();
    });

    it("should reject COMPANY user accessing other company resources", async () => {
      // Arrange
      mockRequest.user = {
        id: "company-123",
        email: "empresa@example.com",
        name: "Empresa Teste",
        userType: "COMPANY",
      };
      mockRequest.params = { id: "company-456" };

      // Act & Assert
      await expect(
        requireCompanyOwnership(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it("should reject non-COMPANY user", async () => {
      // Arrange
      mockRequest.user = {
        id: "client-123",
        email: "cliente@example.com",
        name: "Cliente Teste",
        userType: "CLIENT",
      };

      // Act & Assert
      await expect(
        requireCompanyOwnership(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("requireAppointmentAccess", () => {
    it("should allow CLIENT user", async () => {
      // Arrange
      mockRequest.user = {
        id: "client-123",
        email: "cliente@example.com",
        name: "Cliente Teste",
        userType: "CLIENT",
      };

      // Act & Assert
      await expect(
        requireAppointmentAccess(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).resolves.not.toThrow();
    });

    it("should allow COMPANY user", async () => {
      // Arrange
      mockRequest.user = {
        id: "company-123",
        email: "empresa@example.com",
        name: "Empresa Teste",
        userType: "COMPANY",
      };

      // Act & Assert
      await expect(
        requireAppointmentAccess(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).resolves.not.toThrow();
    });

    it("should reject PROFESSIONAL user", async () => {
      // Arrange
      mockRequest.user = {
        id: "professional-123",
        email: "profissional@example.com",
        name: "Profissional Teste",
        userType: "PROFESSIONAL",
      };

      // Act & Assert
      await expect(
        requireAppointmentAccess(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it("should reject unauthenticated user", async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act & Assert
      await expect(
        requireAppointmentAccess(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("requireReviewAccess", () => {
    it("should allow CLIENT user", async () => {
      // Arrange
      mockRequest.user = {
        id: "client-123",
        email: "cliente@example.com",
        name: "Cliente Teste",
        userType: "CLIENT",
      };

      // Act & Assert
      await expect(
        requireReviewAccess(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).resolves.not.toThrow();
    });

    it("should reject COMPANY user", async () => {
      // Arrange
      mockRequest.user = {
        id: "company-123",
        email: "empresa@example.com",
        name: "Empresa Teste",
        userType: "COMPANY",
      };

      // Act & Assert
      await expect(
        requireReviewAccess(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it("should reject PROFESSIONAL user", async () => {
      // Arrange
      mockRequest.user = {
        id: "professional-123",
        email: "profissional@example.com",
        name: "Profissional Teste",
        userType: "PROFESSIONAL",
      };

      // Act & Assert
      await expect(
        requireReviewAccess(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it("should reject unauthenticated user", async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act & Assert
      await expect(
        requireReviewAccess(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
