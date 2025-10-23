/**
 * Repositório CompanyEmployee - Camada de Infraestrutura
 *
 * Implementação concreta para persistência de funcionários de empresa
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { ICompanyEmployeeRepository } from "../../domain/interfaces/repository.interface";
import { CompanyEmployee } from "../../domain/entities/company-employee.entity";
import { prisma } from "../../lib/prisma";
import { BadRequestError, NotFoundError } from "../../utils/app-error";

/**
 * Repositório concreto para CompanyEmployee
 */
export class CompanyEmployeeRepository implements ICompanyEmployeeRepository {
  /**
   * Cria um novo funcionário
   */
  async create(data: any): Promise<CompanyEmployee> {
    try {
      const employee = await prisma.companyEmployee.create({
        data: {
          id: data.id,
          companyId: data.companyId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          position: data.position,
          specialties: data.specialties || [],
          isActive: data.isActive !== undefined ? data.isActive : true,
          workingHours: data.workingHours,
        },
      });

      return CompanyEmployee.fromPersistence(employee);
    } catch (error: any) {
      throw new BadRequestError(`Erro ao criar funcionário: ${error.message}`);
    }
  }

  /**
   * Busca funcionário por ID
   */
  async findById(id: string): Promise<CompanyEmployee | null> {
    try {
      const employee = await prisma.companyEmployee.findUnique({
        where: { id },
      });

      if (!employee) {
        return null;
      }

      return CompanyEmployee.fromPersistence(employee);
    } catch (error: any) {
      throw new BadRequestError(`Erro ao buscar funcionário: ${error.message}`);
    }
  }

  /**
   * Lista funcionários com filtros
   */
  async findMany(filters: any): Promise<any> {
    try {
      const { skip = 0, take = 10, companyId, isActive, search } = filters;

      const where: any = {};
      if (companyId) where.companyId = companyId;
      if (isActive !== undefined) where.isActive = isActive;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { position: { contains: search, mode: "insensitive" } },
        ];
      }

      const [employees, total] = await Promise.all([
        prisma.companyEmployee.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
        }),
        prisma.companyEmployee.count({ where }),
      ]);

      return {
        data: employees.map((emp) => CompanyEmployee.fromPersistence(emp)),
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        hasNext: skip + take < total,
        hasPrev: skip > 0,
      };
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao listar funcionários: ${error.message}`
      );
    }
  }

  /**
   * Atualiza funcionário
   */
  async update(id: string, data: any): Promise<CompanyEmployee> {
    try {
      const employee = await prisma.companyEmployee.update({
        where: { id },
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          position: data.position,
          specialties: data.specialties,
          isActive: data.isActive,
          workingHours: data.workingHours,
        },
      });

      return CompanyEmployee.fromPersistence(employee);
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new NotFoundError("Funcionário não encontrado");
      }
      throw new BadRequestError(
        `Erro ao atualizar funcionário: ${error.message}`
      );
    }
  }

  /**
   * Remove funcionário
   */
  async delete(id: string): Promise<void> {
    try {
      await prisma.companyEmployee.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new NotFoundError("Funcionário não encontrado");
      }
      throw new BadRequestError(
        `Erro ao remover funcionário: ${error.message}`
      );
    }
  }

  /**
   * Verifica se funcionário existe
   */
  async exists(id: string): Promise<boolean> {
    try {
      const employee = await prisma.companyEmployee.findUnique({
        where: { id },
        select: { id: true },
      });

      return !!employee;
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao verificar funcionário: ${error.message}`
      );
    }
  }

  /**
   * Cria agendamento para funcionário
   */
  async createAppointment(data: any): Promise<any> {
    try {
      const appointment = await prisma.companyEmployeeAppointment.create({
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
      });

      return appointment;
    } catch (error: any) {
      throw new BadRequestError(`Erro ao criar agendamento: ${error.message}`);
    }
  }

  /**
   * Atualiza status do agendamento
   */
  async updateAppointmentStatus(
    id: string,
    status: string,
    notes?: string
  ): Promise<any> {
    try {
      const appointment = await prisma.companyEmployeeAppointment.update({
        where: { id },
        data: {
          status,
          employeeNotes: notes,
        },
      });

      return appointment;
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
   * Cria avaliação para funcionário
   */
  async createReview(data: any): Promise<any> {
    try {
      const review = await prisma.companyEmployeeReview.create({
        data: {
          id: data.id,
          appointmentId: data.appointmentId,
          clientId: data.clientId,
          companyId: data.companyId,
          employeeId: data.employeeId,
          rating: data.rating,
          comment: data.comment,
        },
      });

      return review;
    } catch (error: any) {
      throw new BadRequestError(`Erro ao criar avaliação: ${error.message}`);
    }
  }

  /**
   * Busca estatísticas do funcionário
   */
  async getEmployeeStats(employeeId: string): Promise<any> {
    try {
      const [
        totalAppointments,
        completedAppointments,
        averageRating,
        totalReviews,
      ] = await Promise.all([
        prisma.companyEmployeeAppointment.count({
          where: { employeeId },
        }),
        prisma.companyEmployeeAppointment.count({
          where: { employeeId, status: "COMPLETED" },
        }),
        prisma.companyEmployeeReview.aggregate({
          where: { employeeId },
          _avg: { rating: true },
        }),
        prisma.companyEmployeeReview.count({
          where: { employeeId },
        }),
      ]);

      return {
        totalAppointments,
        completedAppointments,
        averageRating: averageRating._avg.rating || 0,
        totalReviews,
        completionRate:
          totalAppointments > 0
            ? (completedAppointments / totalAppointments) * 100
            : 0,
      };
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao buscar estatísticas: ${error.message}`
      );
    }
  }

  /**
   * Busca agendamento por ID
   */
  async getAppointmentById(id: string): Promise<any> {
    try {
      const appointment = await prisma.companyEmployeeAppointment.findUnique({
        where: { id },
        include: {
          client: true,
          employee: true,
          service: true,
        },
      });

      if (!appointment) {
        throw new NotFoundError("Agendamento não encontrado");
      }

      return appointment;
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new BadRequestError(`Erro ao buscar agendamento: ${error.message}`);
    }
  }

  /**
   * Busca avaliação por ID
   */
  async getReviewById(id: string): Promise<any> {
    try {
      const review = await prisma.companyEmployeeReview.findUnique({
        where: { id },
        include: {
          client: true,
          employee: true,
          appointment: true,
        },
      });

      if (!review) {
        throw new NotFoundError("Avaliação não encontrada");
      }

      return review;
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new BadRequestError(`Erro ao buscar avaliação: ${error.message}`);
    }
  }
}
