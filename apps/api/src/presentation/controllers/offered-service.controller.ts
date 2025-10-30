import { FastifyInstance } from "fastify";
import { OfferedServiceService } from "../../application/services/offered-service.service";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { rbacMiddleware } from "../../middlewares/rbac.middleware";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../../utils/app-error";

export async function offeredServiceRoutes(
  app: FastifyInstance
): Promise<void> {
  const offeredServiceService = new OfferedServiceService();

  app.addHook("preHandler", authMiddleware);

  // Criar serviço oferecido
  app.post("/offered-services", {
    preHandler: rbacMiddleware(["PROFESSIONAL", "COMPANY"]),
    handler: async (request, reply) => {
      try {
        const offeredService = await offeredServiceService.createOfferedService(
          request.body as any
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
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
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
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        const updatedOfferedService =
          await offeredServiceService.updateOfferedService(
            id,
            request.body as any
          );
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
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
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
    handler: async (request, reply) => {
      const { professionalId } = request.params as { professionalId: string };
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
    handler: async (request, reply) => {
      const { companyEmployeeId } = request.params as {
        companyEmployeeId: string;
      };
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
    handler: async (request, reply) => {
      const {
        q,
        category,
        minPrice,
        maxPrice,
        page = "1",
        limit = "10",
      } = request.query as any;
      try {
        const searchParams = {
          query: q,
          category,
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          page: parseInt(page),
          limit: parseInt(limit),
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
    handler: async (request, reply) => {
      const { category } = request.params as { category: string };
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
    handler: async (request, reply) => {
      const { minPrice, maxPrice } = request.query as any;
      try {
        const offeredServices =
          await offeredServiceService.getOfferedServicesByPriceRange(
            parseFloat(minPrice),
            parseFloat(maxPrice)
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
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
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
