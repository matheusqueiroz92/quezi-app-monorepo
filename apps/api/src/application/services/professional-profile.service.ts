/**
 * Serviço de Perfil de Profissional - Camada de Aplicação
 *
 * Implementação seguindo Clean Architecture e TDD
 */

import {
  ProfessionalProfileRepository,
  CreateProfessionalProfileData,
  UpdateProfessionalProfileData,
  ProfessionalProfileFilters,
} from "../../infrastructure/repositories/professional-profile.repository";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { NotFoundError, BadRequestError } from "../../utils/app-error";
import { prisma } from "../../lib/prisma";

export class ProfessionalProfileService {
  constructor(
    private professionalProfileRepository = new ProfessionalProfileRepository(
      prisma
    ),
    private userRepository = new UserRepository(prisma)
  ) {}

  /**
   * Cria perfil de profissional
   */
  async createProfile(
    userId: string,
    data: Omit<CreateProfessionalProfileData, "userId">
  ) {
    // Verificar se usuário existe e é do tipo PROFESSIONAL
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("Usuário não encontrado");
    }

    if (user.userType !== "PROFESSIONAL") {
      throw new BadRequestError(
        "Apenas usuários do tipo PROFESSIONAL podem ter perfil de profissional"
      );
    }

    // Verificar se já existe perfil
    const existingProfile =
      await this.professionalProfileRepository.findByUserId(userId);
    if (existingProfile) {
      throw new BadRequestError("Usuário já possui perfil de profissional");
    }

    // Validar dados obrigatórios
    if (!data.city) {
      throw new BadRequestError("Cidade é obrigatória");
    }

    if (!data.serviceMode) {
      throw new BadRequestError("Modo de serviço é obrigatório");
    }

    // Criar perfil
    const profile = await this.professionalProfileRepository.create({
      userId,
      ...data,
    });

    return profile;
  }

  /**
   * Obtém perfil de profissional
   */
  async getProfileByUserId(userId: string) {
    const profile = await this.professionalProfileRepository.findByUserId(
      userId
    );
    if (!profile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }

    return profile;
  }

  /**
   * Atualiza perfil de profissional
   */
  async updateProfile(userId: string, data: UpdateProfessionalProfileData) {
    // Verificar se perfil existe
    const existingProfile =
      await this.professionalProfileRepository.findByUserId(userId);
    if (!existingProfile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }

    // Atualizar perfil
    const profile = await this.professionalProfileRepository.updateByUserId(
      userId,
      data
    );
    return profile;
  }

  /**
   * Deleta perfil de profissional
   */
  async deleteProfile(userId: string) {
    // Verificar se perfil existe
    const existingProfile =
      await this.professionalProfileRepository.findByUserId(userId);
    if (!existingProfile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }

    // Deletar perfil
    await this.professionalProfileRepository.deleteByUserId(userId);
  }

  /**
   * Lista perfis com filtros
   */
  async listProfiles(
    filters: ProfessionalProfileFilters & { skip?: number; take?: number }
  ) {
    return await this.professionalProfileRepository.findMany(filters);
  }

  /**
   * Busca perfis por cidade
   */
  async getProfilesByCity(city: string) {
    if (!city || city.trim().length === 0) {
      throw new BadRequestError("Cidade é obrigatória");
    }

    return await this.professionalProfileRepository.findByCity(city);
  }

  /**
   * Busca perfis por especialidade
   */
  async getProfilesBySpecialty(specialty: string) {
    if (!specialty || specialty.trim().length === 0) {
      throw new BadRequestError("Especialidade é obrigatória");
    }

    return await this.professionalProfileRepository.findBySpecialty(specialty);
  }

  /**
   * Adiciona especialidade ao perfil
   */
  async addSpecialty(userId: string, specialty: string) {
    if (!specialty || specialty.trim().length === 0) {
      throw new BadRequestError("Especialidade é obrigatória");
    }

    const profile = await this.professionalProfileRepository.findByUserId(
      userId
    );
    if (!profile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }

    if (profile.specialties.includes(specialty)) {
      throw new BadRequestError("Especialidade já existe no perfil");
    }

    const updatedSpecialties = [...profile.specialties, specialty];

    return await this.professionalProfileRepository.updateByUserId(userId, {
      specialties: updatedSpecialties,
    });
  }

  /**
   * Remove especialidade do perfil
   */
  async removeSpecialty(userId: string, specialty: string) {
    if (!specialty || specialty.trim().length === 0) {
      throw new BadRequestError("Especialidade é obrigatória");
    }

    const profile = await this.professionalProfileRepository.findByUserId(
      userId
    );
    if (!profile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }

    if (!profile.specialties.includes(specialty)) {
      throw new BadRequestError("Especialidade não existe no perfil");
    }

    const updatedSpecialties = profile.specialties.filter(
      (s) => s !== specialty
    );

    return await this.professionalProfileRepository.updateByUserId(userId, {
      specialties: updatedSpecialties,
    });
  }

  /**
   * Adiciona certificação ao perfil
   */
  async addCertification(userId: string, certification: string) {
    if (!certification || certification.trim().length === 0) {
      throw new BadRequestError("Certificação é obrigatória");
    }

    const profile = await this.professionalProfileRepository.findByUserId(
      userId
    );
    if (!profile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }

    if (profile.certifications.includes(certification)) {
      throw new BadRequestError("Certificação já existe no perfil");
    }

    const updatedCertifications = [...profile.certifications, certification];

    return await this.professionalProfileRepository.updateByUserId(userId, {
      certifications: updatedCertifications,
    });
  }

  /**
   * Remove certificação do perfil
   */
  async removeCertification(userId: string, certification: string) {
    if (!certification || certification.trim().length === 0) {
      throw new BadRequestError("Certificação é obrigatória");
    }

    const profile = await this.professionalProfileRepository.findByUserId(
      userId
    );
    if (!profile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }

    if (!profile.certifications.includes(certification)) {
      throw new BadRequestError("Certificação não existe no perfil");
    }

    const updatedCertifications = profile.certifications.filter(
      (c) => c !== certification
    );

    return await this.professionalProfileRepository.updateByUserId(userId, {
      certifications: updatedCertifications,
    });
  }

  /**
   * Atualiza rating do profissional
   */
  async updateRating(userId: string, rating: number) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestError("Rating deve estar entre 1 e 5");
    }

    const profile = await this.professionalProfileRepository.findByUserId(
      userId
    );
    if (!profile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }

    return await this.professionalProfileRepository.updateRating(
      userId,
      rating
    );
  }

  /**
   * Ativa/desativa perfil
   */
  async toggleActive(userId: string) {
    const profile = await this.professionalProfileRepository.findByUserId(
      userId
    );
    if (!profile) {
      throw new NotFoundError("Perfil de profissional não encontrado");
    }

    return await this.professionalProfileRepository.updateByUserId(userId, {
      isActive: !profile.isActive,
    });
  }
}
