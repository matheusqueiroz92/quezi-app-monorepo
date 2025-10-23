import { prisma } from "../../lib/prisma";
import { type CompanyEmployee, type CompanyEmployeeAppointment, type CompanyEmployeeReview } from "@prisma/client";
import { type CreateCompanyEmployeeInput, type UpdateCompanyEmployeeInput, type ListCompanyEmployeesQuery } from "./company-employee.schema";

/**
 * Repository para funcionários da empresa
 * 
 * Responsável por operações de banco de dados relacionadas a:
 * - Funcionários da empresa
 * - Agendamentos de funcionários
 * - Reviews de funcionários
 */
export class CompanyEmployeeRepository {
  /**
   * Criar novo funcionário
   */
  async create(data: CreateCompanyEmployeeInput & { companyId: string }): Promise<CompanyEmployee> {
    return await prisma.companyEmployee.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        position: data.position,
        specialties: data.specialties,
      },
    });
  }

  /**
   * Buscar funcionário por ID
   */
  async findById(id: string): Promise<CompanyEmployee | null> {
    return await prisma.companyEmployee.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Listar funcionários da empresa
   */
  async listByCompany(
    companyId: string, 
    query: ListCompanyEmployeesQuery
  ): Promise<{ employees: CompanyEmployee[]; total: number }> {
    const { page, limit, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where = {
      companyId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { position: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(isActive !== undefined && { isActive }),
    };

    const [employees, total] = await Promise.all([
      prisma.companyEmployee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.companyEmployee.count({ where }),
    ]);

    return { employees, total };
  }

  /**
   * Atualizar funcionário
   */
  async update(id: string, data: UpdateCompanyEmployeeInput): Promise<CompanyEmployee> {
    return await prisma.companyEmployee.update({
      where: { id },
      data,
    });
  }

  /**
   * Deletar funcionário
   */
  async delete(id: string): Promise<void> {
    await prisma.companyEmployee.delete({
      where: { id },
    });
  }

  /**
   * Verificar se funcionário pertence à empresa
   */
  async belongsToCompany(employeeId: string, companyId: string): Promise<boolean> {
    const employee = await prisma.companyEmployee.findFirst({
      where: {
        id: employeeId,
        companyId,
      },
    });

    return !!employee;
  }

  /**
   * Listar agendamentos do funcionário
   */
  async getEmployeeAppointments(
    employeeId: string,
    query: { page: number; limit: number; status?: string }
  ): Promise<{ appointments: CompanyEmployeeAppointment[]; total: number }> {
    const { page, limit, status } = query;
    const skip = (page - 1) * limit;

    const where = {
      employeeId,
      ...(status && { status: status as any }),
    };

    const [appointments, total] = await Promise.all([
      prisma.companyEmployeeAppointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledDate: "desc" },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      }),
      prisma.companyEmployeeAppointment.count({ where }),
    ]);

    return { appointments, total };
  }

  /**
   * Criar agendamento para funcionário
   */
  async createAppointment(data: {
    employeeId: string;
    clientId: string;
    serviceId: string;
    scheduledDate: Date;
    locationType: "AT_LOCATION" | "AT_DOMICILE" | "BOTH";
    clientAddress?: string;
    clientNotes?: string;
  }): Promise<CompanyEmployeeAppointment> {
    return await prisma.companyEmployeeAppointment.create({
      data,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });
  }

  /**
   * Atualizar status do agendamento
   */
  async updateAppointmentStatus(
    appointmentId: string,
    status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED"
  ): Promise<CompanyEmployeeAppointment> {
    return await prisma.companyEmployeeAppointment.update({
      where: { id: appointmentId },
      data: { status },
    });
  }

  /**
   * Criar review para funcionário
   */
  async createReview(data: {
    appointmentId: string;
    reviewerId: string;
    employeeId: string;
    rating: number;
    comment?: string;
  }): Promise<CompanyEmployeeReview> {
    return await prisma.companyEmployeeReview.create({
      data,
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Buscar estatísticas do funcionário
   */
  async getEmployeeStats(employeeId: string): Promise<{
    totalAppointments: number;
    completedAppointments: number;
    averageRating: number;
    totalReviews: number;
  }> {
    const [totalAppointments, completedAppointments, reviews] = await Promise.all([
      prisma.companyEmployeeAppointment.count({
        where: { employeeId },
      }),
      prisma.companyEmployeeAppointment.count({
        where: { 
          employeeId,
          status: "COMPLETED",
        },
      }),
      prisma.companyEmployeeReview.findMany({
        where: { employeeId },
        select: { rating: true },
      }),
    ]);

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    return {
      totalAppointments,
      completedAppointments,
      averageRating,
      totalReviews,
    };
  }
}
