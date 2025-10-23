/**
 * Testes de Integração - Repositórios
 *
 * Testa a integração entre repositórios e banco de dados
 * Seguindo TDD e princípios SOLID
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { UserRepository } from "../repositories/user.repository";
import { ClientProfileRepository } from "../repositories/client-profile.repository";
import { ProfessionalProfileRepository } from "../repositories/professional-profile.repository";
import { CompanyProfileRepository } from "../repositories/company-profile.repository";
import { CompanyEmployeeRepository } from "../repositories/company-employee.repository";

// Mock do Prisma para testes de integração
const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  clientProfile: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  professionalProfile: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  companyProfile: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  companyEmployee: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  companyEmployeeAppointment: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  companyEmployeeReview: {
    create: jest.fn(),
    findUnique: jest.fn(),
    aggregate: jest.fn(),
    count: jest.fn(),
  },
} as unknown as PrismaClient;

describe("Repositories Integration", () => {
  let userRepository: UserRepository;
  let clientProfileRepository: ClientProfileRepository;
  let professionalProfileRepository: ProfessionalProfileRepository;
  let companyProfileRepository: CompanyProfileRepository;
  let companyEmployeeRepository: CompanyEmployeeRepository;

  beforeEach(() => {
    jest.clearAllMocks();

    userRepository = new UserRepository(mockPrisma);
    clientProfileRepository = new ClientProfileRepository(mockPrisma);
    professionalProfileRepository = new ProfessionalProfileRepository(
      mockPrisma
    );
    companyProfileRepository = new CompanyProfileRepository(mockPrisma);
    companyEmployeeRepository = new CompanyEmployeeRepository(mockPrisma);
  });

  describe("UserRepository Integration", () => {
    it("deve criar usuário e perfil de cliente em sequência", async () => {
      // Arrange
      const userData = {
        email: "client@example.com",
        passwordHash: "hashed-password",
        name: "Client User",
        userType: "CLIENT" as const,
      };

      const clientProfileData = {
        userId: "user-123",
        cpf: "11144477735",
        addresses: [],
        paymentMethods: [],
        preferences: {},
      };

      const createdUser = {
        id: "user-123",
        email: "client@example.com",
        passwordHash: "hashed-password",
        name: "Client User",
        phone: null,
        userType: "CLIENT",
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null,
      };

      const createdProfile = {
        userId: "user-123",
        cpf: "11144477735",
        addresses: [],
        paymentMethods: [],
        preferences: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.create.mockResolvedValue(createdUser);
      mockPrisma.clientProfile.create.mockResolvedValue(createdProfile);

      // Act
      const user = await userRepository.create(userData);
      const profile = await clientProfileRepository.create(clientProfileData);

      // Assert
      expect(user.id).toBe("user-123");
      expect(user.userType).toBe("CLIENT");
      expect(profile.userId).toBe("user-123");
      expect(profile.cpf).toBe("11144477735");
    });

    it("deve criar usuário e perfil de profissional em sequência", async () => {
      // Arrange
      const userData = {
        email: "professional@example.com",
        passwordHash: "hashed-password",
        name: "Professional User",
        userType: "PROFESSIONAL" as const,
      };

      const professionalProfileData = {
        userId: "user-123",
        address: "Rua Teste, 123",
        city: "São Paulo",
        serviceMode: "BOTH" as const,
        specialties: ["Corte", "Barba"],
      };

      const createdUser = {
        id: "user-123",
        email: "professional@example.com",
        passwordHash: "hashed-password",
        name: "Professional User",
        phone: null,
        userType: "PROFESSIONAL",
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null,
      };

      const createdProfile = {
        userId: "user-123",
        cpf: null,
        cnpj: null,
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
      };

      mockPrisma.user.create.mockResolvedValue(createdUser);
      mockPrisma.professionalProfile.create.mockResolvedValue(createdProfile);

      // Act
      const user = await userRepository.create(userData);
      const profile = await professionalProfileRepository.create(
        professionalProfileData
      );

      // Assert
      expect(user.id).toBe("user-123");
      expect(user.userType).toBe("PROFESSIONAL");
      expect(profile.userId).toBe("user-123");
      expect(profile.address).toBe("Rua Teste, 123");
      expect(profile.specialties).toEqual(["Corte", "Barba"]);
    });

    it("deve criar usuário e perfil de empresa em sequência", async () => {
      // Arrange
      const userData = {
        email: "company@example.com",
        passwordHash: "hashed-password",
        name: "Company User",
        userType: "COMPANY" as const,
      };

      const companyProfileData = {
        userId: "user-123",
        cnpj: "12345678000195",
        address: "Rua Empresa, 456",
        city: "São Paulo",
        description: "Salão de beleza",
      };

      const createdUser = {
        id: "user-123",
        email: "company@example.com",
        passwordHash: "hashed-password",
        name: "Company User",
        phone: null,
        userType: "COMPANY",
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null,
      };

      const createdProfile = {
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
      };

      mockPrisma.user.create.mockResolvedValue(createdUser);
      mockPrisma.companyProfile.create.mockResolvedValue(createdProfile);

      // Act
      const user = await userRepository.create(userData);
      const profile = await companyProfileRepository.create(companyProfileData);

      // Assert
      expect(user.id).toBe("user-123");
      expect(user.userType).toBe("COMPANY");
      expect(profile.userId).toBe("user-123");
      expect(profile.cnpj).toBe("12345678000195");
      expect(profile.description).toBe("Salão de beleza");
    });
  });

  describe("CompanyEmployeeRepository Integration", () => {
    it("deve criar funcionário e agendamento em sequência", async () => {
      // Arrange
      const employeeData = {
        companyId: "company-123",
        name: "João Silva",
        email: "joao@company.com",
        phone: "(11) 99999-9999",
        position: "Barbeiro",
        specialties: ["Corte", "Barba"],
      };

      const appointmentData = {
        clientId: "client-123",
        companyId: "company-123",
        employeeId: "employee-123",
        serviceId: "service-123",
        scheduledDate: new Date("2024-02-01"),
        scheduledTime: "14:30",
        location: "Salão da empresa",
        clientNotes: "Corte moderno",
      };

      const createdEmployee = {
        id: "employee-123",
        companyId: "company-123",
        name: "João Silva",
        email: "joao@company.com",
        phone: "(11) 99999-9999",
        position: "Barbeiro",
        specialties: ["Corte", "Barba"],
        workingHours: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdAppointment = {
        id: "appointment-123",
        clientId: "client-123",
        companyId: "company-123",
        employeeId: "employee-123",
        serviceId: "service-123",
        scheduledDate: new Date("2024-02-01"),
        scheduledTime: "14:30",
        status: "PENDING",
        location: "Salão da empresa",
        clientNotes: "Corte moderno",
        employeeNotes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.companyEmployee.create.mockResolvedValue(createdEmployee);
      mockPrisma.companyEmployeeAppointment.create.mockResolvedValue(
        createdAppointment
      );

      // Act
      const employee = await companyEmployeeRepository.create(employeeData);
      const appointment = await companyEmployeeRepository.createAppointment(
        appointmentData
      );

      // Assert
      expect(employee.id).toBe("employee-123");
      expect(employee.name).toBe("João Silva");
      expect(appointment.id).toBe("appointment-123");
      expect(appointment.status).toBe("PENDING");
    });

    it("deve criar agendamento e review em sequência", async () => {
      // Arrange
      const appointmentData = {
        clientId: "client-123",
        companyId: "company-123",
        employeeId: "employee-123",
        serviceId: "service-123",
        scheduledDate: new Date("2024-02-01"),
        scheduledTime: "14:30",
        location: "Salão da empresa",
      };

      const reviewData = {
        appointmentId: "appointment-123",
        clientId: "client-123",
        companyId: "company-123",
        employeeId: "employee-123",
        rating: 5,
        comment: "Excelente atendimento!",
      };

      const createdAppointment = {
        id: "appointment-123",
        clientId: "client-123",
        companyId: "company-123",
        employeeId: "employee-123",
        serviceId: "service-123",
        scheduledDate: new Date("2024-02-01"),
        scheduledTime: "14:30",
        status: "COMPLETED",
        location: "Salão da empresa",
        clientNotes: null,
        employeeNotes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdReview = {
        id: "review-123",
        appointmentId: "appointment-123",
        clientId: "client-123",
        companyId: "company-123",
        employeeId: "employee-123",
        rating: 5,
        comment: "Excelente atendimento!",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.companyEmployeeAppointment.create.mockResolvedValue(
        createdAppointment
      );
      mockPrisma.companyEmployeeReview.create.mockResolvedValue(createdReview);

      // Act
      const appointment = await companyEmployeeRepository.createAppointment(
        appointmentData
      );
      const review = await companyEmployeeRepository.createReview(reviewData);

      // Assert
      expect(appointment.id).toBe("appointment-123");
      expect(review.id).toBe("review-123");
      expect(review.rating).toBe(5);
      expect(review.comment).toBe("Excelente atendimento!");
    });
  });

  describe("Error Handling Integration", () => {
    it("deve lidar com erros de banco de dados em cascata", async () => {
      // Arrange
      const userData = {
        email: "test@example.com",
        passwordHash: "hashed-password",
        name: "Test User",
        userType: "CLIENT" as const,
      };

      mockPrisma.user.create.mockRejectedValue(
        new Error("Database connection failed")
      );

      // Act & Assert
      await expect(userRepository.create(userData)).rejects.toThrow(
        "Erro ao criar usuário"
      );
    });

    it("deve lidar com erros de validação em perfis", async () => {
      // Arrange
      const clientProfileData = {
        userId: "user-123",
        cpf: "invalid-cpf",
        addresses: [],
        paymentMethods: [],
        preferences: {},
      };

      mockPrisma.clientProfile.create.mockRejectedValue(
        new Error("Invalid CPF format")
      );

      // Act & Assert
      await expect(
        clientProfileRepository.create(clientProfileData)
      ).rejects.toThrow("Erro ao criar perfil de cliente");
    });
  });
});
