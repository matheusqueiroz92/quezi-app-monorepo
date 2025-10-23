/**
 * Testes de integração para CompanyEmployeeAppointment
 * Seguindo TDD e garantindo máxima cobertura
 */

import { FastifyInstance } from "fastify";
import fastify from "fastify";
import { companyEmployeeAppointmentRoutes } from "../company-employee-appointment.routes";
import { errorHandler } from "../../../middlewares/error-handler";

describe("CompanyEmployeeAppointment Integration Tests", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = fastify();
    app.setErrorHandler(errorHandler);
    await app.register(companyEmployeeAppointmentRoutes, { prefix: "/test" });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /test", () => {
    it("deve retornar 401 quando não autenticado", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/test",
        payload: {
          companyId: "123e4567-e89b-12d3-a456-426614174000",
          employeeId: "123e4567-e89b-12d3-a456-426614174001",
          serviceId: "123e4567-e89b-12d3-a456-426614174002",
          scheduledDate: "2024-12-31",
          scheduledTime: "14:00",
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("deve retornar 400 quando dados são inválidos", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/test",
        headers: {
          authorization: "Bearer valid-token",
        },
        payload: {
          // Dados inválidos - faltando campos obrigatórios
          companyId: "company-123",
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("GET /test/:id", () => {
    it("deve retornar 401 quando não autenticado", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/test/123e4567-e89b-12d3-a456-426614174000",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /test", () => {
    it("deve retornar 401 quando não autenticado", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/test",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("PUT /test/:id", () => {
    it("deve retornar 401 quando não autenticado", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/test/123e4567-e89b-12d3-a456-426614174000",
        payload: {
          scheduledDate: "2024-12-31",
          scheduledTime: "15:00",
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("DELETE /test/:id", () => {
    it("deve retornar 401 quando não autenticado", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: "/test/123e4567-e89b-12d3-a456-426614174000",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("PATCH /test/:id/status", () => {
    it("deve retornar 401 quando não autenticado", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: "/test/123e4567-e89b-12d3-a456-426614174000/status",
        payload: {
          status: "ACCEPTED",
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /test/client/my-appointments", () => {
    it("deve retornar 401 quando não autenticado", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/test/client/my-appointments",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /test/company/:companyId", () => {
    it("deve retornar 401 quando não autenticado", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/test/company/123e4567-e89b-12d3-a456-426614174000",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /test/employee/:employeeId", () => {
    it("deve retornar 401 quando não autenticado", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/test/employee/123e4567-e89b-12d3-a456-426614174000",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /test/employee/:employeeId/availability", () => {
    it("deve retornar 401 quando não autenticado", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/test/employee/123e4567-e89b-12d3-a456-426614174000/availability?date=2024-12-31&time=14:00",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /test/employee/:employeeId/available-slots", () => {
    it("deve retornar 401 quando não autenticado", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/test/employee/123e4567-e89b-12d3-a456-426614174000/available-slots?date=2024-12-31",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /test/stats", () => {
    it("deve retornar 401 quando não autenticado", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/test/stats",
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
