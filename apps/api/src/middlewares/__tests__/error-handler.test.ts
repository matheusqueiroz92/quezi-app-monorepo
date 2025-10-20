import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { AppError } from "../../utils/app-error";
import { ZodError } from "zod";

// Mock do env antes de importar error-handler
jest.mock("../../config/env", () => ({
  env: {
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://test",
    JWT_SECRET: "test-secret",
    BETTER_AUTH_SECRET: "test-secret",
    BETTER_AUTH_URL: "http://localhost:3333",
  },
}));

import { errorHandler } from "../error-handler";

describe("errorHandler", () => {
  let requestMock: any;
  let replyMock: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    requestMock = {
      url: "/api/v1/test",
      method: "POST",
    };

    replyMock = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    // Silenciar console.error durante os testes
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("AppError", () => {
    it("deve tratar AppError corretamente", async () => {
      const error = new AppError("Erro customizado", 400);

      await errorHandler(error as any, requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(400);
      expect(replyMock.send).toHaveBeenCalledWith({
        error: "ApplicationError",
        message: "Erro customizado",
        statusCode: 400,
      });
    });

    it("deve tratar AppError com status 404", async () => {
      const error = new AppError("Não encontrado", 404);

      await errorHandler(error as any, requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(404);
      expect(replyMock.send).toHaveBeenCalledWith({
        error: "ApplicationError",
        message: "Não encontrado",
        statusCode: 404,
      });
    });

    it("deve tratar AppError com status 403", async () => {
      const error = new AppError("Acesso negado", 403);

      await errorHandler(error as any, requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(403);
    });

    it("deve logar erro no console", async () => {
      const error = new AppError("Erro teste", 400);

      await errorHandler(error as any, requestMock, replyMock);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "❌ Erro capturado:",
        expect.objectContaining({
          path: "/api/v1/test",
          method: "POST",
          error: "Erro teste",
        })
      );
    });
  });

  describe("ZodError", () => {
    it("deve tratar erro de validação Zod", async () => {
      const zodError = {
        issues: [
          {
            path: ["name"],
            message: "Campo obrigatório",
          },
          {
            path: ["email"],
            message: "Email inválido",
          },
        ],
      };

      await errorHandler(zodError as any, requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(400);
      expect(replyMock.send).toHaveBeenCalledWith({
        error: "ValidationError",
        message: "Erro de validação dos dados",
        statusCode: 400,
        details: [
          { path: "name", message: "Campo obrigatório" },
          { path: "email", message: "Email inválido" },
        ],
      });
    });

    it("deve formatar path corretamente para campos aninhados", async () => {
      const zodError = {
        issues: [
          {
            path: ["user", "profile", "bio"],
            message: "Bio muito longa",
          },
        ],
      };

      await errorHandler(zodError as any, requestMock, replyMock);

      expect(replyMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          details: [{ path: "user.profile.bio", message: "Bio muito longa" }],
        })
      );
    });
  });

  describe("Fastify ValidationError", () => {
    it("deve tratar erro de validação do Fastify", async () => {
      const fastifyError = {
        validation: [
          {
            keyword: "required",
            params: { missingProperty: "name" },
          },
        ],
        statusCode: 400,
      };

      await errorHandler(fastifyError as any, requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(400);
      expect(replyMock.send).toHaveBeenCalledWith({
        error: "ValidationError",
        message: "Erro de validação dos dados",
        statusCode: 400,
        details: fastifyError.validation,
      });
    });
  });

  describe("Generic Errors", () => {
    it("deve tratar erro genérico com status 500", async () => {
      const error = {
        message: "Erro inesperado",
      };

      await errorHandler(error as any, requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(500);
      expect(replyMock.send).toHaveBeenCalledWith({
        error: "InternalServerError",
        message: "Erro inesperado",
        statusCode: 500,
      });
    });

    it("deve usar statusCode do erro se fornecido", async () => {
      const error = {
        message: "Erro customizado",
        statusCode: 503,
      };

      await errorHandler(error as any, requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(503);
      expect(replyMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 503,
        })
      );
    });
  });
});
