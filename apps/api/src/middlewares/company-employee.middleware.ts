import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/prisma";
import { NotFoundError, ForbiddenError } from "../utils/app-error";

/**
 * Middleware para verificar se o funcionário pertence à empresa do usuário
 * Deve ser usado em rotas que acessam funcionários específicos
 */
export async function requireEmployeeOwnership(
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

  const { id } = request.params as { id: string };

  if (!id) {
    throw new ForbiddenError("ID do funcionário é obrigatório");
  }

  // Verificar se o funcionário existe e pertence à empresa
  const employee = await prisma.companyEmployee.findFirst({
    where: {
      id,
      companyId: request.user.id,
    },
  });

  if (!employee) {
    throw new NotFoundError(
      "Funcionário não encontrado ou não pertence à sua empresa"
    );
  }

  // Adicionar o funcionário ao request para uso posterior
  (request as any).employee = employee;
}

/**
 * Middleware para verificar se o agendamento pertence à empresa
 * Deve ser usado em rotas que acessam agendamentos específicos
 */
export async function requireAppointmentOwnership(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Verificar se o usuário está autenticado
  if (!request.user) {
    throw new ForbiddenError("Usuário não autenticado");
  }

  const { id } = request.params as { id: string };

  if (!id) {
    throw new ForbiddenError("ID do agendamento é obrigatório");
  }

  // Verificar se o agendamento existe e pertence à empresa
  const appointment = await prisma.companyEmployeeAppointment.findFirst({
    where: {
      id,
      employee: {
        companyId: request.user.id,
      },
    },
    include: {
      employee: true,
    },
  });

  if (!appointment) {
    throw new NotFoundError(
      "Agendamento não encontrado ou não pertence à sua empresa"
    );
  }

  // Adicionar o agendamento ao request para uso posterior
  (request as any).appointment = appointment;
}

/**
 * Middleware para verificar se o cliente pode acessar o agendamento
 * Clientes só podem acessar seus próprios agendamentos
 */
export async function requireClientAppointmentAccess(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Verificar se o usuário está autenticado
  if (!request.user) {
    throw new ForbiddenError("Usuário não autenticado");
  }

  // Verificar se o usuário é CLIENT
  if (request.user.userType !== "CLIENT") {
    throw new ForbiddenError("Apenas clientes podem acessar este recurso");
  }

  const { id } = request.params as { id: string };

  if (!id) {
    throw new ForbiddenError("ID do agendamento é obrigatório");
  }

  // Verificar se o agendamento existe e pertence ao cliente
  const appointment = await prisma.companyEmployeeAppointment.findFirst({
    where: {
      id,
      clientId: request.user.id,
    },
    include: {
      employee: true,
    },
  });

  if (!appointment) {
    throw new NotFoundError(
      "Agendamento não encontrado ou não pertence a você"
    );
  }

  // Adicionar o agendamento ao request para uso posterior
  (request as any).appointment = appointment;
}
