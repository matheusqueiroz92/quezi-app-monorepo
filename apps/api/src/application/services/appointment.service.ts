/**
 * AppointmentService - Camada de Aplicação
 *
 * Serviço de aplicação para gerenciamento de agendamentos
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { Appointment } from "../../domain/entities/appointment.entity";
import { AppointmentRepository } from "../../infrastructure/repositories/appointment.repository";
import { BadRequestError, NotFoundError } from "../../utils/app-error";

/**
 * Serviço de aplicação para Appointment
 */
export class AppointmentService {
  constructor(private appointmentRepository: AppointmentRepository) {}

  /**
   * Cria um novo agendamento
   */
  async createAppointment(data: {
    clientId: string;
    professionalId: string;
    serviceId: string;
    scheduledDate: Date;
    scheduledTime: string;
    location?: string;
    clientNotes?: string;
  }): Promise<Appointment> {
    // Verificar conflitos de horário
    const hasConflict = await this.appointmentRepository.hasConflict(
      data.professionalId,
      data.scheduledDate,
      data.scheduledTime
    );

    if (hasConflict) {
      throw new BadRequestError("Já existe um agendamento neste horário");
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

    return await this.appointmentRepository.create(appointmentData);
  }

  /**
   * Busca agendamento por ID
   */
  async getAppointmentById(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(id);

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
    professionalId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    return await this.appointmentRepository.findMany(filters);
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
      professionalNotes?: string;
    }
  ): Promise<Appointment> {
    // Verificar se agendamento existe
    const existingAppointment = await this.appointmentRepository.findById(id);
    if (!existingAppointment) {
      throw new NotFoundError("Agendamento não encontrado");
    }

    // Se está alterando data/hora, verificar conflitos
    if (data.scheduledDate && data.scheduledTime) {
      const hasConflict = await this.appointmentRepository.hasConflict(
        existingAppointment.professionalId,
        data.scheduledDate,
        data.scheduledTime
      );

      if (hasConflict) {
        throw new BadRequestError("Já existe um agendamento neste horário");
      }
    }

    return await this.appointmentRepository.update(id, {
      ...data,
      updatedAt: new Date(),
    });
  }

  /**
   * Remove agendamento
   */
  async deleteAppointment(id: string): Promise<void> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError("Agendamento não encontrado");
    }

    // Verificar se pode ser cancelado (apenas PENDING ou ACCEPTED)
    if (!["PENDING", "ACCEPTED"].includes(appointment.status)) {
      throw new BadRequestError("Não é possível cancelar este agendamento");
    }

    await this.appointmentRepository.delete(id);
  }

  /**
   * Atualiza status do agendamento
   */
  async updateAppointmentStatus(
    id: string,
    status: "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELLED",
    notes?: string
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(id);
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

    return await this.appointmentRepository.updateStatus(id, status, notes);
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
    return await this.appointmentRepository.findByClient(clientId, filters);
  }

  /**
   * Busca agendamentos por profissional
   */
  async getProfessionalAppointments(
    professionalId: string,
    filters: {
      skip?: number;
      take?: number;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ) {
    return await this.appointmentRepository.findByProfessional(
      professionalId,
      filters
    );
  }

  /**
   * Obtém estatísticas de agendamentos
   */
  async getAppointmentStats(
    filters: {
      professionalId?: string;
      clientId?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ) {
    return await this.appointmentRepository.getStats(filters);
  }

  /**
   * Verifica disponibilidade de horário
   */
  async checkAvailability(
    professionalId: string,
    scheduledDate: Date,
    scheduledTime: string
  ): Promise<boolean> {
    const hasConflict = await this.appointmentRepository.hasConflict(
      professionalId,
      scheduledDate,
      scheduledTime
    );

    return !hasConflict;
  }

  /**
   * Obtém horários disponíveis para um profissional em uma data
   */
  async getAvailableTimeSlots(
    professionalId: string,
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
          const isAvailable = await this.checkAvailability(
            professionalId,
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
}
