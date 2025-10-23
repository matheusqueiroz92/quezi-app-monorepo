/**
 * CompanyEmployeeAppointmentService - Camada de Aplicação
 *
 * Serviço de aplicação para gerenciamento de agendamentos com funcionários de empresa
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { CompanyEmployeeAppointment } from "../../domain/entities/company-employee-appointment.entity";
import { CompanyEmployeeAppointmentRepository } from "../../infrastructure/repositories/company-employee-appointment.repository";
import { BadRequestError, NotFoundError } from "../../utils/app-error";

/**
 * Serviço de aplicação para CompanyEmployeeAppointment
 */
export class CompanyEmployeeAppointmentService {
  constructor(
    private companyEmployeeAppointmentRepository: CompanyEmployeeAppointmentRepository
  ) {}

  /**
   * Cria um novo agendamento com funcionário
   */
  async createAppointment(data: {
    clientId: string;
    companyId: string;
    employeeId: string;
    serviceId: string;
    scheduledDate: Date;
    scheduledTime: string;
    location?: string;
    clientNotes?: string;
  }): Promise<CompanyEmployeeAppointment> {
    // Verificar conflitos de horário para o funcionário
    const hasConflict =
      await this.companyEmployeeAppointmentRepository.hasConflict(
        data.employeeId,
        data.scheduledDate,
        data.scheduledTime
      );

    if (hasConflict) {
      throw new BadRequestError(
        "O funcionário já tem um agendamento neste horário"
      );
    }

    // Validar data (não pode ser no passado)
    const now = new Date();
    const appointmentDateTime = new Date(
      `${data.scheduledDate.toISOString().split("T")[0]}T${data.scheduledTime}`
    );

    if (appointmentDateTime <= now) {
      throw new BadRequestError("Não é possível agendar no passado");
    }

    // Criar agendamento
    const appointmentData = {
      id: crypto.randomUUID(),
      ...data,
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.companyEmployeeAppointmentRepository.create(
      appointmentData
    );
  }

  /**
   * Busca agendamento por ID
   */
  async getAppointmentById(id: string): Promise<CompanyEmployeeAppointment> {
    const appointment =
      await this.companyEmployeeAppointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundError("Agendamento não encontrado");
    }

    return appointment;
  }

  /**
   * Lista agendamentos com filtros
   */
  async listAppointments(filters: {
    skip?: number;
    take?: number;
    clientId?: string;
    companyId?: string;
    employeeId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    return await this.companyEmployeeAppointmentRepository.findMany(filters);
  }

  /**
   * Atualiza agendamento
   */
  async updateAppointment(
    id: string,
    data: {
      scheduledDate?: Date;
      scheduledTime?: string;
      location?: string;
      clientNotes?: string;
      employeeNotes?: string;
    }
  ): Promise<CompanyEmployeeAppointment> {
    // Verificar se agendamento existe
    const existingAppointment =
      await this.companyEmployeeAppointmentRepository.findById(id);
    if (!existingAppointment) {
      throw new NotFoundError("Agendamento não encontrado");
    }

    // Se está alterando data/hora, verificar conflitos
    if (data.scheduledDate && data.scheduledTime) {
      const hasConflict =
        await this.companyEmployeeAppointmentRepository.hasConflict(
          existingAppointment.employeeId,
          data.scheduledDate,
          data.scheduledTime
        );

      if (hasConflict) {
        throw new BadRequestError(
          "O funcionário já tem um agendamento neste horário"
        );
      }
    }

    return await this.companyEmployeeAppointmentRepository.update(id, {
      ...data,
      updatedAt: new Date(),
    });
  }

  /**
   * Remove agendamento
   */
  async deleteAppointment(id: string): Promise<void> {
    const appointment =
      await this.companyEmployeeAppointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError("Agendamento não encontrado");
    }

    // Verificar se pode ser cancelado (apenas PENDING ou ACCEPTED)
    if (!["PENDING", "ACCEPTED"].includes(appointment.status)) {
      throw new BadRequestError("Não é possível cancelar este agendamento");
    }

    await this.companyEmployeeAppointmentRepository.delete(id);
  }

  /**
   * Atualiza status do agendamento
   */
  async updateAppointmentStatus(
    id: string,
    status: "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELLED",
    notes?: string
  ): Promise<CompanyEmployeeAppointment> {
    const appointment =
      await this.companyEmployeeAppointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError("Agendamento não encontrado");
    }

    // Validar transições de status
    const validTransitions: Record<string, string[]> = {
      PENDING: ["ACCEPTED", "CANCELLED"],
      ACCEPTED: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!validTransitions[appointment.status].includes(status)) {
      throw new BadRequestError(
        `Não é possível alterar status de ${appointment.status} para ${status}`
      );
    }

    return await this.companyEmployeeAppointmentRepository.updateStatus(
      id,
      status,
      notes
    );
  }

  /**
   * Busca agendamentos por cliente
   */
  async getClientAppointments(
    clientId: string,
    filters: {
      skip?: number;
      take?: number;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ) {
    return await this.companyEmployeeAppointmentRepository.findByClient(
      clientId,
      filters
    );
  }

  /**
   * Busca agendamentos por empresa
   */
  async getCompanyAppointments(
    companyId: string,
    filters: {
      skip?: number;
      take?: number;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ) {
    return await this.companyEmployeeAppointmentRepository.findByCompany(
      companyId,
      filters
    );
  }

  /**
   * Busca agendamentos por funcionário
   */
  async getEmployeeAppointments(
    employeeId: string,
    filters: {
      skip?: number;
      take?: number;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ) {
    return await this.companyEmployeeAppointmentRepository.findByEmployee(
      employeeId,
      filters
    );
  }

  /**
   * Obtém estatísticas de agendamentos
   */
  async getAppointmentStats(
    filters: {
      companyId?: string;
      employeeId?: string;
      clientId?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ) {
    return await this.companyEmployeeAppointmentRepository.getStats(filters);
  }

  /**
   * Verifica disponibilidade de horário para funcionário
   */
  async checkEmployeeAvailability(
    employeeId: string,
    scheduledDate: Date,
    scheduledTime: string
  ): Promise<boolean> {
    const hasConflict =
      await this.companyEmployeeAppointmentRepository.hasConflict(
        employeeId,
        scheduledDate,
        scheduledTime
      );

    return !hasConflict;
  }

  /**
   * Obtém horários disponíveis para um funcionário em uma data
   */
  async getEmployeeAvailableTimeSlots(
    employeeId: string,
    date: Date,
    workingHours: any = {}
  ): Promise<string[]> {
    const timeSlots = [];
    const startHour = 8; // 08:00
    const endHour = 18; // 18:00

    // Gerar slots de 30 em 30 minutos
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minutes = 0; minutes < 60; minutes += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;

        // Verificar se está dentro do horário de funcionamento
        if (this.isWithinWorkingHours(timeString, workingHours)) {
          const isAvailable = await this.checkEmployeeAvailability(
            employeeId,
            date,
            timeString
          );
          if (isAvailable) {
            timeSlots.push(timeString);
          }
        }
      }
    }

    return timeSlots;
  }

  /**
   * Verifica se horário está dentro do horário de funcionamento
   */
  private isWithinWorkingHours(time: string, workingHours: any): boolean {
    // Implementação simplificada - pode ser expandida
    return true; // Por enquanto, aceita todos os horários
  }

  /**
   * Busca agendamentos por empresa e funcionário
   */
  async getCompanyEmployeeAppointments(
    companyId: string,
    employeeId: string,
    filters: {
      skip?: number;
      take?: number;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ) {
    return await this.companyEmployeeAppointmentRepository.findMany({
      ...filters,
      companyId,
      employeeId,
    });
  }
}
