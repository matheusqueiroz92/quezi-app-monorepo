import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { AppointmentsController } from "../controllers/appointments.controller";
import { AppointmentService } from "../../application/services/appointment.service";
import { AppointmentRepository } from "../../infrastructure/repositories/appointment.repository";
import { authMiddleware } from "../../middlewares/auth.middleware";
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
} from "../schemas/appointments.schema";

export async function appointmentsRoutes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();
  const appointmentsRepository = new AppointmentRepository(prisma);
  const appointmentsService = new AppointmentService(appointmentsRepository);
  const appointmentsController = new AppointmentsController(
    appointmentsService
  );

  // ========================================
  // CRUD ROUTES
  // ========================================

  // POST /api/v1/appointments
  fastify.post(
    "/",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Appointments"],
        summary: "Criar novo agendamento",
        description: "Cria um novo agendamento para um serviço",
        body: {
          type: "object",
          required: [
            "clientId",
            "professionalId",
            "serviceId",
            "scheduledDate",
            "locationType",
          ],
          properties: {
            clientId: {
              type: "string",
              description: "ID do cliente",
            },
            professionalId: {
              type: "string",
              description: "ID do profissional",
            },
            serviceId: {
              type: "string",
              description: "ID do serviço",
            },
            scheduledDate: {
              type: "string",
              format: "date-time",
              description: "Data e hora do agendamento",
            },
            locationType: {
              type: "string",
              enum: ["AT_LOCATION", "AT_DOMICILE", "BOTH"],
              description: "Tipo de atendimento",
            },
            clientAddress: {
              type: "string",
              description: "Endereço do cliente (se atendimento a domicílio)",
            },
            clientNotes: {
              type: "string",
              maxLength: 500,
              description: "Observações do cliente",
            },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  professionalId: {
                    type: "string",
                  },
                  scheduledDate: { type: "string", format: "date-time" },
                  status: {
                    type: "string",
                    enum: ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED"],
                  },
                  locationType: {
                    type: "string",
                    enum: ["AT_LOCATION", "AT_DOMICILE", "BOTH"],
                  },
                  clientAddress: { type: "string", nullable: true },
                  clientNotes: { type: "string", nullable: true },
                  isReviewed: { type: "boolean" },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
              message: {
                type: "string",
              },
            },
          },
          400: {
            type: "object",
            properties: {},
          },
          401: {
            type: "object",
            properties: {},
          },
          409: {
            type: "object",
            properties: {
              message: {
                type: "string",
              },
            },
          },
        },
      },
    },
    appointmentsController.createAppointment.bind(appointmentsController) as any
  );

  // GET /api/v1/appointments/:id
  fastify.get(
    "/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Appointments"],
        summary: "Buscar agendamento por ID",
        description: "Busca um agendamento específico por ID",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              description: "ID do agendamento",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  professionalId: {
                    type: "string",
                  },
                  scheduledDate: { type: "string", format: "date-time" },
                  status: {
                    type: "string",
                    enum: ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED"],
                  },
                  locationType: {
                    type: "string",
                    enum: ["AT_LOCATION", "AT_DOMICILE", "BOTH"],
                  },
                  clientAddress: { type: "string", nullable: true },
                  clientNotes: { type: "string", nullable: true },
                  isReviewed: { type: "boolean" },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                  client: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string" },
                      email: { type: "string" },
                      phone: { type: "string", nullable: true },
                    },
                  },
                  professional: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string" },
                      email: { type: "string" },
                      phone: { type: "string", nullable: true },
                    },
                  },
                  service: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string" },
                      description: { type: "string", nullable: true },
                      price: { type: "number" },
                      priceType: { type: "string", enum: ["FIXED", "HOURLY"] },
                      durationMinutes: { type: "number" },
                      category: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          slug: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            type: "object",
            properties: {
              message: {
                type: "string",
              },
            },
          },
        },
      },
    },
    appointmentsController.getAppointment.bind(appointmentsController) as any
  );

  // GET /api/v1/appointments
  fastify.get(
    "/",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Appointments"],
        summary: "Listar agendamentos",
        description: "Lista agendamentos com filtros e paginação",
        querystring: {
          type: "object",
          properties: {
            page: {
              type: "string",
              default: "1",
              description: "Número da página",
            },
            limit: {
              type: "string",
              default: "10",
              description: "Itens por página",
            },
            status: {
              type: "string",
              enum: ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED"],
              description: "Filtrar por status",
            },
            clientId: { type: "string", description: "Filtrar por cliente" },
            professionalId: {
              type: "string",
              description: "Filtrar por profissional",
            },
            serviceId: { type: "string", description: "Filtrar por serviço" },
            dateFrom: {
              type: "string",
              format: "date-time",
              description: "Data inicial",
            },
            dateTo: {
              type: "string",
              format: "date-time",
              description: "Data final",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    clientId: { type: "string" },
                    professionalId: { type: "string" },
                    serviceId: { type: "string" },
                    scheduledDate: { type: "string", format: "date-time" },
                    status: {
                      type: "string",
                      enum: ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED"],
                    },
                    locationType: {
                      type: "string",
                      enum: ["AT_LOCATION", "AT_DOMICILE", "BOTH"],
                    },
                    clientAddress: { type: "string", nullable: true },
                    clientNotes: { type: "string", nullable: true },
                    isReviewed: { type: "boolean" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                    client: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        email: { type: "string" },
                        phone: { type: "string", nullable: true },
                      },
                    },
                    professional: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        email: { type: "string" },
                        phone: { type: "string", nullable: true },
                      },
                    },
                    service: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        description: { type: "string", nullable: true },
                        price: { type: "number" },
                        priceType: {
                          type: "string",
                          enum: ["FIXED", "HOURLY"],
                        },
                        durationMinutes: { type: "number" },
                        category: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            slug: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
              },
              pagination: {
                type: "object",
                properties: {
                  page: { type: "number" },
                  limit: { type: "number" },
                  total: { type: "number" },
                  totalPages: { type: "number" },
                },
              },
            },
          },
        },
      },
    },
    appointmentsController.getAppointments.bind(appointmentsController) as any
  );

  // PUT /api/v1/appointments/:id
  fastify.put(
    "/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Appointments"],
        summary: "Atualizar agendamento",
        description: "Atualiza um agendamento existente",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", description: "ID do agendamento" },
          },
        },
        body: {
          type: "object",
          properties: {
            scheduledDate: {
              type: "string",
              format: "date-time",
              description: "Nova data e hora",
            },
            locationType: {
              type: "string",
              enum: ["AT_LOCATION", "AT_DOMICILE", "BOTH"],
              description: "Novo tipo de atendimento",
            },
            clientAddress: { type: "string", description: "Novo endereço" },
            clientNotes: {
              type: "string",
              maxLength: 500,
              description: "Novas observações",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              data: { type: "object" },
              message: {
                type: "string",
              },
            },
          },
          404: {
            type: "object",
            properties: {
              message: {
                type: "string",
              },
            },
          },
        },
      },
    },
    appointmentsController.updateAppointment.bind(appointmentsController) as any
  );

  // DELETE /api/v1/appointments/:id
  fastify.delete(
    "/:id",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Appointments"],
        summary: "Cancelar agendamento",
        description: "Cancela um agendamento",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", description: "ID do agendamento" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: {
                type: "string",
              },
            },
          },
          404: {
            type: "object",
            properties: {
              message: {
                type: "string",
              },
            },
          },
        },
      },
    },
    appointmentsController.deleteAppointment.bind(appointmentsController) as any
  );

  // ========================================
  // STATUS ROUTES
  // ========================================

  // PATCH /api/v1/appointments/:id/status
  fastify.patch(
    "/:id/status",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Appointments"],
        summary: "Atualizar status do agendamento",
        description:
          "Atualiza o status de um agendamento (apenas para profissionais)",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", description: "ID do agendamento" },
          },
        },
        body: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED"],
              description: "Novo status do agendamento",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              data: { type: "object" },
              message: {
                type: "string",
              },
            },
          },
          403: {
            type: "object",
            properties: {
              message: {
                type: "string",
              },
            },
          },
        },
      },
    },
    appointmentsController.updateAppointmentStatus.bind(
      appointmentsController
    ) as any
  );

  // ========================================
  // AVAILABILITY ROUTES
  // ========================================

  // GET /api/v1/appointments/availability
  fastify.get(
    "/availability",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Appointments"],
        summary: "Verificar disponibilidade",
        description: "Verifica horários disponíveis para agendamento",
        querystring: {
          type: "object",
          required: ["professionalId", "serviceId", "date"],
          properties: {
            professionalId: {
              type: "string",
              description: "ID do profissional",
            },
            serviceId: { type: "string", description: "ID do serviço" },
            date: {
              type: "string",
              pattern: "^\\d{4}-\\d{2}-\\d{2}$",
              description: "Data no formato YYYY-MM-DD",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  professionalId: { type: "string" },
                  serviceId: { type: "string" },
                  availableSlots: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        available: { type: "boolean" },
                        reason: { type: "string", nullable: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    appointmentsController.checkAvailability.bind(appointmentsController) as any
  );

  // ========================================
  // STATISTICS ROUTES
  // ========================================

  // GET /api/v1/appointments/stats
  fastify.get(
    "/stats",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Appointments"],
        summary: "Estatísticas de agendamentos",
        description: "Retorna estatísticas dos agendamentos",
        querystring: {
          type: "object",
          properties: {
            professionalId: {
              type: "string",
              description: "ID do profissional",
            },
            clientId: { type: "string", description: "ID do cliente" },
            dateFrom: {
              type: "string",
              format: "date-time",
              description: "Data inicial",
            },
            dateTo: {
              type: "string",
              format: "date-time",
              description: "Data final",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  averageRating: {
                    type: "number",
                    nullable: true,
                  },
                },
              },
            },
          },
        },
      },
    },
    appointmentsController.getStats.bind(appointmentsController) as any
  );

  // ========================================
  // UTILITY ROUTES
  // ========================================

  // GET /api/v1/appointments/my
  fastify.get(
    "/my",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Appointments"],
        summary: "Meus agendamentos",
        description: "Lista todos os agendamentos do usuário logado",
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: { type: "object" },
              },
            },
          },
        },
      },
    },
    appointmentsController.getMyAppointments.bind(appointmentsController) as any
  );

  // GET /api/v1/appointments/upcoming
  fastify.get(
    "/upcoming",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Appointments"],
        summary: "Próximos agendamentos",
        description: "Lista próximos agendamentos do usuário logado",
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: { type: "object" },
              },
            },
          },
        },
      },
    },
    appointmentsController.getUpcomingAppointments.bind(
      appointmentsController
    ) as any
  );

  // GET /api/v1/appointments/history
  fastify.get(
    "/history",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Appointments"],
        summary: "Histórico de agendamentos",
        description: "Lista histórico de agendamentos do usuário logado",
        response: {
          200: {
            type: "object",
            properties: {
              data: {
                type: "array",
                items: { type: "object" },
              },
            },
          },
        },
      },
    },
    appointmentsController.getAppointmentHistory.bind(
      appointmentsController
    ) as any
  );
}
