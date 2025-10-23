/**
 * Caso de Uso: Gerenciamento de Funcionários da Empresa
 *
 * Seguindo os princípios SOLID:
 * - S: Single Responsibility Principle
 * - D: Dependency Inversion Principle
 *
 * Orquestra o processo completo de gerenciamento de funcionários
 */

import { IUserService } from "../../domain/interfaces/repository.interface";
import { IUser } from "../../domain/interfaces/user.interface";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../../utils/app-error";

export interface CreateEmployeeData {
  companyId: string;
  name: string;
  email?: string;
  phone?: string;
  position: string;
  specialties: string[];
  workingHours?: any;
}

export interface UpdateEmployeeData {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  specialties?: string[];
  workingHours?: any;
  isActive?: boolean;
}

export interface EmployeeManagementResult {
  employee: any;
  message: string;
}

export class CompanyEmployeeManagementUseCase {
  constructor(
    private userService: IUserService
  ) // Aqui seriam injetados os serviços específicos
  // private companyEmployeeService: ICompanyEmployeeService,
  // private notificationService: INotificationService
  {}

  // ========================================
  // MÉTODOS DE CRIAÇÃO E ATUALIZAÇÃO
  // ========================================

  async createEmployee(
    companyId: string,
    employeeData: CreateEmployeeData,
    requesterId: string
  ): Promise<EmployeeManagementResult> {
    // 1. Verificar se o solicitante é uma empresa
    const company = await this.userService.getUserById(companyId);
    if (!company.isCompany()) {
      throw new BadRequestError("Apenas empresas podem ter funcionários");
    }

    // 2. Verificar se o solicitante tem permissão
    await this.validateCompanyOwnership(companyId, requesterId);

    // 3. Validar dados do funcionário
    await this.validateEmployeeData(employeeData);

    // 4. Verificar se email já está em uso (se fornecido)
    if (employeeData.email) {
      const existingUser = await this.userService.getUserByEmail(
        employeeData.email
      );
      if (existingUser) {
        throw new BadRequestError("Email já está em uso por outro usuário");
      }
    }

    // 5. Criar funcionário
    const employee = await this.createEmployeeRecord(companyId, employeeData);

    // 6. Enviar notificações
    await this.sendEmployeeCreatedNotifications(company, employee);

    return {
      employee,
      message: "Funcionário criado com sucesso",
    };
  }

  async updateEmployee(
    companyId: string,
    employeeId: string,
    employeeData: UpdateEmployeeData,
    requesterId: string
  ): Promise<EmployeeManagementResult> {
    // 1. Verificar permissões
    await this.validateCompanyOwnership(companyId, requesterId);

    // 2. Verificar se funcionário existe
    const employee = await this.getEmployeeById(companyId, employeeId);
    if (!employee) {
      throw new NotFoundError("Funcionário não encontrado");
    }

    // 3. Validar dados de atualização
    await this.validateEmployeeUpdateData(employeeData);

    // 4. Atualizar funcionário
    const updatedEmployee = await this.updateEmployeeRecord(
      employeeId,
      employeeData
    );

    return {
      employee: updatedEmployee,
      message: "Funcionário atualizado com sucesso",
    };
  }

  async deactivateEmployee(
    companyId: string,
    employeeId: string,
    requesterId: string
  ): Promise<EmployeeManagementResult> {
    // 1. Verificar permissões
    await this.validateCompanyOwnership(companyId, requesterId);

    // 2. Verificar se funcionário existe
    const employee = await this.getEmployeeById(companyId, employeeId);
    if (!employee) {
      throw new NotFoundError("Funcionário não encontrado");
    }

    // 3. Desativar funcionário
    const updatedEmployee = await this.updateEmployeeRecord(employeeId, {
      isActive: false,
    });

    return {
      employee: updatedEmployee,
      message: "Funcionário desativado com sucesso",
    };
  }

  // ========================================
  // MÉTODOS DE CONSULTA
  // ========================================

  async getEmployees(companyId: string, requesterId: string): Promise<any[]> {
    // 1. Verificar permissões
    await this.validateCompanyOwnership(companyId, requesterId);

    // 2. Buscar funcionários
    return await this.getCompanyEmployees(companyId);
  }

  async getEmployeeById(
    companyId: string,
    employeeId: string,
    requesterId: string
  ): Promise<any> {
    // 1. Verificar permissões
    await this.validateCompanyOwnership(companyId, requesterId);

    // 2. Buscar funcionário
    const employee = await this.getEmployeeById(companyId, employeeId);
    if (!employee) {
      throw new NotFoundError("Funcionário não encontrado");
    }

    return employee;
  }

  // ========================================
  // MÉTODOS DE VALIDAÇÃO
  // ========================================

  private async validateCompanyOwnership(
    companyId: string,
    requesterId: string
  ): Promise<void> {
    // Verificar se o solicitante é o dono da empresa
    if (companyId !== requesterId) {
      throw new ForbiddenError(
        "Apenas o dono da empresa pode gerenciar funcionários"
      );
    }

    // Verificar se o solicitante é uma empresa
    const requester = await this.userService.getUserById(requesterId);
    if (!requester.isCompany()) {
      throw new ForbiddenError("Apenas empresas podem gerenciar funcionários");
    }
  }

  private async validateEmployeeData(data: CreateEmployeeData): Promise<void> {
    const errors: string[] = [];

    if (!data.name) {
      errors.push("Nome do funcionário é obrigatório");
    }
    if (!data.position) {
      errors.push("Cargo do funcionário é obrigatório");
    }
    if (!data.specialties || data.specialties.length === 0) {
      errors.push("Especialidades são obrigatórias");
    }

    // Validar email se fornecido
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push("Email inválido");
    }

    // Validar telefone se fornecido
    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push("Telefone inválido");
    }

    if (errors.length > 0) {
      throw new BadRequestError(
        `Dados do funcionário inválidos: ${errors.join(", ")}`
      );
    }
  }

  private async validateEmployeeUpdateData(
    data: UpdateEmployeeData
  ): Promise<void> {
    const errors: string[] = [];

    // Validar email se fornecido
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push("Email inválido");
    }

    // Validar telefone se fornecido
    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push("Telefone inválido");
    }

    if (errors.length > 0) {
      throw new BadRequestError(
        `Dados de atualização inválidos: ${errors.join(", ")}`
      );
    }
  }

  // ========================================
  // MÉTODOS AUXILIARES
  // ========================================

  private async createEmployeeRecord(
    companyId: string,
    data: CreateEmployeeData
  ): Promise<any> {
    // Implementar criação do funcionário
    // Por enquanto, retornar um objeto simulado
    return {
      id: "employee-" + Date.now(),
      companyId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      position: data.position,
      specialties: data.specialties,
      workingHours: data.workingHours,
      isActive: true,
      createdAt: new Date(),
    };
  }

  private async updateEmployeeRecord(
    employeeId: string,
    data: UpdateEmployeeData
  ): Promise<any> {
    // Implementar atualização do funcionário
    // Por enquanto, retornar um objeto simulado
    return {
      id: employeeId,
      ...data,
      updatedAt: new Date(),
    };
  }

  private async getCompanyEmployees(companyId: string): Promise<any[]> {
    // Implementar busca de funcionários da empresa
    // Por enquanto, retornar array vazio
    return [];
  }

  private async getEmployeeById(
    companyId: string,
    employeeId: string
  ): Promise<any> {
    // Implementar busca de funcionário específico
    // Por enquanto, retornar null
    return null;
  }

  private async sendEmployeeCreatedNotifications(
    company: IUser,
    employee: any
  ): Promise<void> {
    // Implementar envio de notificações
    console.log(
      `Notificação enviada para empresa ${company.email} sobre novo funcionário ${employee.name}`
    );
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
  }
}
