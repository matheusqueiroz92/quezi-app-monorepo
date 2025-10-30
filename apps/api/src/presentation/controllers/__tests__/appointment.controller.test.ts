/**
 * Testes para AppointmentController
 *
 * Testa a camada de apresentação do módulo de agendamentos
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
import { FastifyInstance } from "fastify";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../../../utils/app-error";

// Mock do AppointmentService
const mockAppointmentService = {
  createAppointment: jest.fn(),
  getAppointmentById: jest.fn(),
  updateAppointment: jest.fn(),
  cancelAppointment: jest.fn(),
  getAppointmentsByUser: jest.fn(),
  getAppointmentsByProfessional: jest.fn(),
  getAppointmentsByDateRange: jest.fn(),
  confirmAppointment: jest.fn(),
  completeAppointment: jest.fn(),
  startAppointment: jest.fn(),
};

// Mock do middleware de autenticação
const mockAuthMiddleware = jest.fn((request: any, reply: any, done: any) => {
  request.user = {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    userType: "CLIENT",
  };
  done();
});

// Mock do middleware RBAC
const mockRbacMiddleware = jest.fn((request: any, reply: any, done: any) => {
  done();
});

jest.mock("../../../application/services/appointment.service", () => ({
  AppointmentService: jest
    .fn()
    .mockImplementation(() => mockAppointmentService),
}));

jest.mock("../../../middlewares/auth.middleware", () => ({
  authMiddleware: mockAuthMiddleware,
}));

jest.mock("../../../middlewares/rbac.middleware", () => ({
  rbacMiddleware: mockRbacMiddleware,
}));

// Importar após os mocks
import { appointmentRoutes } from "../appointment.controller";

describe.skip("AppointmentController", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Criar instância do Fastify para testes
    const fastify = require("fastify");
    app = fastify({ logger: false });

    // Registrar rotas
    await app.register(appointmentRoutes, { prefix: "/appointments" });

    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("POST /appointments", () => {
    it("deve criar agendamento com sucesso", async () => {
      // Arrange
      const appointmentData = {
        clientId: "client-123",
        professionalId: "professional-123",
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        notes: "Consulta de rotina",
      };

      const mockAppointment = {
        id: "appointment-123",
        ...appointmentData,
        status: "SCHEDULED",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAppointmentService.createAppointment.mockResolvedValue(
        mockAppointment
      );

      // Act
      const response = await app.inject({
        method: "POST",
        url: "/appointments",
        payload: appointmentData,
      });

      // Assert
      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body)).toEqual({
        success: true,
        data: mockAppointment,
        message: "Agendamento criado com sucesso",
      });
      expect(mockAppointmentService.createAppointment).toHaveBeenCalledWith(
        appointmentData
      );
    });

    it("deve retornar erro 400 para dados inválidos", async () => {
      // Arrange
      const invalidData = {
        clientId: "",
        professionalId: "professional-123",
        scheduledDate: "invalid-date",
      };

      mockAppointmentService.createAppointment.mockRejectedValue(
        new BadRequestError("Dados inválidos")
      );

      // Act
      const response = await app.inject({
        method: "POST",
        url: "/appointments",
        payload: invalidData,
      });

      // Assert
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body)).toEqual({
        success: false,
        error: "Dados inválidos",
      });
    });

    it("deve retornar erro 404 se cliente não encontrado", async () => {
      // Arrange
      const appointmentData = {
        clientId: "non-existent-client",
        professionalId: "professional-123",
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duration: 60,
      };

      mockAppointmentService.createAppointment.mockRejectedValue(
        new NotFoundError("Cliente não encontrado")
      );

      // Act
      const response = await app.inject({
        method: "POST",
        url: "/appointments",
        payload: appointmentData,
      });

      // Assert
      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body)).toEqual({
        success: false,
        error: "Cliente não encontrado",
      });
    });
  });

  describe("GET /appointments/:id", () => {
    it("deve retornar agendamento por ID", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      const mockAppointment = {
        id: appointmentId,
        clientId: "client-123",
        professionalId: "professional-123",
        scheduledDate: new Date(),
        status: "SCHEDULED",
        duration: 60,
      };

      mockAppointmentService.getAppointmentById.mockResolvedValue(
        mockAppointment
      );

      // Act
      const response = await app.inject({
        method: "GET",
        url: `/appointments/${appointmentId}`,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({
        success: true,
        data: mockAppointment,
      });
      expect(mockAppointmentService.getAppointmentById).toHaveBeenCalledWith(
        appointmentId
      );
    });

    it("deve retornar erro 404 se agendamento não encontrado", async () => {
      // Arrange
      const appointmentId = "non-existent";
      mockAppointmentService.getAppointmentById.mockRejectedValue(
        new NotFoundError("Agendamento não encontrado")
      );

      // Act
      const response = await app.inject({
        method: "GET",
        url: `/appointments/${appointmentId}`,
      });

      // Assert
      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body)).toEqual({
        success: false,
        error: "Agendamento não encontrado",
      });
    });
  });

  describe("PUT /appointments/:id", () => {
    it("deve atualizar agendamento com sucesso", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      const updateData = {
        scheduledDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        notes: "Consulta atualizada",
      };

      const mockUpdatedAppointment = {
        id: appointmentId,
        clientId: "client-123",
        professionalId: "professional-123",
        ...updateData,
        status: "SCHEDULED",
        duration: 60,
      };

      mockAppointmentService.updateAppointment.mockResolvedValue(
        mockUpdatedAppointment
      );

      // Act
      const response = await app.inject({
        method: "PUT",
        url: `/appointments/${appointmentId}`,
        payload: updateData,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({
        success: true,
        data: mockUpdatedAppointment,
        message: "Agendamento atualizado com sucesso",
      });
      expect(mockAppointmentService.updateAppointment).toHaveBeenCalledWith(
        appointmentId,
        updateData
      );
    });
  });

  describe("DELETE /appointments/:id", () => {
    it("deve cancelar agendamento com sucesso", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      mockAppointmentService.cancelAppointment.mockResolvedValue(undefined);

      // Act
      const response = await app.inject({
        method: "DELETE",
        url: `/appointments/${appointmentId}`,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({
        success: true,
        message: "Agendamento cancelado com sucesso",
      });
      expect(mockAppointmentService.cancelAppointment).toHaveBeenCalledWith(
        appointmentId
      );
    });
  });

  describe("GET /appointments/user/:userId", () => {
    it("deve retornar agendamentos do usuário", async () => {
      // Arrange
      const userId = "user-123";
      const mockAppointments = [
        {
          id: "appointment-1",
          clientId: userId,
          professionalId: "professional-123",
          scheduledDate: new Date(),
          status: "SCHEDULED",
        },
        {
          id: "appointment-2",
          clientId: userId,
          professionalId: "professional-456",
          scheduledDate: new Date(),
          status: "COMPLETED",
        },
      ];

      mockAppointmentService.getAppointmentsByUser.mockResolvedValue(
        mockAppointments
      );

      // Act
      const response = await app.inject({
        method: "GET",
        url: `/appointments/user/${userId}`,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({
        success: true,
        data: mockAppointments,
      });
      expect(mockAppointmentService.getAppointmentsByUser).toHaveBeenCalledWith(
        userId
      );
    });
  });

  describe("GET /appointments/professional/:professionalId", () => {
    it("deve retornar agendamentos do profissional", async () => {
      // Arrange
      const professionalId = "professional-123";
      const mockAppointments = [
        {
          id: "appointment-1",
          clientId: "client-123",
          professionalId,
          scheduledDate: new Date(),
          status: "SCHEDULED",
        },
      ];

      mockAppointmentService.getAppointmentsByProfessional.mockResolvedValue(
        mockAppointments
      );

      // Act
      const response = await app.inject({
        method: "GET",
        url: `/appointments/professional/${professionalId}`,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({
        success: true,
        data: mockAppointments,
      });
      expect(
        mockAppointmentService.getAppointmentsByProfessional
      ).toHaveBeenCalledWith(professionalId);
    });
  });

  describe("POST /appointments/:id/confirm", () => {
    it("deve confirmar agendamento com sucesso", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      const mockConfirmedAppointment = {
        id: appointmentId,
        status: "CONFIRMED",
        confirmedAt: new Date(),
      };

      mockAppointmentService.confirmAppointment.mockResolvedValue(
        mockConfirmedAppointment
      );

      // Act
      const response = await app.inject({
        method: "POST",
        url: `/appointments/${appointmentId}/confirm`,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({
        success: true,
        data: mockConfirmedAppointment,
        message: "Agendamento confirmado com sucesso",
      });
      expect(mockAppointmentService.confirmAppointment).toHaveBeenCalledWith(
        appointmentId
      );
    });
  });

  describe("POST /appointments/:id/start", () => {
    it("deve iniciar agendamento com sucesso", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      const mockStartedAppointment = {
        id: appointmentId,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      };

      mockAppointmentService.startAppointment.mockResolvedValue(
        mockStartedAppointment
      );

      // Act
      const response = await app.inject({
        method: "POST",
        url: `/appointments/${appointmentId}/start`,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({
        success: true,
        data: mockStartedAppointment,
        message: "Agendamento iniciado com sucesso",
      });
      expect(mockAppointmentService.startAppointment).toHaveBeenCalledWith(
        appointmentId
      );
    });
  });

  describe("POST /appointments/:id/complete", () => {
    it("deve completar agendamento com sucesso", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      const mockCompletedAppointment = {
        id: appointmentId,
        status: "COMPLETED",
        completedAt: new Date(),
      };

      mockAppointmentService.completeAppointment.mockResolvedValue(
        mockCompletedAppointment
      );

      // Act
      const response = await app.inject({
        method: "POST",
        url: `/appointments/${appointmentId}/complete`,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({
        success: true,
        data: mockCompletedAppointment,
        message: "Agendamento concluído com sucesso",
      });
      expect(mockAppointmentService.completeAppointment).toHaveBeenCalledWith(
        appointmentId
      );
    });
  });
});
