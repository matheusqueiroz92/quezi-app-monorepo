import { FastifyInstance } from "fastify";
import { z } from "zod";
import { OfferedServiceService } from "../../application/services/offered-service.service";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { rbacMiddleware } from "../../middlewares/rbac.middleware";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../../utils/app-error";

// Zod Schemas
const ServiceIdParamsSchema = z.object({ id: z.string().min(1) });
const ProfessionalIdParamsSchema = z.object({
  professionalId: z.string().min(1),
});
const CompanyEmployeeIdParamsSchema = z.object({
  companyEmployeeId: z.string().min(1),
});
const CategoryParamSchema = z.object({ category: z.string().min(1) });

const CreateOfferedServiceSchema = z
  .object({
    professionalId: z.string().optional(),
    companyEmployeeId: z.string().optional(),
    categoryId: z.string().min(1),
    name: z.string().min(3),
    description: z.string().max(2000).optional(),
    price: z.number().nonnegative(),
    durationMinutes: z.number().int().positive(),
  })
  .refine((d) => Boolean(d.professionalId || d.companyEmployeeId), {
    message: "ID do profissional ou funcionário é obrigatório",
    path: ["professionalId"],
  });

const UpdateOfferedServiceSchema = z.object({
  categoryId: z.string().min(1).optional(),
  name: z.string().min(3).optional(),
  description: z.string().max(2000).optional(),
  price: z.number().nonnegative().optional(),
  durationMinutes: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

const SearchQuerySchema = z.object({
  q: z.string().min(2).optional(),
  category: z.string().optional(),
  minPrice: z
    .string()
    .transform((v) => (v ? parseFloat(v) : undefined))
    .optional(),
  maxPrice: z
    .string()
    .transform((v) => (v ? parseFloat(v) : undefined))
    .optional(),
  page: z
    .string()
    .default("1")
    .transform((v) => parseInt(v)),
  limit: z
    .string()
    .default("10")
    .transform((v) => parseInt(v)),
});

export async function offeredServiceRoutes(
  app: FastifyInstance
): Promise<void> {
  const offeredServiceService = new OfferedServiceService();

  app.addHook("preHandler", authMiddleware);

  // Criar serviço oferecido
  app.post("/offered-services", {
    preHandler: rbacMiddleware(["PROFESSIONAL", "COMPANY"]),
    schema: {
      tags: ["services"],
      body: { type: "object" },
      response: {
        201: { type: "object" },
        400: { type: "object" },
        404: { type: "object" },
        500: { type: "object" },
      },
    },
    handler: async (request, reply) => {
      try {
        const parsed = CreateOfferedServiceSchema.parse(request.body);
        const offeredService = await offeredServiceService.createOfferedService(
          parsed as any
        );
        return reply.status(201).send(offeredService);
      } catch (error) {
        if (error instanceof BadRequestError) {
          return reply.status(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: error.message,
          });
        }
        throw error;
      }
    },
  });

  // Obter serviço oferecido por ID
  app.get("/offered-services/:id", {
    preHandler: rbacMiddleware(["CLIENT", "PROFESSIONAL", "COMPANY", "ADMIN"]),
    schema: {
      tags: ["services"],
      params: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const { id } = ServiceIdParamsSchema.parse(request.params);
      try {
        const offeredService =
          await offeredServiceService.getOfferedServiceById(id);
        if (!offeredService) {
          throw new NotFoundError("Serviço oferecido não encontrado");
        }
        return reply.status(200).send(offeredService);
      } catch (error) {
        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            statusCode: 404,
            error: "Not Found",
            message: error.message,
          });
        }
        throw error;
      }
    },
  });

  // Atualizar serviço oferecido
  app.put("/offered-services/:id", {
    preHandler: rbacMiddleware(["PROFESSIONAL", "COMPANY", "ADMIN"]),
    schema: {
      tags: ["services"],
      params: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
      body: { type: "object" },
    },
    handler: async (request, reply) => {
      const { id } = ServiceIdParamsSchema.parse(request.params);
      try {
        const data = UpdateOfferedServiceSchema.parse(request.body ?? {});
        const updatedOfferedService =
          await offeredServiceService.updateOfferedService(id, data as any);
        return reply.status(200).send(updatedOfferedService);
      } catch (error) {
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
    },
  });

  // Deletar serviço oferecido
  app.delete("/offered-services/:id", {
    preHandler: rbacMiddleware(["PROFESSIONAL", "COMPANY", "ADMIN"]),
    schema: {
      tags: ["services"],
      params: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const { id } = ServiceIdParamsSchema.parse(request.params);
      try {
        await offeredServiceService.deleteOfferedService(id);
        return reply.status(204).send();
      } catch (error) {
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
    },
  });

  // Listar serviços oferecidos por profissional
  app.get("/offered-services/professional/:professionalId", {
    preHandler: rbacMiddleware(["CLIENT", "PROFESSIONAL", "COMPANY", "ADMIN"]),
    schema: {
      tags: ["services"],
      params: {
        type: "object",
        properties: { professionalId: { type: "string" } },
        required: ["professionalId"],
      },
    },
    handler: async (request, reply) => {
      const { professionalId } = ProfessionalIdParamsSchema.parse(
        request.params
      );
      try {
        const offeredServices =
          await offeredServiceService.getOfferedServicesByProfessional(
            professionalId
          );
        return reply.status(200).send(offeredServices);
      } catch (error) {
        if (error instanceof BadRequestError) {
          return reply.status(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: error.message,
          });
        }
        throw error;
      }
    },
  });

  // Listar serviços oferecidos por funcionário da empresa
  app.get("/offered-services/company-employee/:companyEmployeeId", {
    preHandler: rbacMiddleware(["CLIENT", "PROFESSIONAL", "COMPANY", "ADMIN"]),
    schema: {
      tags: ["services"],
      params: {
        type: "object",
        properties: { companyEmployeeId: { type: "string" } },
        required: ["companyEmployeeId"],
      },
    },
    handler: async (request, reply) => {
      const { companyEmployeeId } = CompanyEmployeeIdParamsSchema.parse(
        request.params
      );
      try {
        const offeredServices =
          await offeredServiceService.getOfferedServicesByCompanyEmployee(
            companyEmployeeId
          );
        return reply.status(200).send(offeredServices);
      } catch (error) {
        if (error instanceof BadRequestError) {
          return reply.status(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: error.message,
          });
        }
        throw error;
      }
    },
  });

  // Buscar serviços oferecidos
  app.get("/offered-services/search", {
    preHandler: rbacMiddleware(["CLIENT", "PROFESSIONAL", "COMPANY", "ADMIN"]),
    schema: {
      tags: ["services"],
      querystring: {
        type: "object",
        properties: {
          q: { type: "string" },
          category: { type: "string" },
          minPrice: { type: "string" },
          maxPrice: { type: "string" },
          page: { type: "string" },
          limit: { type: "string" },
        },
      },
    },
    handler: async (request, reply) => {
      const { q, category, minPrice, maxPrice, page, limit } =
        SearchQuerySchema.parse(request.query as any);
      try {
        const searchParams = {
          query: q,
          category,
          minPrice,
          maxPrice,
          page,
          limit,
        };
        const result = await offeredServiceService.searchOfferedServices(
          searchParams
        );
        return reply.status(200).send(result);
      } catch (error) {
        if (error instanceof BadRequestError) {
          return reply.status(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: error.message,
          });
        }
        throw error;
      }
    },
  });

  // Listar serviços por categoria
  app.get("/offered-services/category/:category", {
    preHandler: rbacMiddleware(["CLIENT", "PROFESSIONAL", "COMPANY", "ADMIN"]),
    schema: {
      tags: ["services"],
      params: {
        type: "object",
        properties: { category: { type: "string" } },
        required: ["category"],
      },
    },
    handler: async (request, reply) => {
      const { category } = CategoryParamSchema.parse(request.params);
      try {
        const offeredServices =
          await offeredServiceService.getOfferedServicesByCategory(category);
        return reply.status(200).send(offeredServices);
      } catch (error) {
        if (error instanceof BadRequestError) {
          return reply.status(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: error.message,
          });
        }
        throw error;
      }
    },
  });

  // Listar serviços por faixa de preço
  app.get("/offered-services/price-range", {
    preHandler: rbacMiddleware(["CLIENT", "PROFESSIONAL", "COMPANY", "ADMIN"]),
    schema: {
      tags: ["services"],
      querystring: {
        type: "object",
        properties: {
          minPrice: { type: "string" },
          maxPrice: { type: "string" },
        },
        required: ["minPrice", "maxPrice"],
      },
    },
    handler: async (request, reply) => {
      const qp = z
        .object({ minPrice: z.string(), maxPrice: z.string() })
        .parse(request.query as any);
      try {
        const offeredServices =
          await offeredServiceService.getOfferedServicesByPriceRange(
            parseFloat(qp.minPrice),
            parseFloat(qp.maxPrice)
          );
        return reply.status(200).send(offeredServices);
      } catch (error) {
        if (error instanceof BadRequestError) {
          return reply.status(400).send({
            statusCode: 400,
            error: "Bad Request",
            message: error.message,
          });
        }
        throw error;
      }
    },
  });

  // Toggle status do serviço (ativar/desativar)
  app.patch("/offered-services/:id/toggle-status", {
    preHandler: rbacMiddleware(["PROFESSIONAL", "COMPANY", "ADMIN"]),
    schema: {
      tags: ["services"],
      params: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const { id } = ServiceIdParamsSchema.parse(request.params);
      try {
        const updatedOfferedService =
          await offeredServiceService.toggleServiceStatus(id);
        return reply.status(200).send(updatedOfferedService);
      } catch (error) {
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
    },
  });
}
