/**
 * Rotas para CompanyEmployeeAppointment
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { FastifyInstance } from "fastify";
import { CompanyEmployeeAppointmentController } from "./company-employee-appointment.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

/**
 * Registra as rotas de agendamentos com funcionários de empresa
 */
export async function companyEmployeeAppointmentRoutes(
  fastify: FastifyInstance
) {
  const controller = new CompanyEmployeeAppointmentController();

  // Aplicar middleware de autenticação em todas as rotas
  fastify.addHook("preHandler", authMiddleware);

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  // Criar agendamento com funcionário
  fastify.post(
    "/",
    {
      schema: {
        description: "Cria um novo agendamento com funcionário de empresa",
        tags: ["Company Employee Appointments"],
        body: {
          type: "object",
          required: [
            "companyId",
            "employeeId",
            "serviceId",
            "scheduledDate",
            "scheduledTime",
          ],
          properties: {
            companyId: { type: "string", format: "uuid" },
            employeeId: { type: "string", format: "uuid" },
            serviceId: { type: "string", format: "uuid" },
            scheduledDate: { type: "string", format: "date" },
            scheduledTime: {
              type: "string",
              pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$",
            },
            location: { type: "string", maxLength: 255 },
            clientNotes: { type: "string", maxLength: 1000 },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object" },
              message: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    controller.createAppointment.bind(controller)
  );

  // Buscar agendamento por ID
  fastify.get(
    "/:id",
    {
      schema: {
        description: "Busca agendamento por ID",
        tags: ["Company Employee Appointments"],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object" },
            },
          },
          404: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    controller.getAppointment.bind(controller)
  );

  // Listar agendamentos com filtros
  fastify.get(
    "/",
    {
      schema: {
        description: "Lista agendamentos com filtros",
        tags: ["Company Employee Appointments"],
        querystring: {
          type: "object",
          properties: {
            skip: { type: "integer", minimum: 0, default: 0 },
            take: { type: "integer", minimum: 1, maximum: 100, default: 10 },
            companyId: { type: "string", format: "uuid" },
            employeeId: { type: "string", format: "uuid" },
            status: {
              type: "string",
              enum: ["PENDING", "ACCEPTED", "COMPLETED", "CANCELLED"],
            },
            dateFrom: { type: "string", format: "date" },
            dateTo: { type: "string", format: "date" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "array", items: { type: "object" } },
              pagination: {
                type: "object",
                properties: {
                  total: { type: "integer" },
                  page: { type: "integer" },
                  limit: { type: "integer" },
                  hasNext: { type: "boolean" },
                  hasPrev: { type: "boolean" },
                },
              },
            },
          },
        },
      },
    },
    controller.listAppointments.bind(controller)
  );

  // Atualizar agendamento
  fastify.put(
    "/:id",
    {
      schema: {
        description: "Atualiza agendamento",
        tags: ["Company Employee Appointments"],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          properties: {
            scheduledDate: { type: "string", format: "date" },
            scheduledTime: {
              type: "string",
              pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$",
            },
            location: { type: "string", maxLength: 255 },
            clientNotes: { type: "string", maxLength: 1000 },
            employeeNotes: { type: "string", maxLength: 1000 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object" },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    controller.updateAppointment.bind(controller)
  );

  // Deletar agendamento
  fastify.delete(
    "/:id",
    {
      schema: {
        description: "Remove agendamento",
        tags: ["Company Employee Appointments"],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    controller.deleteAppointment.bind(controller)
  );

  // ========================================
  // STATUS OPERATIONS
  // ========================================

  // Atualizar status do agendamento
  fastify.patch(
    "/:id/status",
    {
      schema: {
        description: "Atualiza status do agendamento",
        tags: ["Company Employee Appointments"],
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["PENDING", "ACCEPTED", "COMPLETED", "CANCELLED"],
            },
            notes: { type: "string", maxLength: 1000 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object" },
              message: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    controller.updateAppointmentStatus.bind(controller)
  );

  // ========================================
  // CLIENT OPERATIONS
  // ========================================

  // Buscar agendamentos do cliente
  fastify.get(
    "/client/my-appointments",
    {
      schema: {
        description: "Busca agendamentos do cliente autenticado",
        tags: ["Company Employee Appointments"],
        querystring: {
          type: "object",
          properties: {
            skip: { type: "integer", minimum: 0, default: 0 },
            take: { type: "integer", minimum: 1, maximum: 100, default: 10 },
            status: {
              type: "string",
              enum: ["PENDING", "ACCEPTED", "COMPLETED", "CANCELLED"],
            },
            dateFrom: { type: "string", format: "date" },
            dateTo: { type: "string", format: "date" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "array", items: { type: "object" } },
              pagination: {
                type: "object",
                properties: {
                  total: { type: "integer" },
                  page: { type: "integer" },
                  limit: { type: "integer" },
                  hasNext: { type: "boolean" },
                  hasPrev: { type: "boolean" },
                },
              },
            },
          },
        },
      },
    },
    controller.getClientAppointments.bind(controller)
  );

  // ========================================
  // COMPANY OPERATIONS
  // ========================================

  // Buscar agendamentos da empresa
  fastify.get(
    "/company/:companyId",
    {
      schema: {
        description: "Busca agendamentos de uma empresa",
        tags: ["Company Employee Appointments"],
        params: {
          type: "object",
          required: ["companyId"],
          properties: {
            companyId: { type: "string", format: "uuid" },
          },
        },
        querystring: {
          type: "object",
          properties: {
            skip: { type: "integer", minimum: 0, default: 0 },
            take: { type: "integer", minimum: 1, maximum: 100, default: 10 },
            status: {
              type: "string",
              enum: ["PENDING", "ACCEPTED", "COMPLETED", "CANCELLED"],
            },
            dateFrom: { type: "string", format: "date" },
            dateTo: { type: "string", format: "date" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "array", items: { type: "object" } },
              pagination: {
                type: "object",
                properties: {
                  total: { type: "integer" },
                  page: { type: "integer" },
                  limit: { type: "integer" },
                  hasNext: { type: "boolean" },
                  hasPrev: { type: "boolean" },
                },
              },
            },
          },
        },
      },
    },
    controller.getCompanyAppointments.bind(controller)
  );

  // ========================================
  // EMPLOYEE OPERATIONS
  // ========================================

  // Buscar agendamentos do funcionário
  fastify.get(
    "/employee/:employeeId",
    {
      schema: {
        description: "Busca agendamentos de um funcionário",
        tags: ["Company Employee Appointments"],
        params: {
          type: "object",
          required: ["employeeId"],
          properties: {
            employeeId: { type: "string", format: "uuid" },
          },
        },
        querystring: {
          type: "object",
          properties: {
            skip: { type: "integer", minimum: 0, default: 0 },
            take: { type: "integer", minimum: 1, maximum: 100, default: 10 },
            status: {
              type: "string",
              enum: ["PENDING", "ACCEPTED", "COMPLETED", "CANCELLED"],
            },
            dateFrom: { type: "string", format: "date" },
            dateTo: { type: "string", format: "date" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "array", items: { type: "object" } },
              pagination: {
                type: "object",
                properties: {
                  total: { type: "integer" },
                  page: { type: "integer" },
                  limit: { type: "integer" },
                  hasNext: { type: "boolean" },
                  hasPrev: { type: "boolean" },
                },
              },
            },
          },
        },
      },
    },
    controller.getEmployeeAppointments.bind(controller)
  );

  // ========================================
  // AVAILABILITY OPERATIONS
  // ========================================

  // Verificar disponibilidade do funcionário
  fastify.get(
    "/employee/:employeeId/availability",
    {
      schema: {
        description: "Verifica disponibilidade do funcionário em um horário",
        tags: ["Company Employee Appointments"],
        params: {
          type: "object",
          required: ["employeeId"],
          properties: {
            employeeId: { type: "string", format: "uuid" },
          },
        },
        querystring: {
          type: "object",
          required: ["date", "time"],
          properties: {
            date: { type: "string", format: "date" },
            time: {
              type: "string",
              pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  isAvailable: { type: "boolean" },
                },
              },
            },
          },
        },
      },
    },
    controller.checkEmployeeAvailability.bind(controller)
  );

  // Obter horários disponíveis do funcionário
  fastify.get(
    "/employee/:employeeId/available-slots",
    {
      schema: {
        description: "Obtém horários disponíveis do funcionário em uma data",
        tags: ["Company Employee Appointments"],
        params: {
          type: "object",
          required: ["employeeId"],
          properties: {
            employeeId: { type: "string", format: "uuid" },
          },
        },
        querystring: {
          type: "object",
          required: ["date"],
          properties: {
            date: { type: "string", format: "date" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  timeSlots: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
      },
    },
    controller.getEmployeeAvailableTimeSlots.bind(controller)
  );

  // ========================================
  // STATISTICS OPERATIONS
  // ========================================

  // Obter estatísticas de agendamentos
  fastify.get(
    "/stats",
    {
      schema: {
        description: "Obtém estatísticas de agendamentos",
        tags: ["Company Employee Appointments"],
        querystring: {
          type: "object",
          properties: {
            companyId: { type: "string", format: "uuid" },
            employeeId: { type: "string", format: "uuid" },
            clientId: { type: "string", format: "uuid" },
            dateFrom: { type: "string", format: "date" },
            dateTo: { type: "string", format: "date" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object" },
            },
          },
        },
      },
    },
    controller.getStats.bind(controller)
  );
}
