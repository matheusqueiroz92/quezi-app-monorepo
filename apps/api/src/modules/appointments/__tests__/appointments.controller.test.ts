import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { AppointmentsController } from "../appointments.controller";
import { AppointmentsService } from "../appointments.service";
import { AppError } from "../../../utils/app-error";

// Mock do service
jest.mock("../appointments.service");

describe("AppointmentsController", () => {
  let controller: AppointmentsController;
  let serviceMock: any;
  let requestMock: any;
  let replyMock: any;

  beforeEach(() => {
    serviceMock = {
      createAppointment: jest.fn(),
      getAppointment: jest.fn(),
      getAppointments: jest.fn(),
      updateAppointment: jest.fn(),
      deleteAppointment: jest.fn(),
      updateAppointmentStatus: jest.fn(),
      checkAvailability: jest.fn(),
      getStats: jest.fn(),
      getUserAppointments: jest.fn(),
      getUpcomingAppointments: jest.fn(),
      getAppointmentHistory: jest.fn(),
    };

    controller = new AppointmentsController(serviceMock);

    requestMock = {
      user: { id: "user-1", userType: "CLIENT" },
      body: {},
      params: {},
      query: {},
    };

    replyMock = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe("createAppointment", () => {
    it("should create appointment successfully", async () => {
      const mockAppointment = {
        id: "clx1234567890abcdef",
        clientId: "clx1234567890abcdef",
        professionalId: "clx0987654321fedcba",
        serviceId: "clx1122334455667788",
        scheduledDate: new Date("2024-02-15T14:30:00Z"),
        status: "PENDING",
      };

      requestMock.body = {
        clientId: "clx1234567890abcdef",
        professionalId: "clx0987654321fedcba",
        serviceId: "clx1122334455667788",
        scheduledDate: "2024-02-15T14:30:00Z",
        locationType: "AT_LOCATION",
      };
      requestMock.user = { id: "clx1234567890abcdef" };

      serviceMock.createAppointment.mockResolvedValue(mockAppointment);

      await controller.createAppointment(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(201);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        data: mockAppointment,
        message: "Agendamento criado com sucesso",
      });
    });

    it("should return 401 if user not authenticated", async () => {
      requestMock.user = undefined;
      requestMock.body = {
        clientId: "clx1234567890abcdef",
        professionalId: "clx0987654321fedcba",
        serviceId: "clx1122334455667788",
        scheduledDate: "2024-02-15T14:30:00Z",
        locationType: "AT_LOCATION",
      };

      await controller.createAppointment(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(401);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: false,
        message: "Usuário não autenticado",
      });
    });

    it("should handle AppError correctly", async () => {
      requestMock.body = {
        clientId: "clx1234567890abcdef",
        professionalId: "clx0987654321fedcba",
        serviceId: "clx1122334455667788",
        scheduledDate: "2024-02-15T14:30:00Z",
        locationType: "AT_LOCATION",
      };
      requestMock.user = { id: "clx1234567890abcdef" };

      serviceMock.createAppointment.mockRejectedValue(
        new AppError("Erro customizado", 400)
      );

      await controller.createAppointment(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(400);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: false,
        message: "Erro customizado",
      });
    });

    it("should handle generic errors", async () => {
      requestMock.body = {
        clientId: "clx1234567890abcdef",
        professionalId: "clx0987654321fedcba",
        serviceId: "clx1122334455667788",
        scheduledDate: "2024-02-15T14:30:00Z",
        locationType: "AT_LOCATION",
      };
      requestMock.user = { id: "clx1234567890abcdef" };

      serviceMock.createAppointment.mockRejectedValue(
        new Error("Erro genérico")
      );

      await controller.createAppointment(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(500);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: false,
        message: "Erro interno do servidor",
      });
    });
  });

  describe("getAppointment", () => {
    it("should get appointment successfully", async () => {
      const mockAppointment = {
        id: "clx1234567890abcdef",
        clientId: "clx1234567890abcdef",
      };

      requestMock.params = { id: "clx1234567890abcdef" };
      requestMock.user = { id: "clx1234567890abcdef" };
      serviceMock.getAppointment.mockResolvedValue(mockAppointment);

      await controller.getAppointment(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        data: mockAppointment,
      });
    });

    it("should return 401 if user not authenticated", async () => {
      requestMock.user = undefined;
      requestMock.params = { id: "clx1234567890abcdef" };

      await controller.getAppointment(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(401);
    });
  });

  describe("getAppointments", () => {
    it("should get appointments list successfully", async () => {
      const mockResult = {
        appointments: [
          { id: "appt-1", status: "PENDING" },
          { id: "appt-2", status: "ACCEPTED" },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      requestMock.query = { page: "1", limit: "10" };
      serviceMock.getAppointments.mockResolvedValue(mockResult);

      await controller.getAppointments(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        data: mockResult.appointments,
        pagination: mockResult.pagination,
      });
    });

    it("should handle errors in getAppointments", async () => {
      requestMock.query = { page: "1", limit: "10" };
      serviceMock.getAppointments.mockRejectedValue(
        new Error("Database error")
      );

      await controller.getAppointments(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(500);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: false,
        message: "Erro interno do servidor",
      });
    });
  });

  describe("updateAppointment", () => {
    it("should update appointment successfully", async () => {
      const mockAppointment = {
        id: "clx1234567890abcdef",
        clientNotes: "Updated notes",
      };

      requestMock.params = { id: "clx1234567890abcdef" };
      requestMock.body = { clientNotes: "Updated notes" };
      requestMock.user = { id: "clx1234567890abcdef" };
      serviceMock.updateAppointment.mockResolvedValue(mockAppointment);

      await controller.updateAppointment(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        data: mockAppointment,
        message: "Agendamento atualizado com sucesso",
      });
    });

    it("should handle errors in updateAppointment", async () => {
      requestMock.params = { id: "clx1234567890abcdef" };
      requestMock.body = { clientNotes: "Updated" };
      requestMock.user = { id: "clx1234567890abcdef" };
      serviceMock.updateAppointment.mockRejectedValue(new Error("DB error"));

      await controller.updateAppointment(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(500);
    });
  });

  describe("deleteAppointment", () => {
    it("should delete appointment successfully", async () => {
      requestMock.params = { id: "clx1234567890abcdef" };
      requestMock.user = { id: "clx1234567890abcdef" };
      serviceMock.deleteAppointment.mockResolvedValue({ success: true });

      await controller.deleteAppointment(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        message: "Agendamento cancelado com sucesso",
      });
    });

    it("should handle errors in deleteAppointment", async () => {
      requestMock.params = { id: "clx1234567890abcdef" };
      requestMock.user = { id: "clx1234567890abcdef" };
      serviceMock.deleteAppointment.mockRejectedValue(new Error("DB error"));

      await controller.deleteAppointment(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(500);
    });
  });

  describe("updateAppointmentStatus", () => {
    it("should update status successfully", async () => {
      const mockAppointment = {
        id: "clx1234567890abcdef",
        status: "ACCEPTED",
      };

      requestMock.params = { id: "clx1234567890abcdef" };
      requestMock.body = { status: "ACCEPTED" };
      requestMock.user = { id: "clx1234567890abcdef" };
      serviceMock.updateAppointmentStatus.mockResolvedValue(mockAppointment);

      await controller.updateAppointmentStatus(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        data: mockAppointment,
        message: "Status do agendamento atualizado com sucesso",
      });
    });

    it("should handle errors in updateAppointmentStatus", async () => {
      requestMock.params = { id: "clx1234567890abcdef" };
      requestMock.body = { status: "ACCEPTED" };
      requestMock.user = { id: "clx1234567890abcdef" };
      serviceMock.updateAppointmentStatus.mockRejectedValue(
        new Error("DB error")
      );

      await controller.updateAppointmentStatus(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(500);
    });
  });

  describe("checkAvailability", () => {
    it("should check availability successfully", async () => {
      const mockAvailability = {
        date: "2024-02-15",
        professionalId: "clx0987654321fedcba",
        serviceId: "clx1122334455667788",
        availableSlots: [
          { time: "08:00", available: true },
          { time: "08:30", available: false, reason: "Horário já ocupado" },
        ],
      };

      requestMock.query = {
        professionalId: "clx0987654321fedcba",
        serviceId: "clx1122334455667788",
        date: "2024-02-15",
      };
      requestMock.user = { id: "clx1234567890abcdef" };

      serviceMock.checkAvailability.mockResolvedValue(mockAvailability);

      await controller.checkAvailability(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        data: mockAvailability,
      });
    });

    it("should handle errors in checkAvailability", async () => {
      requestMock.query = {
        professionalId: "clx0987654321fedcba",
        serviceId: "clx1122334455667788",
        date: "2024-02-15",
      };
      requestMock.user = { id: "clx1234567890abcdef" };
      serviceMock.checkAvailability.mockRejectedValue(new Error("DB error"));

      await controller.checkAvailability(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getStats", () => {
    it("should get statistics successfully", async () => {
      const mockStats = {
        total: 100,
        pending: 10,
        accepted: 50,
        rejected: 15,
        completed: 25,
        completionRate: 25,
        averageRating: 4.5,
      };

      requestMock.query = { professionalId: "clx0987654321fedcba" };
      requestMock.user = { id: "clx1234567890abcdef" };
      serviceMock.getStats.mockResolvedValue(mockStats);

      await controller.getStats(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        data: mockStats,
      });
    });

    it("should handle errors in getStats", async () => {
      requestMock.query = { professionalId: "clx0987654321fedcba" };
      requestMock.user = { id: "clx1234567890abcdef" };
      serviceMock.getStats.mockRejectedValue(new Error("DB error"));

      await controller.getStats(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getMyAppointments", () => {
    it("should get user appointments successfully", async () => {
      const mockAppointments = [
        { id: "appt-1", clientId: "user-1" },
        { id: "appt-2", clientId: "user-1" },
      ];

      requestMock.user = { id: "user-1", userType: "CLIENT" };
      serviceMock.getUserAppointments.mockResolvedValue(mockAppointments);

      await controller.getMyAppointments(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        data: mockAppointments,
      });
      expect(serviceMock.getUserAppointments).toHaveBeenCalledWith(
        "user-1",
        "CLIENT"
      );
    });

    it("should return 400 if userType is invalid", async () => {
      requestMock.user = { id: "user-1", userType: "INVALID" };

      await controller.getMyAppointments(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(400);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: false,
        message: "Tipo de usuário inválido",
      });
    });

    it("should return 401 if user not authenticated", async () => {
      requestMock.user = undefined;

      await controller.getMyAppointments(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(401);
    });

    it("should handle errors in getMyAppointments", async () => {
      requestMock.user = { id: "user-1", userType: "CLIENT" };
      serviceMock.getUserAppointments.mockRejectedValue(new Error("DB error"));

      await controller.getMyAppointments(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getUpcomingAppointments", () => {
    it("should get upcoming appointments successfully", async () => {
      const mockAppointments = [
        {
          id: "appt-1",
          scheduledDate: new Date(Date.now() + 86400000),
          status: "ACCEPTED",
        },
      ];

      requestMock.user = { id: "user-1", userType: "CLIENT" };
      serviceMock.getUpcomingAppointments.mockResolvedValue(mockAppointments);

      await controller.getUpcomingAppointments(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        data: mockAppointments,
      });
      expect(serviceMock.getUpcomingAppointments).toHaveBeenCalledWith(
        "user-1",
        "CLIENT"
      );
    });

    it("should return 400 if userType is invalid", async () => {
      requestMock.user = { id: "user-1", userType: null };

      await controller.getUpcomingAppointments(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(400);
    });

    it("should handle errors in getUpcomingAppointments", async () => {
      requestMock.user = { id: "user-1", userType: "CLIENT" };
      serviceMock.getUpcomingAppointments.mockRejectedValue(
        new Error("DB error")
      );

      await controller.getUpcomingAppointments(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getAppointmentHistory", () => {
    it("should get appointment history successfully", async () => {
      const mockAppointments = [
        {
          id: "appt-1",
          scheduledDate: new Date(Date.now() - 86400000),
          status: "COMPLETED",
        },
      ];

      requestMock.user = { id: "user-1", userType: "PROFESSIONAL" };
      serviceMock.getAppointmentHistory.mockResolvedValue(mockAppointments);

      await controller.getAppointmentHistory(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        data: mockAppointments,
      });
      expect(serviceMock.getAppointmentHistory).toHaveBeenCalledWith(
        "user-1",
        "PROFESSIONAL"
      );
    });

    it("should return 400 if userType is invalid", async () => {
      requestMock.user = { id: "user-1", userType: "ADMIN" };

      await controller.getAppointmentHistory(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(400);
    });

    it("should handle errors in getAppointmentHistory", async () => {
      requestMock.user = { id: "user-1", userType: "PROFESSIONAL" };
      serviceMock.getAppointmentHistory.mockRejectedValue(
        new Error("DB error")
      );

      await controller.getAppointmentHistory(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(500);
    });
  });
});

