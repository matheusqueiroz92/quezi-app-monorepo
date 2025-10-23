import { type FastifyInstance } from "fastify";
import { CompanyEmployeeService } from "./company-employee.service";
import {
  createCompanyEmployeeSchema,
  updateCompanyEmployeeSchema,
  companyEmployeeIdSchema,
  listCompanyEmployeesQuerySchema,
  createCompanyEmployeeAppointmentSchema,
  updateCompanyEmployeeAppointmentSchema,
  createCompanyEmployeeReviewSchema,
} from "./company-employee.schema";
import {
  requireCompany,
  requireCompanyOwnership,
  requireAppointmentAccess,
  requireReviewAccess,
} from "../../middlewares/company-auth.middleware";
import {
  requireEmployeeOwnership,
  requireAppointmentOwnership,
  requireClientAppointmentAccess,
} from "../../middlewares/company-employee.middleware";
import { auth } from "../../lib/auth";

// Wrapper para autenticação
const authMiddleware = async (request: any, reply: any) => {
  const token = request.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    throw new Error("Token não fornecido");
  }

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      throw new Error("Sessão inválida");
    }

    request.user = session.user;
  } catch (error) {
    throw new Error("Sessão inválida");
  }
};

/**
 * Controller para funcionários da empresa
 *
 * Endpoints disponíveis:
 * - GET /company-employees - Listar funcionários
 * - POST /company-employees - Criar funcionário
 * - GET /company-employees/:id - Buscar funcionário
 * - PUT /company-employees/:id - Atualizar funcionário
 * - DELETE /company-employees/:id - Deletar funcionário
 * - GET /company-employees/:id/appointments - Agendamentos do funcionário
 * - POST /company-employees/appointments - Criar agendamento
 * - PUT /company-employees/appointments/:id/status - Atualizar status
 * - POST /company-employees/reviews - Criar review
 * - GET /company-employees/:id/stats - Estatísticas do funcionário
 */
export async function companyEmployeeRoutes(
  app: FastifyInstance
): Promise<void> {
  const service = new CompanyEmployeeService();

  // Listar funcionários da empresa
  app.get(
    "/company-employees",
    {
      preHandler: [authMiddleware, requireCompany],
      schema: {
        tags: ["company-employees"],
        description: "Listar funcionários da empresa",
        security: [{ bearerAuth: [] }],
        querystring: listCompanyEmployeesQuerySchema,
        response: {
          200: {
            type: "object",
            properties: {
              employees: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    email: { type: "string" },
                    phone: { type: "string" },
                    position: { type: "string" },
                    specialties: { type: "array", items: { type: "string" } },
                    isActive: { type: "boolean" },
                    createdAt: { type: "string" },
                  },
                },
              },
              total: { type: "number" },
              page: { type: "number" },
              limit: { type: "number" },
            },
          },
          401: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          403: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const query = request.query as any;
      const result = await service.listEmployees(request.user!.id, query);
      return reply.send(result);
    }
  );

  // Criar funcionário
  app.post(
    "/company-employees",
    {
      preHandler: [authMiddleware, requireCompany],
      schema: {
        tags: ["company-employees"],
        description: "Criar novo funcionário",
        security: [{ bearerAuth: [] }],
        body: createCompanyEmployeeSchema,
        response: {
          201: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              email: { type: "string" },
              phone: { type: "string" },
              position: { type: "string" },
              specialties: { type: "array", items: { type: "string" } },
              isActive: { type: "boolean" },
              createdAt: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          401: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          403: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const data = request.body as any;
      const employee = await service.createEmployee(request.user!.id, data);
      return reply.status(201).send(employee);
    }
  );

  // Buscar funcionário por ID
  app.get(
    "/company-employees/:id",
    {
      preHandler: [authMiddleware, requireCompany, requireEmployeeOwnership],
      schema: {
        tags: ["company-employees"],
        description: "Buscar funcionário por ID",
        security: [{ bearerAuth: [] }],
        params: companyEmployeeIdSchema,
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              email: { type: "string" },
              phone: { type: "string" },
              position: { type: "string" },
              specialties: { type: "array", items: { type: "string" } },
              isActive: { type: "boolean" },
              createdAt: { type: "string" },
              company: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                },
              },
            },
          },
          401: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          403: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const employee = await service.getEmployeeById(id, request.user!.id);
      return reply.send(employee);
    }
  );

  // Atualizar funcionário
  app.put(
    "/company-employees/:id",
    {
      schema: {
        tags: ["company-employees"],
        description: "Atualizar funcionário",
        security: [{ bearerAuth: [] }],
        params: companyEmployeeIdSchema,
        body: updateCompanyEmployeeSchema,
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              email: { type: "string" },
              phone: { type: "string" },
              position: { type: "string" },
              specialties: { type: "array", items: { type: "string" } },
              isActive: { type: "boolean" },
              updatedAt: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      // TODO: Implementar middleware de autenticação e verificar se é COMPANY
      const companyId = "temp-company-id"; // Placeholder
      const { id } = request.params as { id: string };
      const data = request.body as any;

      const employee = await service.updateEmployee(id, companyId, data);
      return reply.send(employee);
    }
  );

  // Deletar funcionário
  app.delete(
    "/company-employees/:id",
    {
      schema: {
        tags: ["company-employees"],
        description: "Deletar funcionário",
        security: [{ bearerAuth: [] }],
        params: companyEmployeeIdSchema,
        response: {
          204: {
            type: "null",
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      // TODO: Implementar middleware de autenticação e verificar se é COMPANY
      const companyId = "temp-company-id"; // Placeholder
      const { id } = request.params as { id: string };

      await service.deleteEmployee(id, companyId);
      return reply.status(204).send();
    }
  );

  // Listar agendamentos do funcionário
  app.get(
    "/company-employees/:id/appointments",
    {
      schema: {
        tags: ["company-employees"],
        description: "Listar agendamentos do funcionário",
        security: [{ bearerAuth: [] }],
        params: companyEmployeeIdSchema,
        querystring: {
          type: "object",
          properties: {
            page: { type: "number", default: 1 },
            limit: { type: "number", default: 10 },
            status: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              appointments: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    scheduledDate: { type: "string" },
                    status: { type: "string" },
                    locationType: { type: "string" },
                    clientAddress: { type: "string" },
                    clientNotes: { type: "string" },
                    client: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        email: { type: "string" },
                      },
                    },
                    service: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        price: { type: "number" },
                      },
                    },
                  },
                },
              },
              total: { type: "number" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      // TODO: Implementar middleware de autenticação e verificar se é COMPANY
      const companyId = "temp-company-id"; // Placeholder
      const { id } = request.params as { id: string };
      const query = request.query as any;

      const result = await service.getEmployeeAppointments(
        id,
        companyId,
        query
      );
      return reply.send(result);
    }
  );

  // Criar agendamento para funcionário
  app.post(
    "/company-employees/appointments",
    {
      preHandler: [authMiddleware, requireAppointmentAccess],
      schema: {
        tags: ["company-employees"],
        description: "Criar agendamento para funcionário",
        security: [{ bearerAuth: [] }],
        body: createCompanyEmployeeAppointmentSchema,
        response: {
          201: {
            type: "object",
            properties: {
              id: { type: "string" },
              scheduledDate: { type: "string" },
              status: { type: "string" },
              locationType: { type: "string" },
              clientAddress: { type: "string" },
              clientNotes: { type: "string" },
              client: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  email: { type: "string" },
                },
              },
              service: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  price: { type: "number" },
                },
              },
            },
          },
          401: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          403: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const data = request.body as any;
      const appointment = await service.createAppointment(
        request.user!.id,
        data
      );
      return reply.status(201).send(appointment);
    }
  );

  // Atualizar status do agendamento
  app.put(
    "/company-employees/appointments/:id/status",
    {
      schema: {
        tags: ["company-employees"],
        description: "Atualizar status do agendamento",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        body: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED"],
            },
          },
          required: ["status"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              status: { type: "string" },
              updatedAt: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      // TODO: Implementar middleware de autenticação e verificar se é COMPANY
      const companyId = "temp-company-id"; // Placeholder
      const { id } = request.params as { id: string };
      const { status } = request.body as { status: string };

      const appointment = await service.updateAppointmentStatus(
        id,
        companyId,
        status as any
      );
      return reply.send(appointment);
    }
  );

  // Criar review para funcionário
  app.post(
    "/company-employees/reviews",
    {
      preHandler: [authMiddleware, requireReviewAccess],
      schema: {
        tags: ["company-employees"],
        description: "Criar review para funcionário",
        security: [{ bearerAuth: [] }],
        body: createCompanyEmployeeReviewSchema,
        response: {
          201: {
            type: "object",
            properties: {
              id: { type: "string" },
              rating: { type: "number" },
              comment: { type: "string" },
              createdAt: { type: "string" },
              reviewer: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                },
              },
            },
          },
          401: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
          403: {
            type: "object",
            properties: {
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const data = request.body as any;
      const reviewData = {
        ...data,
        reviewerId: request.user!.id,
      };
      const review = await service.createReview(reviewData);
      return reply.status(201).send(review);
    }
  );

  // Buscar estatísticas do funcionário
  app.get(
    "/company-employees/:id/stats",
    {
      schema: {
        tags: ["company-employees"],
        description: "Buscar estatísticas do funcionário",
        security: [{ bearerAuth: [] }],
        params: companyEmployeeIdSchema,
        response: {
          200: {
            type: "object",
            properties: {
              totalAppointments: { type: "number" },
              completedAppointments: { type: "number" },
              averageRating: { type: "number" },
              totalReviews: { type: "number" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      // TODO: Implementar middleware de autenticação e verificar se é COMPANY
      const companyId = "temp-company-id"; // Placeholder
      const { id } = request.params as { id: string };

      const stats = await service.getEmployeeStats(id, companyId);
      return reply.send(stats);
    }
  );
}
