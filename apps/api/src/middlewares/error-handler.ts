import {
  type FastifyError,
  type FastifyReply,
  type FastifyRequest,
} from "fastify";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error";
import { env } from "../config/env";

/**
 * Handler global de erros do Fastify
 */
export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Log do erro (em produção, usar um logger apropriado)
  console.error("❌ Erro capturado:", {
    path: request.url,
    method: request.method,
    error: error.message,
    stack: env.NODE_ENV === "development" ? error.stack : undefined,
  });

  // Erro customizado da aplicação
  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      error: "ApplicationError",
      message: error.message,
      statusCode: error.statusCode,
    });
    return;
  }

  // Erro de validação Zod
  if ("issues" in error) {
    const zodError = error as unknown as ZodError;
    reply.status(400).send({
      error: "ValidationError",
      message: "Erro de validação dos dados",
      statusCode: 400,
      details: zodError.issues.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      })),
    });
    return;
  }

  // Erro de validação do Fastify
  if (error.validation) {
    reply.status(400).send({
      error: "ValidationError",
      message: "Erro de validação dos dados",
      statusCode: 400,
      details: error.validation,
    });
    return;
  }

  // Erro padrão - 500 Internal Server Error
  const statusCode = error.statusCode || 500;
  reply.status(statusCode).send({
    error: "InternalServerError",
    message:
      env.NODE_ENV === "production"
        ? "Erro interno do servidor"
        : error.message,
    statusCode,
  });
}
