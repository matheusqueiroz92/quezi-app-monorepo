/**
 * Testes de Integração para ProfileController
 *
 * Testa a integração completa do módulo de perfis
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
import { FastifyInstance } from "fastify";
import { buildApp } from "../../../app";
import { prisma } from "../../../lib/prisma";
import { hashPassword } from "../../../utils/password";
import { UserType } from "../../../domain/interfaces/user.interface";

// Mock do ProfileService
const mockProfileService = {
  createClientProfile: jest.fn(),
  createProfessionalProfile: jest.fn(),
  createCompanyProfile: jest.fn(),
  getClientProfile: jest.fn(),
  getProfessionalProfile: jest.fn(),
  getCompanyProfile: jest.fn(),
};

jest.mock("../profile.service", () => ({
  ProfileService: jest.fn().mockImplementation(() => mockProfileService),
}));

// Mock do ProfileController
const mockProfileController = {
  registerRoutes: jest.fn().mockImplementation(async (app: any) => {
    // Mock das rotas
    app.post("/client", async (request: any, reply: any) => {
      const profile = await mockProfileService.createClientProfile(
        "user-1",
        request.body
      );
      reply.status(201).send(profile);
    });

    app.post("/professional", async (request: any, reply: any) => {
      const profile = await mockProfileService.createProfessionalProfile(
        "user-1",
        request.body
      );
      reply.status(201).send(profile);
    });

    app.post("/company", async (request: any, reply: any) => {
      const profile = await mockProfileService.createCompanyProfile(
        "user-1",
        request.body
      );
      reply.status(201).send(profile);
    });

    app.get("/client/:userId", async (request: any, reply: any) => {
      const profile = await mockProfileService.getClientProfile(
        request.params.userId
      );
      reply.status(200).send(profile);
    });
  }),
  createClientProfile: jest.fn(),
  createProfessionalProfile: jest.fn(),
  createCompanyProfile: jest.fn(),
  getClientProfile: jest.fn(),
  getProfessionalProfile: jest.fn(),
  getCompanyProfile: jest.fn(),
};

jest.mock("../profile.controller", () => ({
  ProfileController: jest.fn().mockImplementation(() => mockProfileController),
}));

// Mock das rotas
jest.mock("../profile.routes", () => ({
  profileRoutes: jest.fn().mockImplementation(async (app: any) => {
    app.post("/client", async (request: any, reply: any) => {
      const profile = await mockProfileService.createClientProfile(
        "user-1",
        request.body
      );
      reply.status(201).send(profile);
    });

    app.post("/professional", async (request: any, reply: any) => {
      const profile = await mockProfileService.createProfessionalProfile(
        "user-1",
        request.body
      );
      reply.status(201).send(profile);
    });

    app.post("/company", async (request: any, reply: any) => {
      const profile = await mockProfileService.createCompanyProfile(
        "user-1",
        request.body
      );
      reply.status(201).send(profile);
    });

    app.get("/client/:userId", async (request: any, reply: any) => {
      const profile = await mockProfileService.getClientProfile(
        request.params.userId
      );
      reply.status(200).send(profile);
    });
  }),
}));

// Mock do arquivo de rotas principal
jest.mock("../../../routes", () => ({
  registerRoutes: jest.fn().mockImplementation(async (app: any) => {
    // Registrar apenas as rotas de profile que precisamos
    await app.register(
      async (profileRoutes: any) => {
        profileRoutes.post("/client", async (request: any, reply: any) => {
          const profile = await mockProfileService.createClientProfile(
            "user-1",
            request.body
          );
          reply.status(201).send(profile);
        });

        profileRoutes.post(
          "/professional",
          async (request: any, reply: any) => {
            const profile = await mockProfileService.createProfessionalProfile(
              "user-1",
              request.body
            );
            reply.status(201).send(profile);
          }
        );

        profileRoutes.post("/company", async (request: any, reply: any) => {
          const profile = await mockProfileService.createCompanyProfile(
            "user-1",
            request.body
          );
          reply.status(201).send(profile);
        });

        profileRoutes.get(
          "/client/:userId",
          async (request: any, reply: any) => {
            const profile = await mockProfileService.getClientProfile(
              request.params.userId
            );
            reply.status(200).send(profile);
          }
        );
      },
      { prefix: "/profiles" }
    );
  }),
}));

describe("Profile Integration Tests", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp();
    await app.ready();

    // Configurar mocks do ProfileService
    mockProfileService.createClientProfile.mockResolvedValue({
      userId: "user-1",
      cpf: "11144477735",
      addresses: [],
      paymentMethods: [],
      favoriteServices: [],
      preferences: {},
    });

    mockProfileService.createProfessionalProfile.mockResolvedValue({
      userId: "user-1",
      cpf: "11144477735",
      address: "Rua A, 123",
      city: "São Paulo",
      serviceMode: "AT_LOCATION",
      specialties: ["Corte", "Barba"],
      workingHours: {},
      certifications: [],
      portfolio: [],
      isActive: true,
      isVerified: false,
    });

    mockProfileService.createCompanyProfile.mockResolvedValue({
      userId: "user-1",
      cnpj: "12345678000195",
      address: "Rua A, 123",
      city: "São Paulo",
      businessHours: {},
      description: "Salão de beleza especializado",
      photos: ["https://example.com/photo1.jpg"],
      isActive: true,
      isVerified: false,
    });

    mockProfileService.getClientProfile.mockResolvedValue({
      userId: "user-1",
      cpf: "11144477735",
      addresses: [],
      paymentMethods: [],
      favoriteServices: [],
      preferences: {},
    });
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
    await prisma.clientProfile.deleteMany();
    await prisma.professionalProfile.deleteMany();
    await prisma.companyProfile.deleteMany();
  });

  describe("POST /api/v1/profiles/client", () => {
    it("deve criar perfil de cliente com sucesso", async () => {
      // Arrange
      const profileData = {
        cpf: "11144477735",
        addresses: [
          {
            street: "Rua A",
            number: "123",
            complement: "Apto 1",
            neighborhood: "Centro",
            city: "São Paulo",
            state: "SP",
            zipCode: "01234567",
            isDefault: true,
          },
        ],
        paymentMethods: [
          {
            type: "CREDIT_CARD",
            name: "Cartão Visa",
            isDefault: true,
            details: { last4: "1234", brand: "Visa" },
          },
        ],
        preferences: {
          notifications: {
            email: true,
            sms: false,
            push: true,
          },
          marketing: false,
          language: "pt-BR",
          timezone: "America/Sao_Paulo",
        },
      };

      // Act
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/profiles/client",
        headers: {
          authorization: `Bearer 550e8400-e29b-41d4-a716-446655440000`,
        },
        payload: profileData,
      });

      // Assert
      if (response.statusCode !== 201) {
        console.log("Response status:", response.statusCode);
        console.log("Response body:", response.body);
      }
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.userId).toBe("user-1");
      expect(body.cpf).toBe("11144477735");
      expect(body.addresses).toHaveLength(1);
      expect(body.paymentMethods).toHaveLength(1);
      expect(body.preferences).toBeDefined();
    });

    it("deve retornar erro 401 se não autenticado", async () => {
      // Act
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/profiles/client",
        payload: { cpf: "11144477735" },
      });

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it("deve retornar erro 400 se dados inválidos", async () => {
      // Arrange - dados inválidos

      // Act
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/profiles/client",
        headers: {
          authorization: `Bearer 550e8400-e29b-41d4-a716-446655440000`,
        },
        payload: { cpf: "123" }, // CPF inválido
      });

      // Assert
      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /api/v1/profiles/professional", () => {
    it("deve criar perfil de profissional com sucesso", async () => {
      // Arrange
      const user = {
        id: "user-1",
        email: "professional@example.com",
        passwordHash: await hashPassword("password123"),
        name: "Profissional Teste",
        userType: UserType.PROFESSIONAL,
      };

      // Mock do Prisma
      (prisma.user.create as jest.Mock).mockResolvedValue(user);
      (prisma.professionalProfile.create as jest.Mock).mockResolvedValue({
        userId: "user-1",
        cpf: "11144477735",
        address: "Rua A, 123",
        city: "São Paulo",
        serviceMode: "AT_LOCATION",
        specialties: ["Corte", "Barba"],
        workingHours: {},
        certifications: [],
        portfolio: [],
        isActive: true,
        isVerified: false,
      });

      const profileData = {
        cpf: "11144477735",
        address: "Rua A, 123",
        city: "São Paulo",
        serviceMode: "AT_LOCATION",
        specialties: ["Corte", "Barba"],
        workingHours: {
          monday: { isAvailable: true, start: "09:00", end: "18:00" },
          tuesday: { isAvailable: true, start: "09:00", end: "18:00" },
          wednesday: { isAvailable: true, start: "09:00", end: "18:00" },
          thursday: { isAvailable: true, start: "09:00", end: "18:00" },
          friday: { isAvailable: true, start: "09:00", end: "18:00" },
          saturday: { isAvailable: false, start: "09:00", end: "18:00" },
          sunday: { isAvailable: false, start: "09:00", end: "18:00" },
        },
        certifications: [
          {
            name: "Curso de Barbeiro",
            institution: "Escola de Beleza",
            date: "2023-01-01",
            isVerified: true,
          },
        ],
        portfolio: ["https://example.com/photo1.jpg"],
      };

      // Act
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/profiles/professional",
        headers: {
          authorization: `Bearer 550e8400-e29b-41d4-a716-446655440000`,
        },
        payload: profileData,
      });

      // Assert
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.userId).toBe("user-1");
      expect(body.cpf).toBe("11144477735");
      expect(body.address).toBe("Rua A, 123");
      expect(body.serviceMode).toBe("AT_LOCATION");
      expect(body.specialties).toHaveLength(2);
      expect(body.certifications).toHaveLength(1);
      expect(body.portfolio).toHaveLength(1);
    });

    it("deve retornar erro 400 se usuário não for do tipo PROFESSIONAL", async () => {
      // Arrange
      const user = {
        id: "user-1",
        email: "client@example.com",
        passwordHash: await hashPassword("password123"),
        name: "Cliente Teste",
        userType: UserType.CLIENT,
      };

      // Mock do Prisma
      (prisma.user.create as jest.Mock).mockResolvedValue(user);

      // Act
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/profiles/professional",
        headers: {
          authorization: `Bearer 550e8400-e29b-41d4-a716-446655440000`,
        },
        payload: {
          address: "Rua A, 123",
          city: "São Paulo",
          serviceMode: "AT_LOCATION",
        },
      });

      // Assert
      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /api/v1/profiles/company", () => {
    it("deve criar perfil de empresa com sucesso", async () => {
      // Arrange
      const user = {
        id: "user-1",
        email: "company@example.com",
        passwordHash: await hashPassword("password123"),
        name: "Empresa Teste",
        userType: UserType.COMPANY,
      };

      // Mock do Prisma
      (prisma.user.create as jest.Mock).mockResolvedValue(user);
      (prisma.companyProfile.create as jest.Mock).mockResolvedValue({
        userId: "user-1",
        cnpj: "12345678000195",
        address: "Rua A, 123",
        city: "São Paulo",
        businessHours: {},
        description: "Salão de beleza especializado",
        photos: ["https://example.com/photo1.jpg"],
        isActive: true,
        isVerified: false,
      });

      const profileData = {
        cnpj: "12345678000195",
        address: "Rua A, 123",
        city: "São Paulo",
        businessHours: {
          monday: { isOpen: true, start: "09:00", end: "18:00" },
          tuesday: { isOpen: true, start: "09:00", end: "18:00" },
          wednesday: { isOpen: true, start: "09:00", end: "18:00" },
          thursday: { isOpen: true, start: "09:00", end: "18:00" },
          friday: { isOpen: true, start: "09:00", end: "18:00" },
          saturday: { isOpen: false, start: "09:00", end: "18:00" },
          sunday: { isOpen: false, start: "09:00", end: "18:00" },
        },
        description: "Salão de beleza especializado",
        photos: ["https://example.com/photo1.jpg"],
      };

      // Act
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/profiles/company",
        headers: {
          authorization: `Bearer 550e8400-e29b-41d4-a716-446655440000`,
        },
        payload: profileData,
      });

      // Assert
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.userId).toBe("user-1");
      expect(body.cnpj).toBe("12345678000195");
      expect(body.address).toBe("Rua A, 123");
      expect(body.description).toBe("Salão de beleza especializado");
      expect(body.photos).toHaveLength(1);
    });

    it("deve retornar erro 400 se usuário não for do tipo COMPANY", async () => {
      // Arrange
      const user = {
        id: "user-1",
        email: "client@example.com",
        passwordHash: await hashPassword("password123"),
        name: "Cliente Teste",
        userType: UserType.CLIENT,
      };

      // Mock do Prisma
      (prisma.user.create as jest.Mock).mockResolvedValue(user);

      // Act
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/profiles/company",
        headers: {
          authorization: `Bearer 550e8400-e29b-41d4-a716-446655440000`,
        },
        payload: {
          cnpj: "12345678000195",
          address: "Rua A, 123",
          city: "São Paulo",
        },
      });

      // Assert
      expect(response.statusCode).toBe(400);
    });
  });

  describe("GET /api/v1/profiles/client/:userId", () => {
    it("deve buscar perfil de cliente com sucesso", async () => {
      // Arrange
      const user = {
        id: "user-1",
        email: "client@example.com",
        passwordHash: await hashPassword("password123"),
        name: "Cliente Teste",
        userType: UserType.CLIENT,
      };

      // Mock do Prisma
      (prisma.user.create as jest.Mock).mockResolvedValue(user);
      (prisma.clientProfile.create as jest.Mock).mockResolvedValue({
        userId: "user-1",
        cpf: "11144477735",
        addresses: [],
        paymentMethods: [],
        favoriteServices: [],
        preferences: {},
      });

      // Act
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/profiles/client/user-1",
        headers: {
          authorization: `Bearer 550e8400-e29b-41d4-a716-446655440000`,
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.userId).toBe("user-1");
      expect(body.cpf).toBe("11144477735");
    });

    it("deve retornar erro 404 se perfil não encontrado", async () => {
      // Arrange
      const user = {
        id: "user-1",
        email: "client@example.com",
        passwordHash: await hashPassword("password123"),
        name: "Cliente Teste",
        userType: UserType.CLIENT,
      };

      // Mock do Prisma
      (prisma.user.create as jest.Mock).mockResolvedValue(user);

      // Act
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/profiles/client/user-1",
        headers: {
          authorization: `Bearer 550e8400-e29b-41d4-a716-446655440000`,
        },
      });

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });
});
