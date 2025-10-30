/**
 * Testes para AppointmentService
 *
 * Testa a lógica de negócio dos agendamentos
 * Seguindo TDD e princípios SOLID
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { AppointmentService } from "../appointment.service";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "../../../utils/app-error";

// Mock do AppointmentRepository
const mockAppointmentRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByProfessionalId: jest.fn(),
  findByCompanyEmployeeId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findMany: jest.fn(),
  findByDateRange: jest.fn(),
  findByStatus: jest.fn(),
  count: jest.fn(),
};

// Mock do UserRepository
const mockUserRepository = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
};

// Mock do ProfessionalProfileRepository
const mockProfessionalProfileRepository = {
  findByUserId: jest.fn(),
};

// Mock do CompanyEmployeeRepository
const mockCompanyEmployeeRepository = {
  findById: jest.fn(),
  findByUserId: jest.fn(),
};

jest.mock(
  "../../../infrastructure/repositories/appointment.repository",
  () => ({
    AppointmentRepository: jest
      .fn()
      .mockImplementation(() => mockAppointmentRepository),
  })
);

jest.mock("../../../infrastructure/repositories/user.repository", () => ({
  UserRepository: jest.fn().mockImplementation(() => mockUserRepository),
}));

jest.mock(
  "../../../infrastructure/repositories/professional-profile.repository",
  () => ({
    ProfessionalProfileRepository: jest
      .fn()
      .mockImplementation(() => mockProfessionalProfileRepository),
  })
);

jest.mock(
  "../../../infrastructure/repositories/company-employee.repository",
  () => ({
    CompanyEmployeeRepository: jest
      .fn()
      .mockImplementation(() => mockCompanyEmployeeRepository),
  })
);

describe("AppointmentService", () => {
  let appointmentService: AppointmentService;

  beforeEach(() => {
    jest.clearAllMocks();
    appointmentService = new AppointmentService(
      mockAppointmentRepository as any,
      mockUserRepository as any,
      mockProfessionalProfileRepository as any,
      mockCompanyEmployeeRepository as any
    );
  });

  describe("createAppointment", () => {
    it("deve criar agendamento com sucesso", async () => {
      // Arrange
      const appointmentData = {
        clientId: "client-123",
        professionalId: "professional-123",
        serviceId: "service-123",
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
        duration: 60,
        notes: "Corte de cabelo",
        status: "SCHEDULED" as const,
      };

      const mockClient = {
        id: "client-123",
        userType: "CLIENT",
        name: "João Cliente",
        email: "joao@example.com",
      };

      const mockProfessional = {
        id: "professional-123",
        userId: "professional-123",
        specialties: ["Cabelo", "Barba"],
        isActive: true,
      };

      const mockAppointment = {
        id: "appointment-123",
        ...appointmentData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findById.mockResolvedValue(mockClient);
      mockProfessionalProfileRepository.findByUserId.mockResolvedValue(
        mockProfessional
      );
      mockAppointmentRepository.findByDateRange.mockResolvedValue([]); // Sem conflitos
      mockAppointmentRepository.create.mockResolvedValue(mockAppointment);

      // Act
      const result = await appointmentService.createAppointment(
        appointmentData
      );

      // Assert
      expect(result).toEqual(mockAppointment);
      expect(mockUserRepository.findById).toHaveBeenCalledWith("client-123");
      expect(
        mockProfessionalProfileRepository.findByUserId
      ).toHaveBeenCalledWith("professional-123");
      expect(mockAppointmentRepository.create).toHaveBeenCalledWith(
        appointmentData
      );
    });

    it("deve lançar erro se cliente não encontrado", async () => {
      // Arrange
      const appointmentData = {
        clientId: "non-existent",
        professionalId: "professional-123",
        serviceId: "service-123",
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
        duration: 60,
        notes: "Corte de cabelo",
        status: "SCHEDULED" as const,
      };

      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        appointmentService.createAppointment(appointmentData)
      ).rejects.toThrow(NotFoundError);
    });

    it("deve lançar erro se profissional não encontrado", async () => {
      // Arrange
      const appointmentData = {
        clientId: "client-123",
        professionalId: "non-existent",
        serviceId: "service-123",
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
        duration: 60,
        notes: "Corte de cabelo",
        status: "SCHEDULED" as const,
      };

      const mockClient = {
        id: "client-123",
        userType: "CLIENT",
        name: "João Cliente",
        email: "joao@example.com",
      };

      mockUserRepository.findById.mockResolvedValue(mockClient);
      mockProfessionalProfileRepository.findByUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(
        appointmentService.createAppointment(appointmentData)
      ).rejects.toThrow(NotFoundError);
    });

    it("deve lançar erro se data for no passado", async () => {
      // Arrange
      const appointmentData = {
        clientId: "client-123",
        professionalId: "professional-123",
        serviceId: "service-123",
        scheduledDate: new Date("2020-01-15T10:00:00Z"), // Data no passado
        duration: 60,
        notes: "Corte de cabelo",
        status: "SCHEDULED" as const,
      };

      // Act & Assert
      await expect(
        appointmentService.createAppointment(appointmentData)
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("getAppointmentById", () => {
    it("deve retornar agendamento quando encontrado", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      const mockAppointment = {
        id: appointmentId,
        clientId: "client-123",
        professionalId: "professional-123",
        serviceId: "service-123",
        scheduledDate: new Date("2024-01-15T10:00:00Z"),
        duration: 60,
        notes: "Corte de cabelo",
        status: "SCHEDULED",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAppointmentRepository.findById.mockResolvedValue(mockAppointment);

      // Act
      const result = await appointmentService.getAppointmentById(appointmentId);

      // Assert
      expect(result).toEqual(mockAppointment);
      expect(mockAppointmentRepository.findById).toHaveBeenCalledWith(
        appointmentId
      );
    });

    it("deve lançar erro quando agendamento não encontrado", async () => {
      // Arrange
      const appointmentId = "non-existent";
      mockAppointmentRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        appointmentService.getAppointmentById(appointmentId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("updateAppointment", () => {
    it("deve atualizar agendamento com sucesso", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      const updateData = {
        scheduledDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // Depois de amanhã
        notes: "Corte de cabelo e barba",
        status: "CONFIRMED" as const,
      };

      const mockAppointment = {
        id: appointmentId,
        clientId: "client-123",
        professionalId: "professional-123",
        serviceId: "service-123",
        scheduledDate: new Date("2024-01-15T10:00:00Z"),
        duration: 60,
        notes: "Corte de cabelo",
        status: "SCHEDULED",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedAppointment = {
        ...mockAppointment,
        ...updateData,
        updatedAt: new Date(),
      };

      mockAppointmentRepository.findById.mockResolvedValue(mockAppointment);
      mockAppointmentRepository.update.mockResolvedValue(updatedAppointment);

      // Act
      const result = await appointmentService.updateAppointment(
        appointmentId,
        updateData
      );

      // Assert
      expect(result).toEqual(updatedAppointment);
      expect(mockAppointmentRepository.findById).toHaveBeenCalledWith(
        appointmentId
      );
      expect(mockAppointmentRepository.update).toHaveBeenCalledWith(
        appointmentId,
        updateData
      );
    });

    it("deve lançar erro quando agendamento não encontrado", async () => {
      // Arrange
      const appointmentId = "non-existent";
      const updateData = { status: "CANCELLED" as const };

      mockAppointmentRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        appointmentService.updateAppointment(appointmentId, updateData)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("cancelAppointment", () => {
    it("deve cancelar agendamento com sucesso", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      const reason = "Cliente cancelou";

      const mockAppointment = {
        id: appointmentId,
        clientId: "client-123",
        professionalId: "professional-123",
        serviceId: "service-123",
        scheduledDate: new Date("2024-01-15T10:00:00Z"),
        duration: 60,
        notes: "Corte de cabelo",
        status: "SCHEDULED",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const cancelledAppointment = {
        ...mockAppointment,
        status: "CANCELLED",
        cancellationReason: reason,
        updatedAt: new Date(),
      };

      mockAppointmentRepository.findById.mockResolvedValue(mockAppointment);
      mockAppointmentRepository.update.mockResolvedValue(cancelledAppointment);

      // Act
      const result = await appointmentService.cancelAppointment(
        appointmentId,
        reason
      );

      // Assert
      expect(result).toEqual(cancelledAppointment);
      expect(mockAppointmentRepository.update).toHaveBeenCalledWith(
        appointmentId,
        {
          status: "CANCELLED",
          cancellationReason: reason,
        }
      );
    });

    it("deve lançar erro quando agendamento não encontrado", async () => {
      // Arrange
      const appointmentId = "non-existent";
      const reason = "Cliente cancelou";

      mockAppointmentRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        appointmentService.cancelAppointment(appointmentId, reason)
      ).rejects.toThrow(NotFoundError);
    });

    it("deve lançar erro quando agendamento já está cancelado", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      const reason = "Cliente cancelou";

      const mockAppointment = {
        id: appointmentId,
        status: "CANCELLED",
        cancellationReason: "Já cancelado",
      };

      mockAppointmentRepository.findById.mockResolvedValue(mockAppointment);

      // Act & Assert
      await expect(
        appointmentService.cancelAppointment(appointmentId, reason)
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("getAppointmentsByUser", () => {
    it("deve retornar agendamentos do cliente", async () => {
      // Arrange
      const userId = "client-123";
      const mockAppointments = [
        {
          id: "appointment-1",
          clientId: userId,
          professionalId: "professional-123",
          scheduledDate: new Date("2024-01-15T10:00:00Z"),
          status: "SCHEDULED",
        },
        {
          id: "appointment-2",
          clientId: userId,
          professionalId: "professional-456",
          scheduledDate: new Date("2024-01-20T14:00:00Z"),
          status: "CONFIRMED",
        },
      ];

      mockAppointmentRepository.findByUserId.mockResolvedValue(
        mockAppointments
      );

      // Act
      const result = await appointmentService.getAppointmentsByUser(userId);

      // Assert
      expect(result).toEqual(mockAppointments);
      expect(mockAppointmentRepository.findByUserId).toHaveBeenCalledWith(
        userId
      );
    });
  });

  describe("getAppointmentsByProfessional", () => {
    it("deve retornar agendamentos do profissional", async () => {
      // Arrange
      const professionalId = "professional-123";
      const mockAppointments = [
        {
          id: "appointment-1",
          clientId: "client-123",
          professionalId,
          scheduledDate: new Date("2024-01-15T10:00:00Z"),
          status: "SCHEDULED",
        },
      ];

      mockAppointmentRepository.findByProfessionalId.mockResolvedValue(
        mockAppointments
      );

      // Act
      const result = await appointmentService.getAppointmentsByProfessional(
        professionalId
      );

      // Assert
      expect(result).toEqual(mockAppointments);
      expect(
        mockAppointmentRepository.findByProfessionalId
      ).toHaveBeenCalledWith(professionalId);
    });
  });

  describe("getAppointmentsByDateRange", () => {
    it("deve retornar agendamentos no período especificado", async () => {
      // Arrange
      const startDate = new Date("2024-01-15T00:00:00Z");
      const endDate = new Date("2024-01-15T23:59:59Z");
      const mockAppointments = [
        {
          id: "appointment-1",
          clientId: "client-123",
          professionalId: "professional-123",
          scheduledDate: new Date("2024-01-15T10:00:00Z"),
          status: "SCHEDULED",
        },
      ];

      mockAppointmentRepository.findByDateRange.mockResolvedValue(
        mockAppointments
      );

      // Act
      const result = await appointmentService.getAppointmentsByDateRange(
        startDate,
        endDate
      );

      // Assert
      expect(result).toEqual(mockAppointments);
      expect(mockAppointmentRepository.findByDateRange).toHaveBeenCalledWith(
        startDate,
        endDate
      );
    });
  });
});
