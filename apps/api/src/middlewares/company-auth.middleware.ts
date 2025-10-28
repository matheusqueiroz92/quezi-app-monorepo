import { FastifyRequest, FastifyReply } from "fastify";
import { ForbiddenError } from "../utils/app-error";

/**
 * Middleware para verificar se o usuário é do tipo COMPANY
 * Deve ser usado após o middleware de autenticação
 */
export async function requireCompany(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Verificar se o usuário está autenticado
  if (!request.user) {
    throw new ForbiddenError("Usuário não autenticado");
  }

  // Verificar se o usuário é do tipo COMPANY
  if (request.user.userType !== "COMPANY") {
    throw new ForbiddenError("Apenas empresas podem acessar este recurso");
  }
}

/**
 * Middleware para verificar se o usuário pode acessar recursos de uma empresa específica
 * Verifica se o usuário é o dono da empresa ou se tem permissão de acesso
 */
export async function requireCompanyOwnership(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Verificar se o usuário está autenticado
  if (!request.user) {
    throw new ForbiddenError("Usuário não autenticado");
  }

  // Verificar se o usuário é do tipo COMPANY
  if (request.user.userType !== "COMPANY") {
    throw new ForbiddenError("Apenas empresas podem acessar este recurso");
  }

  // Para recursos específicos de funcionários, verificar se a empresa é a dona
  const { id } = request.params as { id: string };

  if (id && request.user.id !== id) {
    // Aqui você pode implementar lógica adicional para verificar
    // se a empresa tem acesso ao recurso específico
    // Por exemplo, verificar se o funcionário pertence à empresa
    throw new ForbiddenError(
      "Acesso negado: recurso não pertence à sua empresa"
    );
  }
}

/**
 * Middleware para verificar se o usuário pode criar agendamentos
 * Clientes podem criar agendamentos, empresas podem gerenciar
 */
export async function requireAppointmentAccess(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Verificar se o usuário está autenticado
  if (!request.user) {
    throw new ForbiddenError("Usuário não autenticado");
  }

  // Verificar se o usuário é CLIENT ou COMPANY
  if (!["CLIENT", "COMPANY"].includes(request.user.userType || "")) {
    throw new ForbiddenError(
      "Apenas clientes e empresas podem acessar agendamentos"
    );
  }
}

/**
 * Middleware para verificar se o usuário pode criar avaliações
 * Apenas clientes podem avaliar após agendamento concluído
 */
export async function requireReviewAccess(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Verificar se o usuário está autenticado
  if (!request.user) {
    throw new ForbiddenError("Usuário não autenticado");
  }

  // Verificar se o usuário é CLIENT
  if (request.user.userType !== "CLIENT") {
    throw new ForbiddenError("Apenas clientes podem criar avaliações");
  }
}
