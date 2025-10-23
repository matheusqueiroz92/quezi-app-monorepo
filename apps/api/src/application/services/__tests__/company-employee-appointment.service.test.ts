/**
 * Testes unitários para CompanyEmployeeAppointmentService
 * Seguindo TDD e garantindo máxima cobertura
 */

import { CompanyEmployeeAppointmentService } from "../company-employee-appointment.service";
import { CompanyEmployeeAppointmentRepository } from "../../../infrastructure/repositories/company-employee-appointment.repository";
import { BadRequestError, NotFoundError } from "../../../utils/app-error";

// Mock do repositório
jest.mock(
  "../../../infrastructure/repositories/company-employee-appointment.repository"
);
const MockedCompanyEmployeeAppointmentRepository =
  CompanyEmployeeAppointmentRepository as jest.MockedClass<
    typeof CompanyEmployeeAppointmentRepository
  >;

describe("CompanyEmployeeAppointmentService", () => {
  let companyEmployeeAppointmentService: CompanyEmployeeAppointmentService;
  let mockRepository: jest.Mocked<CompanyEmployeeAppointmentRepository>;

  beforeEach(() => {
    mockRepository =
      new MockedCompanyEmployeeAppointmentRepository() as jest.Mocked<CompanyEmployeeAppointmentRepository>;
    companyEmployeeAppointmentService = new CompanyEmployeeAppointmentService(
      mockRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createAppointment", () => {
    const validAppointmentData = {
      clientId: "client-123",
      companyId: "company-123",
      employeeId: "employee-123",
      serviceId: "service-123",
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
      scheduledTime: "14:00",
      location: "Local do serviço",
      clientNotes: "Observações do cliente",
    };

    it("deve criar um agendamento com funcionário com sucesso", async () => {
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
      const result = await companyEmployeeAppointmentService.createAppointment(
        validAppointmentData
      );

      // Assert
      expect(mockRepository.hasConflict).toHaveBeenCalledWith(
        validAppointmentData.employeeId,
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

    it("deve lançar erro quando funcionário tem conflito de horário", async () => {
      // Arrange
      mockRepository.hasConflict.mockResolvedValue(true);

      // Act & Assert
      await expect(
        companyEmployeeAppointmentService.createAppointment(
          validAppointmentData
        )
      ).rejects.toThrow(
        new BadRequestError("O funcionário já tem um agendamento neste horário")
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
        companyEmployeeAppointmentService.createAppointment(appointmentData)
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
      const result = await companyEmployeeAppointmentService.getAppointmentById(
        appointmentId
      );

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
        companyEmployeeAppointmentService.getAppointmentById(appointmentId)
      ).rejects.toThrow(new NotFoundError("Agendamento não encontrado"));
    });
  });

  describe("listAppointments", () => {
    it("deve listar agendamentos com filtros", async () => {
      // Arrange
      const filters = { skip: 0, take: 10, companyId: "company-123" };
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
      const result = await companyEmployeeAppointmentService.listAppointments(
        filters
      );

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
        employeeId: "employee-123",
        status: "PENDING",
      };
      const updatedAppointment = { ...existingAppointment, ...updateData };

      mockRepository.findById.mockResolvedValue(existingAppointment as any);
      mockRepository.hasConflict.mockResolvedValue(false);
      mockRepository.update.mockResolvedValue(updatedAppointment as any);

      // Act
      const result = await companyEmployeeAppointmentService.updateAppointment(
        appointmentId,
        updateData
      );

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(appointmentId);
      expect(mockRepository.hasConflict).toHaveBeenCalledWith(
        existingAppointment.employeeId,
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
        companyEmployeeAppointmentService.updateAppointment(
          appointmentId,
          updateData
        )
      ).rejects.toThrow(new NotFoundError("Agendamento não encontrado"));
    });

    it("deve lançar erro quando funcionário tem conflito de horário na atualização", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      const updateData = {
        scheduledDate: new Date("2024-12-31"),
        scheduledTime: "15:00",
      };
      const existingAppointment = {
        id: appointmentId,
        employeeId: "employee-123",
        status: "PENDING",
      };

      mockRepository.findById.mockResolvedValue(existingAppointment as any);
      mockRepository.hasConflict.mockResolvedValue(true);

      // Act & Assert
      await expect(
        companyEmployeeAppointmentService.updateAppointment(
          appointmentId,
          updateData
        )
      ).rejects.toThrow(
        new BadRequestError("O funcionário já tem um agendamento neste horário")
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
      await companyEmployeeAppointmentService.deleteAppointment(appointmentId);

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
        companyEmployeeAppointmentService.deleteAppointment(appointmentId)
      ).rejects.toThrow(new NotFoundError("Agendamento não encontrado"));
    });

    it("deve lançar erro quando agendamento não pode ser cancelado", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      const appointment = { id: appointmentId, status: "COMPLETED" };
      mockRepository.findById.mockResolvedValue(appointment as any);

      // Act & Assert
      await expect(
        companyEmployeeAppointmentService.deleteAppointment(appointmentId)
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
      const result =
        await companyEmployeeAppointmentService.updateAppointmentStatus(
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
        companyEmployeeAppointmentService.updateAppointmentStatus(
          appointmentId,
          newStatus
        )
      ).rejects.toThrow(
        new BadRequestError(
          "Não é possível alterar status de PENDING para COMPLETED"
        )
      );
    });
  });

  describe("getClientAppointments", () => {
    it("deve retornar agendamentos do cliente", async () => {
      // Arrange
      const clientId = "client-123";
      const filters = { skip: 0, take: 10 };
      const mockResult = {
        data: [{ id: "appointment-1" }],
        total: 1,
        page: 1,
        limit: 10,
        hasNext: false,
        hasPrev: false,
      };
      mockRepository.findByClient.mockResolvedValue(mockResult);

      // Act
      const result =
        await companyEmployeeAppointmentService.getClientAppointments(
          clientId,
          filters
        );

      // Assert
      expect(mockRepository.findByClient).toHaveBeenCalledWith(
        clientId,
        filters
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("getCompanyAppointments", () => {
    it("deve retornar agendamentos da empresa", async () => {
      // Arrange
      const companyId = "company-123";
      const filters = { skip: 0, take: 10 };
      const mockResult = {
        data: [{ id: "appointment-1" }],
        total: 1,
        page: 1,
        limit: 10,
        hasNext: false,
        hasPrev: false,
      };
      mockRepository.findByCompany.mockResolvedValue(mockResult);

      // Act
      const result =
        await companyEmployeeAppointmentService.getCompanyAppointments(
          companyId,
          filters
        );

      // Assert
      expect(mockRepository.findByCompany).toHaveBeenCalledWith(
        companyId,
        filters
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("getEmployeeAppointments", () => {
    it("deve retornar agendamentos do funcionário", async () => {
      // Arrange
      const employeeId = "employee-123";
      const filters = { skip: 0, take: 10 };
      const mockResult = {
        data: [{ id: "appointment-1" }],
        total: 1,
        page: 1,
        limit: 10,
        hasNext: false,
        hasPrev: false,
      };
      mockRepository.findByEmployee.mockResolvedValue(mockResult);

      // Act
      const result =
        await companyEmployeeAppointmentService.getEmployeeAppointments(
          employeeId,
          filters
        );

      // Assert
      expect(mockRepository.findByEmployee).toHaveBeenCalledWith(
        employeeId,
        filters
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("checkEmployeeAvailability", () => {
    it("deve retornar true quando funcionário está disponível", async () => {
      // Arrange
      const employeeId = "employee-123";
      const scheduledDate = new Date("2024-12-31");
      const scheduledTime = "14:00";
      mockRepository.hasConflict.mockResolvedValue(false);

      // Act
      const result =
        await companyEmployeeAppointmentService.checkEmployeeAvailability(
          employeeId,
          scheduledDate,
          scheduledTime
        );

      // Assert
      expect(mockRepository.hasConflict).toHaveBeenCalledWith(
        employeeId,
        scheduledDate,
        scheduledTime
      );
      expect(result).toBe(true);
    });

    it("deve retornar false quando funcionário não está disponível", async () => {
      // Arrange
      const employeeId = "employee-123";
      const scheduledDate = new Date("2024-12-31");
      const scheduledTime = "14:00";
      mockRepository.hasConflict.mockResolvedValue(true);

      // Act
      const result =
        await companyEmployeeAppointmentService.checkEmployeeAvailability(
          employeeId,
          scheduledDate,
          scheduledTime
        );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("getEmployeeAvailableTimeSlots", () => {
    it("deve retornar horários disponíveis do funcionário", async () => {
      // Arrange
      const employeeId = "employee-123";
      const date = new Date("2024-12-31");
      mockRepository.hasConflict.mockResolvedValue(false);

      // Act
      const result =
        await companyEmployeeAppointmentService.getEmployeeAvailableTimeSlots(
          employeeId,
          date
        );

      // Assert
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toMatch(/^\d{2}:\d{2}$/); // Formato HH:MM
    });
  });

  describe("getAppointmentStats", () => {
    it("deve retornar estatísticas de agendamentos", async () => {
      // Arrange
      const filters = { companyId: "company-123" };
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
      const result =
        await companyEmployeeAppointmentService.getAppointmentStats(filters);

      // Assert
      expect(mockRepository.getStats).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockStats);
    });
  });

  describe("getCompanyEmployeeAppointments", () => {
    it("deve retornar agendamentos de empresa e funcionário", async () => {
      // Arrange
      const companyId = "company-123";
      const employeeId = "employee-123";
      const filters = { skip: 0, take: 10 };
      const mockResult = {
        data: [{ id: "appointment-1" }],
        total: 1,
        page: 1,
        limit: 10,
        hasNext: false,
        hasPrev: false,
      };
      mockRepository.findMany.mockResolvedValue(mockResult);

      // Act
      const result =
        await companyEmployeeAppointmentService.getCompanyEmployeeAppointments(
          companyId,
          employeeId,
          filters
        );

      // Assert
      expect(mockRepository.findMany).toHaveBeenCalledWith({
        ...filters,
        companyId,
        employeeId,
      });
      expect(result).toEqual(mockResult);
    });
  });
});
