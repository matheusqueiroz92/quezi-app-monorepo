/**
 * AppointmentController
 *
 * Controller para gerenciar agendamentos
 * Camada de Apresentação - Clean Architecture
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";

import { AppointmentService } from "../../application/services/appointment.service";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { rbacMiddleware } from "../../middlewares/rbac.middleware";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../../utils/app-error";

// =============================
// Zod Schemas (request/params)
// =============================
const AppointmentIdParamsSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});

const CreateAppointmentSchema = z
  .object({
    clientId: z.string().min(1, "ID do cliente é obrigatório"),
    professionalId: z.string().optional(),
    companyEmployeeId: z.string().optional(),
    serviceId: z.string().min(1, "ID do serviço é obrigatório"),
    scheduledDate: z
      .string()
      .datetime({ offset: false, message: "Data inválida" }),
    duration: z.number().int().positive("Duração deve ser maior que zero"),
    notes: z.string().max(1000).optional(),
  })
  .refine((data) => Boolean(data.professionalId || data.companyEmployeeId), {
    message: "ID do profissional ou funcionário é obrigatório",
    path: ["professionalId"],
  });

const UpdateAppointmentSchema = z.object({
  scheduledDate: z.string().datetime({ offset: false }).optional(),
  duration: z.number().int().positive().optional(),
  notes: z.string().max(1000).optional(),
  status: z
    .enum(["SCHEDULED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .optional(),
});

const DateRangeQuerySchema = z.object({
  startDate: z
    .string()
    .datetime({ offset: false, message: "startDate inválida" }),
  endDate: z.string().datetime({ offset: false, message: "endDate inválida" }),
});

const UserIdParamsSchema = z.object({ userId: z.string().min(1) });
const ProfessionalIdParamsSchema = z.object({
  professionalId: z.string().min(1),
});
const CompanyEmployeeIdParamsSchema = z.object({
  companyEmployeeId: z.string().min(1),
});

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
  }>(
    "/",
    {
      schema: {
        tags: ["appointments"],
        body: {
          type: "object",
          properties: {
            clientId: { type: "string" },
            professionalId: { type: "string" },
            companyEmployeeId: { type: "string" },
            serviceId: { type: "string" },
            scheduledDate: { type: "string", format: "date-time" },
            duration: { type: "number" },
            notes: { type: "string" },
          },
          required: ["clientId", "serviceId", "scheduledDate", "duration"],
        },
        response: {
          201: { type: "object" },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const parsed = CreateAppointmentSchema.parse(request.body);

        const appointment = await appointmentService.createAppointment({
          ...parsed,
          scheduledDate: new Date(parsed.scheduledDate),
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
    }
  );

  /**
   * GET /appointments/:id
   * Buscar agendamento por ID
   */
  app.get<{
    Params: AppointmentParams;
  }>(
    "/:id",
    {
      schema: {
        tags: ["appointments"],
        params: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = AppointmentIdParamsSchema.parse(request.params);

        const appointment = await appointmentService.getAppointmentById(id);
        if (!appointment) {
          throw new NotFoundError("Agendamento não encontrado");
        }

        return reply.status(200).send({
          success: true,
          data: appointment,
          message: "Agendamento encontrado com sucesso",
        });
      } catch (error: any) {
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
    }
  );

  /**
   * PUT /appointments/:id
   * Atualizar agendamento
   */
  app.put<{
    Params: AppointmentParams;
    Body: UpdateAppointmentRequest;
  }>(
    "/:id",
    {
      schema: {
        tags: ["appointments"],
        params: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: {
            scheduledDate: { type: "string", format: "date-time" },
            duration: { type: "number" },
            notes: { type: "string" },
            status: {
              type: "string",
              enum: [
                "SCHEDULED",
                "CONFIRMED",
                "IN_PROGRESS",
                "COMPLETED",
                "CANCELLED",
              ],
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = AppointmentIdParamsSchema.parse(request.params);
        const updateData = UpdateAppointmentSchema.parse(request.body ?? {});

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
        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            success: false,
            error: error.message,
          });
        }
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
   * DELETE /appointments/:id
   * Cancelar agendamento
   */
  app.delete<{
    Params: AppointmentParams;
  }>(
    "/:id",
    {
      schema: {
        tags: ["appointments"],
        params: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = AppointmentIdParamsSchema.parse(request.params);
        await appointmentService.cancelAppointment(id);
        return reply.status(204).send();
      } catch (error: any) {
        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            statusCode: 404,
            error: "Not Found",
            message: error.message,
          });
        }
        if (error instanceof BadRequestError) {
          return reply.status(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: error.message,
          });
        }
        throw error;
      }
    }
  );

  /**
   * GET /appointments/user/:userId
   * Buscar agendamentos do usuário
   */
  app.get<{ Params: { userId: string } }>(
    "/user/:userId",
    {
      preHandler: rbacMiddleware([
        "CLIENT",
        "PROFESSIONAL",
        "COMPANY",
        "ADMIN",
      ]),
      schema: {
        tags: ["appointments"],
        params: {
          type: "object",
          properties: { userId: { type: "string" } },
          required: ["userId"],
        },
      },
    },
    async (request, reply) => {
      const { userId } = UserIdParamsSchema.parse(request.params);
      try {
        const appointments = await appointmentService.getAppointmentsByUser(
          userId
        );
        return reply.status(200).send({
          success: true,
          data: appointments,
          message: "Agendamentos encontrados com sucesso",
        });
      } catch (error: any) {
        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            statusCode: 404,
            error: "Not Found",
            message: error.message,
          });
        }
        throw error;
      }
    }
  );

  /**
   * GET /appointments/professional/:professionalId
   * Buscar agendamentos do profissional
   */
  app.get<{ Params: { professionalId: string } }>(
    "/professional/:professionalId",
    {
      preHandler: rbacMiddleware(["PROFESSIONAL", "COMPANY", "ADMIN"]),
      schema: {
        tags: ["appointments"],
        params: {
          type: "object",
          properties: { professionalId: { type: "string" } },
          required: ["professionalId"],
        },
      },
    },
    async (request, reply) => {
      const { professionalId } = ProfessionalIdParamsSchema.parse(
        request.params
      );
      try {
        const appointments =
          await appointmentService.getAppointmentsByProfessional(
            professionalId
          );
        return reply.status(200).send({
          success: true,
          data: appointments,
          message: "Agendamentos encontrados com sucesso",
        });
      } catch (error: any) {
        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            statusCode: 404,
            error: "Not Found",
            message: error.message,
          });
        }
        throw error;
      }
    }
  );

  /**
   * GET /appointments/date-range
   * Buscar agendamentos por período
   */
  app.get<{
    Querystring: { startDate: string; endDate: string };
  }>(
    "/date-range",
    {
      schema: {
        tags: ["appointments"],
        querystring: {
          type: "object",
          properties: {
            startDate: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time" },
          },
          required: ["startDate", "endDate"],
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { startDate, endDate } = DateRangeQuerySchema.parse(
          request.query
        );

        const appointments =
          await appointmentService.getAppointmentsByDateRange(
            new Date(startDate),
            new Date(endDate)
          );

        return reply.status(200).send({
          success: true,
          data: appointments,
          message: "Agendamentos encontrados com sucesso",
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
