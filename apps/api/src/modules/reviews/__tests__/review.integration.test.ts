/**
 * Testes de integração para Review
 * Seguindo TDD e garantindo máxima cobertura
 */

import { FastifyInstance } from "fastify";
import fastify from "fastify";
import { reviewRoutes } from "../review.routes";
import { errorHandler } from "../../../middlewares/error-handler";

describe("Review Integration Tests", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = fastify();
    app.setErrorHandler(errorHandler);
    await app.register(reviewRoutes, { prefix: "/test" });
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
          appointmentId: "123e4567-e89b-12d3-a456-426614174000",
          professionalId: "123e4567-e89b-12d3-a456-426614174001",
          rating: 5,
          comment: "Excelente serviço!",
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
          // Dados inválidos - rating fora do range
          appointmentId: "123e4567-e89b-12d3-a456-426614174000",
          professionalId: "123e4567-e89b-12d3-a456-426614174001",
          rating: 6, // Inválido - deve ser 1-5
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

  describe("GET /test/appointment/:appointmentId", () => {
    it("deve retornar 401 quando não autenticado", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/test/appointment/123e4567-e89b-12d3-a456-426614174000",
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
          rating: 4,
          comment: "Muito bom!",
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

  describe("GET /test/professional/:professionalId", () => {
    it("deve retornar 401 quando não autenticado", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/test/professional/123e4567-e89b-12d3-a456-426614174000",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /test/client/my-reviews", () => {
    it("deve retornar 401 quando não autenticado", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/test/client/my-reviews",
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

  describe("GET /test/professional/:professionalId/average-rating", () => {
    it("deve retornar 401 quando não autenticado", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/test/professional/123e4567-e89b-12d3-a456-426614174000/average-rating",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /test/professional/:professionalId/recent", () => {
    it("deve retornar 401 quando não autenticado", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/test/professional/123e4567-e89b-12d3-a456-426614174000/recent",
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
