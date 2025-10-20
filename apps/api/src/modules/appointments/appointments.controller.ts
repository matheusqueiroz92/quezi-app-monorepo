import { FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "../../lib/errors";
import { AppointmentsService } from "./appointments.service";
import {
  CreateAppointmentInputSchema,
  CreateAppointmentResponseSchema,
  UpdateAppointmentInputSchema,
  UpdateAppointmentResponseSchema,
  GetAppointmentsQuerySchema,
  GetAppointmentsResponseSchema,
  AppointmentParamsSchema,
  UpdateAppointmentStatusInputSchema,
  UpdateAppointmentStatusResponseSchema,
  CheckAvailabilityQuerySchema,
  CheckAvailabilityResponseSchema,
  GetAppointmentStatsQuerySchema,
  GetAppointmentStatsResponseSchema,
} from "./appointments.schema";

export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  async createAppointment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = CreateAppointmentInputSchema.parse(request.body);
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const appointment = await this.appointmentsService.createAppointment(
        data,
        userId
      );

      return reply.status(201).send({
        success: true,
        data: appointment,
        message: "Agendamento criado com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async getAppointment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = AppointmentParamsSchema.parse(request.params);
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const appointment = await this.appointmentsService.getAppointment(
        params,
        userId
      );

      return reply.status(200).send({
        success: true,
        data: appointment,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async getAppointments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = GetAppointmentsQuerySchema.parse(request.query);
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const result = await this.appointmentsService.getAppointments(
        query,
        userId
      );

      return reply.status(200).send({
        success: true,
        data: result.appointments,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async updateAppointment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = AppointmentParamsSchema.parse(request.params);
      const data = UpdateAppointmentInputSchema.parse(request.body);
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const appointment = await this.appointmentsService.updateAppointment(
        params,
        data,
        userId
      );

      return reply.status(200).send({
        success: true,
        data: appointment,
        message: "Agendamento atualizado com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async deleteAppointment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = AppointmentParamsSchema.parse(request.params);
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      await this.appointmentsService.deleteAppointment(params, userId);

      return reply.status(200).send({
        success: true,
        message: "Agendamento cancelado com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  // ========================================
  // STATUS OPERATIONS
  // ========================================

  async updateAppointmentStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = AppointmentParamsSchema.parse(request.params);
      const data = UpdateAppointmentStatusInputSchema.parse(request.body);
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const appointment =
        await this.appointmentsService.updateAppointmentStatus(
          params,
          data,
          userId
        );

      return reply.status(200).send({
        success: true,
        data: appointment,
        message: "Status do agendamento atualizado com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  // ========================================
  // AVAILABILITY OPERATIONS
  // ========================================

  async checkAvailability(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = CheckAvailabilityQuerySchema.parse(request.query);
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const availability = await this.appointmentsService.checkAvailability(
        query,
        userId
      );

      return reply.status(200).send({
        success: true,
        data: availability,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  // ========================================
  // STATISTICS OPERATIONS
  // ========================================

  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = GetAppointmentStatsQuerySchema.parse(request.query);
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const stats = await this.appointmentsService.getStats(query, userId);

      return reply.status(200).send({
        success: true,
        data: stats,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  // ========================================
  // UTILITY OPERATIONS
  // ========================================

  async getMyAppointments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.id;
      const userType = (request as any).user?.userType;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      if (!userType || !["CLIENT", "PROFESSIONAL"].includes(userType)) {
        throw new AppError("Tipo de usuário inválido", 400);
      }

      const appointments = await this.appointmentsService.getUserAppointments(
        userId,
        userType as "CLIENT" | "PROFESSIONAL"
      );

      return reply.status(200).send({
        success: true,
        data: appointments,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async getUpcomingAppointments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.id;
      const userType = (request as any).user?.userType;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      if (!userType || !["CLIENT", "PROFESSIONAL"].includes(userType)) {
        throw new AppError("Tipo de usuário inválido", 400);
      }

      const appointments =
        await this.appointmentsService.getUpcomingAppointments(
          userId,
          userType as "CLIENT" | "PROFESSIONAL"
        );

      return reply.status(200).send({
        success: true,
        data: appointments,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async getAppointmentHistory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.id;
      const userType = (request as any).user?.userType;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      if (!userType || !["CLIENT", "PROFESSIONAL"].includes(userType)) {
        throw new AppError("Tipo de usuário inválido", 400);
      }

      const appointments = await this.appointmentsService.getAppointmentHistory(
        userId,
        userType as "CLIENT" | "PROFESSIONAL"
      );

      return reply.status(200).send({
        success: true,
        data: appointments,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }
}
