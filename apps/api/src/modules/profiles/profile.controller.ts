/**
 * Controller de Perfis - Camada de Apresentação
 *
 * Gerencia perfis específicos (Cliente, Profissional, Empresa)
 * Seguindo os princípios SOLID e Clean Architecture
 */

import {
  type FastifyInstance,
  type FastifyRequest,
  type FastifyReply,
} from "fastify";
import { ProfileService } from "./profile.service";
import { authMiddleware } from "../../middlewares/auth.middleware";

/**
 * Controller para gerenciar perfis específicos
 */
export class ProfileController {
  private profileService: ProfileService;

  constructor() {
    this.profileService = new ProfileService();
  }

  /**
   * Registra todas as rotas de perfis
   */
  async registerRoutes(app: FastifyInstance): Promise<void> {
    // ========================================
    // ROTAS DE PERFIL DE CLIENTE
    // ========================================

    // POST /api/v1/profiles/client - Criar perfil de cliente
    app.post(
      "/client",
      {
        preHandler: [authMiddleware],
        schema: {
          tags: ["profiles"],
          description: "Cria perfil de cliente (requer autenticação)",
          body: {
            type: "object",
            required: ["cpf"],
            properties: {
              cpf: { type: "string", pattern: "^\\d{11}$" },
              addresses: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    street: { type: "string" },
                    number: { type: "string" },
                    complement: { type: "string" },
                    neighborhood: { type: "string" },
                    city: { type: "string" },
                    state: { type: "string" },
                    zipCode: { type: "string" },
                    isDefault: { type: "boolean", default: false },
                  },
                },
              },
              paymentMethods: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: [
                        "CREDIT_CARD",
                        "DEBIT_CARD",
                        "PIX",
                        "BANK_TRANSFER",
                      ],
                    },
                    name: { type: "string" },
                    isDefault: { type: "boolean", default: false },
                    details: { type: "object" },
                  },
                },
              },
              preferences: {
                type: "object",
                properties: {
                  notifications: {
                    type: "object",
                    properties: {
                      email: { type: "boolean", default: true },
                      sms: { type: "boolean", default: false },
                      push: { type: "boolean", default: true },
                    },
                  },
                  marketing: { type: "boolean", default: false },
                  language: { type: "string", default: "pt-BR" },
                  timezone: { type: "string", default: "America/Sao_Paulo" },
                },
              },
            },
          },
          response: {
            201: {
              type: "object",
              properties: {
                userId: { type: "string" },
                cpf: { type: "string" },
                addresses: { type: "array" },
                paymentMethods: { type: "array" },
                preferences: { type: "object" },
                createdAt: { type: "string" },
                updatedAt: { type: "string" },
              },
            },
          },
        },
      },
      this.createClientProfile.bind(this)
    );

    // ========================================
    // ROTAS DE PERFIL DE PROFISSIONAL
    // ========================================

    // POST /api/v1/profiles/professional - Criar perfil de profissional
    app.post(
      "/professional",
      {
        preHandler: [authMiddleware],
        schema: {
          tags: ["profiles"],
          description: "Cria perfil de profissional (requer autenticação)",
          body: {
            type: "object",
            required: ["address", "city", "serviceMode"],
            properties: {
              cpf: { type: "string", pattern: "^\\d{11}$" },
              cnpj: { type: "string", pattern: "^\\d{14}$" },
              address: { type: "string", minLength: 5 },
              city: { type: "string", minLength: 2 },
              serviceMode: {
                type: "string",
                enum: ["AT_LOCATION", "AT_DOMICILE", "BOTH"],
              },
              specialties: {
                type: "array",
                items: { type: "string" },
              },
              workingHours: {
                type: "object",
                properties: {
                  monday: {
                    type: "object",
                    properties: {
                      isAvailable: { type: "boolean" },
                      start: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                      end: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                    },
                  },
                  tuesday: {
                    type: "object",
                    properties: {
                      isAvailable: { type: "boolean" },
                      start: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                      end: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                    },
                  },
                  wednesday: {
                    type: "object",
                    properties: {
                      isAvailable: { type: "boolean" },
                      start: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                      end: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                    },
                  },
                  thursday: {
                    type: "object",
                    properties: {
                      isAvailable: { type: "boolean" },
                      start: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                      end: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                    },
                  },
                  friday: {
                    type: "object",
                    properties: {
                      isAvailable: { type: "boolean" },
                      start: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                      end: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                    },
                  },
                  saturday: {
                    type: "object",
                    properties: {
                      isAvailable: { type: "boolean" },
                      start: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                      end: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                    },
                  },
                  sunday: {
                    type: "object",
                    properties: {
                      isAvailable: { type: "boolean" },
                      start: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                      end: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                    },
                  },
                },
              },
              certifications: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    institution: { type: "string" },
                    date: { type: "string", format: "date" },
                    documentUrl: { type: "string", format: "uri" },
                    isVerified: { type: "boolean", default: false },
                  },
                },
              },
              portfolio: {
                type: "array",
                items: { type: "string", format: "uri" },
              },
            },
          },
          response: {
            201: {
              type: "object",
              properties: {
                userId: { type: "string" },
                cpf: { type: "string" },
                cnpj: { type: "string" },
                address: { type: "string" },
                city: { type: "string" },
                serviceMode: { type: "string" },
                specialties: { type: "array" },
                workingHours: { type: "object" },
                certifications: { type: "array" },
                portfolio: { type: "array" },
                isActive: { type: "boolean" },
                isVerified: { type: "boolean" },
                createdAt: { type: "string" },
                updatedAt: { type: "string" },
              },
            },
          },
        },
      },
      this.createProfessionalProfile.bind(this)
    );

    // ========================================
    // ROTAS DE PERFIL DE EMPRESA
    // ========================================

    // POST /api/v1/profiles/company - Criar perfil de empresa
    app.post(
      "/company",
      {
        preHandler: [authMiddleware],
        schema: {
          tags: ["profiles"],
          description: "Cria perfil de empresa (requer autenticação)",
          body: {
            type: "object",
            required: ["cnpj", "address", "city"],
            properties: {
              cnpj: { type: "string", pattern: "^\\d{14}$" },
              address: { type: "string", minLength: 5 },
              city: { type: "string", minLength: 2 },
              businessHours: {
                type: "object",
                properties: {
                  monday: {
                    type: "object",
                    properties: {
                      isOpen: { type: "boolean" },
                      start: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                      end: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                    },
                  },
                  tuesday: {
                    type: "object",
                    properties: {
                      isOpen: { type: "boolean" },
                      start: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                      end: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                    },
                  },
                  wednesday: {
                    type: "object",
                    properties: {
                      isOpen: { type: "boolean" },
                      start: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                      end: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                    },
                  },
                  thursday: {
                    type: "object",
                    properties: {
                      isOpen: { type: "boolean" },
                      start: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                      end: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                    },
                  },
                  friday: {
                    type: "object",
                    properties: {
                      isOpen: { type: "boolean" },
                      start: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                      end: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                    },
                  },
                  saturday: {
                    type: "object",
                    properties: {
                      isOpen: { type: "boolean" },
                      start: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                      end: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                    },
                  },
                  sunday: {
                    type: "object",
                    properties: {
                      isOpen: { type: "boolean" },
                      start: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                      end: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
                    },
                  },
                },
              },
              description: { type: "string", maxLength: 1000 },
              photos: {
                type: "array",
                items: { type: "string", format: "uri" },
              },
            },
          },
          response: {
            201: {
              type: "object",
              properties: {
                userId: { type: "string" },
                cnpj: { type: "string" },
                address: { type: "string" },
                city: { type: "string" },
                businessHours: { type: "object" },
                description: { type: "string" },
                photos: { type: "array" },
                isActive: { type: "boolean" },
                isVerified: { type: "boolean" },
                createdAt: { type: "string" },
                updatedAt: { type: "string" },
              },
            },
          },
        },
      },
      this.createCompanyProfile.bind(this)
    );

    // ========================================
    // ROTAS DE BUSCA DE PERFIS
    // ========================================

    // GET /api/v1/profiles/client/:userId - Buscar perfil de cliente
    app.get(
      "/client/:userId",
      {
        preHandler: [authMiddleware],
        schema: {
          tags: ["profiles"],
          description: "Busca perfil de cliente (requer autenticação)",
          params: {
            type: "object",
            properties: {
              userId: { type: "string" },
            },
          },
        },
      },
      this.getClientProfile.bind(this)
    );

    // GET /api/v1/profiles/professional/:userId - Buscar perfil de profissional
    app.get(
      "/professional/:userId",
      {
        preHandler: [authMiddleware],
        schema: {
          tags: ["profiles"],
          description: "Busca perfil de profissional (requer autenticação)",
          params: {
            type: "object",
            properties: {
              userId: { type: "string" },
            },
          },
        },
      },
      this.getProfessionalProfile.bind(this)
    );

    // GET /api/v1/profiles/company/:userId - Buscar perfil de empresa
    app.get(
      "/company/:userId",
      {
        preHandler: [authMiddleware],
        schema: {
          tags: ["profiles"],
          description: "Busca perfil de empresa (requer autenticação)",
          params: {
            type: "object",
            properties: {
              userId: { type: "string" },
            },
          },
        },
      },
      this.getCompanyProfile.bind(this)
    );
  }

  // ========================================
  // HANDLERS
  // ========================================

  private async createClientProfile(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userId = (request as any).user?.id;
      if (!userId) {
        return reply.status(401).send({ error: "Não autenticado" });
      }

      const profileData = request.body as any;
      const profile = await this.profileService.createClientProfile(
        userId,
        profileData
      );

      reply.status(201).send(profile);
    } catch (error: any) {
      reply.status(400).send({ error: error.message });
    }
  }

  private async createProfessionalProfile(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userId = (request as any).user?.id;
      if (!userId) {
        return reply.status(401).send({ error: "Não autenticado" });
      }

      const profileData = request.body as any;
      const profile = await this.profileService.createProfessionalProfile(
        userId,
        profileData
      );

      reply.status(201).send(profile);
    } catch (error: any) {
      reply.status(400).send({ error: error.message });
    }
  }

  private async createCompanyProfile(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userId = (request as any).user?.id;
      if (!userId) {
        return reply.status(401).send({ error: "Não autenticado" });
      }

      const profileData = request.body as any;
      const profile = await this.profileService.createCompanyProfile(
        userId,
        profileData
      );

      reply.status(201).send(profile);
    } catch (error: any) {
      reply.status(400).send({ error: error.message });
    }
  }

  private async getClientProfile(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { userId } = request.params as { userId: string };
      const profile = await this.profileService.getClientProfile(userId);

      reply.status(200).send(profile);
    } catch (error: any) {
      reply.status(404).send({ error: error.message });
    }
  }

  private async getProfessionalProfile(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { userId } = request.params as { userId: string };
      const profile = await this.profileService.getProfessionalProfile(userId);

      reply.status(200).send(profile);
    } catch (error: any) {
      reply.status(404).send({ error: error.message });
    }
  }

  private async getCompanyProfile(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { userId } = request.params as { userId: string };
      const profile = await this.profileService.getCompanyProfile(userId);

      reply.status(200).send(profile);
    } catch (error: any) {
      reply.status(404).send({ error: error.message });
    }
  }
}
