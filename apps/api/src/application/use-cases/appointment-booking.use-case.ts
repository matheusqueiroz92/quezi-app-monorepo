/**
 * Caso de Uso: Agendamento de Serviços
 *
 * Seguindo os princípios SOLID:
 * - S: Single Responsibility Principle
 * - D: Dependency Inversion Principle
 *
 * Orquestra o processo completo de agendamento
 */

import { IUserService } from "../../domain/interfaces/repository.interface";
import { IUser } from "../../domain/interfaces/user.interface";
import { BadRequestError, NotFoundError } from "../../utils/app-error";

export interface AppointmentBookingData {
  clientId: string;
  serviceProviderId: string; // ID do profissional ou empresa
  serviceId: string;
  scheduledDate: Date;
  scheduledTime: string;
  location: string;
  clientNotes?: string;
}

export interface AppointmentBookingResult {
  appointmentId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  message: string;
}

export class AppointmentBookingUseCase {
  constructor(
    private userService: IUserService // Aqui seriam injetados os serviços de agendamento
  ) // private appointmentService: IAppointmentService,
  // private notificationService: INotificationService
  {}

  async execute(
    data: AppointmentBookingData
  ): Promise<AppointmentBookingResult> {
    // 1. Validar dados de entrada
    await this.validateBookingData(data);

    // 2. Verificar se cliente existe e é válido
    const client = await this.userService.getUserById(data.clientId);
    if (!client.isClient()) {
      throw new BadRequestError("Apenas clientes podem fazer agendamentos");
    }

    // 3. Verificar se provedor de serviço existe
    const serviceProvider = await this.userService.getUserById(
      data.serviceProviderId
    );
    if (!serviceProvider.canReceiveAppointments()) {
      throw new BadRequestError("Este usuário não pode receber agendamentos");
    }

    // 4. Validar disponibilidade
    await this.validateAvailability(data);

    // 5. Criar agendamento
    const appointment = await this.createAppointment(data);

    // 6. Enviar notificações
    await this.sendNotifications(appointment, client, serviceProvider);

    return {
      appointmentId: appointment.id,
      status: "PENDING",
      message: "Agendamento criado com sucesso. Aguardando confirmação.",
    };
  }

  private async validateBookingData(
    data: AppointmentBookingData
  ): Promise<void> {
    const errors: string[] = [];

    if (!data.clientId) {
      errors.push("ID do cliente é obrigatório");
    }
    if (!data.serviceProviderId) {
      errors.push("ID do provedor de serviço é obrigatório");
    }
    if (!data.serviceId) {
      errors.push("ID do serviço é obrigatório");
    }
    if (!data.scheduledDate) {
      errors.push("Data do agendamento é obrigatória");
    }
    if (!data.scheduledTime) {
      errors.push("Horário do agendamento é obrigatório");
    }
    if (!data.location) {
      errors.push("Local do agendamento é obrigatório");
    }

    // Validar data não pode ser no passado
    if (data.scheduledDate && data.scheduledDate < new Date()) {
      errors.push("Data do agendamento não pode ser no passado");
    }

    // Validar horário
    if (data.scheduledTime && !this.isValidTimeFormat(data.scheduledTime)) {
      errors.push("Formato de horário inválido (use HH:MM)");
    }

    if (errors.length > 0) {
      throw new BadRequestError(
        `Dados de agendamento inválidos: ${errors.join(", ")}`
      );
    }
  }

  private async validateAvailability(
    data: AppointmentBookingData
  ): Promise<void> {
    // Aqui seria implementada a lógica de validação de disponibilidade
    // Verificar se o profissional/empresa está disponível no horário
    // Verificar se não há conflitos com outros agendamentos
    // Verificar se está dentro do horário de funcionamento

    // Por enquanto, apenas simular validação
    const isAvailable = await this.checkProviderAvailability(
      data.serviceProviderId,
      data.scheduledDate,
      data.scheduledTime
    );

    if (!isAvailable) {
      throw new BadRequestError(
        "Provedor de serviço não está disponível neste horário"
      );
    }
  }

  private async checkProviderAvailability(
    providerId: string,
    date: Date,
    time: string
  ): Promise<boolean> {
    // Implementar lógica de verificação de disponibilidade
    // Por enquanto, retornar true para simular disponibilidade
    return true;
  }

  private async createAppointment(data: AppointmentBookingData): Promise<any> {
    // Aqui seria implementada a criação do agendamento
    // Por enquanto, retornar um objeto simulado
    return {
      id: "appointment-" + Date.now(),
      clientId: data.clientId,
      serviceProviderId: data.serviceProviderId,
      serviceId: data.serviceId,
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      location: data.location,
      clientNotes: data.clientNotes,
      status: "PENDING",
      createdAt: new Date(),
    };
  }

  private async sendNotifications(
    appointment: any,
    client: IUser,
    serviceProvider: IUser
  ): Promise<void> {
    // Implementar envio de notificações
    // Notificar o cliente sobre a criação do agendamento
    // Notificar o provedor de serviço sobre o novo agendamento

    console.log(`Notificação enviada para cliente ${client.email}`);
    console.log(`Notificação enviada para provedor ${serviceProvider.email}`);
  }

  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }
}
