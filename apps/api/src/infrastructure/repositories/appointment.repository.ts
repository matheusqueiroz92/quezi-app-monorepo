/**
 * Repositório Appointment - Camada de Infraestrutura
 *
 * Implementação concreta para persistência de agendamentos
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { Appointment } from "../../domain/entities/appointment.entity";
import { prisma } from "../../lib/prisma";
import { BadRequestError, NotFoundError } from "../../utils/app-error";

/**
 * Repositório concreto para Appointment
 */
export class AppointmentRepository {
  /**
   * Cria um novo agendamento
   */
  async create(data: any): Promise<Appointment> {
    try {
      const appointment = await prisma.appointment.create({
        data: {
          id: data.id,
          clientId: data.clientId,
          professionalId: data.professionalId,
          serviceId: data.serviceId,
          scheduledDate: data.scheduledDate,
          scheduledTime: data.scheduledTime,
          status: data.status || "PENDING",
          location: data.location,
          clientNotes: data.clientNotes,
          professionalNotes: data.professionalNotes,
        },
        include: {
          client: true,
          professional: true,
          service: true,
        },
      });

      return Appointment.fromPersistence(appointment);
    } catch (error: any) {
      throw new BadRequestError(`Erro ao criar agendamento: ${error.message}`);
    }
  }

  /**
   * Busca agendamento por ID
   */
  async findById(id: string): Promise<Appointment | null> {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          client: true,
          professional: true,
          service: true,
          review: true,
        },
      });

      if (!appointment) {
        return null;
      }

      return Appointment.fromPersistence(appointment);
    } catch (error: any) {
      throw new BadRequestError(`Erro ao buscar agendamento: ${error.message}`);
    }
  }

  /**
   * Lista agendamentos com filtros
   */
  async findMany(filters: any): Promise<any> {
    try {
      const {
        skip = 0,
        take = 10,
        clientId,
        professionalId,
        status,
        dateFrom,
        dateTo,
      } = filters;

      const where: any = {};
      if (clientId) where.clientId = clientId;
      if (professionalId) where.professionalId = professionalId;
      if (status) where.status = status;
      if (dateFrom || dateTo) {
        where.scheduledDate = {};
        if (dateFrom) where.scheduledDate.gte = new Date(dateFrom);
        if (dateTo) where.scheduledDate.lte = new Date(dateTo);
      }

      const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
          where,
          skip,
          take,
          orderBy: { scheduledDate: "desc" },
          include: {
            client: true,
            professional: true,
            service: true,
            review: true,
          },
        }),
        prisma.appointment.count({ where }),
      ]);

      return {
        data: appointments.map((appointment) =>
          Appointment.fromPersistence(appointment)
        ),
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        hasNext: skip + take < total,
        hasPrev: skip > 0,
      };
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao listar agendamentos: ${error.message}`
      );
    }
  }

  /**
   * Atualiza agendamento
   */
  async update(id: string, data: any): Promise<Appointment> {
    try {
      const appointment = await prisma.appointment.update({
        where: { id },
        data: {
          scheduledDate: data.scheduledDate,
          scheduledTime: data.scheduledTime,
          status: data.status,
          location: data.location,
          clientNotes: data.clientNotes,
          professionalNotes: data.professionalNotes,
        },
        include: {
          client: true,
          professional: true,
          service: true,
          review: true,
        },
      });

      return Appointment.fromPersistence(appointment);
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new NotFoundError("Agendamento não encontrado");
      }
      throw new BadRequestError(
        `Erro ao atualizar agendamento: ${error.message}`
      );
    }
  }

  /**
   * Remove agendamento
   */
  async delete(id: string): Promise<void> {
    try {
      await prisma.appointment.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new NotFoundError("Agendamento não encontrado");
      }
      throw new BadRequestError(
        `Erro ao remover agendamento: ${error.message}`
      );
    }
  }

  /**
   * Verifica se agendamento existe
   */
  async exists(id: string): Promise<boolean> {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id },
        select: { id: true },
      });

      return !!appointment;
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao verificar agendamento: ${error.message}`
      );
    }
  }

  /**
   * Atualiza status do agendamento
   */
  async updateStatus(
    id: string,
    status: string,
    notes?: string
  ): Promise<Appointment> {
    try {
      const appointment = await prisma.appointment.update({
        where: { id },
        data: {
          status: status as any, // Prisma enum type
          professionalNotes: notes,
          updatedAt: new Date(),
        },
        include: {
          client: true,
          professional: true,
          service: true,
          review: true,
        },
      });

      return Appointment.fromPersistence(appointment);
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new NotFoundError("Agendamento não encontrado");
      }
      throw new BadRequestError(`Erro ao atualizar status: ${error.message}`);
    }
  }

  /**
   * Busca agendamentos por cliente
   */
  async findByClient(clientId: string, filters: any = {}): Promise<any> {
    try {
      const { skip = 0, take = 10, status, dateFrom, dateTo } = filters;

      const where: any = { clientId };
      if (status) where.status = status;
      if (dateFrom || dateTo) {
        where.scheduledDate = {};
        if (dateFrom) where.scheduledDate.gte = new Date(dateFrom);
        if (dateTo) where.scheduledDate.lte = new Date(dateTo);
      }

      const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
          where,
          skip,
          take,
          orderBy: { scheduledDate: "desc" },
          include: {
            client: true,
            professional: true,
            service: true,
            review: true,
          },
        }),
        prisma.appointment.count({ where }),
      ]);

      return {
        data: appointments.map((appointment) =>
          Appointment.fromPersistence(appointment)
        ),
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        hasNext: skip + take < total,
        hasPrev: skip > 0,
      };
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao buscar agendamentos do cliente: ${error.message}`
      );
    }
  }

  /**
   * Busca agendamentos por profissional
   */
  async findByProfessional(
    professionalId: string,
    filters: any = {}
  ): Promise<any> {
    try {
      const { skip = 0, take = 10, status, dateFrom, dateTo } = filters;

      const where: any = { professionalId };
      if (status) where.status = status;
      if (dateFrom || dateTo) {
        where.scheduledDate = {};
        if (dateFrom) where.scheduledDate.gte = new Date(dateFrom);
        if (dateTo) where.scheduledDate.lte = new Date(dateTo);
      }

      const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
          where,
          skip,
          take,
          orderBy: { scheduledDate: "desc" },
          include: {
            client: true,
            professional: true,
            service: true,
            review: true,
          },
        }),
        prisma.appointment.count({ where }),
      ]);

      return {
        data: appointments.map((appointment) =>
          Appointment.fromPersistence(appointment)
        ),
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        hasNext: skip + take < total,
        hasPrev: skip > 0,
      };
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao buscar agendamentos do profissional: ${error.message}`
      );
    }
  }

  /**
   * Verifica conflitos de horário
   */
  async hasConflict(
    professionalId: string,
    scheduledDate: Date,
    scheduledTime: string
  ): Promise<boolean> {
    try {
      const appointment = await prisma.appointment.findFirst({
        where: {
          professionalId,
          scheduledDate: {
            gte: new Date(
              scheduledDate.getFullYear(),
              scheduledDate.getMonth(),
              scheduledDate.getDate()
            ),
            lt: new Date(
              scheduledDate.getFullYear(),
              scheduledDate.getMonth(),
              scheduledDate.getDate() + 1
            ),
          },
          scheduledTime,
          status: {
            in: ["PENDING", "ACCEPTED"],
          },
        },
      });

      return !!appointment;
    } catch (error: any) {
      throw new BadRequestError(`Erro ao verificar conflito: ${error.message}`);
    }
  }

  /**
   * Obtém estatísticas de agendamentos
   */
  async getStats(filters: any = {}): Promise<any> {
    try {
      const { professionalId, clientId, dateFrom, dateTo } = filters;

      const where: any = {};
      if (professionalId) where.professionalId = professionalId;
      if (clientId) where.clientId = clientId;
      if (dateFrom || dateTo) {
        where.scheduledDate = {};
        if (dateFrom) where.scheduledDate.gte = new Date(dateFrom);
        if (dateTo) where.scheduledDate.lte = new Date(dateTo);
      }

      const [total, pending, accepted, completed, cancelled] =
        await Promise.all([
          prisma.appointment.count({ where }),
          prisma.appointment.count({ where: { ...where, status: "PENDING" } }),
          prisma.appointment.count({ where: { ...where, status: "ACCEPTED" } }),
          prisma.appointment.count({
            where: { ...where, status: "COMPLETED" },
          }),
          prisma.appointment.count({
            where: { ...where, status: "CANCELLED" },
          }),
        ]);

      return {
        total,
        pending,
        accepted,
        completed,
        cancelled,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
        cancellationRate: total > 0 ? (cancelled / total) * 100 : 0,
      };
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao buscar estatísticas: ${error.message}`
      );
    }
  }
}
