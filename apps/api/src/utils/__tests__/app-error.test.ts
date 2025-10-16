import { describe, it, expect } from "@jest/globals";
import {
  AppError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} from "../app-error";

describe("AppError Classes", () => {
  describe("AppError", () => {
    it("deve criar um erro com mensagem e status code", () => {
      // Act
      const error = new AppError("Erro de teste", 500);

      // Assert
      expect(error.message).toBe("Erro de teste");
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(Error);
    });

    it("deve usar status code padrão 500", () => {
      // Act
      const error = new AppError("Erro sem status code");

      // Assert
      expect(error.statusCode).toBe(500);
    });

    it("deve permitir definir isOperational como false", () => {
      // Act
      const error = new AppError("Erro não operacional", 500, false);

      // Assert
      expect(error.isOperational).toBe(false);
    });

    it("deve manter stack trace", () => {
      // Act
      const error = new AppError("Erro com stack");

      // Assert
      expect(error.stack).toBeDefined();
    });
  });

  describe("NotFoundError", () => {
    it("deve criar erro 404 com recurso especificado", () => {
      // Act
      const error = new NotFoundError("Usuário");

      // Assert
      expect(error.message).toBe("Usuário não encontrado(a)");
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });
  });

  describe("BadRequestError", () => {
    it("deve criar erro 400 com mensagem customizada", () => {
      // Act
      const error = new BadRequestError("Dados inválidos");

      // Assert
      expect(error.message).toBe("Dados inválidos");
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });
  });

  describe("UnauthorizedError", () => {
    it("deve criar erro 401 com mensagem padrão", () => {
      // Act
      const error = new UnauthorizedError();

      // Assert
      expect(error.message).toBe("Não autorizado");
      expect(error.statusCode).toBe(401);
    });

    it("deve criar erro 401 com mensagem customizada", () => {
      // Act
      const error = new UnauthorizedError("Token inválido");

      // Assert
      expect(error.message).toBe("Token inválido");
      expect(error.statusCode).toBe(401);
    });
  });

  describe("ForbiddenError", () => {
    it("deve criar erro 403 com mensagem padrão", () => {
      // Act
      const error = new ForbiddenError();

      // Assert
      expect(error.message).toBe("Acesso negado");
      expect(error.statusCode).toBe(403);
    });

    it("deve criar erro 403 com mensagem customizada", () => {
      // Act
      const error = new ForbiddenError("Sem permissão");

      // Assert
      expect(error.message).toBe("Sem permissão");
      expect(error.statusCode).toBe(403);
    });
  });

  describe("ConflictError", () => {
    it("deve criar erro 409 com mensagem", () => {
      // Act
      const error = new ConflictError("Email já cadastrado");

      // Assert
      expect(error.message).toBe("Email já cadastrado");
      expect(error.statusCode).toBe(409);
      expect(error.isOperational).toBe(true);
    });
  });
});

