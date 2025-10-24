import { FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "../../utils/app-error";
import { ProfessionalProfileService } from "../../application/services/professional-profile.service";
import {
  CreateProfileInputSchema,
  UpdateProfileInputSchema,
  GetProfilesQuerySchema,
  SearchProfilesQuerySchema,
  ProfileParamsSchema,
  UpdatePortfolioSchema,
  UpdateWorkingHoursSchema,
  ToggleActiveSchema,
} from "../schemas/professional-profiles.schema";

export class ProfilesController {
  constructor(private profilesService: ProfessionalProfileService) {}

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  async createProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = CreateProfileInputSchema.parse(request.body);
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const profile = await this.profilesService.createProfile(data, userId);

      return reply.status(201).send({
        success: true,
        data: profile,
        message: "Perfil profissional criado com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = ProfileParamsSchema.parse(request.params);
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const profile = await this.profilesService.getProfile(params, userId);

      return reply.status(200).send({
        success: true,
        data: profile,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async getProfiles(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = GetProfilesQuerySchema.parse(request.query);

      const result = await this.profilesService.getProfiles(query);

      return reply.status(200).send({
        success: true,
        data: result.profiles,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async searchProfiles(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = SearchProfilesQuerySchema.parse(request.query);

      const result = await this.profilesService.searchProfiles(query);

      return reply.status(200).send({
        success: true,
        data: result.profiles,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = ProfileParamsSchema.parse(request.params);
      const data = UpdateProfileInputSchema.parse(request.body);
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const profile = await this.profilesService.updateProfile(
        params,
        data,
        userId
      );

      return reply.status(200).send({
        success: true,
        data: profile,
        message: "Perfil atualizado com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async deleteProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = ProfileParamsSchema.parse(request.params);
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      await this.profilesService.deleteProfile(params, userId);

      return reply.status(200).send({
        success: true,
        message: "Perfil deletado com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  // ========================================
  // SPECIFIC OPERATIONS
  // ========================================

  async updatePortfolio(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = ProfileParamsSchema.parse(request.params);
      const data = UpdatePortfolioSchema.parse(request.body);
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const profile = await this.profilesService.updatePortfolio(
        params,
        data,
        userId
      );

      return reply.status(200).send({
        success: true,
        data: profile,
        message: "Portfólio atualizado com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async updateWorkingHours(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = ProfileParamsSchema.parse(request.params);
      const data = UpdateWorkingHoursSchema.parse(request.body);
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const profile = await this.profilesService.updateWorkingHours(
        params,
        data,
        userId
      );

      return reply.status(200).send({
        success: true,
        data: profile,
        message: "Horários atualizados com sucesso",
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async toggleActive(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = ProfileParamsSchema.parse(request.params);
      const data = ToggleActiveSchema.parse(request.body);
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const profile = await this.profilesService.toggleActive(
        params,
        data,
        userId
      );

      return reply.status(200).send({
        success: true,
        data: profile,
        message: `Perfil ${
          data.isActive ? "ativado" : "desativado"
        } com sucesso`,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async getTopRated(request: FastifyRequest, reply: FastifyReply) {
    try {
      const limit = (request.query as any).limit
        ? parseInt((request.query as any).limit)
        : 10;

      const profiles = await this.profilesService.getTopRated(limit);

      return reply.status(200).send({
        success: true,
        data: profiles,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async getMyProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new AppError("Usuário não autenticado", 401);
      }

      const profile = await this.profilesService.getMyProfile(userId);

      return reply.status(200).send({
        success: true,
        data: profile,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }
}
