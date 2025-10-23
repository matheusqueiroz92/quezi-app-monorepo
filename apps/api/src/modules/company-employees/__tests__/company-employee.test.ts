import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { FastifyInstance } from "fastify";
import { buildApp } from "../../../app";
import { prisma } from "../../../lib/prisma";
import { hashPassword } from "../../../utils/password";

describe("Company Employees", () => {
  let app: FastifyInstance;
  let companyUser: any;
  let clientUser: any;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();

    // Criar usuário do tipo COMPANY
    companyUser = await prisma.user.create({
      data: {
        email: "empresa@example.com",
        name: "Empresa Teste",
        passwordHash: await hashPassword("password123"),
        userType: "COMPANY",
      },
    });

    // Criar usuário do tipo CLIENT
    clientUser = await prisma.user.create({
      data: {
        email: "cliente@example.com",
        name: "Cliente Teste",
        passwordHash: await hashPassword("password123"),
        userType: "CLIENT",
      },
    });
  });

  afterEach(async () => {
    await prisma.companyEmployeeReview.deleteMany();
    await prisma.companyEmployeeAppointment.deleteMany();
    await prisma.companyEmployee.deleteMany();
    await prisma.companyService.deleteMany();
    await prisma.user.deleteMany();
  });

  describe("POST /api/v1/company-employees", () => {
    it("should create a new company employee", async () => {
      // Arrange
      const employeeData = {
        name: "Maria Silva",
        email: "maria@example.com",
        phone: "11999999999",
        position: "Cabeleireira",
        specialties: ["Corte", "Coloração", "Escova"],
      };

      // Act
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/company-employees",
        payload: employeeData,
      });

      // Assert
      expect(response.statusCode).toBe(201);
      const employee = response.json();
      expect(employee).toMatchObject({
        name: "Maria Silva",
        email: "maria@example.com",
        phone: "11999999999",
        position: "Cabeleireira",
        specialties: ["Corte", "Coloração", "Escova"],
        isActive: true,
      });
      expect(employee.id).toBeDefined();
      expect(employee.createdAt).toBeDefined();
    });

    it("should create employee with minimal data", async () => {
      // Arrange
      const employeeData = {
        name: "João Santos",
      };

      // Act
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/company-employees",
        payload: employeeData,
      });

      // Assert
      expect(response.statusCode).toBe(201);
      const employee = response.json();
      expect(employee).toMatchObject({
        name: "João Santos",
        isActive: true,
      });
    });

    it("should validate required fields", async () => {
      // Act
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/company-employees",
        payload: {},
      });

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty("error");
    });

    it("should validate email format", async () => {
      // Arrange
      const employeeData = {
        name: "Maria Silva",
        email: "invalid-email",
      };

      // Act
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/company-employees",
        payload: employeeData,
      });

      // Assert
      expect(response.statusCode).toBe(400);
      expect(response.json()).toHaveProperty("error");
    });
  });

  describe("GET /api/v1/company-employees", () => {
    beforeEach(async () => {
      // Criar funcionários de teste
      await prisma.companyEmployee.createMany({
        data: [
          {
            companyId: companyUser.id,
            name: "Maria Silva",
            email: "maria@example.com",
            position: "Cabeleireira",
            specialties: ["Corte", "Coloração"],
          },
          {
            companyId: companyUser.id,
            name: "João Santos",
            email: "joao@example.com",
            position: "Manicure",
            specialties: ["Unhas", "Pedicure"],
          },
          {
            companyId: companyUser.id,
            name: "Ana Costa",
            email: "ana@example.com",
            position: "Esteticista",
            specialties: ["Limpeza de Pele"],
            isActive: false,
          },
        ],
      });
    });

    it("should list all company employees", async () => {
      // Act
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/company-employees",
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.employees).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it("should filter employees by search", async () => {
      // Act
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/company-employees?search=Maria",
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.employees).toHaveLength(1);
      expect(result.employees[0].name).toBe("Maria Silva");
    });

    it("should filter employees by active status", async () => {
      // Act
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/company-employees?isActive=true",
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.employees).toHaveLength(2);
      expect(result.employees.every((emp: any) => emp.isActive)).toBe(true);
    });

    it("should support pagination", async () => {
      // Act
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/company-employees?page=1&limit=2",
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.employees).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
    });
  });

  describe("GET /api/v1/company-employees/:id", () => {
    let employee: any;

    beforeEach(async () => {
      employee = await prisma.companyEmployee.create({
        data: {
          companyId: companyUser.id,
          name: "Maria Silva",
          email: "maria@example.com",
          phone: "11999999999",
          position: "Cabeleireira",
          specialties: ["Corte", "Coloração"],
        },
      });
    });

    it("should get employee by id", async () => {
      // Act
      const response = await app.inject({
        method: "GET",
        url: `/api/v1/company-employees/${employee.id}`,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result).toMatchObject({
        id: employee.id,
        name: "Maria Silva",
        email: "maria@example.com",
        phone: "11999999999",
        position: "Cabeleireira",
        specialties: ["Corte", "Coloração"],
        isActive: true,
      });
    });

    it("should return 404 for non-existent employee", async () => {
      // Act
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/company-employees/non-existent-id",
      });

      // Assert
      expect(response.statusCode).toBe(404);
      expect(response.json()).toHaveProperty("error");
    });
  });

  describe("PUT /api/v1/company-employees/:id", () => {
    let employee: any;

    beforeEach(async () => {
      employee = await prisma.companyEmployee.create({
        data: {
          companyId: companyUser.id,
          name: "Maria Silva",
          email: "maria@example.com",
          position: "Cabeleireira",
        },
      });
    });

    it("should update employee", async () => {
      // Arrange
      const updateData = {
        name: "Maria Silva Santos",
        email: "maria.santos@example.com",
        phone: "11988888888",
        position: "Cabeleireira Sênior",
        specialties: ["Corte", "Coloração", "Escova"],
      };

      // Act
      const response = await app.inject({
        method: "PUT",
        url: `/api/v1/company-employees/${employee.id}`,
        payload: updateData,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result).toMatchObject({
        id: employee.id,
        name: "Maria Silva Santos",
        email: "maria.santos@example.com",
        phone: "11988888888",
        position: "Cabeleireira Sênior",
        specialties: ["Corte", "Coloração", "Escova"],
      });
    });

    it("should update only provided fields", async () => {
      // Arrange
      const updateData = {
        name: "Maria Silva Santos",
      };

      // Act
      const response = await app.inject({
        method: "PUT",
        url: `/api/v1/company-employees/${employee.id}`,
        payload: updateData,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.name).toBe("Maria Silva Santos");
      expect(result.email).toBe("maria@example.com"); // Não alterado
    });

    it("should deactivate employee", async () => {
      // Arrange
      const updateData = {
        isActive: false,
      };

      // Act
      const response = await app.inject({
        method: "PUT",
        url: `/api/v1/company-employees/${employee.id}`,
        payload: updateData,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result.isActive).toBe(false);
    });
  });

  describe("DELETE /api/v1/company-employees/:id", () => {
    let employee: any;

    beforeEach(async () => {
      employee = await prisma.companyEmployee.create({
        data: {
          companyId: companyUser.id,
          name: "Maria Silva",
          email: "maria@example.com",
          position: "Cabeleireira",
        },
      });
    });

    it("should delete employee", async () => {
      // Act
      const response = await app.inject({
        method: "DELETE",
        url: `/api/v1/company-employees/${employee.id}`,
      });

      // Assert
      expect(response.statusCode).toBe(204);

      // Verificar se foi deletado
      const deletedEmployee = await prisma.companyEmployee.findUnique({
        where: { id: employee.id },
      });
      expect(deletedEmployee).toBeNull();
    });

    it("should return 404 for non-existent employee", async () => {
      // Act
      const response = await app.inject({
        method: "DELETE",
        url: "/api/v1/company-employees/non-existent-id",
      });

      // Assert
      expect(response.statusCode).toBe(404);
      expect(response.json()).toHaveProperty("error");
    });
  });

  describe("GET /api/v1/company-employees/:id/stats", () => {
    let employee: any;

    beforeEach(async () => {
      employee = await prisma.companyEmployee.create({
        data: {
          companyId: companyUser.id,
          name: "Maria Silva",
          email: "maria@example.com",
          position: "Cabeleireira",
        },
      });
    });

    it("should get employee stats", async () => {
      // Act
      const response = await app.inject({
        method: "GET",
        url: `/api/v1/company-employees/${employee.id}/stats`,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const result = response.json();
      expect(result).toMatchObject({
        totalAppointments: 0,
        completedAppointments: 0,
        averageRating: 0,
        totalReviews: 0,
      });
    });
  });
});
