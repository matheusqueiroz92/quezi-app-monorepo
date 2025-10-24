import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { ProfilesController } from "../controllers/professional-profiles.controller";
import { ProfessionalProfileService } from "../../application/services/professional-profile.service";
import { ProfessionalProfileRepository } from "../../infrastructure/repositories/professional-profile.repository";
import { authMiddleware } from "../../middlewares/auth.middleware";

export async function profilesRoutes(fastify: FastifyInstance) {
  const prisma = new PrismaClient();
  const profilesRepository = new ProfessionalProfileRepository(prisma);
  const profilesService = new ProfessionalProfileService(profilesRepository);
  const profilesController = new ProfilesController(profilesService);

  // ========================================
  // PUBLIC ROUTES
  // ========================================

  // GET /api/v1/profiles - Listar perfis com filtros
  fastify.get(
    "/",
    {
      schema: {
        tags: ["Professional Profiles"],
        summary: "Listar perfis profissionais",
        description: "Lista perfis com filtros avançados e paginação",
        querystring: {
          type: "object",
          properties: {
            page: { type: "string", default: "1" },
            limit: { type: "string", default: "10" },
            city: { type: "string", description: "Filtrar por cidade" },
            serviceMode: {
              type: "string",
              enum: ["AT_LOCATION", "AT_DOMICILE", "BOTH"],
            },
            minRating: { type: "string", description: "Rating mínimo (0-5)" },
            specialty: { type: "string", description: "Especialidade" },
            isActive: {
              type: "string",
              description: "Perfil ativo (true/false)",
            },
            isVerified: {
              type: "string",
              description: "Perfil verificado (true/false)",
            },
            sortBy: {
              type: "string",
              enum: ["rating", "experience", "reviews", "createdAt"],
              default: "rating",
            },
            sortOrder: {
              type: "string",
              enum: ["asc", "desc"],
              default: "desc",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "array", items: { type: "object" } },
              pagination: { type: "object" },
            },
          },
        },
      },
    },
    profilesController.getProfiles.bind(profilesController) as any
  );

  // GET /api/v1/profiles/search - Busca textual
  fastify.get(
    "/search",
    {
      schema: {
        tags: ["Professional Profiles"],
        summary: "Buscar perfis",
        description: "Busca textual em nome, bio e especialidades",
        querystring: {
          type: "object",
          required: ["query"],
          properties: {
            query: { type: "string", minLength: 2 },
            city: { type: "string" },
            serviceMode: {
              type: "string",
              enum: ["AT_LOCATION", "AT_DOMICILE", "BOTH"],
            },
            page: { type: "string", default: "1" },
            limit: { type: "string", default: "10" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "array", items: { type: "object" } },
              pagination: { type: "object" },
            },
          },
        },
      },
    },
    profilesController.searchProfiles.bind(profilesController) as any
  );

  // GET /api/v1/profiles/top-rated - Top perfis avaliados
  fastify.get(
    "/top-rated",
    {
      schema: {
        tags: ["Professional Profiles"],
        summary: "Perfis mais bem avaliados",
        description:
          "Retorna os perfis com melhor avaliação (mínimo 5 reviews)",
        querystring: {
          type: "object",
          properties: {
            limit: { type: "number", default: 10, minimum: 1, maximum: 50 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "array", items: { type: "object" } },
            },
          },
        },
      },
    },
    profilesController.getTopRated.bind(profilesController) as any
  );

  // GET /api/v1/profiles/:userId - Buscar perfil por ID
  fastify.get(
    "/:userId",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Professional Profiles"],
        summary: "Buscar perfil por ID",
        description: "Retorna um perfil profissional específico",
        params: {
          type: "object",
          required: ["userId"],
          properties: {
            userId: { type: "string", description: "ID do usuário" },
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
    profilesController.getProfile.bind(profilesController) as any
  );

  // ========================================
  // AUTHENTICATED ROUTES
  // ========================================

  // POST /api/v1/profiles - Criar perfil
  fastify.post(
    "/",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Professional Profiles"],
        summary: "Criar perfil profissional",
        description:
          "Cria um novo perfil profissional (apenas para PROFESSIONAL)",
        body: {
          type: "object",
          required: ["userId", "city", "serviceMode"],
          properties: {
            userId: { type: "string" },
            bio: { type: "string", maxLength: 1000 },
            city: { type: "string", minLength: 2 },
            address: { type: "string" },
            serviceMode: {
              type: "string",
              enum: ["AT_LOCATION", "AT_DOMICILE", "BOTH"],
            },
            photoUrl: { type: "string", format: "uri" },
            portfolioImages: {
              type: "array",
              items: { type: "string", format: "uri" },
              maxItems: 20,
            },
            workingHours: { type: "object" },
            yearsOfExperience: { type: "integer", minimum: 0, maximum: 70 },
            specialties: {
              type: "array",
              items: { type: "string" },
              maxItems: 20,
            },
            certifications: {
              type: "array",
              items: { type: "string" },
              maxItems: 15,
            },
            languages: {
              type: "array",
              items: { type: "string" },
              maxItems: 10,
            },
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
        },
      },
    },
    profilesController.createProfile.bind(profilesController) as any
  );

  // GET /api/v1/profiles/me - Meu perfil
  fastify.get(
    "/me",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Professional Profiles"],
        summary: "Meu perfil profissional",
        description: "Retorna o perfil do usuário autenticado",
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
    profilesController.getMyProfile.bind(profilesController) as any
  );

  // PUT /api/v1/profiles/:userId - Atualizar perfil
  fastify.put(
    "/:userId",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Professional Profiles"],
        summary: "Atualizar perfil",
        description: "Atualiza o perfil profissional (apenas próprio perfil)",
        params: {
          type: "object",
          required: ["userId"],
          properties: {
            userId: { type: "string" },
          },
        },
        body: {
          type: "object",
          properties: {
            bio: { type: "string", maxLength: 1000 },
            city: { type: "string", minLength: 2 },
            address: { type: "string" },
            serviceMode: {
              type: "string",
              enum: ["AT_LOCATION", "AT_DOMICILE", "BOTH"],
            },
            photoUrl: { type: "string", format: "uri" },
            portfolioImages: {
              type: "array",
              items: { type: "string", format: "uri" },
              maxItems: 20,
            },
            workingHours: { type: "object" },
            yearsOfExperience: { type: "integer", minimum: 0, maximum: 70 },
            specialties: {
              type: "array",
              items: { type: "string" },
              maxItems: 20,
            },
            certifications: {
              type: "array",
              items: { type: "string" },
              maxItems: 15,
            },
            languages: {
              type: "array",
              items: { type: "string" },
              maxItems: 10,
            },
            isActive: { type: "boolean" },
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
        },
      },
    },
    profilesController.updateProfile.bind(profilesController) as any
  );

  // PUT /api/v1/profiles/:userId/portfolio - Atualizar portfólio
  fastify.put(
    "/:userId/portfolio",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Professional Profiles"],
        summary: "Atualizar portfólio",
        description: "Atualiza as imagens do portfólio",
        params: {
          type: "object",
          required: ["userId"],
          properties: {
            userId: { type: "string" },
          },
        },
        body: {
          type: "object",
          required: ["portfolioImages"],
          properties: {
            portfolioImages: {
              type: "array",
              items: { type: "string", format: "uri" },
              minItems: 1,
              maxItems: 20,
            },
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
        },
      },
    },
    profilesController.updatePortfolio.bind(profilesController) as any
  );

  // PUT /api/v1/profiles/:userId/working-hours - Atualizar horários
  fastify.put(
    "/:userId/working-hours",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Professional Profiles"],
        summary: "Atualizar horários de trabalho",
        description: "Atualiza os horários de funcionamento",
        params: {
          type: "object",
          required: ["userId"],
          properties: {
            userId: { type: "string" },
          },
        },
        body: {
          type: "object",
          required: ["workingHours"],
          properties: {
            workingHours: { type: "object" },
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
        },
      },
    },
    profilesController.updateWorkingHours.bind(profilesController) as any
  );

  // PUT /api/v1/profiles/:userId/toggle-active - Ativar/desativar
  fastify.put(
    "/:userId/toggle-active",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Professional Profiles"],
        summary: "Ativar/desativar perfil",
        description: "Alterna o status ativo/inativo do perfil",
        params: {
          type: "object",
          required: ["userId"],
          properties: {
            userId: { type: "string" },
          },
        },
        body: {
          type: "object",
          required: ["isActive"],
          properties: {
            isActive: { type: "boolean" },
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
        },
      },
    },
    profilesController.toggleActive.bind(profilesController) as any
  );

  // DELETE /api/v1/profiles/:userId - Deletar perfil
  fastify.delete(
    "/:userId",
    {
      preHandler: [authMiddleware],
      schema: {
        tags: ["Professional Profiles"],
        summary: "Deletar perfil",
        description: "Deleta o perfil profissional (apenas próprio perfil)",
        params: {
          type: "object",
          required: ["userId"],
          properties: {
            userId: { type: "string" },
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
        },
      },
    },
    profilesController.deleteProfile.bind(profilesController) as any
  );
}
