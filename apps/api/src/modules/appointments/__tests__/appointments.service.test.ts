import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { AppointmentsService } from "../appointments.service";
import { AppointmentsRepository } from "../appointments.repository";
import { AppError } from "../../../utils/app-error";

// Mock do repositório
jest.mock("../appointments.repository");

describe("AppointmentsService", () => {
  let service: AppointmentsService;
  let repositoryMock: any;

  beforeEach(() => {
    repositoryMock = {
      create: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateStatus: jest.fn(),
      checkAvailability: jest.fn(),
      getStats: jest.fn(),
      findByUser: jest.fn(),
    };

    service = new AppointmentsService(repositoryMock);
  });

  describe("createAppointment", () => {
    it("should create appointment successfully", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // 7 dias no futuro
      futureDate.setHours(14, 30, 0, 0); // 14:30 (horário comercial)
      futureDate.setDate(
        futureDate.getDate() +
          ((1 + 7 - futureDate.getDay()) % 7 || 7) // Segunda-feira
      );

      const mockAppointment = {
        id: "appt-1",
        clientId: "client-1",
        professionalId: "prof-1",
        serviceId: "service-1",
        scheduledDate: futureDate,
        status: "PENDING",
        locationType: "AT_LOCATION",
      };

      repositoryMock.create.mockResolvedValue(mockAppointment);

      const input = {
        clientId: "client-1",
        professionalId: "prof-1",
        serviceId: "service-1",
        scheduledDate: futureDate.toISOString(),
        locationType: "AT_LOCATION" as const,
      };

      const result = await service.createAppointment(input, "client-1");

      expect(result).toEqual(mockAppointment);
      expect(repositoryMock.create).toHaveBeenCalledWith(input);
    });

    it("should throw error if trying to create appointment for another user", async () => {
      const input = {
        clientId: "client-2",
        professionalId: "prof-1",
        serviceId: "service-1",
        scheduledDate: new Date().toISOString(),
        locationType: "AT_LOCATION" as const,
      };

      await expect(
        service.createAppointment(input, "client-1")
      ).rejects.toThrow(AppError);
      await expect(
        service.createAppointment(input, "client-1")
      ).rejects.toThrow("Você só pode criar agendamentos para si mesmo");
    });

    it("should throw error if scheduled date is in the past", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const input = {
        clientId: "client-1",
        professionalId: "prof-1",
        serviceId: "service-1",
        scheduledDate: pastDate.toISOString(),
        locationType: "AT_LOCATION" as const,
      };

      await expect(
        service.createAppointment(input, "client-1")
      ).rejects.toThrow(AppError);
      await expect(
        service.createAppointment(input, "client-1")
      ).rejects.toThrow("Não é possível agendar para horários no passado");
    });

    it("should throw error if scheduled date is more than 3 months ahead", async () => {
      const farFutureDate = new Date();
      farFutureDate.setMonth(farFutureDate.getMonth() + 4);

      const input = {
        clientId: "client-1",
        professionalId: "prof-1",
        serviceId: "service-1",
        scheduledDate: farFutureDate.toISOString(),
        locationType: "AT_LOCATION" as const,
      };

      await expect(
        service.createAppointment(input, "client-1")
      ).rejects.toThrow(AppError);
      await expect(
        service.createAppointment(input, "client-1")
      ).rejects.toThrow(
        "Não é possível agendar com mais de 3 meses de antecedência"
      );
    });

    it("should throw error if scheduled time is outside business hours", async () => {
      const earlyMorning = new Date();
      earlyMorning.setDate(earlyMorning.getDate() + 1);
      earlyMorning.setHours(7, 0, 0, 0); // 7:00 AM

      const input = {
        clientId: "client-1",
        professionalId: "prof-1",
        serviceId: "service-1",
        scheduledDate: earlyMorning.toISOString(),
        locationType: "AT_LOCATION" as const,
      };

      await expect(
        service.createAppointment(input, "client-1")
      ).rejects.toThrow(AppError);
      await expect(
        service.createAppointment(input, "client-1")
      ).rejects.toThrow("Agendamentos devem ser feitos entre 8h e 18h");
    });

    it("should throw error if scheduled date is on weekend", async () => {
      const sunday = new Date();
      sunday.setDate(sunday.getDate() + ((7 - sunday.getDay()) % 7 || 7)); // Próximo domingo
      sunday.setHours(14, 0, 0, 0);

      const input = {
        clientId: "client-1",
        professionalId: "prof-1",
        serviceId: "service-1",
        scheduledDate: sunday.toISOString(),
        locationType: "AT_LOCATION" as const,
      };

      await expect(
        service.createAppointment(input, "client-1")
      ).rejects.toThrow(AppError);
      await expect(
        service.createAppointment(input, "client-1")
      ).rejects.toThrow("Agendamentos não podem ser feitos nos fins de semana");
    });
  });

  describe("getAppointment", () => {
    it("should get appointment if user has permission", async () => {
      const mockAppointment = {
        id: "appt-1",
        clientId: "client-1",
        professionalId: "prof-1",
        serviceId: "service-1",
      };

      repositoryMock.findById.mockResolvedValue(mockAppointment);

      const result = await service.getAppointment({ id: "appt-1" }, "client-1");

      expect(result).toEqual(mockAppointment);
    });

    it("should throw error if user has no permission to access appointment", async () => {
      const mockAppointment = {
        id: "appt-1",
        clientId: "client-1",
        professionalId: "prof-1",
      };

      repositoryMock.findById.mockResolvedValue(mockAppointment);

      await expect(
        service.getAppointment({ id: "appt-1" }, "other-user")
      ).rejects.toThrow(AppError);
      await expect(
        service.getAppointment({ id: "appt-1" }, "other-user")
      ).rejects.toThrow("Você não tem permissão para acessar este agendamento");
    });
  });

  describe("getAppointments", () => {
    it("should get appointments with default filters", async () => {
      const mockResult = {
        appointments: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      repositoryMock.findMany.mockResolvedValue(mockResult);

      const query = {
        page: 1,
        limit: 10,
      };

      const result = await service.getAppointments(query, "user-1");

      expect(result).toEqual(mockResult);
      expect(query.clientId).toBe("user-1");
    });

    it("should not modify query if clientId or professionalId is provided", async () => {
      const mockResult = {
        appointments: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      repositoryMock.findMany.mockResolvedValue(mockResult);

      const query = {
        page: 1,
        limit: 10,
        professionalId: "prof-1",
      };

      await service.getAppointments(query, "user-1");

      expect(query.clientId).toBeUndefined();
      expect(query.professionalId).toBe("prof-1");
    });
  });

  describe("updateAppointment", () => {
    it("should update appointment successfully", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);

      const mockAppointment = {
        id: "appt-1",
        clientId: "client-1",
        professionalId: "prof-1",
        status: "PENDING",
        scheduledDate: futureDate,
      };

      const updatedAppointment = {
        ...mockAppointment,
        clientNotes: "Updated notes",
      };

      repositoryMock.findById.mockResolvedValue(mockAppointment);
      repositoryMock.update.mockResolvedValue(updatedAppointment);

      const result = await service.updateAppointment(
        { id: "appt-1" },
        { clientNotes: "Updated notes" },
        "client-1"
      );

      expect(result).toEqual(updatedAppointment);
    });

    it("should throw error if trying to update completed appointment", async () => {
      const mockAppointment = {
        id: "appt-1",
        clientId: "client-1",
        status: "COMPLETED",
        scheduledDate: new Date(),
      };

      repositoryMock.findById.mockResolvedValue(mockAppointment);

      await expect(
        service.updateAppointment(
          { id: "appt-1" },
          { clientNotes: "test" },
          "client-1"
        )
      ).rejects.toThrow(AppError);
      await expect(
        service.updateAppointment(
          { id: "appt-1" },
          { clientNotes: "test" },
          "client-1"
        )
      ).rejects.toThrow("Agendamentos concluídos não podem ser editados");
    });

    it("should throw error if trying to update with less than 24h notice", async () => {
      const soonDate = new Date();
      soonDate.setHours(soonDate.getHours() + 12); // 12 horas no futuro

      const mockAppointment = {
        id: "appt-1",
        clientId: "client-1",
        status: "PENDING",
        scheduledDate: soonDate,
      };

      repositoryMock.findById.mockResolvedValue(mockAppointment);

      await expect(
        service.updateAppointment(
          { id: "appt-1" },
          { clientNotes: "test" },
          "client-1"
        )
      ).rejects.toThrow(AppError);
      await expect(
        service.updateAppointment(
          { id: "appt-1" },
          { clientNotes: "test" },
          "client-1"
        )
      ).rejects.toThrow(
        "Agendamentos só podem ser editados com pelo menos 24h de antecedência"
      );
    });
  });

  describe("deleteAppointment", () => {
    it("should delete appointment successfully", async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 3);

      const mockAppointment = {
        id: "appt-1",
        clientId: "client-1",
        status: "PENDING",
        scheduledDate: futureDate,
      };

      repositoryMock.findById.mockResolvedValue(mockAppointment);
      repositoryMock.delete.mockResolvedValue({ success: true });

      const result = await service.deleteAppointment(
        { id: "appt-1" },
        "client-1"
      );

      expect(result).toEqual({ success: true });
    });

    it("should throw error if trying to delete completed appointment", async () => {
      const mockAppointment = {
        id: "appt-1",
        clientId: "client-1",
        status: "COMPLETED",
        scheduledDate: new Date(),
      };

      repositoryMock.findById.mockResolvedValue(mockAppointment);

      await expect(
        service.deleteAppointment({ id: "appt-1" }, "client-1")
      ).rejects.toThrow(AppError);
      await expect(
        service.deleteAppointment({ id: "appt-1" }, "client-1")
      ).rejects.toThrow("Agendamentos concluídos não podem ser cancelados");
    });

    it("should throw error if trying to cancel with less than 2h notice", async () => {
      const soonDate = new Date();
      soonDate.setHours(soonDate.getHours() + 1);

      const mockAppointment = {
        id: "appt-1",
        clientId: "client-1",
        status: "PENDING",
        scheduledDate: soonDate,
      };

      repositoryMock.findById.mockResolvedValue(mockAppointment);

      await expect(
        service.deleteAppointment({ id: "appt-1" }, "client-1")
      ).rejects.toThrow(AppError);
      await expect(
        service.deleteAppointment({ id: "appt-1" }, "client-1")
      ).rejects.toThrow(
        "Agendamentos só podem ser cancelados com pelo menos 2h de antecedência"
      );
    });
  });

  describe("updateAppointmentStatus", () => {
    it("should update status from PENDING to ACCEPTED", async () => {
      const mockAppointment = {
        id: "appt-1",
        clientId: "client-1",
        professionalId: "prof-1",
        status: "PENDING",
        scheduledDate: new Date(),
      };

      const updatedAppointment = {
        ...mockAppointment,
        status: "ACCEPTED",
      };

      repositoryMock.findById.mockResolvedValue(mockAppointment);
      repositoryMock.updateStatus.mockResolvedValue(updatedAppointment);

      const result = await service.updateAppointmentStatus(
        { id: "appt-1" },
        { status: "ACCEPTED" },
        "prof-1"
      );

      expect(result.status).toBe("ACCEPTED");
    });

    it("should throw error if non-professional tries to update status", async () => {
      const mockAppointment = {
        id: "appt-1",
        clientId: "client-1",
        professionalId: "prof-1",
        status: "PENDING",
      };

      repositoryMock.findById.mockResolvedValue(mockAppointment);

      await expect(
        service.updateAppointmentStatus(
          { id: "appt-1" },
          { status: "ACCEPTED" },
          "client-1"
        )
      ).rejects.toThrow(AppError);
      await expect(
        service.updateAppointmentStatus(
          { id: "appt-1" },
          { status: "ACCEPTED" },
          "client-1"
        )
      ).rejects.toThrow(
        "Apenas o profissional pode alterar o status do agendamento"
      );
    });

    it("should throw error for invalid status transition", async () => {
      const mockAppointment = {
        id: "appt-1",
        professionalId: "prof-1",
        status: "REJECTED",
        scheduledDate: new Date(),
      };

      repositoryMock.findById.mockResolvedValue(mockAppointment);

      await expect(
        service.updateAppointmentStatus(
          { id: "appt-1" },
          { status: "COMPLETED" },
          "prof-1"
        )
      ).rejects.toThrow(AppError);
      await expect(
        service.updateAppointmentStatus(
          { id: "appt-1" },
          { status: "COMPLETED" },
          "prof-1"
        )
      ).rejects.toThrow(
        "Não é possível alterar status de REJECTED para COMPLETED"
      );
    });

    it("should throw error if trying to complete future appointment", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const mockAppointment = {
        id: "appt-1",
        professionalId: "prof-1",
        status: "ACCEPTED",
        scheduledDate: futureDate,
      };

      repositoryMock.findById.mockResolvedValue(mockAppointment);

      await expect(
        service.updateAppointmentStatus(
          { id: "appt-1" },
          { status: "COMPLETED" },
          "prof-1"
        )
      ).rejects.toThrow(AppError);
      await expect(
        service.updateAppointmentStatus(
          { id: "appt-1" },
          { status: "COMPLETED" },
          "prof-1"
        )
      ).rejects.toThrow(
        "Não é possível marcar como concluído um agendamento futuro"
      );
    });

    it("should allow completing past appointment", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const mockAppointment = {
        id: "appt-1",
        professionalId: "prof-1",
        status: "ACCEPTED",
        scheduledDate: pastDate,
      };

      const completedAppointment = {
        ...mockAppointment,
        status: "COMPLETED",
      };

      repositoryMock.findById.mockResolvedValue(mockAppointment);
      repositoryMock.updateStatus.mockResolvedValue(completedAppointment);

      const result = await service.updateAppointmentStatus(
        { id: "appt-1" },
        { status: "COMPLETED" },
        "prof-1"
      );

      expect(result.status).toBe("COMPLETED");
    });
  });

  describe("checkAvailability", () => {
    it("should check availability successfully", async () => {
      const mockAvailability = {
        date: "2024-02-15",
        professionalId: "prof-1",
        serviceId: "service-1",
        availableSlots: [
          { time: "08:00", available: true },
          { time: "08:30", available: true },
        ],
      };

      repositoryMock.checkAvailability.mockResolvedValue(mockAvailability);

      const result = await service.checkAvailability(
        {
          professionalId: "prof-1",
          serviceId: "service-1",
          date: "2024-02-15",
        },
        "user-1"
      );

      expect(result).toEqual(mockAvailability);
    });
  });

  describe("getStats", () => {
    it("should get stats for own professional profile", async () => {
      const mockStats = {
        total: 100,
        pending: 10,
        accepted: 50,
        rejected: 15,
        completed: 25,
        completionRate: 25,
        averageRating: 4.5,
      };

      repositoryMock.getStats.mockResolvedValue(mockStats);

      const result = await service.getStats(
        { professionalId: "prof-1" },
        "prof-1"
      );

      expect(result).toEqual(mockStats);
    });

    it("should throw error if trying to see other professional stats", async () => {
      await expect(
        service.getStats({ professionalId: "prof-1" }, "prof-2")
      ).rejects.toThrow(AppError);
      await expect(
        service.getStats({ professionalId: "prof-1" }, "prof-2")
      ).rejects.toThrow("Você só pode ver suas próprias estatísticas");
    });

    it("should throw error if trying to see other client stats", async () => {
      await expect(
        service.getStats({ clientId: "client-1" }, "client-2")
      ).rejects.toThrow(AppError);
      await expect(
        service.getStats({ clientId: "client-1" }, "client-2")
      ).rejects.toThrow("Você só pode ver suas próprias estatísticas");
    });
  });

  describe("getUserAppointments", () => {
    it("should get user appointments as client", async () => {
      const mockAppointments = [
        { id: "appt-1", clientId: "client-1" },
        { id: "appt-2", clientId: "client-1" },
      ];

      repositoryMock.findByUser.mockResolvedValue(mockAppointments);

      const result = await service.getUserAppointments("client-1", "CLIENT");

      expect(result).toEqual(mockAppointments);
      expect(repositoryMock.findByUser).toHaveBeenCalledWith(
        "client-1",
        "CLIENT"
      );
    });
  });

  describe("getUpcomingAppointments", () => {
    it("should get only future appointments with PENDING or ACCEPTED status", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const mockAppointments = [
        {
          id: "appt-1",
          scheduledDate: futureDate,
          status: "ACCEPTED",
        },
        {
          id: "appt-2",
          scheduledDate: pastDate,
          status: "PENDING",
        },
        {
          id: "appt-3",
          scheduledDate: futureDate,
          status: "COMPLETED",
        },
      ];

      repositoryMock.findByUser.mockResolvedValue(mockAppointments);

      const result = await service.getUpcomingAppointments(
        "client-1",
        "CLIENT"
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("appt-1");
    });
  });

  describe("getAppointmentHistory", () => {
    it("should get only past or completed appointments", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const mockAppointments = [
        {
          id: "appt-1",
          scheduledDate: futureDate,
          status: "ACCEPTED",
        },
        {
          id: "appt-2",
          scheduledDate: pastDate,
          status: "PENDING",
        },
        {
          id: "appt-3",
          scheduledDate: futureDate,
          status: "COMPLETED",
        },
      ];

      repositoryMock.findByUser.mockResolvedValue(mockAppointments);

      const result = await service.getAppointmentHistory("client-1", "CLIENT");

      expect(result).toHaveLength(2);
      expect(result.map((a) => a.id)).toContain("appt-2");
      expect(result.map((a) => a.id)).toContain("appt-3");
    });
  });
});

