import { CompanyEmployeeRepository } from "./company-employee.repository";
import { type CreateCompanyEmployeeInput, type UpdateCompanyEmployeeInput, type ListCompanyEmployeesQuery } from "./company-employee.schema";
import { NotFoundError, ForbiddenError, BadRequestError } from "../../utils/app-error";

/**
 * Service para funcionários da empresa
 * 
 * Responsável por:
 * - Gerenciar funcionários da empresa
 * - Gerenciar agendamentos de funcionários
 * - Gerenciar reviews de funcionários
 */
export class CompanyEmployeeService {
  private repository: CompanyEmployeeRepository;

  constructor() {
    this.repository = new CompanyEmployeeRepository();
  }

  /**
   * Criar novo funcionário
   */
  async createEmployee(
    companyId: string,
    data: CreateCompanyEmployeeInput
  ): Promise<any> {
    return await this.repository.create({
      ...data,
      companyId,
    });
  }

  /**
   * Listar funcionários da empresa
   */
  async listEmployees(
    companyId: string,
    query: ListCompanyEmployeesQuery
  ): Promise<{ employees: any[]; total: number; page: number; limit: number }> {
    const result = await this.repository.listByCompany(companyId, query);
    
    return {
      ...result,
      page: query.page,
      limit: query.limit,
    };
  }

  /**
   * Buscar funcionário por ID
   */
  async getEmployeeById(employeeId: string, companyId: string): Promise<any> {
    const employee = await this.repository.findById(employeeId);
    
    if (!employee) {
      throw new NotFoundError("Funcionário não encontrado");
    }

    // Verificar se funcionário pertence à empresa
    const belongsToCompany = await this.repository.belongsToCompany(employeeId, companyId);
    if (!belongsToCompany) {
      throw new ForbiddenError("Funcionário não pertence à sua empresa");
    }

    return employee;
  }

  /**
   * Atualizar funcionário
   */
  async updateEmployee(
    employeeId: string,
    companyId: string,
    data: UpdateCompanyEmployeeInput
  ): Promise<any> {
    // Verificar se funcionário pertence à empresa
    const belongsToCompany = await this.repository.belongsToCompany(employeeId, companyId);
    if (!belongsToCompany) {
      throw new ForbiddenError("Funcionário não pertence à sua empresa");
    }

    return await this.repository.update(employeeId, data);
  }

  /**
   * Deletar funcionário
   */
  async deleteEmployee(employeeId: string, companyId: string): Promise<void> {
    // Verificar se funcionário pertence à empresa
    const belongsToCompany = await this.repository.belongsToCompany(employeeId, companyId);
    if (!belongsToCompany) {
      throw new ForbiddenError("Funcionário não pertence à sua empresa");
    }

    await this.repository.delete(employeeId);
  }

  /**
   * Listar agendamentos do funcionário
   */
  async getEmployeeAppointments(
    employeeId: string,
    companyId: string,
    query: { page: number; limit: number; status?: string }
  ): Promise<any> {
    // Verificar se funcionário pertence à empresa
    const belongsToCompany = await this.repository.belongsToCompany(employeeId, companyId);
    if (!belongsToCompany) {
      throw new ForbiddenError("Funcionário não pertence à sua empresa");
    }

    return await this.repository.getEmployeeAppointments(employeeId, query);
  }

  /**
   * Criar agendamento para funcionário
   */
  async createAppointment(
    companyId: string,
    data: {
      employeeId: string;
      clientId: string;
      serviceId: string;
      scheduledDate: string;
      locationType: "AT_LOCATION" | "AT_DOMICILE" | "BOTH";
      clientAddress?: string;
      clientNotes?: string;
    }
  ): Promise<any> {
    // Verificar se funcionário pertence à empresa
    const belongsToCompany = await this.repository.belongsToCompany(data.employeeId, companyId);
    if (!belongsToCompany) {
      throw new ForbiddenError("Funcionário não pertence à sua empresa");
    }

    // Validar data
    const scheduledDate = new Date(data.scheduledDate);
    if (scheduledDate <= new Date()) {
      throw new BadRequestError("Data do agendamento deve ser futura");
    }

    return await this.repository.createAppointment({
      ...data,
      scheduledDate,
    });
  }

  /**
   * Atualizar status do agendamento
   */
  async updateAppointmentStatus(
    appointmentId: string,
    companyId: string,
    status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED"
  ): Promise<any> {
    // TODO: Verificar se agendamento pertence à empresa
    return await this.repository.updateAppointmentStatus(appointmentId, status);
  }

  /**
   * Criar review para funcionário
   */
  async createReview(
    data: {
      appointmentId: string;
      reviewerId: string;
      employeeId: string;
      rating: number;
      comment?: string;
    }
  ): Promise<any> {
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestError("Rating deve ser entre 1 e 5");
    }

    return await this.repository.createReview(data);
  }

  /**
   * Buscar estatísticas do funcionário
   */
  async getEmployeeStats(employeeId: string, companyId: string): Promise<any> {
    // Verificar se funcionário pertence à empresa
    const belongsToCompany = await this.repository.belongsToCompany(employeeId, companyId);
    if (!belongsToCompany) {
      throw new ForbiddenError("Funcionário não pertence à sua empresa");
    }

    return await this.repository.getEmployeeStats(employeeId);
  }
}
