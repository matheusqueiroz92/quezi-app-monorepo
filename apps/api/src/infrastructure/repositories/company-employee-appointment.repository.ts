/**
 * Repositório CompanyEmployeeAppointment - Camada de Infraestrutura
 *
 * Implementação concreta para persistência de agendamentos com funcionários de empresa
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { CompanyEmployeeAppointment } from "../../domain/entities/company-employee-appointment.entity";
import { prisma } from "../../lib/prisma";
import { BadRequestError, NotFoundError } from "../../utils/app-error";

/**
 * Repositório concreto para CompanyEmployeeAppointment
 */
export class CompanyEmployeeAppointmentRepository {
  constructor(private prismaClient = prisma) {}

  /**
   * Cria um novo agendamento com funcionário
   */
  async create(data: any): Promise<CompanyEmployeeAppointment> {
    try {
      const appointment =
        await this.prismaClient.companyEmployeeAppointment.create({
          data: {
            id: data.id,
            clientId: data.clientId,
            companyId: data.companyId,
            employeeId: data.employeeId,
            serviceId: data.serviceId,
            scheduledDate: data.scheduledDate,
            scheduledTime: data.scheduledTime,
            status: data.status || "PENDING",
            location: data.location,
            clientNotes: data.clientNotes,
            employeeNotes: data.employeeNotes,
          },
          include: {
            client: true,
            company: true,
            employee: true,
            service: true,
          },
        });

      return CompanyEmployeeAppointment.fromPersistence(appointment);
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao criar agendamento com funcionário: ${error.message}`
      );
    }
  }

  /**
   * Busca agendamento por ID
   */
  async findById(id: string): Promise<CompanyEmployeeAppointment | null> {
    try {
      const appointment =
        await this.prismaClient.companyEmployeeAppointment.findUnique({
          where: { id },
          include: {
            client: true,
            company: true,
            employee: true,
            service: true,
            review: true,
          },
        });

      if (!appointment) {
        return null;
      }

      return CompanyEmployeeAppointment.fromPersistence(appointment);
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
        companyId,
        employeeId,
        status,
        dateFrom,
        dateTo,
      } = filters;

      const where: any = {};
      if (clientId) where.clientId = clientId;
      if (companyId) where.companyId = companyId;
      if (employeeId) where.employeeId = employeeId;
      if (status) where.status = status;
      if (dateFrom || dateTo) {
        where.scheduledDate = {};
        if (dateFrom) where.scheduledDate.gte = new Date(dateFrom);
        if (dateTo) where.scheduledDate.lte = new Date(dateTo);
      }

      const [appointments, total] = await Promise.all([
        this.prismaClient.companyEmployeeAppointment.findMany({
          where,
          skip,
          take,
          orderBy: { scheduledDate: "desc" },
          include: {
            client: true,
            company: true,
            employee: true,
            service: true,
            review: true,
          },
        }),
        this.prismaClient.companyEmployeeAppointment.count({ where }),
      ]);

      return {
        data: appointments.map((appointment) =>
          CompanyEmployeeAppointment.fromPersistence(appointment)
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
  async update(id: string, data: any): Promise<CompanyEmployeeAppointment> {
    try {
      const appointment =
        await this.prismaClient.companyEmployeeAppointment.update({
          where: { id },
          data: {
            scheduledDate: data.scheduledDate,
            scheduledTime: data.scheduledTime,
            status: data.status,
            location: data.location,
            clientNotes: data.clientNotes,
            employeeNotes: data.employeeNotes,
          },
          include: {
            client: true,
            company: true,
            employee: true,
            service: true,
            review: true,
          },
        });

      return CompanyEmployeeAppointment.fromPersistence(appointment);
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
      await this.prismaClient.companyEmployeeAppointment.delete({
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
      const appointment =
        await this.prismaClient.companyEmployeeAppointment.findUnique({
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
  ): Promise<CompanyEmployeeAppointment> {
    try {
      const appointment =
        await this.prismaClient.companyEmployeeAppointment.update({
          where: { id },
          data: {
            status: status as any, // Prisma enum type
            employeeNotes: notes,
            updatedAt: new Date(),
          },
          include: {
            client: true,
            company: true,
            employee: true,
            service: true,
            review: true,
          },
        });

      return CompanyEmployeeAppointment.fromPersistence(appointment);
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
        this.prismaClient.companyEmployeeAppointment.findMany({
          where,
          skip,
          take,
          orderBy: { scheduledDate: "desc" },
          include: {
            client: true,
            company: true,
            employee: true,
            service: true,
            review: true,
          },
        }),
        this.prismaClient.companyEmployeeAppointment.count({ where }),
      ]);

      return {
        data: appointments.map((appointment) =>
          CompanyEmployeeAppointment.fromPersistence(appointment)
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
   * Busca agendamentos por empresa
   */
  async findByCompany(companyId: string, filters: any = {}): Promise<any> {
    try {
      const { skip = 0, take = 10, status, dateFrom, dateTo } = filters;

      const where: any = { companyId };
      if (status) where.status = status;
      if (dateFrom || dateTo) {
        where.scheduledDate = {};
        if (dateFrom) where.scheduledDate.gte = new Date(dateFrom);
        if (dateTo) where.scheduledDate.lte = new Date(dateTo);
      }

      const [appointments, total] = await Promise.all([
        this.prismaClient.companyEmployeeAppointment.findMany({
          where,
          skip,
          take,
          orderBy: { scheduledDate: "desc" },
          include: {
            client: true,
            company: true,
            employee: true,
            service: true,
            review: true,
          },
        }),
        this.prismaClient.companyEmployeeAppointment.count({ where }),
      ]);

      return {
        data: appointments.map((appointment) =>
          CompanyEmployeeAppointment.fromPersistence(appointment)
        ),
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        hasNext: skip + take < total,
        hasPrev: skip > 0,
      };
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao buscar agendamentos da empresa: ${error.message}`
      );
    }
  }

  /**
   * Busca agendamentos por funcionário
   */
  async findByEmployee(employeeId: string, filters: any = {}): Promise<any> {
    try {
      const { skip = 0, take = 10, status, dateFrom, dateTo } = filters;

      const where: any = { employeeId };
      if (status) where.status = status;
      if (dateFrom || dateTo) {
        where.scheduledDate = {};
        if (dateFrom) where.scheduledDate.gte = new Date(dateFrom);
        if (dateTo) where.scheduledDate.lte = new Date(dateTo);
      }

      const [appointments, total] = await Promise.all([
        this.prismaClient.companyEmployeeAppointment.findMany({
          where,
          skip,
          take,
          orderBy: { scheduledDate: "desc" },
          include: {
            client: true,
            company: true,
            employee: true,
            service: true,
            review: true,
          },
        }),
        this.prismaClient.companyEmployeeAppointment.count({ where }),
      ]);

      return {
        data: appointments.map((appointment) =>
          CompanyEmployeeAppointment.fromPersistence(appointment)
        ),
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        hasNext: skip + take < total,
        hasPrev: skip > 0,
      };
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao buscar agendamentos do funcionário: ${error.message}`
      );
    }
  }

  /**
   * Verifica conflitos de horário para funcionário
   */
  async hasConflict(
    employeeId: string,
    scheduledDate: Date,
    scheduledTime: string
  ): Promise<boolean> {
    try {
      const appointment =
        await this.prismaClient.companyEmployeeAppointment.findFirst({
          where: {
            employeeId,
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
      const { companyId, employeeId, clientId, dateFrom, dateTo } = filters;

      const where: any = {};
      if (companyId) where.companyId = companyId;
      if (employeeId) where.employeeId = employeeId;
      if (clientId) where.clientId = clientId;
      if (dateFrom || dateTo) {
        where.scheduledDate = {};
        if (dateFrom) where.scheduledDate.gte = new Date(dateFrom);
        if (dateTo) where.scheduledDate.lte = new Date(dateTo);
      }

      const [total, pending, accepted, completed, cancelled] =
        await Promise.all([
          this.prismaClient.companyEmployeeAppointment.count({ where }),
          this.prismaClient.companyEmployeeAppointment.count({
            where: { ...where, status: "PENDING" },
          }),
          this.prismaClient.companyEmployeeAppointment.count({
            where: { ...where, status: "ACCEPTED" },
          }),
          this.prismaClient.companyEmployeeAppointment.count({
            where: { ...where, status: "COMPLETED" },
          }),
          this.prismaClient.companyEmployeeAppointment.count({
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
