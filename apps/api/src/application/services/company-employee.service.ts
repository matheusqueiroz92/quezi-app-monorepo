/**
 * CompanyEmployeeService - Camada de Aplicação
 *
 * Serviço de aplicação para gerenciamento de funcionários de empresas
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { CompanyEmployee } from "../../domain/entities/company-employee.entity";
import { CompanyEmployeeRepository } from "../../infrastructure/repositories/company-employee.repository";
import { BadRequestError, NotFoundError } from "../../utils/app-error";

/**
 * Serviço de aplicação para CompanyEmployee
 */
export class CompanyEmployeeService {
  constructor(private companyEmployeeRepository: CompanyEmployeeRepository) {}

  /**
   * Cria um novo funcionário
   */
  async createEmployee(data: {
    companyId: string;
    name: string;
    email: string;
    phone: string;
    position: string;
    specialties?: string[];
    isActive?: boolean;
    workingHours?: any;
  }): Promise<CompanyEmployee> {
    // Validar dados
    if (!data.name || data.name.trim().length < 3) {
      throw new BadRequestError("Nome deve ter no mínimo 3 caracteres");
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      throw new BadRequestError("Email inválido");
    }

    if (!data.phone || data.phone.trim().length < 10) {
      throw new BadRequestError("Telefone inválido");
    }

    if (!data.position || data.position.trim().length < 3) {
      throw new BadRequestError("Cargo deve ter no mínimo 3 caracteres");
    }

    // Verificar se email já existe
    const existingEmployee = await this.companyEmployeeRepository.findByEmail(
      data.email
    );
    if (existingEmployee) {
      throw new BadRequestError("Email já está em uso");
    }

    // Criar funcionário
    return await this.companyEmployeeRepository.create(data);
  }

  /**
   * Busca funcionário por ID
   */
  async getEmployeeById(id: string): Promise<CompanyEmployee> {
    const employee = await this.companyEmployeeRepository.findById(id);

    if (!employee) {
      throw new NotFoundError("Funcionário não encontrado");
    }

    return employee;
  }

  /**
   * Lista funcionários com filtros
   */
  async listEmployees(filters: {
    companyId?: string;
    isActive?: boolean;
    position?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    employees: CompanyEmployee[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;

    const employees = await this.companyEmployeeRepository.findMany(filters);
    const total = await this.companyEmployeeRepository.count(filters);

    return {
      employees,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Atualiza funcionário
   */
  async updateEmployee(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      position?: string;
      specialties?: string[];
      isActive?: boolean;
      workingHours?: any;
    }
  ): Promise<CompanyEmployee> {
    // Verificar se funcionário existe
    await this.getEmployeeById(id);

    // Validar dados
    if (data.name && data.name.trim().length < 3) {
      throw new BadRequestError("Nome deve ter no mínimo 3 caracteres");
    }

    if (data.email && !this.isValidEmail(data.email)) {
      throw new BadRequestError("Email inválido");
    }

    if (data.phone && data.phone.trim().length < 10) {
      throw new BadRequestError("Telefone inválido");
    }

    if (data.position && data.position.trim().length < 3) {
      throw new BadRequestError("Cargo deve ter no mínimo 3 caracteres");
    }

    // Verificar se email já existe (se estiver sendo alterado)
    if (data.email) {
      const existingEmployee = await this.companyEmployeeRepository.findByEmail(
        data.email
      );
      if (existingEmployee && existingEmployee.id !== id) {
        throw new BadRequestError("Email já está em uso");
      }
    }

    // Atualizar funcionário
    return await this.companyEmployeeRepository.update(id, data);
  }

  /**
   * Deleta funcionário
   */
  async deleteEmployee(id: string): Promise<void> {
    // Verificar se funcionário existe
    await this.getEmployeeById(id);

    // Deletar funcionário
    await this.companyEmployeeRepository.delete(id);
  }

  /**
   * Busca funcionários por empresa
   */
  async getEmployeesByCompany(companyId: string): Promise<CompanyEmployee[]> {
    return await this.companyEmployeeRepository.findByCompany(companyId);
  }

  /**
   * Ativa/desativa funcionário
   */
  async toggleEmployeeStatus(id: string): Promise<CompanyEmployee> {
    const employee = await this.getEmployeeById(id);
    return await this.companyEmployeeRepository.update(id, {
      isActive: !employee.isActive,
    });
  }

  /**
   * Busca funcionários ativos
   */
  async getActiveEmployees(companyId: string): Promise<CompanyEmployee[]> {
    return await this.companyEmployeeRepository.findMany({
      companyId,
      isActive: true,
    });
  }

  /**
   * Busca funcionários por cargo
   */
  async getEmployeesByPosition(
    companyId: string,
    position: string
  ): Promise<CompanyEmployee[]> {
    return await this.companyEmployeeRepository.findMany({
      companyId,
      position,
    });
  }

  /**
   * Valida email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
