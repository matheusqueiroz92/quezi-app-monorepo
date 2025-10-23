/**
 * Testes Simples de Integração para ProfileController
 *
 * Testa a funcionalidade básica sem mocks complexos
 * Foca na validação e estrutura das rotas
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { FastifyInstance } from "fastify";
import { buildApp } from "../../../app";
import { prisma } from "../../../lib/prisma";
import { hashPassword } from "../../../utils/password";
import { UserType } from "../../../domain/interfaces/user.interface";

describe("Profile Simple Integration Tests", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
    await prisma.clientProfile.deleteMany();
    await prisma.professionalProfile.deleteMany();
    await prisma.companyProfile.deleteMany();
  });

  describe("POST /api/v1/profiles/client", () => {
    it("deve retornar erro 401 se não autenticado", async () => {
      // Arrange
      const profileData = {
        cpf: "11144477735",
        addresses: [],
        paymentMethods: [],
        favoriteServices: [],
        preferences: {},
      };

      // Act
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/profiles/client",
        payload: profileData,
      });

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it("deve retornar erro 400 se dados inválidos", async () => {
      // Arrange
      const profileData = {
        cpf: "123", // CPF inválido
        addresses: [],
        paymentMethods: [],
        favoriteServices: [],
        preferences: {},
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
      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /api/v1/profiles/professional", () => {
    it("deve retornar erro 401 se não autenticado", async () => {
      // Arrange
      const profileData = {
        address: "Rua A, 123",
        city: "São Paulo",
        serviceMode: "AT_LOCATION",
        specialties: ["Corte", "Barba"],
        workingHours: {},
        certifications: [],
        portfolio: [],
      };

      // Act
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/profiles/professional",
        payload: profileData,
      });

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it("deve retornar erro 400 se dados inválidos", async () => {
      // Arrange
      const profileData = {
        address: "Rua", // Muito curto
        city: "São Paulo",
        serviceMode: "AT_LOCATION",
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
      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /api/v1/profiles/company", () => {
    it("deve retornar erro 401 se não autenticado", async () => {
      // Arrange
      const profileData = {
        cnpj: "12345678000195",
        address: "Rua A, 123",
        city: "São Paulo",
        businessHours: {},
        description: "Salão de beleza especializado",
        photos: [],
      };

      // Act
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/profiles/company",
        payload: profileData,
      });

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it("deve retornar erro 400 se dados inválidos", async () => {
      // Arrange
      const profileData = {
        cnpj: "123", // CNPJ inválido
        address: "Rua", // Muito curto
        city: "São Paulo",
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
      expect(response.statusCode).toBe(400);
    });
  });

  describe("GET /api/v1/profiles/client/:userId", () => {
    it("deve retornar erro 401 se não autenticado", async () => {
      // Act
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/profiles/client/user-1",
      });

      // Assert
      expect(response.statusCode).toBe(401);
    });
  });
});
