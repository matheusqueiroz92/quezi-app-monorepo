import { AppError } from "../../lib/errors";
import { AppointmentsRepository } from "./appointments.repository";
import {
  CreateAppointmentInput,
  UpdateAppointmentInput,
  GetAppointmentsQuery,
  AppointmentParams,
  UpdateAppointmentStatusInput,
  CheckAvailabilityQuery,
  GetAppointmentStatsQuery,
  AppointmentStatus,
} from "./appointments.schema";

export class AppointmentsService {
  constructor(private appointmentsRepository: AppointmentsRepository) {}

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  async createAppointment(data: CreateAppointmentInput, userId: string) {
    try {
      // Validações de negócio
      await this.validateAppointmentCreation(data, userId);

      // Verificar se o horário não está no passado
      const scheduledDate = new Date(data.scheduledDate);
      const now = new Date();

      if (scheduledDate <= now) {
        throw new AppError(
          "Não é possível agendar para horários no passado",
          400
        );
      }

      // Verificar se o agendamento não é muito distante no futuro (máximo 3 meses)
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 3);

      if (scheduledDate > maxDate) {
        throw new AppError(
          "Não é possível agendar com mais de 3 meses de antecedência",
          400
        );
      }

      // Verificar se é um horário comercial (8h às 18h)
      const hour = scheduledDate.getHours();
      if (hour < 8 || hour > 18) {
        throw new AppError("Agendamentos devem ser feitos entre 8h e 18h", 400);
      }

      // Verificar se não é fim de semana
      const dayOfWeek = scheduledDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        throw new AppError(
          "Agendamentos não podem ser feitos nos fins de semana",
          400
        );
      }

      const appointment = await this.appointmentsRepository.create(data);

      return appointment;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao criar agendamento", 500);
    }
  }

  async getAppointment(params: AppointmentParams, userId: string) {
    try {
      const appointment = await this.appointmentsRepository.findById(params.id);

      // Verificar se o usuário tem permissão para ver este agendamento
      this.validateAppointmentAccess(appointment, userId);

      return appointment;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar agendamento", 500);
    }
  }

  async getAppointments(query: GetAppointmentsQuery, userId: string) {
    try {
      // Se não especificou clientId ou professionalId, filtrar pelos agendamentos do usuário
      if (!query.clientId && !query.professionalId) {
        // Aqui você pode implementar lógica para determinar se o usuário é cliente ou profissional
        // Por enquanto, vou assumir que o usuário pode ver seus próprios agendamentos
        query.clientId = userId;
      }

      const result = await this.appointmentsRepository.findMany(query);

      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar agendamentos", 500);
    }
  }

  async updateAppointment(
    params: AppointmentParams,
    data: UpdateAppointmentInput,
    userId: string
  ) {
    try {
      const appointment = await this.appointmentsRepository.findById(params.id);

      // Verificar se o usuário tem permissão para editar este agendamento
      this.validateAppointmentAccess(appointment, userId);

      // Validações específicas de edição
      await this.validateAppointmentUpdate(appointment, data, userId);

      const updatedAppointment = await this.appointmentsRepository.update(
        params.id,
        data
      );

      return updatedAppointment;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar agendamento", 500);
    }
  }

  async deleteAppointment(params: AppointmentParams, userId: string) {
    try {
      const appointment = await this.appointmentsRepository.findById(params.id);

      // Verificar se o usuário tem permissão para cancelar este agendamento
      this.validateAppointmentAccess(appointment, userId);

      // Validações específicas de cancelamento
      await this.validateAppointmentDeletion(appointment, userId);

      const result = await this.appointmentsRepository.delete(params.id);

      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao cancelar agendamento", 500);
    }
  }

  // ========================================
  // STATUS OPERATIONS
  // ========================================

  async updateAppointmentStatus(
    params: AppointmentParams,
    data: UpdateAppointmentStatusInput,
    userId: string
  ) {
    try {
      const appointment = await this.appointmentsRepository.findById(params.id);

      // Verificar se o usuário tem permissão para alterar o status
      this.validateStatusUpdatePermission(appointment, userId);

      // Validações específicas de mudança de status
      await this.validateStatusUpdate(appointment, data.status, userId);

      const updatedAppointment = await this.appointmentsRepository.updateStatus(
        params.id,
        data
      );

      return updatedAppointment;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar status do agendamento", 500);
    }
  }

  // ========================================
  // AVAILABILITY OPERATIONS
  // ========================================

  async checkAvailability(query: CheckAvailabilityQuery, userId: string) {
    try {
      // Verificar se o usuário tem permissão para verificar disponibilidade
      await this.validateAvailabilityCheck(query, userId);

      const availability = await this.appointmentsRepository.checkAvailability(
        query
      );

      return availability;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao verificar disponibilidade", 500);
    }
  }

  // ========================================
  // STATISTICS OPERATIONS
  // ========================================

  async getStats(query: GetAppointmentStatsQuery, userId: string) {
    try {
      // Verificar se o usuário tem permissão para ver estatísticas
      await this.validateStatsAccess(query, userId);

      const stats = await this.appointmentsRepository.getStats(query);

      return stats;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar estatísticas", 500);
    }
  }

  // ========================================
  // VALIDATION METHODS
  // ========================================

  private async validateAppointmentCreation(
    data: CreateAppointmentInput,
    userId: string
  ) {
    // Verificar se o cliente é o usuário logado
    if (data.clientId !== userId) {
      throw new AppError("Você só pode criar agendamentos para si mesmo", 403);
    }

    // Verificar se o profissional existe e está ativo
    // Aqui você pode implementar validações adicionais como:
    // - Profissional está ativo
    // - Profissional aceita novos agendamentos
    // - Serviço está disponível
  }

  private validateAppointmentAccess(appointment: any, userId: string) {
    // Verificar se o usuário é o cliente ou o profissional do agendamento
    if (
      appointment.clientId !== userId &&
      appointment.professionalId !== userId
    ) {
      throw new AppError(
        "Você não tem permissão para acessar este agendamento",
        403
      );
    }
  }

  private async validateAppointmentUpdate(
    appointment: any,
    data: UpdateAppointmentInput,
    userId: string
  ) {
    // Verificar se o agendamento pode ser editado
    if (appointment.status === "COMPLETED") {
      throw new AppError("Agendamentos concluídos não podem ser editados", 400);
    }

    if (appointment.status === "REJECTED") {
      throw new AppError("Agendamentos rejeitados não podem ser editados", 400);
    }

    // Verificar se não está tentando editar muito próximo do horário
    const scheduledDate = new Date(appointment.scheduledDate);
    const now = new Date();
    const timeDiff = scheduledDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      throw new AppError(
        "Agendamentos só podem ser editados com pelo menos 24h de antecedência",
        400
      );
    }
  }

  private async validateAppointmentDeletion(appointment: any, userId: string) {
    // Verificar se o agendamento pode ser cancelado
    if (appointment.status === "COMPLETED") {
      throw new AppError(
        "Agendamentos concluídos não podem ser cancelados",
        400
      );
    }

    // Verificar se não está tentando cancelar muito próximo do horário
    const scheduledDate = new Date(appointment.scheduledDate);
    const now = new Date();
    const timeDiff = scheduledDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 2) {
      throw new AppError(
        "Agendamentos só podem ser cancelados com pelo menos 2h de antecedência",
        400
      );
    }
  }

  private validateStatusUpdatePermission(appointment: any, userId: string) {
    // Apenas o profissional pode alterar o status
    if (appointment.professionalId !== userId) {
      throw new AppError(
        "Apenas o profissional pode alterar o status do agendamento",
        403
      );
    }
  }

  private async validateStatusUpdate(
    appointment: any,
    newStatus: AppointmentStatus,
    userId: string
  ) {
    // Verificar se a transição de status é válida
    const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      PENDING: ["ACCEPTED", "REJECTED"],
      ACCEPTED: ["COMPLETED", "REJECTED"],
      REJECTED: [], // Rejeitado é estado final
      COMPLETED: [], // Concluído é estado final
    };

    if (!validTransitions[appointment.status].includes(newStatus)) {
      throw new AppError(
        `Não é possível alterar status de ${appointment.status} para ${newStatus}`,
        400
      );
    }

    // Validações específicas por status
    if (newStatus === "COMPLETED") {
      // Verificar se o agendamento já passou
      const scheduledDate = new Date(appointment.scheduledDate);
      const now = new Date();

      if (scheduledDate > now) {
        throw new AppError(
          "Não é possível marcar como concluído um agendamento futuro",
          400
        );
      }
    }
  }

  private async validateAvailabilityCheck(
    query: CheckAvailabilityQuery,
    userId: string
  ) {
    // Verificar se o usuário tem permissão para verificar disponibilidade
    // Por enquanto, qualquer usuário pode verificar disponibilidade
    // Você pode implementar validações mais específicas aqui
  }

  private async validateStatsAccess(
    query: GetAppointmentStatsQuery,
    userId: string
  ) {
    // Verificar se o usuário tem permissão para ver estatísticas
    if (query.professionalId && query.professionalId !== userId) {
      throw new AppError("Você só pode ver suas próprias estatísticas", 403);
    }

    if (query.clientId && query.clientId !== userId) {
      throw new AppError("Você só pode ver suas próprias estatísticas", 403);
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  async getUserAppointments(
    userId: string,
    userType: "CLIENT" | "PROFESSIONAL"
  ) {
    try {
      const appointments = await this.appointmentsRepository.findByUser(
        userId,
        userType
      );
      return appointments;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar agendamentos do usuário", 500);
    }
  }

  async getUpcomingAppointments(
    userId: string,
    userType: "CLIENT" | "PROFESSIONAL"
  ) {
    try {
      const appointments = await this.appointmentsRepository.findByUser(
        userId,
        userType
      );

      // Filtrar apenas agendamentos futuros
      const now = new Date();
      const upcoming = appointments.filter(
        (appointment) =>
          new Date(appointment.scheduledDate) > now &&
          ["PENDING", "ACCEPTED"].includes(appointment.status)
      );

      return upcoming;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar próximos agendamentos", 500);
    }
  }

  async getAppointmentHistory(
    userId: string,
    userType: "CLIENT" | "PROFESSIONAL"
  ) {
    try {
      const appointments = await this.appointmentsRepository.findByUser(
        userId,
        userType
      );

      // Filtrar apenas agendamentos passados ou concluídos
      const now = new Date();
      const history = appointments.filter(
        (appointment) =>
          new Date(appointment.scheduledDate) <= now ||
          appointment.status === "COMPLETED"
      );

      return history;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar histórico de agendamentos", 500);
    }
  }
}
