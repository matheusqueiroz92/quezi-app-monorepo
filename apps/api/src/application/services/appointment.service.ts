/**
 * AppointmentService
 *
 * Serviço de aplicação para gerenciamento de agendamentos
 * Camada de Aplicação - Clean Architecture
 *
 * Responsabilidades:
 * - Lógica de negócio para agendamentos
 * - Validações de regras de negócio
 * - Orquestração entre repositórios
 */

import { AppointmentRepository } from "../../infrastructure/repositories/appointment.repository";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { ProfessionalProfileRepository } from "../../infrastructure/repositories/professional-profile.repository";
import { CompanyEmployeeRepository } from "../../infrastructure/repositories/company-employee.repository";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "../../utils/app-error";
import { prisma } from "../../lib/prisma";

export interface CreateAppointmentData {
  clientId: string;
  professionalId?: string;
  companyEmployeeId?: string;
  serviceId: string;
  scheduledDate: Date;
  duration: number;
  notes?: string;
  status?:
    | "SCHEDULED"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
}

export interface UpdateAppointmentData {
  scheduledDate?: Date;
  duration?: number;
  notes?: string;
  status?:
    | "SCHEDULED"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
  cancellationReason?: string;
}

export interface AppointmentFilters {
  status?: string;
  professionalId?: string;
  companyEmployeeId?: string;
  clientId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

/**
 * Serviço de Agendamentos
 *
 * Gerencia a lógica de negócio dos agendamentos entre clientes e profissionais/empresas
 */
export class AppointmentService {
  private appointmentRepository: AppointmentRepository;
  private userRepository: UserRepository;
  private professionalProfileRepository: ProfessionalProfileRepository;
  private companyEmployeeRepository: CompanyEmployeeRepository;

  constructor(
    appointmentRepository: AppointmentRepository = new AppointmentRepository(
      prisma
    ),
    userRepository: UserRepository = new UserRepository(prisma),
    professionalProfileRepository: ProfessionalProfileRepository = new ProfessionalProfileRepository(
      prisma
    ),
    companyEmployeeRepository: CompanyEmployeeRepository = new CompanyEmployeeRepository(
      prisma
    )
  ) {
    this.appointmentRepository = appointmentRepository;
    this.userRepository = userRepository;
    this.professionalProfileRepository = professionalProfileRepository;
    this.companyEmployeeRepository = companyEmployeeRepository;
  }

  /**
   * Cria um novo agendamento
   */
  async createAppointment(data: CreateAppointmentData): Promise<any> {
    // Validar se a data não é no passado
    if (data.scheduledDate < new Date()) {
      throw new BadRequestError(
        "Não é possível agendar para uma data no passado"
      );
    }

    // Validar se o cliente existe
    const client = await this.userRepository.findById(data.clientId);
    if (!client || client.userType !== "CLIENT") {
      throw new NotFoundError("Cliente não encontrado");
    }

    // Validar se o profissional ou funcionário da empresa existe
    if (data.professionalId) {
      const professional =
        await this.professionalProfileRepository.findByUserId(
          data.professionalId
        );
      if (!professional || !professional.isActive) {
        throw new NotFoundError("Profissional não encontrado ou inativo");
      }
    } else if (data.companyEmployeeId) {
      const employee = await this.companyEmployeeRepository.findById(
        data.companyEmployeeId
      );
      if (!employee || !employee.isActive) {
        throw new NotFoundError("Funcionário não encontrado ou inativo");
      }
    } else {
      throw new BadRequestError(
        "É necessário informar um profissional ou funcionário"
      );
    }

    // Verificar conflitos de horário
    const startTime = data.scheduledDate;
    const endTime = new Date(startTime.getTime() + data.duration * 60000);

    const conflictingAppointments =
      await this.appointmentRepository.findByDateRange(startTime, endTime);

    const hasConflict = conflictingAppointments.some((appointment) => {
      const appointmentStart = appointment.scheduledDate;
      const appointmentEnd = new Date(
        appointmentStart.getTime() + appointment.duration * 60000
      );

      return (
        (startTime >= appointmentStart && startTime < appointmentEnd) ||
        (endTime > appointmentStart && endTime <= appointmentEnd) ||
        (startTime <= appointmentStart && endTime >= appointmentEnd)
      );
    });

    if (hasConflict) {
      throw new ConflictError("Já existe um agendamento neste horário");
    }

    // Criar o agendamento
    return await this.appointmentRepository.create({
      ...data,
      status: data.status || "SCHEDULED",
    });
  }

  /**
   * Busca um agendamento por ID
   */
  async getAppointmentById(id: string): Promise<any> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError("Agendamento não encontrado");
    }
    return appointment;
  }

  /**
   * Atualiza um agendamento
   */
  async updateAppointment(
    id: string,
    data: UpdateAppointmentData
  ): Promise<any> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError("Agendamento não encontrado");
    }

    // Validar se a nova data não é no passado (se fornecida)
    if (data.scheduledDate && data.scheduledDate < new Date()) {
      throw new BadRequestError(
        "Não é possível agendar para uma data no passado"
      );
    }

    return await this.appointmentRepository.update(id, data);
  }

  /**
   * Cancela um agendamento
   */
  async cancelAppointment(id: string, reason?: string): Promise<any> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError("Agendamento não encontrado");
    }

    if (appointment.status === "CANCELLED") {
      throw new BadRequestError("Agendamento já está cancelado");
    }

    return await this.appointmentRepository.update(id, {
      status: "CANCELLED",
      cancellationReason: reason,
    });
  }

  /**
   * Busca agendamentos de um usuário (cliente)
   */
  async getAppointmentsByUser(userId: string): Promise<any[]> {
    return await this.appointmentRepository.findByUserId(userId);
  }

  /**
   * Busca agendamentos de um profissional
   */
  async getAppointmentsByProfessional(professionalId: string): Promise<any[]> {
    return await this.appointmentRepository.findByProfessionalId(
      professionalId
    );
  }

  /**
   * Busca agendamentos de um funcionário de empresa
   */
  async getAppointmentsByCompanyEmployee(
    companyEmployeeId: string
  ): Promise<any[]> {
    return await this.appointmentRepository.findByCompanyEmployeeId(
      companyEmployeeId
    );
  }

  /**
   * Busca agendamentos por período
   */
  async getAppointmentsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    return await this.appointmentRepository.findByDateRange(startDate, endDate);
  }

  /**
   * Busca agendamentos por status
   */
  async getAppointmentsByStatus(status: string): Promise<any[]> {
    return await this.appointmentRepository.findByStatus(status);
  }

  /**
   * Lista agendamentos com filtros
   */
  async getAppointments(filters: AppointmentFilters = {}): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, ...otherFilters } = filters;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.appointmentRepository.findMany({
        ...otherFilters,
        skip,
        take: limit,
      }),
      this.appointmentRepository.count(otherFilters),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Deleta um agendamento
   */
  async deleteAppointment(id: string): Promise<void> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError("Agendamento não encontrado");
    }

    await this.appointmentRepository.delete(id);
  }

  /**
   * Confirma um agendamento
   */
  async confirmAppointment(id: string): Promise<any> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError("Agendamento não encontrado");
    }

    if (appointment.status !== "SCHEDULED") {
      throw new BadRequestError(
        "Apenas agendamentos pendentes podem ser confirmados"
      );
    }

    return await this.appointmentRepository.update(id, {
      status: "CONFIRMED",
    });
  }

  /**
   * Marca um agendamento como concluído
   */
  async completeAppointment(id: string): Promise<any> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError("Agendamento não encontrado");
    }

    if (
      appointment.status !== "CONFIRMED" &&
      appointment.status !== "IN_PROGRESS"
    ) {
      throw new BadRequestError(
        "Apenas agendamentos confirmados ou em andamento podem ser concluídos"
      );
    }

    return await this.appointmentRepository.update(id, {
      status: "COMPLETED",
    });
  }

  /**
   * Marca um agendamento como em andamento
   */
  async startAppointment(id: string): Promise<any> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError("Agendamento não encontrado");
    }

    if (appointment.status !== "CONFIRMED") {
      throw new BadRequestError(
        "Apenas agendamentos confirmados podem ser iniciados"
      );
    }

    return await this.appointmentRepository.update(id, {
      status: "IN_PROGRESS",
    });
  }
}
