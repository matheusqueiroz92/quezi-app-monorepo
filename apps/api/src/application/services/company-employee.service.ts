/**
 * Serviço de Funcionário da Empresa - Camada de Aplicação
 *
 * Implementação seguindo Clean Architecture e TDD
 */

import {
  CompanyEmployeeRepository,
  CreateCompanyEmployeeData,
  UpdateCompanyEmployeeData,
  CompanyEmployeeFilters,
} from "../../infrastructure/repositories/company-employee.repository";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { NotFoundError, BadRequestError } from "../../utils/app-error";
import { prisma } from "../../lib/prisma";

export class CompanyEmployeeService {
  constructor(
    private companyEmployeeRepository = new CompanyEmployeeRepository(prisma),
    private userRepository = new UserRepository(prisma)
  ) {}

  /**
   * Cria funcionário da empresa
   */
  async createEmployee(
    companyId: string,
    data: Omit<CreateCompanyEmployeeData, "companyId">
  ) {
    // Verificar se empresa existe e é do tipo COMPANY
    const company = await this.userRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError("Empresa não encontrada");
    }

    if (company.userType !== "COMPANY") {
      throw new BadRequestError(
        "Apenas usuários do tipo COMPANY podem ter funcionários"
      );
    }

    // Validar dados obrigatórios
    if (!data.name || data.name.trim().length === 0) {
      throw new BadRequestError("Nome do funcionário é obrigatório");
    }

    // Verificar se email já existe (se fornecido)
    if (data.email) {
      const existingEmployee = await this.companyEmployeeRepository.findMany({
        companyId,
        skip: 0,
        take: 1,
      });

      const emailExists = existingEmployee.data.some(
        (emp) => emp.email === data.email
      );
      if (emailExists) {
        throw new BadRequestError(
          "Email já está sendo usado por outro funcionário"
        );
      }
    }

    // Criar funcionário
    const employee = await this.companyEmployeeRepository.create({
      companyId,
      ...data,
    });

    return employee;
  }

  /**
   * Obtém funcionário por ID
   */
  async getEmployeeById(id: string) {
    const employee = await this.companyEmployeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundError("Funcionário não encontrado");
    }

    return employee;
  }

  /**
   * Lista funcionários da empresa
   */
  async getEmployeesByCompanyId(companyId: string) {
    // Verificar se empresa existe
    const company = await this.userRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError("Empresa não encontrada");
    }

    if (company.userType !== "COMPANY") {
      throw new BadRequestError(
        "Apenas usuários do tipo COMPANY podem ter funcionários"
      );
    }

    return await this.companyEmployeeRepository.findByCompanyId(companyId);
  }

  /**
   * Atualiza funcionário
   */
  async updateEmployee(id: string, data: UpdateCompanyEmployeeData) {
    // Verificar se funcionário existe
    const existingEmployee = await this.companyEmployeeRepository.findById(id);
    if (!existingEmployee) {
      throw new NotFoundError("Funcionário não encontrado");
    }

    // Validar nome se fornecido
    if (data.name && data.name.trim().length === 0) {
      throw new BadRequestError("Nome do funcionário não pode ser vazio");
    }

    // Verificar se email já existe (se fornecido e diferente do atual)
    if (data.email && data.email !== existingEmployee.email) {
      const employees = await this.companyEmployeeRepository.findByCompanyId(
        existingEmployee.companyId
      );
      const emailExists = employees.some(
        (emp) => emp.email === data.email && emp.id !== id
      );
      if (emailExists) {
        throw new BadRequestError(
          "Email já está sendo usado por outro funcionário"
        );
      }
    }

    // Atualizar funcionário
    const employee = await this.companyEmployeeRepository.update(id, data);
    return employee;
  }

  /**
   * Deleta funcionário
   */
  async deleteEmployee(id: string) {
    // Verificar se funcionário existe
    const existingEmployee = await this.companyEmployeeRepository.findById(id);
    if (!existingEmployee) {
      throw new NotFoundError("Funcionário não encontrado");
    }

    // Verificar se funcionário tem agendamentos futuros
    const futureAppointments = existingEmployee.appointments.filter(
      (apt) => new Date(apt.scheduledDate) > new Date()
    );

    if (futureAppointments.length > 0) {
      throw new BadRequestError(
        "Não é possível deletar funcionário com agendamentos futuros"
      );
    }

    // Deletar funcionário
    await this.companyEmployeeRepository.delete(id);
  }

  /**
   * Lista funcionários com filtros
   */
  async listEmployees(
    filters: CompanyEmployeeFilters & { skip?: number; take?: number }
  ) {
    return await this.companyEmployeeRepository.findMany(filters);
  }

  /**
   * Busca funcionários por especialidade
   */
  async getEmployeesBySpecialty(specialty: string, companyId?: string) {
    if (!specialty || specialty.trim().length === 0) {
      throw new BadRequestError("Especialidade é obrigatória");
    }

    if (companyId) {
      // Verificar se empresa existe
      const company = await this.userRepository.findById(companyId);
      if (!company) {
        throw new NotFoundError("Empresa não encontrada");
      }

      if (company.userType !== "COMPANY") {
        throw new BadRequestError(
          "Apenas usuários do tipo COMPANY podem ter funcionários"
        );
      }
    }

    return await this.companyEmployeeRepository.findBySpecialty(
      specialty,
      companyId
    );
  }

  /**
   * Adiciona especialidade ao funcionário
   */
  async addSpecialty(id: string, specialty: string) {
    if (!specialty || specialty.trim().length === 0) {
      throw new BadRequestError("Especialidade é obrigatória");
    }

    const employee = await this.companyEmployeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundError("Funcionário não encontrado");
    }

    if (employee.specialties.includes(specialty)) {
      throw new BadRequestError(
        "Especialidade já existe no perfil do funcionário"
      );
    }

    const updatedSpecialties = [...employee.specialties, specialty];

    return await this.companyEmployeeRepository.update(id, {
      specialties: updatedSpecialties,
    });
  }

  /**
   * Remove especialidade do funcionário
   */
  async removeSpecialty(id: string, specialty: string) {
    if (!specialty || specialty.trim().length === 0) {
      throw new BadRequestError("Especialidade é obrigatória");
    }

    const employee = await this.companyEmployeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundError("Funcionário não encontrado");
    }

    if (!employee.specialties.includes(specialty)) {
      throw new BadRequestError(
        "Especialidade não existe no perfil do funcionário"
      );
    }

    const updatedSpecialties = employee.specialties.filter(
      (s) => s !== specialty
    );

    return await this.companyEmployeeRepository.update(id, {
      specialties: updatedSpecialties,
    });
  }

  /**
   * Ativa/desativa funcionário
   */
  async toggleActive(id: string) {
    const employee = await this.companyEmployeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundError("Funcionário não encontrado");
    }

    return await this.companyEmployeeRepository.toggleActive(id);
  }

  /**
   * Conta funcionários da empresa
   */
  async countEmployeesByCompany(companyId: string) {
    // Verificar se empresa existe
    const company = await this.userRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError("Empresa não encontrada");
    }

    if (company.userType !== "COMPANY") {
      throw new BadRequestError(
        "Apenas usuários do tipo COMPANY podem ter funcionários"
      );
    }

    return await this.companyEmployeeRepository.countByCompany(companyId);
  }

  /**
   * Conta funcionários ativos da empresa
   */
  async countActiveEmployeesByCompany(companyId: string) {
    // Verificar se empresa existe
    const company = await this.userRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError("Empresa não encontrada");
    }

    if (company.userType !== "COMPANY") {
      throw new BadRequestError(
        "Apenas usuários do tipo COMPANY podem ter funcionários"
      );
    }

    return await this.companyEmployeeRepository.countActiveByCompany(companyId);
  }
}
