/**
 * Repositório de Funcionário da Empresa - Camada de Infraestrutura
 * 
 * Implementação concreta seguindo Clean Architecture
 * Compatível com o schema Prisma atual
 */

import { PrismaClient } from "@prisma/client";

export interface CreateCompanyEmployeeData {
  companyId: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  specialties?: string[];
  isActive?: boolean;
}

export interface UpdateCompanyEmployeeData {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  specialties?: string[];
  isActive?: boolean;
}

export interface CompanyEmployeeFilters {
  companyId?: string;
  position?: string;
  specialties?: string[];
  isActive?: boolean;
}

export class CompanyEmployeeRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Cria funcionário da empresa
   */
  async create(data: CreateCompanyEmployeeData) {
    const employee = await this.prisma.companyEmployee.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        position: data.position,
        specialties: data.specialties || [],
        isActive: data.isActive ?? true,
      },
      include: {
        company: true,
        appointments: true,
      },
    });

    return employee;
  }

  /**
   * Busca funcionário por ID
   */
  async findById(id: string) {
    const employee = await this.prisma.companyEmployee.findUnique({
      where: { id },
      include: {
        company: true,
        appointments: {
          include: {
            client: true,
            service: true,
          },
        },
      },
    });

    return employee;
  }

  /**
   * Busca funcionários por empresa
   */
  async findByCompanyId(companyId: string) {
    const employees = await this.prisma.companyEmployee.findMany({
      where: { companyId },
      include: {
        company: true,
        appointments: true,
      },
      orderBy: { name: "asc" },
    });

    return employees;
  }

  /**
   * Atualiza funcionário
   */
  async update(id: string, data: UpdateCompanyEmployeeData) {
    const employee = await this.prisma.companyEmployee.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        position: data.position,
        specialties: data.specialties,
        isActive: data.isActive,
      },
      include: {
        company: true,
        appointments: true,
      },
    });

    return employee;
  }

  /**
   * Deleta funcionário
   */
  async delete(id: string) {
    await this.prisma.companyEmployee.delete({
      where: { id },
    });
  }

  /**
   * Lista funcionários com filtros
   */
  async findMany(filters: CompanyEmployeeFilters & { skip?: number; take?: number }) {
    const where: any = {};

    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters.position) {
      where.position = { contains: filters.position, mode: "insensitive" };
    }

    if (filters.specialties && filters.specialties.length > 0) {
      where.specialties = { hasSome: filters.specialties };
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [employees, total] = await Promise.all([
      this.prisma.companyEmployee.findMany({
        where,
        skip: filters.skip || 0,
        take: filters.take || 10,
        include: {
          company: true,
          appointments: true,
        },
        orderBy: { name: "asc" },
      }),
      this.prisma.companyEmployee.count({ where }),
    ]);

    return {
      data: employees,
      total,
      skip: filters.skip || 0,
      take: filters.take || 10,
    };
  }

  /**
   * Busca funcionários por especialidade
   */
  async findBySpecialty(specialty: string, companyId?: string) {
    const where: any = {
      specialties: { has: specialty },
      isActive: true,
    };

    if (companyId) {
      where.companyId = companyId;
    }

    return await this.prisma.companyEmployee.findMany({
      where,
      include: {
        company: true,
        appointments: true,
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Ativa/desativa funcionário
   */
  async toggleActive(id: string) {
    const employee = await this.prisma.companyEmployee.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new Error("Funcionário não encontrado");
    }

    return await this.prisma.companyEmployee.update({
      where: { id },
      data: { isActive: !employee.isActive },
      include: {
        company: true,
        appointments: true,
      },
    });
  }

  /**
   * Conta funcionários por empresa
   */
  async countByCompany(companyId: string) {
    return await this.prisma.companyEmployee.count({
      where: { companyId },
    });
  }

  /**
   * Conta funcionários ativos por empresa
   */
  async countActiveByCompany(companyId: string) {
    return await this.prisma.companyEmployee.count({
      where: { 
        companyId,
        isActive: true,
      },
    });
  }
}