import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { AppointmentsRepository } from "../appointments.repository";
import { AppError } from "../../../utils/app-error";

// Mock do Prisma Client
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(),
}));

describe("AppointmentsRepository", () => {
  let repository: AppointmentsRepository;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      appointment: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
      },
      service: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      review: {
        aggregate: jest.fn(),
      },
    };

    repository = new AppointmentsRepository(prismaMock as any);
  });

  describe("create", () => {
    it("should create an appointment successfully", async () => {
      const mockService = {
        id: "service-1",
        professionalId: "prof-1",
        durationMinutes: 60,
        professional: { id: "prof-1", userType: "PROFESSIONAL" },
        category: { id: "cat-1", name: "Categoria" },
      };

      const mockProfessional = {
        id: "prof-1",
        userType: "PROFESSIONAL",
      };

      const mockClient = {
        id: "client-1",
      };

      const mockAppointment = {
        id: "appt-1",
        clientId: "client-1",
        professionalId: "prof-1",
        serviceId: "service-1",
        scheduledDate: new Date("2024-02-15T14:30:00Z"),
        status: "PENDING",
        locationType: "AT_LOCATION",
        clientAddress: null,
        clientNotes: "Test notes",
        isReviewed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        client: mockClient,
        professional: mockProfessional,
        service: mockService,
      };

      prismaMock.service.findFirst.mockResolvedValue(mockService);
      prismaMock.user.findUnique
        .mockResolvedValueOnce(mockProfessional)
        .mockResolvedValueOnce(mockClient);
      prismaMock.appointment.findFirst.mockResolvedValue(null);
      prismaMock.appointment.create.mockResolvedValue(mockAppointment);

      const input = {
        clientId: "client-1",
        professionalId: "prof-1",
        serviceId: "service-1",
        scheduledDate: "2024-02-15T14:30:00Z",
        locationType: "AT_LOCATION" as const,
        clientNotes: "Test notes",
      };

      const result = await repository.create(input);

      expect(result).toEqual(mockAppointment);
      expect(prismaMock.service.findFirst).toHaveBeenCalledWith({
        where: {
          id: "service-1",
          professionalId: "prof-1",
        },
        include: {
          professional: true,
          category: true,
        },
      });
    });

    it("should throw error if service not found", async () => {
      prismaMock.service.findFirst.mockResolvedValue(null);

      const input = {
        clientId: "client-1",
        professionalId: "prof-1",
        serviceId: "service-1",
        scheduledDate: "2024-02-15T14:30:00Z",
        locationType: "AT_LOCATION" as const,
      };

      await expect(repository.create(input)).rejects.toThrow(AppError);
      await expect(repository.create(input)).rejects.toThrow(
        "Serviço não encontrado ou não pertence ao profissional"
      );
    });

    it("should throw error if professional not found", async () => {
      const mockService = {
        id: "service-1",
        professionalId: "prof-1",
        durationMinutes: 60,
      };

      prismaMock.service.findFirst.mockResolvedValue(mockService);
      prismaMock.user.findUnique.mockResolvedValue(null);

      const input = {
        clientId: "client-1",
        professionalId: "prof-1",
        serviceId: "service-1",
        scheduledDate: "2024-02-15T14:30:00Z",
        locationType: "AT_LOCATION" as const,
      };

      await expect(repository.create(input)).rejects.toThrow(AppError);
      await expect(repository.create(input)).rejects.toThrow(
        "Profissional não encontrado"
      );
    });

    it("should throw error if client not found", async () => {
      const mockService = {
        id: "service-1",
        professionalId: "prof-1",
        durationMinutes: 60,
      };

      const mockProfessional = {
        id: "prof-1",
        userType: "PROFESSIONAL",
      };

      prismaMock.service.findFirst.mockResolvedValue(mockService);
      prismaMock.user.findUnique
        .mockResolvedValueOnce(mockProfessional)
        .mockResolvedValueOnce(null);

      const input = {
        clientId: "client-1",
        professionalId: "prof-1",
        serviceId: "service-1",
        scheduledDate: "2024-02-15T14:30:00Z",
        locationType: "AT_LOCATION" as const,
      };

      await expect(repository.create(input)).rejects.toThrow(AppError);
      await expect(repository.create(input)).rejects.toThrow(
        "Cliente não encontrado"
      );
    });

    it("should throw error if time slot has conflict", async () => {
      const mockService = {
        id: "service-1",
        professionalId: "prof-1",
        durationMinutes: 60,
      };

      const mockProfessional = {
        id: "prof-1",
        userType: "PROFESSIONAL",
      };

      const mockClient = {
        id: "client-1",
      };

      const conflictingAppointment = {
        id: "existing-appt",
        scheduledDate: new Date("2024-02-15T14:30:00Z"),
      };

      prismaMock.service.findFirst.mockResolvedValue(mockService);
      prismaMock.user.findUnique
        .mockResolvedValueOnce(mockProfessional)
        .mockResolvedValueOnce(mockClient);
      prismaMock.appointment.findFirst.mockResolvedValue(
        conflictingAppointment
      );

      const input = {
        clientId: "client-1",
        professionalId: "prof-1",
        serviceId: "service-1",
        scheduledDate: "2024-02-15T14:30:00Z",
        locationType: "AT_LOCATION" as const,
      };

      await expect(repository.create(input)).rejects.toThrow(AppError);
      await expect(repository.create(input)).rejects.toThrow(
        "Profissional já possui agendamento neste horário"
      );
    });
  });

  describe("findById", () => {
    it("should find appointment by id", async () => {
      const mockAppointment = {
        id: "appt-1",
        clientId: "client-1",
        professionalId: "prof-1",
        serviceId: "service-1",
        scheduledDate: new Date("2024-02-15T14:30:00Z"),
        status: "PENDING",
        locationType: "AT_LOCATION",
        clientAddress: null,
        clientNotes: null,
        isReviewed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        client: { id: "client-1", name: "Client", email: "client@test.com" },
        professional: {
          id: "prof-1",
          name: "Professional",
          email: "prof@test.com",
        },
        service: {
          id: "service-1",
          name: "Service",
          category: { id: "cat-1", name: "Category" },
        },
        review: null,
      };

      prismaMock.appointment.findUnique.mockResolvedValue(mockAppointment);

      const result = await repository.findById("appt-1");

      expect(result).toEqual(mockAppointment);
      expect(prismaMock.appointment.findUnique).toHaveBeenCalledWith({
        where: { id: "appt-1" },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          professional: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          service: {
            include: {
              category: true,
            },
          },
          review: true,
        },
      });
    });

    it("should throw error if appointment not found", async () => {
      prismaMock.appointment.findUnique.mockResolvedValue(null);

      await expect(repository.findById("non-existent")).rejects.toThrow(
        AppError
      );
      await expect(repository.findById("non-existent")).rejects.toThrow(
        "Agendamento não encontrado"
      );
    });
  });

  describe("findMany", () => {
    it("should find appointments with pagination", async () => {
      const mockAppointments = [
        {
          id: "appt-1",
          status: "PENDING",
          scheduledDate: new Date(),
        },
        {
          id: "appt-2",
          status: "ACCEPTED",
          scheduledDate: new Date(),
        },
      ];

      prismaMock.appointment.findMany.mockResolvedValue(mockAppointments);
      prismaMock.appointment.count.mockResolvedValue(2);

      const query = {
        page: 1,
        limit: 10,
      };

      const result = await repository.findMany(query);

      expect(result.appointments).toEqual(mockAppointments);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it("should filter by status", async () => {
      const mockAppointments = [
        {
          id: "appt-1",
          status: "PENDING",
        },
      ];

      prismaMock.appointment.findMany.mockResolvedValue(mockAppointments);
      prismaMock.appointment.count.mockResolvedValue(1);

      const query = {
        page: 1,
        limit: 10,
        status: "PENDING" as const,
      };

      await repository.findMany(query);

      expect(prismaMock.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "PENDING",
          }),
        })
      );
    });

    it("should filter by date range", async () => {
      const mockAppointments = [];

      prismaMock.appointment.findMany.mockResolvedValue(mockAppointments);
      prismaMock.appointment.count.mockResolvedValue(0);

      const query = {
        page: 1,
        limit: 10,
        dateFrom: "2024-01-01T00:00:00Z",
        dateTo: "2024-12-31T23:59:59Z",
      };

      await repository.findMany(query);

      expect(prismaMock.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            scheduledDate: {
              gte: new Date("2024-01-01T00:00:00Z"),
              lte: new Date("2024-12-31T23:59:59Z"),
            },
          }),
        })
      );
    });
  });

  describe("update", () => {
    it("should update appointment successfully", async () => {
      const existingAppointment = {
        id: "appt-1",
        serviceId: "service-1",
        professionalId: "prof-1",
        status: "PENDING",
        scheduledDate: new Date("2024-02-15T14:30:00Z"),
      };

      const mockService = {
        id: "service-1",
        durationMinutes: 60,
      };

      const updatedAppointment = {
        ...existingAppointment,
        clientNotes: "Updated notes",
      };

      prismaMock.appointment.findUnique.mockResolvedValue(existingAppointment);
      prismaMock.service.findUnique.mockResolvedValue(mockService);
      prismaMock.appointment.findFirst.mockResolvedValue(null);
      prismaMock.appointment.update.mockResolvedValue(updatedAppointment);

      const result = await repository.update("appt-1", {
        clientNotes: "Updated notes",
      });

      expect(result).toEqual(updatedAppointment);
    });

    it("should throw error if appointment not found for update", async () => {
      prismaMock.appointment.findUnique.mockResolvedValue(null);

      await expect(
        repository.update("non-existent", { clientNotes: "test" })
      ).rejects.toThrow(AppError);
      await expect(
        repository.update("non-existent", { clientNotes: "test" })
      ).rejects.toThrow("Agendamento não encontrado");
    });

    it("should check for conflicts when updating scheduledDate", async () => {
      const existingAppointment = {
        id: "appt-1",
        serviceId: "service-1",
        professionalId: "prof-1",
        status: "PENDING",
        scheduledDate: new Date("2024-02-15T14:30:00Z"),
      };

      const mockService = {
        id: "service-1",
        durationMinutes: 60,
      };

      const conflictingAppointment = {
        id: "appt-2",
        scheduledDate: new Date("2024-02-16T14:30:00Z"),
      };

      prismaMock.appointment.findUnique.mockResolvedValue(existingAppointment);
      prismaMock.service.findUnique.mockResolvedValue(mockService);
      prismaMock.appointment.findFirst.mockResolvedValue(
        conflictingAppointment
      );

      await expect(
        repository.update("appt-1", {
          scheduledDate: "2024-02-16T14:30:00Z",
        })
      ).rejects.toThrow(AppError);
      await expect(
        repository.update("appt-1", {
          scheduledDate: "2024-02-16T14:30:00Z",
        })
      ).rejects.toThrow("Profissional já possui agendamento neste horário");
    });
  });

  describe("delete", () => {
    it("should delete appointment successfully", async () => {
      const mockAppointment = {
        id: "appt-1",
        status: "PENDING",
      };

      prismaMock.appointment.findUnique.mockResolvedValue(mockAppointment);
      prismaMock.appointment.delete.mockResolvedValue(mockAppointment);

      const result = await repository.delete("appt-1");

      expect(result).toEqual({ success: true });
      expect(prismaMock.appointment.delete).toHaveBeenCalledWith({
        where: { id: "appt-1" },
      });
    });

    it("should throw error if appointment not found for deletion", async () => {
      prismaMock.appointment.findUnique.mockResolvedValue(null);

      await expect(repository.delete("non-existent")).rejects.toThrow(AppError);
      await expect(repository.delete("non-existent")).rejects.toThrow(
        "Agendamento não encontrado"
      );
    });

    it("should throw error if trying to delete non-PENDING appointment", async () => {
      const mockAppointment = {
        id: "appt-1",
        status: "ACCEPTED",
      };

      prismaMock.appointment.findUnique.mockResolvedValue(mockAppointment);

      await expect(repository.delete("appt-1")).rejects.toThrow(AppError);
      await expect(repository.delete("appt-1")).rejects.toThrow(
        "Apenas agendamentos pendentes podem ser cancelados"
      );
    });
  });

  describe("updateStatus", () => {
    it("should update appointment status", async () => {
      const mockAppointment = {
        id: "appt-1",
        status: "PENDING",
      };

      const updatedAppointment = {
        ...mockAppointment,
        status: "ACCEPTED",
      };

      prismaMock.appointment.findUnique.mockResolvedValue(mockAppointment);
      prismaMock.appointment.update.mockResolvedValue(updatedAppointment);

      const result = await repository.updateStatus("appt-1", {
        status: "ACCEPTED",
      });

      expect(result.status).toBe("ACCEPTED");
      expect(prismaMock.appointment.update).toHaveBeenCalledWith({
        where: { id: "appt-1" },
        data: { status: "ACCEPTED" },
        include: expect.any(Object),
      });
    });

    it("should throw error if appointment not found for status update", async () => {
      prismaMock.appointment.findUnique.mockResolvedValue(null);

      await expect(
        repository.updateStatus("non-existent", { status: "ACCEPTED" })
      ).rejects.toThrow(AppError);
    });
  });

  describe("checkAvailability", () => {
    it("should return available slots", async () => {
      const mockService = {
        id: "service-1",
        durationMinutes: 60,
      };

      prismaMock.service.findFirst.mockResolvedValue(mockService);
      prismaMock.appointment.findMany.mockResolvedValue([]);

      const result = await repository.checkAvailability({
        professionalId: "prof-1",
        serviceId: "service-1",
        date: "2024-02-15",
      });

      expect(result.availableSlots.length).toBeGreaterThan(0);
      expect(result.availableSlots[0]).toHaveProperty("time");
      expect(result.availableSlots[0]).toHaveProperty("available");
    });

    it("should mark conflicting slots as unavailable", async () => {
      const mockService = {
        id: "service-1",
        durationMinutes: 60,
      };

      const existingAppointment = {
        scheduledDate: new Date("2024-02-15T09:00:00Z"),
        service: {
          durationMinutes: 60,
        },
      };

      prismaMock.service.findFirst.mockResolvedValue(mockService);
      prismaMock.appointment.findMany.mockResolvedValue([existingAppointment]);

      const result = await repository.checkAvailability({
        professionalId: "prof-1",
        serviceId: "service-1",
        date: "2024-02-15",
      });

      const slot9am = result.availableSlots.find((s) => s.time === "09:00");
      expect(slot9am?.available).toBe(false);
      expect(slot9am?.reason).toBe("Horário já ocupado");
    });

    it("should throw error if service not found for availability check", async () => {
      prismaMock.service.findFirst.mockResolvedValue(null);

      await expect(
        repository.checkAvailability({
          professionalId: "prof-1",
          serviceId: "service-1",
          date: "2024-02-15",
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe("getStats", () => {
    it("should return appointment statistics", async () => {
      const mockStats = [
        { status: "PENDING", _count: { status: 10 } },
        { status: "ACCEPTED", _count: { status: 50 } },
        { status: "COMPLETED", _count: { status: 40 } },
      ];

      const mockAvgRating = {
        _avg: {
          rating: 4.5,
        },
      };

      prismaMock.appointment.groupBy.mockResolvedValue(mockStats);
      prismaMock.review.aggregate.mockResolvedValue(mockAvgRating);

      const result = await repository.getStats({});

      expect(result.total).toBe(100);
      expect(result.pending).toBe(10);
      expect(result.accepted).toBe(50);
      expect(result.completed).toBe(40);
      expect(result.completionRate).toBe(40);
      expect(result.averageRating).toBe(4.5);
    });

    it("should return null averageRating if no reviews", async () => {
      prismaMock.appointment.groupBy.mockResolvedValue([]);
      prismaMock.review.aggregate.mockResolvedValue({
        _avg: { rating: null },
      });

      const result = await repository.getStats({});

      expect(result.averageRating).toBeNull();
    });
  });

  describe("findByUser", () => {
    it("should find appointments by client", async () => {
      const mockAppointments = [
        { id: "appt-1", clientId: "client-1" },
        { id: "appt-2", clientId: "client-1" },
      ];

      prismaMock.appointment.findMany.mockResolvedValue(mockAppointments);

      const result = await repository.findByUser("client-1", "CLIENT");

      expect(result).toEqual(mockAppointments);
      expect(prismaMock.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clientId: "client-1" },
        })
      );
    });

    it("should find appointments by professional", async () => {
      const mockAppointments = [
        { id: "appt-1", professionalId: "prof-1" },
        { id: "appt-2", professionalId: "prof-1" },
      ];

      prismaMock.appointment.findMany.mockResolvedValue(mockAppointments);

      const result = await repository.findByUser("prof-1", "PROFESSIONAL");

      expect(result).toEqual(mockAppointments);
      expect(prismaMock.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { professionalId: "prof-1" },
        })
      );
    });
  });

  describe("countByStatus", () => {
    it("should count appointments by status", async () => {
      prismaMock.appointment.count.mockResolvedValue(15);

      const result = await repository.countByStatus("PENDING");

      expect(result).toBe(15);
      expect(prismaMock.appointment.count).toHaveBeenCalledWith({
        where: { status: "PENDING" },
      });
    });
  });
});

