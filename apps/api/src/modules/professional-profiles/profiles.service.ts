import { AppError } from "../../utils/app-error";
import { ProfilesRepository } from "./profiles.repository";
import {
  CreateProfileInput,
  UpdateProfileInput,
  GetProfilesQuery,
  SearchProfilesQuery,
  ProfileParams,
  UpdatePortfolio,
  UpdateWorkingHoursInput,
  ToggleActive,
} from "./profiles.schema";

export class ProfilesService {
  constructor(private profilesRepository: ProfilesRepository) {}

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  async createProfile(data: CreateProfileInput, userId: string) {
    try {
      // Validar que o usuário autenticado está criando seu próprio perfil
      if (data.userId !== userId) {
        throw new AppError(
          "Você só pode criar perfil para sua própria conta",
          403
        );
      }

      const profile = await this.profilesRepository.create(data);

      return profile;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao criar perfil profissional", 500);
    }
  }

  async getProfile(params: ProfileParams, userId: string) {
    try {
      const profile = await this.profilesRepository.findById(params.userId);

      // Perfis inativos só podem ser vistos pelo próprio profissional
      if (!profile.isActive && profile.userId !== userId) {
        throw new AppError("Perfil não está ativo", 404);
      }

      return profile;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar perfil profissional", 500);
    }
  }

  async getProfiles(query: GetProfilesQuery) {
    try {
      const result = await this.profilesRepository.findMany(query);
      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar perfis profissionais", 500);
    }
  }

  async searchProfiles(query: SearchProfilesQuery) {
    try {
      const result = await this.profilesRepository.search(query);
      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar perfis profissionais", 500);
    }
  }

  async updateProfile(
    params: ProfileParams,
    data: UpdateProfileInput,
    userId: string
  ) {
    try {
      // Validar que o usuário autenticado está atualizando seu próprio perfil
      if (params.userId !== userId) {
        throw new AppError(
          "Você só pode atualizar seu próprio perfil",
          403
        );
      }

      const updatedProfile = await this.profilesRepository.update(
        params.userId,
        data
      );

      return updatedProfile;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar perfil profissional", 500);
    }
  }

  async deleteProfile(params: ProfileParams, userId: string) {
    try {
      // Validar que o usuário autenticado está deletando seu próprio perfil
      if (params.userId !== userId) {
        throw new AppError(
          "Você só pode deletar seu próprio perfil",
          403
        );
      }

      const result = await this.profilesRepository.delete(params.userId);

      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao deletar perfil profissional", 500);
    }
  }

  // ========================================
  // SPECIFIC OPERATIONS
  // ========================================

  async updatePortfolio(
    params: ProfileParams,
    data: UpdatePortfolio,
    userId: string
  ) {
    try {
      // Validar propriedade do perfil
      if (params.userId !== userId) {
        throw new AppError(
          "Você só pode atualizar seu próprio portfólio",
          403
        );
      }

      const updatedProfile = await this.profilesRepository.updatePortfolio(
        params.userId,
        data.portfolioImages
      );

      return updatedProfile;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar portfólio", 500);
    }
  }

  async updateWorkingHours(
    params: ProfileParams,
    data: UpdateWorkingHoursInput,
    userId: string
  ) {
    try {
      // Validar propriedade do perfil
      if (params.userId !== userId) {
        throw new AppError(
          "Você só pode atualizar seus próprios horários",
          403
        );
      }

      const updatedProfile = await this.profilesRepository.updateWorkingHours(
        params.userId,
        data.workingHours
      );

      return updatedProfile;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar horários de trabalho", 500);
    }
  }

  async toggleActive(
    params: ProfileParams,
    data: ToggleActive,
    userId: string
  ) {
    try {
      // Validar propriedade do perfil
      if (params.userId !== userId) {
        throw new AppError(
          "Você só pode alterar status do seu próprio perfil",
          403
        );
      }

      const updatedProfile = await this.profilesRepository.toggleActive(
        params.userId,
        data.isActive
      );

      return updatedProfile;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao alterar status do perfil", 500);
    }
  }

  async getTopRated(limit: number = 10) {
    try {
      const profiles = await this.profilesRepository.getTopRated(limit);
      return profiles;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar perfis mais bem avaliados", 500);
    }
  }

  async getMyProfile(userId: string) {
    try {
      const profile = await this.profilesRepository.findById(userId);
      return profile;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar seu perfil", 500);
    }
  }
}

