/**
 * CompanyEmployeeAppointmentController - Camada de Apresentação
 *
 * Controller para gerenciamento de agendamentos com funcionários de empresa
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { FastifyRequest, FastifyReply } from "fastify";
import { CompanyEmployeeAppointmentService } from "../../application/services/company-employee-appointment.service";
import { CompanyEmployeeAppointmentRepository } from "../../infrastructure/repositories/company-employee-appointment.repository";
import { BadRequestError, NotFoundError } from "../../utils/app-error";

/**
 * Controller para CompanyEmployeeAppointment
 */
export class CompanyEmployeeAppointmentController {
  private companyEmployeeAppointmentService: CompanyEmployeeAppointmentService;

  constructor() {
    const repository = new CompanyEmployeeAppointmentRepository();
    this.companyEmployeeAppointmentService =
      new CompanyEmployeeAppointmentService(repository);
  }

  /**
   * Cria um novo agendamento com funcionário
   */
  async createAppointment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = request.body as any;
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const appointment =
        await this.companyEmployeeAppointmentService.createAppointment({
          ...data,
          clientId: userId,
        });

      return reply.status(201).send({
        success: true,
        data: appointment,
        message: "Agendamento criado com sucesso",
      });
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        return reply.status(error.statusCode || 400).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  /**
   * Busca agendamento por ID
   */
  async getAppointment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const appointment =
        await this.companyEmployeeAppointmentService.getAppointmentById(id);

      return reply.status(200).send({
        success: true,
        data: appointment,
      });
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        return reply.status(error.statusCode || 400).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  /**
   * Lista agendamentos com filtros
   */
  async listAppointments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const filters = request.query as any;
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const result =
        await this.companyEmployeeAppointmentService.listAppointments(filters);

      return reply.status(200).send({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
      });
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        return reply.status(error.statusCode || 400).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  /**
   * Atualiza agendamento
   */
  async updateAppointment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const data = request.body as any;
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const appointment =
        await this.companyEmployeeAppointmentService.updateAppointment(
          id,
          data
        );

      return reply.status(200).send({
        success: true,
        data: appointment,
        message: "Agendamento atualizado com sucesso",
      });
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        return reply.status(error.statusCode || 400).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  /**
   * Remove agendamento
   */
  async deleteAppointment(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      await this.companyEmployeeAppointmentService.deleteAppointment(id);

      return reply.status(200).send({
        success: true,
        message: "Agendamento cancelado com sucesso",
      });
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        return reply.status(error.statusCode || 400).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  /**
   * Atualiza status do agendamento
   */
  async updateAppointmentStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const { status, notes } = request.body as {
        status: string;
        notes?: string;
      };
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const appointment =
        await this.companyEmployeeAppointmentService.updateAppointmentStatus(
          id,
          status as any,
          notes
        );

      return reply.status(200).send({
        success: true,
        data: appointment,
        message: "Status do agendamento atualizado com sucesso",
      });
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        return reply.status(error.statusCode || 400).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  /**
   * Busca agendamentos por cliente
   */
  async getClientAppointments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const filters = request.query as any;
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const result =
        await this.companyEmployeeAppointmentService.getClientAppointments(
          userId,
          filters
        );

      return reply.status(200).send({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
      });
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        return reply.status(error.statusCode || 400).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  /**
   * Busca agendamentos por empresa
   */
  async getCompanyAppointments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { companyId } = request.params as { companyId: string };
      const filters = request.query as any;
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const result =
        await this.companyEmployeeAppointmentService.getCompanyAppointments(
          companyId,
          filters
        );

      return reply.status(200).send({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
      });
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        return reply.status(error.statusCode || 400).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  /**
   * Busca agendamentos por funcionário
   */
  async getEmployeeAppointments(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { employeeId } = request.params as { employeeId: string };
      const filters = request.query as any;
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const result =
        await this.companyEmployeeAppointmentService.getEmployeeAppointments(
          employeeId,
          filters
        );

      return reply.status(200).send({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        },
      });
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        return reply.status(error.statusCode || 400).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  /**
   * Verifica disponibilidade de funcionário
   */
  async checkEmployeeAvailability(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { employeeId } = request.params as { employeeId: string };
      const { date, time } = request.query as { date: string; time: string };
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const isAvailable =
        await this.companyEmployeeAppointmentService.checkEmployeeAvailability(
          employeeId,
          new Date(date),
          time
        );

      return reply.status(200).send({
        success: true,
        data: { isAvailable },
      });
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        return reply.status(error.statusCode || 400).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  /**
   * Obtém horários disponíveis para funcionário
   */
  async getEmployeeAvailableTimeSlots(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { employeeId } = request.params as { employeeId: string };
      const { date } = request.query as { date: string };
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const timeSlots =
        await this.companyEmployeeAppointmentService.getEmployeeAvailableTimeSlots(
          employeeId,
          new Date(date)
        );

      return reply.status(200).send({
        success: true,
        data: { timeSlots },
      });
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        return reply.status(error.statusCode || 400).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  /**
   * Obtém estatísticas de agendamentos
   */
  async getStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const filters = request.query as any;
      const userId = (request as any).user?.id;

      if (!userId) {
        throw new BadRequestError("Usuário não autenticado");
      }

      const stats =
        await this.companyEmployeeAppointmentService.getAppointmentStats(
          filters
        );

      return reply.status(200).send({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        return reply.status(error.statusCode || 400).send({
          success: false,
          message: error.message,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }
}
