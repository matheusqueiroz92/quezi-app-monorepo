import { FastifyInstance } from "fastify";
import { ProfessionalProfileService } from "../../application/services/professional-profile.service";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { rbacMiddleware } from "../../middlewares/rbac.middleware";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../../utils/app-error";

export async function professionalProfileRoutes(
  app: FastifyInstance
): Promise<void> {
  const professionalProfileService = new ProfessionalProfileService();

  app.addHook("preHandler", authMiddleware);

  // Criar perfil de profissional
  app.post("/professional-profiles", {
    preHandler: rbacMiddleware(["PROFESSIONAL"]),
    handler: async (request, reply) => {
      try {
        const profile = await professionalProfileService.createProfile(
          request.user!.id,
          request.body as any
        );
        return reply.status(201).send(profile);
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

  // Obter perfil de profissional por ID do usuário
  app.get("/professional-profiles/me", {
    preHandler: rbacMiddleware(["PROFESSIONAL"]),
    handler: async (request, reply) => {
      try {
        const profile = await professionalProfileService.getProfileByUserId(
          request.user!.id
        );
        if (!profile) {
          throw new NotFoundError("Perfil de profissional não encontrado");
        }
        return reply.status(200).send(profile);
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

  // Obter perfil de profissional por ID do usuário (para outros usuários)
  app.get("/professional-profiles/user/:userId", {
    preHandler: rbacMiddleware(["CLIENT", "PROFESSIONAL", "COMPANY", "ADMIN"]),
    handler: async (request, reply) => {
      const { userId } = request.params as { userId: string };
      try {
        const profile = await professionalProfileService.getProfileByUserId(
          userId
        );
        if (!profile) {
          throw new NotFoundError("Perfil de profissional não encontrado");
        }
        return reply.status(200).send(profile);
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

  // Atualizar perfil de profissional
  app.put("/professional-profiles/me", {
    preHandler: rbacMiddleware(["PROFESSIONAL"]),
    handler: async (request, reply) => {
      try {
        const updatedProfile = await professionalProfileService.updateProfile(
          request.user!.id,
          request.body as any
        );
        return reply.status(200).send(updatedProfile);
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

  // Atualizar perfil de profissional por ID do usuário (admin)
  app.put("/professional-profiles/user/:userId", {
    preHandler: rbacMiddleware(["ADMIN"]),
    handler: async (request, reply) => {
      const { userId } = request.params as { userId: string };
      try {
        const updatedProfile = await professionalProfileService.updateProfile(
          userId,
          request.body as any
        );
        return reply.status(200).send(updatedProfile);
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

  // Deletar perfil de profissional
  app.delete("/professional-profiles/me", {
    preHandler: rbacMiddleware(["PROFESSIONAL"]),
    handler: async (request, reply) => {
      try {
        await professionalProfileService.deleteProfile(request.user!.id);
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

  // Deletar perfil de profissional por ID do usuário (admin)
  app.delete("/professional-profiles/user/:userId", {
    preHandler: rbacMiddleware(["ADMIN"]),
    handler: async (request, reply) => {
      const { userId } = request.params as { userId: string };
      try {
        await professionalProfileService.deleteProfile(userId);
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
