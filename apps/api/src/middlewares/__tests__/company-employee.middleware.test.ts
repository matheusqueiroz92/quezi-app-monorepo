import { FastifyRequest, FastifyReply } from "fastify";
import {
  requireEmployeeOwnership,
  requireAppointmentOwnership,
  requireClientAppointmentAccess,
} from "../company-employee.middleware";
import { NotFoundError, ForbiddenError } from "../../utils/app-error";
import { prisma } from "../../lib/prisma";

// Mock do Prisma
jest.mock("../../lib/prisma", () => ({
  prisma: {
    companyEmployee: {
      findFirst: jest.fn(),
    },
    companyEmployeeAppointment: {
      findFirst: jest.fn(),
    },
  },
}));

// Mock do FastifyRequest
const createMockRequest = (
  user?: any,
  params?: any
): Partial<FastifyRequest> => ({
  user,
  params,
});

// Mock do FastifyReply
const createMockReply = (): Partial<FastifyReply> => ({
  code: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
});

describe("Company Employee Middleware", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockRequest = createMockRequest();
    mockReply = createMockReply();
    jest.clearAllMocks();
  });

  describe("requireEmployeeOwnership", () => {
    it("should allow COMPANY user accessing their own employee", async () => {
      // Arrange
      mockRequest.user = {
        id: "company-123",
        email: "empresa@example.com",
        name: "Empresa Teste",
        userType: "COMPANY",
      };
      mockRequest.params = { id: "employee-123" };

      const mockEmployee = {
        id: "employee-123",
        companyId: "company-123",
        name: "Funcionário Teste",
      };

      (prisma.companyEmployee.findFirst as jest.Mock).mockResolvedValue(
        mockEmployee
      );

      // Act & Assert
      await expect(
        requireEmployeeOwnership(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).resolves.not.toThrow();

      expect(prisma.companyEmployee.findFirst).toHaveBeenCalledWith({
        where: {
          id: "employee-123",
          companyId: "company-123",
        },
      });
    });

    it("should reject COMPANY user accessing employee from another company", async () => {
      // Arrange
      mockRequest.user = {
        id: "company-123",
        email: "empresa@example.com",
        name: "Empresa Teste",
        userType: "COMPANY",
      };
      mockRequest.params = { id: "employee-456" };

      (prisma.companyEmployee.findFirst as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(
        requireEmployeeOwnership(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow(NotFoundError);
    });

    it("should reject non-COMPANY user", async () => {
      // Arrange
      mockRequest.user = {
        id: "client-123",
        email: "cliente@example.com",
        name: "Cliente Teste",
        userType: "CLIENT",
      };
      mockRequest.params = { id: "employee-123" };

      // Act & Assert
      await expect(
        requireEmployeeOwnership(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it("should reject unauthenticated user", async () => {
      // Arrange
      mockRequest.user = undefined;
      mockRequest.params = { id: "employee-123" };

      // Act & Assert
      await expect(
        requireEmployeeOwnership(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it("should reject when employee ID is missing", async () => {
      // Arrange
      mockRequest.user = {
        id: "company-123",
        email: "empresa@example.com",
        name: "Empresa Teste",
        userType: "COMPANY",
      };
      mockRequest.params = {};

      // Act & Assert
      await expect(
        requireEmployeeOwnership(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("requireAppointmentOwnership", () => {
    it("should allow COMPANY user accessing their own appointment", async () => {
      // Arrange
      mockRequest.user = {
        id: "company-123",
        email: "empresa@example.com",
        name: "Empresa Teste",
        userType: "COMPANY",
      };
      mockRequest.params = { id: "appointment-123" };

      const mockAppointment = {
        id: "appointment-123",
        employee: {
          companyId: "company-123",
        },
      };

      (
        prisma.companyEmployeeAppointment.findFirst as jest.Mock
      ).mockResolvedValue(mockAppointment);

      // Act & Assert
      await expect(
        requireAppointmentOwnership(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).resolves.not.toThrow();

      expect(prisma.companyEmployeeAppointment.findFirst).toHaveBeenCalledWith({
        where: {
          id: "appointment-123",
          employee: {
            companyId: "company-123",
          },
        },
        include: {
          employee: true,
        },
      });
    });

    it("should reject COMPANY user accessing appointment from another company", async () => {
      // Arrange
      mockRequest.user = {
        id: "company-123",
        email: "empresa@example.com",
        name: "Empresa Teste",
        userType: "COMPANY",
      };
      mockRequest.params = { id: "appointment-456" };

      (
        prisma.companyEmployeeAppointment.findFirst as jest.Mock
      ).mockResolvedValue(null);

      // Act & Assert
      await expect(
        requireAppointmentOwnership(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow(NotFoundError);
    });

    it("should reject non-COMPANY user", async () => {
      // Arrange
      mockRequest.user = {
        id: "client-123",
        email: "cliente@example.com",
        name: "Cliente Teste",
        userType: "CLIENT",
      };
      mockRequest.params = { id: "appointment-123" };

      // Act & Assert
      await expect(
        requireAppointmentOwnership(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow(NotFoundError);
    });

    it("should reject when appointment ID is missing", async () => {
      // Arrange
      mockRequest.user = {
        id: "company-123",
        email: "empresa@example.com",
        name: "Empresa Teste",
        userType: "COMPANY",
      };
      mockRequest.params = {};

      // Act & Assert
      await expect(
        requireAppointmentOwnership(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("requireClientAppointmentAccess", () => {
    it("should allow CLIENT user accessing their own appointment", async () => {
      // Arrange
      mockRequest.user = {
        id: "client-123",
        email: "cliente@example.com",
        name: "Cliente Teste",
        userType: "CLIENT",
      };
      mockRequest.params = { id: "appointment-123" };

      const mockAppointment = {
        id: "appointment-123",
        clientId: "client-123",
        employee: {
          name: "Funcionário Teste",
        },
      };

      (
        prisma.companyEmployeeAppointment.findFirst as jest.Mock
      ).mockResolvedValue(mockAppointment);

      // Act & Assert
      await expect(
        requireClientAppointmentAccess(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).resolves.not.toThrow();

      expect(prisma.companyEmployeeAppointment.findFirst).toHaveBeenCalledWith({
        where: {
          id: "appointment-123",
          clientId: "client-123",
        },
        include: {
          employee: true,
        },
      });
    });

    it("should reject CLIENT user accessing another client's appointment", async () => {
      // Arrange
      mockRequest.user = {
        id: "client-123",
        email: "cliente@example.com",
        name: "Cliente Teste",
        userType: "CLIENT",
      };
      mockRequest.params = { id: "appointment-456" };

      (
        prisma.companyEmployeeAppointment.findFirst as jest.Mock
      ).mockResolvedValue(null);

      // Act & Assert
      await expect(
        requireClientAppointmentAccess(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow(NotFoundError);
    });

    it("should reject non-CLIENT user", async () => {
      // Arrange
      mockRequest.user = {
        id: "company-123",
        email: "empresa@example.com",
        name: "Empresa Teste",
        userType: "COMPANY",
      };
      mockRequest.params = { id: "appointment-123" };

      // Act & Assert
      await expect(
        requireClientAppointmentAccess(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it("should reject unauthenticated user", async () => {
      // Arrange
      mockRequest.user = undefined;
      mockRequest.params = { id: "appointment-123" };

      // Act & Assert
      await expect(
        requireClientAppointmentAccess(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it("should reject when appointment ID is missing", async () => {
      // Arrange
      mockRequest.user = {
        id: "client-123",
        email: "cliente@example.com",
        name: "Cliente Teste",
        userType: "CLIENT",
      };
      mockRequest.params = {};

      // Act & Assert
      await expect(
        requireClientAppointmentAccess(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply
        )
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
