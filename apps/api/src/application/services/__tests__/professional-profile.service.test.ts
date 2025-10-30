/**
 * ProfessionalProfileService Tests
 *
 * Testes unitários para o serviço de perfis profissionais
 */

import { ProfessionalProfileService } from "../professional-profile.service";
import { ProfessionalProfileRepository } from "../../../infrastructure/repositories/professional-profile.repository";
import { UserRepository } from "../../../infrastructure/repositories/user.repository";
import { NotFoundError, BadRequestError } from "../../../utils/app-error";

// Mock dos repositórios
const mockProfessionalProfileRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
  updateByUserId: jest.fn(),
  delete: jest.fn(),
  deleteByUserId: jest.fn(),
  findMany: jest.fn(),
  updateRating: jest.fn(),
};

const mockUserRepository = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findMany: jest.fn(),
  exists: jest.fn(),
};

describe("ProfessionalProfileService", () => {
  let service: ProfessionalProfileService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProfessionalProfileService(
      mockProfessionalProfileRepository as any,
      mockUserRepository as any
    );
  });

  describe("createProfile", () => {
    it("deve criar perfil profissional com sucesso", async () => {
      // Arrange
      const userId = "user-123";
      const profileData = {
        city: "São Paulo",
        serviceMode: "LOCAL_PROPRIO",
        specialties: ["Corte", "Barba"],
        certifications: ["Certificação 1"],
        bio: "Profissional experiente",
        averageRating: 0,
        isActive: true,
      };

      const mockUser = {
        id: userId,
        userType: "PROFESSIONAL",
        name: "João Silva",
      };

      const mockProfile = {
        id: "profile-123",
        userId,
        ...profileData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockProfessionalProfileRepository.findByUserId.mockResolvedValue(null);
      mockProfessionalProfileRepository.create.mockResolvedValue(mockProfile);

      // Act
      const result = await service.createProfile(userId, profileData);

      // Assert
      expect(result).toEqual(mockProfile);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockProfessionalProfileRepository.create).toHaveBeenCalledWith({
        userId,
        ...profileData,
      });
    });

    it("deve lançar erro quando usuário não for encontrado", async () => {
      // Arrange
      const userId = "user-123";
      const profileData = {
        city: "São Paulo",
        serviceMode: "LOCAL_PROPRIO",
      };

      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.createProfile(userId, profileData)).rejects.toThrow(
        NotFoundError
      );
    });

    it("deve lançar erro quando usuário não for do tipo PROFESSIONAL", async () => {
      // Arrange
      const userId = "user-123";
      const profileData = {
        city: "São Paulo",
        serviceMode: "LOCAL_PROPRIO",
      };

      const mockUser = {
        id: userId,
        userType: "CLIENT",
        name: "Cliente",
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.createProfile(userId, profileData)).rejects.toThrow(
        BadRequestError
      );
    });

    it("deve lançar erro quando usuário já tiver perfil", async () => {
      // Arrange
      const userId = "user-123";
      const profileData = {
        city: "São Paulo",
        serviceMode: "LOCAL_PROPRIO",
      };

      const mockUser = {
        id: userId,
        userType: "PROFESSIONAL",
        name: "João Silva",
      };

      const existingProfile = {
        id: "profile-123",
        userId,
        city: "Rio de Janeiro",
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockProfessionalProfileRepository.findByUserId.mockResolvedValue(
        existingProfile
      );

      // Act & Assert
      await expect(service.createProfile(userId, profileData)).rejects.toThrow(
        BadRequestError
      );
    });

    it("deve lançar erro quando cidade não for fornecida", async () => {
      // Arrange
      const userId = "user-123";
      const profileData = {
        serviceMode: "LOCAL_PROPRIO",
      };

      const mockUser = {
        id: userId,
        userType: "PROFESSIONAL",
        name: "João Silva",
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockProfessionalProfileRepository.findByUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(service.createProfile(userId, profileData)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe("getProfileByUserId", () => {
    it("deve retornar perfil quando encontrado", async () => {
      // Arrange
      const userId = "user-123";
      const mockProfile = {
        id: "profile-123",
        userId,
        city: "São Paulo",
        serviceMode: "LOCAL_PROPRIO",
      };

      mockProfessionalProfileRepository.findByUserId.mockResolvedValue(
        mockProfile
      );

      // Act
      const result = await service.getProfileByUserId(userId);

      // Assert
      expect(result).toEqual(mockProfile);
      expect(
        mockProfessionalProfileRepository.findByUserId
      ).toHaveBeenCalledWith(userId);
    });

    it("deve lançar erro quando perfil não for encontrado", async () => {
      // Arrange
      const userId = "user-123";
      mockProfessionalProfileRepository.findByUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getProfileByUserId(userId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("updateProfile", () => {
    it("deve atualizar perfil com sucesso", async () => {
      // Arrange
      const userId = "user-123";
      const updateData = {
        city: "Rio de Janeiro",
        bio: "Nova bio",
      };

      const existingProfile = {
        id: "profile-123",
        userId,
        city: "São Paulo",
        bio: "Bio antiga",
      };

      const updatedProfile = {
        ...existingProfile,
        ...updateData,
      };

      mockProfessionalProfileRepository.findByUserId.mockResolvedValue(
        existingProfile
      );
      mockProfessionalProfileRepository.updateByUserId.mockResolvedValue(
        updatedProfile
      );

      // Act
      const result = await service.updateProfile(userId, updateData);

      // Assert
      expect(result).toEqual(updatedProfile);
      expect(
        mockProfessionalProfileRepository.updateByUserId
      ).toHaveBeenCalledWith(userId, updateData);
    });

    it("deve lançar erro quando perfil não for encontrado", async () => {
      // Arrange
      const userId = "user-123";
      const updateData = { city: "Rio de Janeiro" };

      mockProfessionalProfileRepository.findByUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateProfile(userId, updateData)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("deleteProfile", () => {
    it("deve deletar perfil com sucesso", async () => {
      // Arrange
      const userId = "user-123";
      const existingProfile = {
        id: "profile-123",
        userId,
        city: "São Paulo",
      };

      mockProfessionalProfileRepository.findByUserId.mockResolvedValue(
        existingProfile
      );
      mockProfessionalProfileRepository.deleteByUserId.mockResolvedValue(
        undefined
      );

      // Act
      await service.deleteProfile(userId);

      // Assert
      expect(
        mockProfessionalProfileRepository.deleteByUserId
      ).toHaveBeenCalledWith(userId);
    });

    it("deve lançar erro quando perfil não for encontrado", async () => {
      // Arrange
      const userId = "user-123";
      mockProfessionalProfileRepository.findByUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteProfile(userId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("addSpecialty", () => {
    it("deve adicionar especialidade com sucesso", async () => {
      // Arrange
      const userId = "user-123";
      const specialty = "Manicure";
      const existingProfile = {
        id: "profile-123",
        userId,
        specialties: ["Corte", "Barba"],
      };

      const updatedProfile = {
        ...existingProfile,
        specialties: [...existingProfile.specialties, specialty],
      };

      mockUserRepository.findById.mockResolvedValue({
        id: userId,
        userType: "PROFESSIONAL",
      });
      mockProfessionalProfileRepository.findByUserId.mockResolvedValue(
        existingProfile
      );
      mockProfessionalProfileRepository.updateByUserId.mockResolvedValue(
        updatedProfile
      );

      // Act
      const result = await service.addSpecialty(userId, specialty);

      // Assert
      expect(result).toEqual(updatedProfile);
      expect(
        mockProfessionalProfileRepository.updateByUserId
      ).toHaveBeenCalledWith(userId, {
        specialties: [...existingProfile.specialties, specialty],
      });
    });

    it("deve lançar erro quando especialidade já existir", async () => {
      // Arrange
      const userId = "user-123";
      const specialty = "Corte";
      const existingProfile = {
        id: "profile-123",
        userId,
        specialties: ["Corte", "Barba"],
      };

      mockUserRepository.findById.mockResolvedValue({
        id: userId,
        userType: "PROFESSIONAL",
      });
      mockProfessionalProfileRepository.findByUserId.mockResolvedValue(
        existingProfile
      );

      // Act & Assert
      await expect(service.addSpecialty(userId, specialty)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe("addCertification", () => {
    it("deve adicionar certificação com sucesso", async () => {
      // Arrange
      const userId = "user-123";
      const certification = "Certificação ABC";
      const existingProfile = {
        id: "profile-123",
        userId,
        certifications: ["Certificação 1"],
      };

      const updatedProfile = {
        ...existingProfile,
        certifications: [...existingProfile.certifications, certification],
      };

      mockUserRepository.findById.mockResolvedValue({
        id: userId,
        userType: "PROFESSIONAL",
      });
      mockProfessionalProfileRepository.findByUserId.mockResolvedValue(
        existingProfile
      );
      mockProfessionalProfileRepository.updateByUserId.mockResolvedValue(
        updatedProfile
      );

      // Act
      const result = await service.addCertification(userId, certification);

      // Assert
      expect(result).toEqual(updatedProfile);
      expect(
        mockProfessionalProfileRepository.updateByUserId
      ).toHaveBeenCalledWith(userId, {
        certifications: [...existingProfile.certifications, certification],
      });
    });
  });

  describe("updateRating", () => {
    it("deve atualizar rating com sucesso", async () => {
      // Arrange
      const userId = "user-123";
      const rating = 4.5;
      const existingProfile = {
        id: "profile-123",
        userId,
        averageRating: 4.0,
      };

      const updatedProfile = {
        ...existingProfile,
        averageRating: rating,
      };

      mockUserRepository.findById.mockResolvedValue({
        id: userId,
        userType: "PROFESSIONAL",
      });
      mockProfessionalProfileRepository.findByUserId.mockResolvedValue(
        existingProfile
      );
      mockProfessionalProfileRepository.updateRating.mockResolvedValue(
        updatedProfile
      );

      // Act
      const result = await service.updateRating(userId, rating);

      // Assert
      expect(result).toEqual(updatedProfile);
      expect(
        mockProfessionalProfileRepository.updateRating
      ).toHaveBeenCalledWith(userId, rating);
    });

    it("deve lançar erro quando rating for inválido", async () => {
      // Arrange
      const userId = "user-123";
      const rating = 6; // Rating inválido (> 5)

      // Act & Assert
      await expect(service.updateRating(userId, rating)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe("toggleActive", () => {
    it("deve alternar status ativo com sucesso", async () => {
      // Arrange
      const userId = "user-123";
      const existingProfile = {
        id: "profile-123",
        userId,
        isActive: true,
      };

      const updatedProfile = {
        ...existingProfile,
        isActive: false,
      };

      mockProfessionalProfileRepository.findByUserId.mockResolvedValue(
        existingProfile
      );
      mockProfessionalProfileRepository.updateByUserId.mockResolvedValue(
        updatedProfile
      );

      // Act
      const result = await service.toggleActive(userId);

      // Assert
      expect(result).toEqual(updatedProfile);
      expect(
        mockProfessionalProfileRepository.updateByUserId
      ).toHaveBeenCalledWith(userId, { isActive: false });
    });
  });
});
