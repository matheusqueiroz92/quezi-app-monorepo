/**
 * Testes para UserRegistrationUseCase - Casos de Uso
 *
 * Seguindo TDD e princípios SOLID
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import {
  UserRegistrationUseCase,
  UserRegistrationData,
} from "../user-registration.use-case";
import {
  IUserService,
  IClientProfileService,
  IProfessionalProfileService,
  ICompanyProfileService,
} from "../../../domain/interfaces/repository.interface";
import {
  IUser,
  IClientProfile,
  IProfessionalProfile,
  ICompanyProfile,
} from "../../../domain/interfaces/user.interface";
import { BadRequestError } from "../../../utils/app-error";

// Mocks dos serviços
const mockUserService: jest.Mocked<IUserService> = {
  createUser: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  findUsersByType: jest.fn(),
  searchUsers: jest.fn(),
  createClientProfile: jest.fn(),
  createProfessionalProfile: jest.fn(),
  createCompanyProfile: jest.fn(),
};

const mockClientProfileService: jest.Mocked<IClientProfileService> = {
  createProfile: jest.fn(),
  getProfileById: jest.fn(),
  updateProfile: jest.fn(),
  deleteProfile: jest.fn(),
  searchProfiles: jest.fn(),
  getProfileByCPF: jest.fn(),
  addAddress: jest.fn(),
  removeAddress: jest.fn(),
  updateAddress: jest.fn(),
  addPaymentMethod: jest.fn(),
  removePaymentMethod: jest.fn(),
  updatePaymentMethod: jest.fn(),
};

const mockProfessionalProfileService: jest.Mocked<IProfessionalProfileService> =
  {
    createProfile: jest.fn(),
    getProfileById: jest.fn(),
    updateProfile: jest.fn(),
    deleteProfile: jest.fn(),
    searchProfiles: jest.fn(),
    getProfileByCPF: jest.fn(),
    getProfileByCNPJ: jest.fn(),
    addSpecialty: jest.fn(),
    removeSpecialty: jest.fn(),
    addCertification: jest.fn(),
    removeCertification: jest.fn(),
    updateCertification: jest.fn(),
    addPortfolioItem: jest.fn(),
    removePortfolioItem: jest.fn(),
    updateWorkingHours: jest.fn(),
  };

const mockCompanyProfileService: jest.Mocked<ICompanyProfileService> = {
  createProfile: jest.fn(),
  getProfileById: jest.fn(),
  updateProfile: jest.fn(),
  deleteProfile: jest.fn(),
  searchProfiles: jest.fn(),
  getProfileByCNPJ: jest.fn(),
  addPhoto: jest.fn(),
  removePhoto: jest.fn(),
  updateBusinessHours: jest.fn(),
  getEmployees: jest.fn(),
  addEmployee: jest.fn(),
  removeEmployee: jest.fn(),
};

// Mock do usuário
const mockUser: IUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  phone: "(11) 99999-9999",
  userType: "CLIENT",
  isEmailVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLogin: null,

  // Métodos de domínio
  canCreateAppointment: jest.fn(() => true),
  canReceiveAppointments: jest.fn(() => false),
  getProfileType: jest.fn(() => "CLIENT"),
  isClient: jest.fn(() => true),
  isProfessional: jest.fn(() => false),
  isCompany: jest.fn(() => false),
  canManageEmployees: jest.fn(() => false),
  canOfferServices: jest.fn(() => false),
  canBookAppointments: jest.fn(() => true),
};

// Mock do perfil de cliente
const mockClientProfile: IClientProfile = {
  userId: "user-123",
  cpf: "11144477735",
  addresses: [],
  paymentMethods: [],
  preferences: {},
  createdAt: new Date(),
  updatedAt: new Date(),

  // Métodos de domínio
  addAddress: jest.fn(),
  removeAddress: jest.fn(),
  addPaymentMethod: jest.fn(),
  removePaymentMethod: jest.fn(),
  addFavoriteService: jest.fn(),
  removeFavoriteService: jest.fn(),
  getDefaultAddress: jest.fn(),
  getDefaultPaymentMethod: jest.fn(),
  hasAddress: jest.fn(),
  hasPaymentMethod: jest.fn(),
  isFavoriteService: jest.fn(),
};

describe("UserRegistrationUseCase", () => {
  let useCase: UserRegistrationUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UserRegistrationUseCase(
      mockUserService,
      mockClientProfileService,
      mockProfessionalProfileService,
      mockCompanyProfileService
    );
  });

  describe("execute", () => {
    it("deve registrar usuário CLIENT com perfil", async () => {
      // Arrange
      const registrationData: UserRegistrationData = {
        email: "client@example.com",
        password: "password123",
        name: "Client User",
        phone: "(11) 99999-9999",
        userType: "CLIENT",
        profileData: {
          cpf: "11144477735",
          addresses: [],
          paymentMethods: [],
          preferences: {},
        },
      };

      mockUserService.createUser.mockResolvedValue(mockUser);
      mockClientProfileService.createProfile.mockResolvedValue(
        mockClientProfile
      );

      // Act
      const result = await useCase.execute(registrationData);

      // Assert
      expect(result.user).toBe(mockUser);
      expect(result.profile).toBe(mockClientProfile);
      expect(mockUserService.createUser).toHaveBeenCalledWith({
        email: registrationData.email,
        password: registrationData.password,
        name: registrationData.name,
        phone: registrationData.phone,
        userType: registrationData.userType,
      });
      expect(mockClientProfileService.createProfile).toHaveBeenCalledWith({
        userId: mockUser.id,
        cpf: registrationData.profileData!.cpf,
        addresses: registrationData.profileData!.addresses,
        paymentMethods: registrationData.profileData!.paymentMethods,
        preferences: registrationData.profileData!.preferences,
      });
    });

    it("deve registrar usuário CLIENT sem perfil", async () => {
      // Arrange
      const registrationData: UserRegistrationData = {
        email: "client@example.com",
        password: "password123",
        name: "Client User",
        userType: "CLIENT",
      };

      mockUserService.createUser.mockResolvedValue(mockUser);

      // Act
      const result = await useCase.execute(registrationData);

      // Assert
      expect(result.user).toBe(mockUser);
      expect(result.profile).toBeUndefined();
      expect(mockUserService.createUser).toHaveBeenCalledWith({
        email: registrationData.email,
        password: registrationData.password,
        name: registrationData.name,
        phone: undefined,
        userType: registrationData.userType,
      });
      expect(mockClientProfileService.createProfile).not.toHaveBeenCalled();
    });

    it("deve registrar usuário PROFESSIONAL com perfil", async () => {
      // Arrange
      const registrationData: UserRegistrationData = {
        email: "professional@example.com",
        password: "password123",
        name: "Professional User",
        userType: "PROFESSIONAL",
        profileData: {
          address: "Rua Teste, 123",
          city: "São Paulo",
          serviceMode: "BOTH",
          specialties: ["Corte", "Barba"],
        },
      };

      const professionalUser = {
        ...mockUser,
        userType: "PROFESSIONAL" as const,
      };
      const professionalProfile: IProfessionalProfile = {
        userId: "user-123",
        address: "Rua Teste, 123",
        city: "São Paulo",
        serviceMode: "BOTH",
        specialties: ["Corte", "Barba"],
        workingHours: {},
        certifications: [],
        portfolio: [],
        averageRating: 0,
        totalRatings: 0,
        isActive: true,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),

        // Métodos de domínio
        addSpecialty: jest.fn(),
        removeSpecialty: jest.fn(),
        addCertification: jest.fn(),
        removeCertification: jest.fn(),
        updateCertification: jest.fn(),
        addPortfolioItem: jest.fn(),
        removePortfolioItem: jest.fn(),
        updateWorkingHours: jest.fn(),
      };

      mockUserService.createUser.mockResolvedValue(professionalUser);
      mockProfessionalProfileService.createProfile.mockResolvedValue(
        professionalProfile
      );

      // Act
      const result = await useCase.execute(registrationData);

      // Assert
      expect(result.user).toBe(professionalUser);
      expect(result.profile).toBe(professionalProfile);
      expect(mockProfessionalProfileService.createProfile).toHaveBeenCalledWith(
        {
          userId: professionalUser.id,
          address: registrationData.profileData!.address,
          city: registrationData.profileData!.city,
          serviceMode: registrationData.profileData!.serviceMode,
          specialties: registrationData.profileData!.specialties,
          workingHours: {},
          certifications: [],
          portfolio: [],
        }
      );
    });

    it("deve registrar usuário COMPANY com perfil", async () => {
      // Arrange
      const registrationData: UserRegistrationData = {
        email: "company@example.com",
        password: "password123",
        name: "Company User",
        userType: "COMPANY",
        profileData: {
          cnpj: "12345678000195",
          address: "Rua Empresa, 456",
          city: "São Paulo",
          description: "Salão de beleza",
        },
      };

      const companyUser = { ...mockUser, userType: "COMPANY" as const };
      const companyProfile: ICompanyProfile = {
        userId: "user-123",
        cnpj: "12345678000195",
        address: "Rua Empresa, 456",
        city: "São Paulo",
        businessHours: {},
        description: "Salão de beleza",
        photos: [],
        averageRating: 0,
        totalRatings: 0,
        isActive: true,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),

        // Métodos de domínio
        addPhoto: jest.fn(),
        removePhoto: jest.fn(),
        updateBusinessHours: jest.fn(),
        addEmployee: jest.fn(),
        removeEmployee: jest.fn(),
        getEmployees: jest.fn(),
      };

      mockUserService.createUser.mockResolvedValue(companyUser);
      mockCompanyProfileService.createProfile.mockResolvedValue(companyProfile);

      // Act
      const result = await useCase.execute(registrationData);

      // Assert
      expect(result.user).toBe(companyUser);
      expect(result.profile).toBe(companyProfile);
      expect(mockCompanyProfileService.createProfile).toHaveBeenCalledWith({
        userId: companyUser.id,
        cnpj: registrationData.profileData!.cnpj,
        address: registrationData.profileData!.address,
        city: registrationData.profileData!.city,
        businessHours: {},
        description: registrationData.profileData!.description,
        photos: [],
      });
    });

    it("deve lançar erro para dados inválidos", async () => {
      // Arrange
      const registrationData: UserRegistrationData = {
        email: "invalid-email",
        password: "123",
        name: "A",
        userType: "CLIENT",
        profileData: {
          cpf: "invalid-cpf",
        },
      };

      // Act & Assert
      await expect(useCase.execute(registrationData)).rejects.toThrow(
        BadRequestError
      );
    });

    it("deve lançar erro para CNPJ inválido em empresa", async () => {
      // Arrange
      const registrationData: UserRegistrationData = {
        email: "company@example.com",
        password: "password123",
        name: "Company User",
        userType: "COMPANY",
        profileData: {
          cnpj: "invalid-cnpj",
          address: "Rua Empresa, 456",
          city: "São Paulo",
        },
      };

      // Act & Assert
      await expect(useCase.execute(registrationData)).rejects.toThrow(
        BadRequestError
      );
    });
  });
});
