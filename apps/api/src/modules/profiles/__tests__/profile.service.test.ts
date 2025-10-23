/**
 * Testes para ProfileService
 *
 * Testa a lógica de negócio para perfis específicos
 * Seguindo os princípios TDD e Clean Architecture
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { ProfileService } from "../profile.service";
import { UserType } from "../../../domain/interfaces/user.interface";
import { BadRequestError, NotFoundError } from "../../../utils/app-error";

// Mock das dependências
jest.mock("../../../modules/users/user.service");
jest.mock("../../../infrastructure/repositories/user.repository");
jest.mock("../../../infrastructure/repositories/client-profile.repository");
jest.mock(
  "../../../infrastructure/repositories/professional-profile.repository"
);
jest.mock("../../../infrastructure/repositories/company-profile.repository");

describe("ProfileService", () => {
  let profileService: ProfileService;
  let mockUserService: any;

  beforeEach(() => {
    // Mock do UserService
    mockUserService = {
      getUserById: jest.fn(),
      createClientProfile: jest.fn(),
      createProfessionalProfile: jest.fn(),
      createCompanyProfile: jest.fn(),
      getClientProfile: jest.fn(),
      getProfessionalProfile: jest.fn(),
      getCompanyProfile: jest.fn(),
    };

    // Mock do User
    const mockUser = {
      getUserType: jest.fn(),
    };

    mockUserService.getUserById.mockResolvedValue(mockUser);
    mockUserService.createClientProfile.mockResolvedValue({
      toJSON: () => ({ userId: "user-1", cpf: "11144477735" }),
    });
    mockUserService.createProfessionalProfile.mockResolvedValue({
      toJSON: () => ({ userId: "user-1", cpf: "11144477735" }),
    });
    mockUserService.createCompanyProfile.mockResolvedValue({
      toJSON: () => ({ userId: "user-1", cnpj: "12345678000195" }),
    });
    mockUserService.getClientProfile.mockResolvedValue({
      toJSON: () => ({ userId: "user-1", cpf: "11144477735" }),
    });
    mockUserService.getProfessionalProfile.mockResolvedValue({
      toJSON: () => ({ userId: "user-1", cpf: "11144477735" }),
    });
    mockUserService.getCompanyProfile.mockResolvedValue({
      toJSON: () => ({ userId: "user-1", cnpj: "12345678000195" }),
    });

    profileService = new ProfileService();
    // Substituir o userService mockado
    (profileService as any).userService = mockUserService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createClientProfile", () => {
    it("deve criar perfil de cliente com sucesso", async () => {
      // Arrange
      const userId = "user-1";
      const profileData = { cpf: "11144477735" };
      mockUserService.getUserById.mockResolvedValue({
        getUserType: () => UserType.CLIENT,
      });

      // Act
      const result = await profileService.createClientProfile(
        userId,
        profileData
      );

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockUserService.createClientProfile).toHaveBeenCalledWith(
        userId,
        profileData
      );
      expect(result).toEqual({ userId: "user-1", cpf: "11144477735" });
    });

    it("deve lançar erro se usuário não for do tipo CLIENT", async () => {
      // Arrange
      const userId = "user-1";
      const profileData = { cpf: "11144477735" };
      mockUserService.getUserById.mockResolvedValue({
        getUserType: () => UserType.PROFESSIONAL,
      });

      // Act & Assert
      await expect(
        profileService.createClientProfile(userId, profileData)
      ).rejects.toThrow(BadRequestError);
      await expect(
        profileService.createClientProfile(userId, profileData)
      ).rejects.toThrow(
        "Apenas usuários do tipo CLIENT podem ter perfil de cliente"
      );
    });
  });

  describe("createProfessionalProfile", () => {
    it("deve criar perfil de profissional com sucesso", async () => {
      // Arrange
      const userId = "user-1";
      const profileData = { cpf: "11144477735", address: "Rua A, 123" };
      mockUserService.getUserById.mockResolvedValue({
        getUserType: () => UserType.PROFESSIONAL,
      });

      // Act
      const result = await profileService.createProfessionalProfile(
        userId,
        profileData
      );

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockUserService.createProfessionalProfile).toHaveBeenCalledWith(
        userId,
        profileData
      );
      expect(result).toEqual({ userId: "user-1", cpf: "11144477735" });
    });

    it("deve lançar erro se usuário não for do tipo PROFESSIONAL", async () => {
      // Arrange
      const userId = "user-1";
      const profileData = { cpf: "11144477735" };
      mockUserService.getUserById.mockResolvedValue({
        getUserType: () => UserType.CLIENT,
      });

      // Act & Assert
      await expect(
        profileService.createProfessionalProfile(userId, profileData)
      ).rejects.toThrow(BadRequestError);
      await expect(
        profileService.createProfessionalProfile(userId, profileData)
      ).rejects.toThrow(
        "Apenas usuários do tipo PROFESSIONAL podem ter perfil de profissional"
      );
    });
  });

  describe("createCompanyProfile", () => {
    it("deve criar perfil de empresa com sucesso", async () => {
      // Arrange
      const userId = "user-1";
      const profileData = { cnpj: "12345678000195", address: "Rua A, 123" };
      mockUserService.getUserById.mockResolvedValue({
        getUserType: () => UserType.COMPANY,
      });

      // Act
      const result = await profileService.createCompanyProfile(
        userId,
        profileData
      );

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockUserService.createCompanyProfile).toHaveBeenCalledWith(
        userId,
        profileData
      );
      expect(result).toEqual({ userId: "user-1", cnpj: "12345678000195" });
    });

    it("deve lançar erro se usuário não for do tipo COMPANY", async () => {
      // Arrange
      const userId = "user-1";
      const profileData = { cnpj: "12345678000195" };
      mockUserService.getUserById.mockResolvedValue({
        getUserType: () => UserType.CLIENT,
      });

      // Act & Assert
      await expect(
        profileService.createCompanyProfile(userId, profileData)
      ).rejects.toThrow(BadRequestError);
      await expect(
        profileService.createCompanyProfile(userId, profileData)
      ).rejects.toThrow(
        "Apenas usuários do tipo COMPANY podem ter perfil de empresa"
      );
    });
  });

  describe("getClientProfile", () => {
    it("deve buscar perfil de cliente com sucesso", async () => {
      // Arrange
      const userId = "user-1";
      mockUserService.getUserById.mockResolvedValue({
        getUserType: () => UserType.CLIENT,
      });

      // Act
      const result = await profileService.getClientProfile(userId);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockUserService.getClientProfile).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ userId: "user-1", cpf: "11144477735" });
    });

    it("deve lançar erro se usuário não for do tipo CLIENT", async () => {
      // Arrange
      const userId = "user-1";
      mockUserService.getUserById.mockResolvedValue({
        getUserType: () => UserType.PROFESSIONAL,
      });

      // Act & Assert
      await expect(profileService.getClientProfile(userId)).rejects.toThrow(
        NotFoundError
      );
      await expect(profileService.getClientProfile(userId)).rejects.toThrow(
        "Perfil de cliente não encontrado"
      );
    });
  });

  describe("getProfessionalProfile", () => {
    it("deve buscar perfil de profissional com sucesso", async () => {
      // Arrange
      const userId = "user-1";
      mockUserService.getUserById.mockResolvedValue({
        getUserType: () => UserType.PROFESSIONAL,
      });

      // Act
      const result = await profileService.getProfessionalProfile(userId);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockUserService.getProfessionalProfile).toHaveBeenCalledWith(
        userId
      );
      expect(result).toEqual({ userId: "user-1", cpf: "11144477735" });
    });

    it("deve lançar erro se usuário não for do tipo PROFESSIONAL", async () => {
      // Arrange
      const userId = "user-1";
      mockUserService.getUserById.mockResolvedValue({
        getUserType: () => UserType.CLIENT,
      });

      // Act & Assert
      await expect(
        profileService.getProfessionalProfile(userId)
      ).rejects.toThrow(NotFoundError);
      await expect(
        profileService.getProfessionalProfile(userId)
      ).rejects.toThrow("Perfil de profissional não encontrado");
    });
  });

  describe("getCompanyProfile", () => {
    it("deve buscar perfil de empresa com sucesso", async () => {
      // Arrange
      const userId = "user-1";
      mockUserService.getUserById.mockResolvedValue({
        getUserType: () => UserType.COMPANY,
      });

      // Act
      const result = await profileService.getCompanyProfile(userId);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockUserService.getCompanyProfile).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ userId: "user-1", cnpj: "12345678000195" });
    });

    it("deve lançar erro se usuário não for do tipo COMPANY", async () => {
      // Arrange
      const userId = "user-1";
      mockUserService.getUserById.mockResolvedValue({
        getUserType: () => UserType.CLIENT,
      });

      // Act & Assert
      await expect(profileService.getCompanyProfile(userId)).rejects.toThrow(
        NotFoundError
      );
      await expect(profileService.getCompanyProfile(userId)).rejects.toThrow(
        "Perfil de empresa não encontrado"
      );
    });
  });
});
