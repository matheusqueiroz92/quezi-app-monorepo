/**
 * CompanyEmployeeService Tests
 *
 * Testes unitários para o serviço de funcionários de empresa
 */

import { CompanyEmployeeService } from "../company-employee.service";
import { CompanyEmployeeRepository } from "../../../infrastructure/repositories/company-employee.repository";
import { UserRepository } from "../../../infrastructure/repositories/user.repository";
import { NotFoundError, BadRequestError } from "../../../utils/app-error";

// Mock dos repositórios
const mockCompanyEmployeeRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByCompanyId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findMany: jest.fn(),
  findBySpecialty: jest.fn(),
  countActiveByCompany: jest.fn(),
};

const mockUserRepository = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findMany: jest.fn(),
  exists: jest.fn(),
};

describe("CompanyEmployeeService", () => {
  let service: CompanyEmployeeService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CompanyEmployeeService(
      mockCompanyEmployeeRepository as any,
      mockUserRepository as any
    );
  });

  describe("createEmployee", () => {
    it("deve criar funcionário com sucesso", async () => {
      // Arrange
      const companyId = "company-123";
      const employeeData = {
        name: "João Silva",
        email: "joao@empresa.com",
        phone: "11999999999",
        position: "Barbeiro",
        specialties: ["Corte", "Barba"],
        isActive: true,
      };

      const mockCompany = {
        id: companyId,
        userType: "COMPANY",
        name: "Barbearia Silva",
      };

      const mockEmployee = {
        id: "employee-123",
        companyId,
        ...employeeData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findById.mockResolvedValue(mockCompany);
      mockCompanyEmployeeRepository.findMany.mockResolvedValue({ data: [] });
      mockCompanyEmployeeRepository.create.mockResolvedValue(mockEmployee);

      // Act
      const result = await service.createEmployee(companyId, employeeData);

      // Assert
      expect(result).toEqual(mockEmployee);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(companyId);
      expect(mockCompanyEmployeeRepository.create).toHaveBeenCalledWith({
        companyId,
        ...employeeData,
      });
    });

    it("deve lançar erro quando empresa não for encontrada", async () => {
      // Arrange
      const companyId = "company-123";
      const employeeData = {
        name: "João Silva",
        email: "joao@empresa.com",
      };

      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.createEmployee(companyId, employeeData)
      ).rejects.toThrow(NotFoundError);
    });

    it("deve lançar erro quando empresa não for do tipo COMPANY", async () => {
      // Arrange
      const companyId = "company-123";
      const employeeData = {
        name: "João Silva",
        email: "joao@empresa.com",
      };

      const mockCompany = {
        id: companyId,
        userType: "CLIENT",
        name: "Cliente",
      };

      mockUserRepository.findById.mockResolvedValue(mockCompany);

      // Act & Assert
      await expect(
        service.createEmployee(companyId, employeeData)
      ).rejects.toThrow(BadRequestError);
    });

    it("deve lançar erro quando email já estiver em uso", async () => {
      // Arrange
      const companyId = "company-123";
      const employeeData = {
        name: "João Silva",
        email: "joao@empresa.com",
      };

      const mockCompany = {
        id: companyId,
        userType: "COMPANY",
        name: "Barbearia Silva",
      };

      const existingEmployee = {
        id: "existing-employee",
        email: "joao@empresa.com",
      };

      mockUserRepository.findById.mockResolvedValue(mockCompany);
      mockCompanyEmployeeRepository.findMany.mockResolvedValue({
        data: [existingEmployee],
      });

      // Act & Assert
      await expect(
        service.createEmployee(companyId, employeeData)
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("getEmployeeById", () => {
    it("deve retornar funcionário quando encontrado", async () => {
      // Arrange
      const employeeId = "employee-123";
      const mockEmployee = {
        id: employeeId,
        name: "João Silva",
        email: "joao@empresa.com",
      };

      mockCompanyEmployeeRepository.findById.mockResolvedValue(mockEmployee);

      // Act
      const result = await service.getEmployeeById(employeeId);

      // Assert
      expect(result).toEqual(mockEmployee);
      expect(mockCompanyEmployeeRepository.findById).toHaveBeenCalledWith(
        employeeId
      );
    });

    it("deve lançar erro quando funcionário não for encontrado", async () => {
      // Arrange
      const employeeId = "employee-123";
      mockCompanyEmployeeRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getEmployeeById(employeeId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("getEmployeesByCompanyId", () => {
    it("deve retornar funcionários da empresa", async () => {
      // Arrange
      const companyId = "company-123";
      const mockCompany = {
        id: companyId,
        userType: "COMPANY",
        name: "Barbearia Silva",
      };

      const mockEmployees = [
        { id: "emp1", name: "João Silva" },
        { id: "emp2", name: "Maria Santos" },
      ];

      mockUserRepository.findById.mockResolvedValue(mockCompany);
      mockCompanyEmployeeRepository.findByCompanyId.mockResolvedValue(
        mockEmployees
      );

      // Act
      const result = await service.getEmployeesByCompanyId(companyId);

      // Assert
      expect(result).toEqual(mockEmployees);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(companyId);
      expect(
        mockCompanyEmployeeRepository.findByCompanyId
      ).toHaveBeenCalledWith(companyId);
    });

    it("deve lançar erro quando empresa não for encontrada", async () => {
      // Arrange
      const companyId = "company-123";
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getEmployeesByCompanyId(companyId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("updateEmployee", () => {
    it("deve atualizar funcionário com sucesso", async () => {
      // Arrange
      const employeeId = "employee-123";
      const updateData = {
        name: "João Silva Atualizado",
        phone: "11888888888",
      };

      const existingEmployee = {
        id: employeeId,
        companyId: "company-123",
        email: "joao@empresa.com",
        name: "João Silva",
      };

      const updatedEmployee = {
        ...existingEmployee,
        ...updateData,
      };

      mockCompanyEmployeeRepository.findById.mockResolvedValue(
        existingEmployee
      );
      mockCompanyEmployeeRepository.findByCompanyId.mockResolvedValue([]);
      mockCompanyEmployeeRepository.update.mockResolvedValue(updatedEmployee);

      // Act
      const result = await service.updateEmployee(employeeId, updateData);

      // Assert
      expect(result).toEqual(updatedEmployee);
      expect(mockCompanyEmployeeRepository.update).toHaveBeenCalledWith(
        employeeId,
        updateData
      );
    });

    it("deve lançar erro quando funcionário não for encontrado", async () => {
      // Arrange
      const employeeId = "employee-123";
      const updateData = { name: "Novo Nome" };

      mockCompanyEmployeeRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateEmployee(employeeId, updateData)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteEmployee", () => {
    it("deve deletar funcionário com sucesso", async () => {
      // Arrange
      const employeeId = "employee-123";
      const existingEmployee = {
        id: employeeId,
        appointments: [], // Sem agendamentos futuros
      };

      mockCompanyEmployeeRepository.findById.mockResolvedValue(
        existingEmployee
      );
      mockCompanyEmployeeRepository.delete.mockResolvedValue(undefined);

      // Act
      await service.deleteEmployee(employeeId);

      // Assert
      expect(mockCompanyEmployeeRepository.delete).toHaveBeenCalledWith(
        employeeId
      );
    });

    it("deve lançar erro quando funcionário tiver agendamentos futuros", async () => {
      // Arrange
      const employeeId = "employee-123";
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const existingEmployee = {
        id: employeeId,
        appointments: [
          {
            id: "appointment-123",
            scheduledDate: futureDate,
          },
        ],
      };

      mockCompanyEmployeeRepository.findById.mockResolvedValue(
        existingEmployee
      );

      // Act & Assert
      await expect(service.deleteEmployee(employeeId)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe("addSpecialtyToEmployee", () => {
    it("deve adicionar especialidade com sucesso", async () => {
      // Arrange
      const employeeId = "employee-123";
      const specialty = "Manicure";
      const existingEmployee = {
        id: employeeId,
        specialties: ["Corte", "Barba"],
      };

      const updatedEmployee = {
        ...existingEmployee,
        specialties: [...existingEmployee.specialties, specialty],
      };

      mockCompanyEmployeeRepository.findById.mockResolvedValue(
        existingEmployee
      );
      mockCompanyEmployeeRepository.update.mockResolvedValue(updatedEmployee);

      // Act
      const result = await service.addSpecialtyToEmployee(
        employeeId,
        specialty
      );

      // Assert
      expect(result).toEqual(updatedEmployee);
      expect(mockCompanyEmployeeRepository.update).toHaveBeenCalledWith(
        employeeId,
        {
          specialties: [...existingEmployee.specialties, specialty],
        }
      );
    });

    it("deve lançar erro quando especialidade já existir", async () => {
      // Arrange
      const employeeId = "employee-123";
      const specialty = "Corte";
      const existingEmployee = {
        id: employeeId,
        specialties: ["Corte", "Barba"],
      };

      mockCompanyEmployeeRepository.findById.mockResolvedValue(
        existingEmployee
      );

      // Act & Assert
      await expect(
        service.addSpecialtyToEmployee(employeeId, specialty)
      ).rejects.toThrow(BadRequestError);
    });
  });
});
