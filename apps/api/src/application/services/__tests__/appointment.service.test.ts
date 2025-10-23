/**
 * Testes unitários para AppointmentService
 * Seguindo TDD e garantindo máxima cobertura
 */

import { AppointmentService } from "../appointment.service";
import { AppointmentRepository } from "../../../infrastructure/repositories/appointment.repository";
import { BadRequestError, NotFoundError } from "../../../utils/app-error";

// Mock do repositório
jest.mock("../../../infrastructure/repositories/appointment.repository");
const MockedAppointmentRepository = AppointmentRepository as jest.MockedClass<
  typeof AppointmentRepository
>;

describe("AppointmentService", () => {
  let appointmentService: AppointmentService;
  let mockRepository: jest.Mocked<AppointmentRepository>;

  beforeEach(() => {
    mockRepository =
      new MockedAppointmentRepository() as jest.Mocked<AppointmentRepository>;
    appointmentService = new AppointmentService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createAppointment", () => {
    const validAppointmentData = {
      clientId: "client-123",
      professionalId: "professional-123",
      serviceId: "service-123",
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
      scheduledTime: "14:00",
      location: "Local do serviço",
      clientNotes: "Observações do cliente",
    };

    it("deve criar um agendamento com sucesso", async () => {
      // Arrange
      mockRepository.hasConflict.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue({
        id: "appointment-123",
        ...validAppointmentData,
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      // Act
      const result = await appointmentService.createAppointment(
        validAppointmentData
      );

      // Assert
      expect(mockRepository.hasConflict).toHaveBeenCalledWith(
        validAppointmentData.professionalId,
        validAppointmentData.scheduledDate,
        validAppointmentData.scheduledTime
      );
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          ...validAppointmentData,
          status: "PENDING",
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );
      expect(result).toBeDefined();
    });

    it("deve lançar erro quando há conflito de horário", async () => {
      // Arrange
      mockRepository.hasConflict.mockResolvedValue(true);

      // Act & Assert
      await expect(
        appointmentService.createAppointment(validAppointmentData)
      ).rejects.toThrow(
        new BadRequestError("Já existe um agendamento neste horário")
      );
    });

    it("deve lançar erro quando data é no passado", async () => {
      // Arrange
      const pastDate = new Date("2020-01-01");
      const appointmentData = {
        ...validAppointmentData,
        scheduledDate: pastDate,
      };
      mockRepository.hasConflict.mockResolvedValue(false);

      // Act & Assert
      await expect(
        appointmentService.createAppointment(appointmentData)
      ).rejects.toThrow(
        new BadRequestError("Não é possível agendar no passado")
      );
    });
  });

  describe("getAppointmentById", () => {
    it("deve retornar agendamento quando encontrado", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      const mockAppointment = { id: appointmentId, status: "PENDING" };
      mockRepository.findById.mockResolvedValue(mockAppointment as any);

      // Act
      const result = await appointmentService.getAppointmentById(appointmentId);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(appointmentId);
      expect(result).toEqual(mockAppointment);
    });

    it("deve lançar erro quando agendamento não encontrado", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        appointmentService.getAppointmentById(appointmentId)
      ).rejects.toThrow(new NotFoundError("Agendamento não encontrado"));
    });
  });

  describe("listAppointments", () => {
    it("deve listar agendamentos com filtros", async () => {
      // Arrange
      const filters = { skip: 0, take: 10, status: "PENDING" };
      const mockResult = {
        data: [{ id: "appointment-1" }, { id: "appointment-2" }],
        total: 2,
        page: 1,
        limit: 10,
        hasNext: false,
        hasPrev: false,
      };
      mockRepository.findMany.mockResolvedValue(mockResult);

      // Act
      const result = await appointmentService.listAppointments(filters);

      // Assert
      expect(mockRepository.findMany).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResult);
    });
  });

  describe("updateAppointment", () => {
    it("deve atualizar agendamento com sucesso", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      const updateData = {
        scheduledDate: new Date("2024-12-31"),
        scheduledTime: "15:00",
      };
      const existingAppointment = {
        id: appointmentId,
        professionalId: "professional-123",
        status: "PENDING",
      };
      const updatedAppointment = { ...existingAppointment, ...updateData };

      mockRepository.findById.mockResolvedValue(existingAppointment as any);
      mockRepository.hasConflict.mockResolvedValue(false);
      mockRepository.update.mockResolvedValue(updatedAppointment as any);

      // Act
      const result = await appointmentService.updateAppointment(
        appointmentId,
        updateData
      );

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(appointmentId);
      expect(mockRepository.hasConflict).toHaveBeenCalledWith(
        existingAppointment.professionalId,
        updateData.scheduledDate,
        updateData.scheduledTime
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        appointmentId,
        expect.objectContaining({
          ...updateData,
          updatedAt: expect.any(Date),
        })
      );
      expect(result).toEqual(updatedAppointment);
    });

    it("deve lançar erro quando agendamento não encontrado", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      const updateData = { scheduledDate: new Date("2024-12-31") };
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        appointmentService.updateAppointment(appointmentId, updateData)
      ).rejects.toThrow(new NotFoundError("Agendamento não encontrado"));
    });

    it("deve lançar erro quando há conflito de horário na atualização", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      const updateData = {
        scheduledDate: new Date("2024-12-31"),
        scheduledTime: "15:00",
      };
      const existingAppointment = {
        id: appointmentId,
        professionalId: "professional-123",
        status: "PENDING",
      };

      mockRepository.findById.mockResolvedValue(existingAppointment as any);
      mockRepository.hasConflict.mockResolvedValue(true);

      // Act & Assert
      await expect(
        appointmentService.updateAppointment(appointmentId, updateData)
      ).rejects.toThrow(
        new BadRequestError("Já existe um agendamento neste horário")
      );
    });
  });

  describe("deleteAppointment", () => {
    it("deve deletar agendamento com sucesso", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      const appointment = { id: appointmentId, status: "PENDING" };
      mockRepository.findById.mockResolvedValue(appointment as any);
      mockRepository.delete.mockResolvedValue();

      // Act
      await appointmentService.deleteAppointment(appointmentId);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(appointmentId);
      expect(mockRepository.delete).toHaveBeenCalledWith(appointmentId);
    });

    it("deve lançar erro quando agendamento não encontrado", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        appointmentService.deleteAppointment(appointmentId)
      ).rejects.toThrow(new NotFoundError("Agendamento não encontrado"));
    });

    it("deve lançar erro quando agendamento não pode ser cancelado", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      const appointment = { id: appointmentId, status: "COMPLETED" };
      mockRepository.findById.mockResolvedValue(appointment as any);

      // Act & Assert
      await expect(
        appointmentService.deleteAppointment(appointmentId)
      ).rejects.toThrow(
        new BadRequestError("Não é possível cancelar este agendamento")
      );
    });
  });

  describe("updateAppointmentStatus", () => {
    it("deve atualizar status com sucesso", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      const newStatus = "ACCEPTED";
      const notes = "Agendamento aceito";
      const appointment = { id: appointmentId, status: "PENDING" };
      const updatedAppointment = { ...appointment, status: newStatus };

      mockRepository.findById.mockResolvedValue(appointment as any);
      mockRepository.updateStatus.mockResolvedValue(updatedAppointment as any);

      // Act
      const result = await appointmentService.updateAppointmentStatus(
        appointmentId,
        newStatus,
        notes
      );

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(appointmentId);
      expect(mockRepository.updateStatus).toHaveBeenCalledWith(
        appointmentId,
        newStatus,
        notes
      );
      expect(result).toEqual(updatedAppointment);
    });

    it("deve lançar erro quando transição de status é inválida", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      const newStatus = "COMPLETED";
      const appointment = { id: appointmentId, status: "PENDING" };

      mockRepository.findById.mockResolvedValue(appointment as any);

      // Act & Assert
      await expect(
        appointmentService.updateAppointmentStatus(appointmentId, newStatus)
      ).rejects.toThrow(
        new BadRequestError(
          "Não é possível alterar status de PENDING para COMPLETED"
        )
      );
    });
  });

  describe("checkAvailability", () => {
    it("deve retornar true quando horário está disponível", async () => {
      // Arrange
      const professionalId = "professional-123";
      const scheduledDate = new Date("2024-12-31");
      const scheduledTime = "14:00";
      mockRepository.hasConflict.mockResolvedValue(false);

      // Act
      const result = await appointmentService.checkAvailability(
        professionalId,
        scheduledDate,
        scheduledTime
      );

      // Assert
      expect(mockRepository.hasConflict).toHaveBeenCalledWith(
        professionalId,
        scheduledDate,
        scheduledTime
      );
      expect(result).toBe(true);
    });

    it("deve retornar false quando horário não está disponível", async () => {
      // Arrange
      const professionalId = "professional-123";
      const scheduledDate = new Date("2024-12-31");
      const scheduledTime = "14:00";
      mockRepository.hasConflict.mockResolvedValue(true);

      // Act
      const result = await appointmentService.checkAvailability(
        professionalId,
        scheduledDate,
        scheduledTime
      );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("getAvailableTimeSlots", () => {
    it("deve retornar horários disponíveis", async () => {
      // Arrange
      const professionalId = "professional-123";
      const date = new Date("2024-12-31");
      mockRepository.hasConflict.mockResolvedValue(false);

      // Act
      const result = await appointmentService.getAvailableTimeSlots(
        professionalId,
        date
      );

      // Assert
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toMatch(/^\d{2}:\d{2}$/); // Formato HH:MM
    });
  });

  describe("getAppointmentStats", () => {
    it("deve retornar estatísticas", async () => {
      // Arrange
      const filters = { professionalId: "professional-123" };
      const mockStats = {
        total: 10,
        pending: 3,
        accepted: 5,
        completed: 2,
        cancelled: 0,
        completionRate: 20,
        cancellationRate: 0,
      };
      mockRepository.getStats.mockResolvedValue(mockStats);

      // Act
      const result = await appointmentService.getAppointmentStats(filters);

      // Assert
      expect(mockRepository.getStats).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockStats);
    });
  });
});
