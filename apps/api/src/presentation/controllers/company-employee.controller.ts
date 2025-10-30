import { FastifyInstance } from "fastify";
import { CompanyEmployeeService } from "../../application/services/company-employee.service";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { rbacMiddleware } from "../../middlewares/rbac.middleware";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../../utils/app-error";

export async function companyEmployeeRoutes(
  app: FastifyInstance
): Promise<void> {
  const companyEmployeeService = new CompanyEmployeeService();

  app.addHook("preHandler", authMiddleware);

  // Criar funcionário da empresa
  app.post("/company-employees", {
    preHandler: rbacMiddleware(["COMPANY", "ADMIN"]),
    handler: async (request, reply) => {
      try {
        const employee = await companyEmployeeService.createEmployee(
          request.user!.id, // companyId
          request.body as any
        );
        return reply.status(201).send(employee);
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

  // Obter funcionário por ID
  app.get("/company-employees/:id", {
    preHandler: rbacMiddleware(["CLIENT", "PROFESSIONAL", "COMPANY", "ADMIN"]),
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        const employee = await companyEmployeeService.getEmployeeById(id);
        if (!employee) {
          throw new NotFoundError("Funcionário não encontrado");
        }
        return reply.status(200).send(employee);
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

  // Listar funcionários da empresa
  app.get("/company-employees/company/:companyId", {
    preHandler: rbacMiddleware(["CLIENT", "PROFESSIONAL", "COMPANY", "ADMIN"]),
    handler: async (request, reply) => {
      const { companyId } = request.params as { companyId: string };
      try {
        const employees = await companyEmployeeService.getEmployeesByCompanyId(
          companyId
        );
        return reply.status(200).send(employees);
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

  // Listar funcionários da empresa atual (para empresas)
  app.get("/company-employees/my-company", {
    preHandler: rbacMiddleware(["COMPANY"]),
    handler: async (request, reply) => {
      try {
        const employees = await companyEmployeeService.getEmployeesByCompanyId(
          request.user!.id
        );
        return reply.status(200).send(employees);
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

  // Atualizar funcionário
  app.put("/company-employees/:id", {
    preHandler: rbacMiddleware(["COMPANY", "ADMIN"]),
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        const updatedEmployee = await companyEmployeeService.updateEmployee(
          id,
          request.body as any
        );
        return reply.status(200).send(updatedEmployee);
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

  // Deletar funcionário
  app.delete("/company-employees/:id", {
    preHandler: rbacMiddleware(["COMPANY", "ADMIN"]),
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        await companyEmployeeService.deleteEmployee(id);
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
}
