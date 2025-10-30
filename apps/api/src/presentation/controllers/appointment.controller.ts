/**
 * AppointmentController
 *
 * Controller para gerenciar agendamentos
 * Camada de Apresentação - Clean Architecture
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

import { AppointmentService } from "../../application/services/appointment.service";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { rbacMiddleware } from "../../middlewares/rbac.middleware";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../../utils/app-error";

// Interfaces para tipagem
interface CreateAppointmentRequest {
  clientId: string;
  professionalId?: string;
  companyEmployeeId?: string;
  serviceId: string;
  scheduledDate: string;
  duration: number;
  notes?: string;
}

interface UpdateAppointmentRequest {
  scheduledDate?: string;
  duration?: number;
  notes?: string;
  status?:
    | "SCHEDULED"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
}

interface AppointmentParams {
  id: string;
}

interface UserParams {
  userId: string;
}

interface ProfessionalParams {
  professionalId: string;
}

export async function appointmentRoutes(app: FastifyInstance) {
  const appointmentService = new AppointmentService();

  // Middleware de autenticação para todas as rotas
  app.addHook("preHandler", authMiddleware);

  /**
   * POST /appointments
   * Criar novo agendamento
   */
  app.post<{
    Body: CreateAppointmentRequest;
  }>("/", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const appointmentData = request.body as CreateAppointmentRequest;

      // Validações básicas
      if (!appointmentData.clientId) {
        throw new BadRequestError("ID do cliente é obrigatório");
      }

      if (!appointmentData.scheduledDate) {
        throw new BadRequestError("Data do agendamento é obrigatória");
      }

      if (!appointmentData.duration || appointmentData.duration <= 0) {
        throw new BadRequestError("Duração deve ser maior que zero");
      }

      if (
        !appointmentData.professionalId &&
        !appointmentData.companyEmployeeId
      ) {
        throw new BadRequestError(
          "ID do profissional ou funcionário é obrigatório"
        );
      }

      const appointment = await appointmentService.createAppointment({
        ...appointmentData,
        scheduledDate: new Date(appointmentData.scheduledDate),
      });

      return reply.status(201).send({
        success: true,
        data: appointment,
        message: "Agendamento criado com sucesso",
      });
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        return reply.status(400).send({
          success: false,
          error: error.message,
        });
      }

      if (error instanceof NotFoundError) {
        return reply.status(404).send({
          success: false,
          error: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  });

  /**
   * GET /appointments/:id
   * Buscar agendamento por ID
   */
  app.get<{
    Params: AppointmentParams;
  }>("/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as AppointmentParams;

      if (!id) {
        throw new BadRequestError("ID do agendamento é obrigatório");
      }

      const appointment = await appointmentService.getAppointmentById(id);

      return reply.status(200).send({
        success: true,
        data: appointment,
      });
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        return reply.status(400).send({
          success: false,
          error: error.message,
        });
      }

      if (error instanceof NotFoundError) {
        return reply.status(404).send({
          success: false,
          error: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  });

  /**
   * PUT /appointments/:id
   * Atualizar agendamento
   */
  app.put<{
    Params: AppointmentParams;
    Body: UpdateAppointmentRequest;
  }>("/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as AppointmentParams;
      const updateData = request.body as UpdateAppointmentRequest;

      if (!id) {
        throw new BadRequestError("ID do agendamento é obrigatório");
      }

      // Validações de data
      if (updateData.scheduledDate) {
        const scheduledDate = new Date(updateData.scheduledDate);
        if (isNaN(scheduledDate.getTime())) {
          throw new BadRequestError("Data do agendamento inválida");
        }
      }

      // Validação de duração
      if (updateData.duration && updateData.duration <= 0) {
        throw new BadRequestError("Duração deve ser maior que zero");
      }

      const appointment = await appointmentService.updateAppointment(id, {
        ...updateData,
        scheduledDate: updateData.scheduledDate
          ? new Date(updateData.scheduledDate)
          : undefined,
      });

      return reply.status(200).send({
        success: true,
        data: appointment,
        message: "Agendamento atualizado com sucesso",
      });
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        return reply.status(400).send({
          success: false,
          error: error.message,
        });
      }

      if (error instanceof NotFoundError) {
        return reply.status(404).send({
          success: false,
          error: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  });

  /**
   * DELETE /appointments/:id
   * Cancelar agendamento
   */
  app.delete<{
    Params: AppointmentParams;
  }>("/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as AppointmentParams;

      if (!id) {
        throw new BadRequestError("ID do agendamento é obrigatório");
      }

      await appointmentService.cancelAppointment(id);

      return reply.status(200).send({
        success: true,
        message: "Agendamento cancelado com sucesso",
      });
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        return reply.status(400).send({
          success: false,
          error: error.message,
        });
      }

      if (error instanceof NotFoundError) {
        return reply.status(404).send({
          success: false,
          error: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  });

  /**
   * GET /appointments/user/:userId
   * Buscar agendamentos do usuário
   */
  app.get<{
    Params: UserParams;
  }>("/user/:userId", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { userId } = request.params as UserParams;

      if (!userId) {
        throw new BadRequestError("ID do usuário é obrigatório");
      }

      const appointments = await appointmentService.getAppointmentsByUser(
        userId
      );

      return reply.status(200).send({
        success: true,
        data: appointments,
      });
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        return reply.status(400).send({
          success: false,
          error: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  });

  /**
   * GET /appointments/professional/:professionalId
   * Buscar agendamentos do profissional
   */
  app.get<{
    Params: ProfessionalParams;
  }>(
    "/professional/:professionalId",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { professionalId } = request.params as ProfessionalParams;

        if (!professionalId) {
          throw new BadRequestError("ID do profissional é obrigatório");
        }

        const appointments =
          await appointmentService.getAppointmentsByProfessional(
            professionalId
          );

        return reply.status(200).send({
          success: true,
          data: appointments,
        });
      } catch (error: any) {
        if (error instanceof BadRequestError) {
          return reply.status(400).send({
            success: false,
            error: error.message,
          });
        }

        return reply.status(500).send({
          success: false,
          error: "Erro interno do servidor",
        });
      }
    }
  );

  /**
   * GET /appointments/date-range
   * Buscar agendamentos por período
   */
  app.get<{
    Querystring: {
      startDate: string;
      endDate: string;
    };
  }>("/date-range", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { startDate, endDate } = request.query as {
        startDate: string;
        endDate: string;
      };

      if (!startDate || !endDate) {
        throw new BadRequestError("Data inicial e final são obrigatórias");
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestError("Datas inválidas");
      }

      if (start >= end) {
        throw new BadRequestError(
          "Data inicial deve ser anterior à data final"
        );
      }

      const appointments = await appointmentService.getAppointmentsByDateRange(
        start,
        end
      );

      return reply.status(200).send({
        success: true,
        data: appointments,
      });
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        return reply.status(400).send({
          success: false,
          error: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  });

  /**
   * POST /appointments/:id/confirm
   * Confirmar agendamento
   */
  app.post<{
    Params: AppointmentParams;
  }>("/:id/confirm", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as AppointmentParams;

      if (!id) {
        throw new BadRequestError("ID do agendamento é obrigatório");
      }

      const appointment = await appointmentService.confirmAppointment(id);

      return reply.status(200).send({
        success: true,
        data: appointment,
        message: "Agendamento confirmado com sucesso",
      });
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        return reply.status(400).send({
          success: false,
          error: error.message,
        });
      }

      if (error instanceof NotFoundError) {
        return reply.status(404).send({
          success: false,
          error: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  });

  /**
   * POST /appointments/:id/start
   * Iniciar agendamento
   */
  app.post<{
    Params: AppointmentParams;
  }>("/:id/start", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as AppointmentParams;

      if (!id) {
        throw new BadRequestError("ID do agendamento é obrigatório");
      }

      const appointment = await appointmentService.startAppointment(id);

      return reply.status(200).send({
        success: true,
        data: appointment,
        message: "Agendamento iniciado com sucesso",
      });
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        return reply.status(400).send({
          success: false,
          error: error.message,
        });
      }

      if (error instanceof NotFoundError) {
        return reply.status(404).send({
          success: false,
          error: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  });

  /**
   * POST /appointments/:id/complete
   * Concluir agendamento
   */
  app.post<{
    Params: AppointmentParams;
  }>("/:id/complete", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as AppointmentParams;

      if (!id) {
        throw new BadRequestError("ID do agendamento é obrigatório");
      }

      const appointment = await appointmentService.completeAppointment(id);

      return reply.status(200).send({
        success: true,
        data: appointment,
        message: "Agendamento concluído com sucesso",
      });
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        return reply.status(400).send({
          success: false,
          error: error.message,
        });
      }

      if (error instanceof NotFoundError) {
        return reply.status(404).send({
          success: false,
          error: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        error: "Erro interno do servidor",
      });
    }
  });
}
