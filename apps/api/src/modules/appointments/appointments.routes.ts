import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { AppointmentsController } from "./appointments.controller";
import { AppointmentsService } from "./appointments.service";
import { AppointmentsRepository } from "./appointments.repository";
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
} from "./appointments.schema";

export async function appointmentsRoutes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();
  const appointmentsRepository = new AppointmentsRepository(prisma);
  const appointmentsService = new AppointmentsService(appointmentsRepository);
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
              example: "clx1234567890abcdef",
            },
            professionalId: {
              type: "string",
              description: "ID do profissional",
              example: "clx0987654321fedcba",
            },
            serviceId: {
              type: "string",
              description: "ID do serviço",
              example: "clx1122334455667788",
            },
            scheduledDate: {
              type: "string",
              format: "date-time",
              description: "Data e hora do agendamento",
              example: "2024-02-15T14:30:00Z",
            },
            locationType: {
              type: "string",
              enum: ["AT_LOCATION", "AT_DOMICILE", "BOTH"],
              description: "Tipo de atendimento",
              example: "AT_LOCATION",
            },
            clientAddress: {
              type: "string",
              description: "Endereço do cliente (se atendimento a domicílio)",
              example: "Rua das Flores, 123 - Centro",
            },
            clientNotes: {
              type: "string",
              maxLength: 500,
              description: "Observações do cliente",
              example: "Primeira consulta, chegar 10 minutos antes",
            },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  id: { type: "string", example: "clx1234567890abcdef" },
                  clientId: { type: "string", example: "clx1234567890abcdef" },
                  professionalId: {
                    type: "string",
                    example: "clx0987654321fedcba",
                  },
                  serviceId: { type: "string", example: "clx1122334455667788" },
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
                example: "Agendamento criado com sucesso",
              },
            },
          },
          400: {
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              message: { type: "string", example: "Dados inválidos" },
            },
          },
          401: {
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              message: { type: "string", example: "Usuário não autenticado" },
            },
          },
          409: {
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              message: {
                type: "string",
                example: "Profissional já possui agendamento neste horário",
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
              example: "clx1234567890abcdef",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  id: { type: "string", example: "clx1234567890abcdef" },
                  clientId: { type: "string", example: "clx1234567890abcdef" },
                  professionalId: {
                    type: "string",
                    example: "clx0987654321fedcba",
                  },
                  serviceId: { type: "string", example: "clx1122334455667788" },
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
              success: { type: "boolean", example: false },
              message: {
                type: "string",
                example: "Agendamento não encontrado",
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
              success: { type: "boolean", example: true },
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
              success: { type: "boolean", example: true },
              data: { type: "object" },
              message: {
                type: "string",
                example: "Agendamento atualizado com sucesso",
              },
            },
          },
          404: {
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              message: {
                type: "string",
                example: "Agendamento não encontrado",
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
              success: { type: "boolean", example: true },
              message: {
                type: "string",
                example: "Agendamento cancelado com sucesso",
              },
            },
          },
          404: {
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              message: {
                type: "string",
                example: "Agendamento não encontrado",
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
              success: { type: "boolean", example: true },
              data: { type: "object" },
              message: {
                type: "string",
                example: "Status do agendamento atualizado com sucesso",
              },
            },
          },
          403: {
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              message: {
                type: "string",
                example: "Apenas o profissional pode alterar o status",
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
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  date: { type: "string", example: "2024-02-15" },
                  professionalId: { type: "string" },
                  serviceId: { type: "string" },
                  availableSlots: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        time: { type: "string", example: "14:30" },
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
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  total: { type: "number", example: 150 },
                  pending: { type: "number", example: 25 },
                  accepted: { type: "number", example: 100 },
                  rejected: { type: "number", example: 15 },
                  completed: { type: "number", example: 85 },
                  completionRate: { type: "number", example: 85.5 },
                  averageRating: {
                    type: "number",
                    nullable: true,
                    example: 4.8,
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
              success: { type: "boolean", example: true },
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
              success: { type: "boolean", example: true },
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
              success: { type: "boolean", example: true },
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
