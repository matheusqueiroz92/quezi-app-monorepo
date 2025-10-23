import { FastifyInstance } from "fastify";
import { buildApp } from "../../../app";
import { prisma } from "../../../lib/prisma";
import { hashPassword } from "../../../utils/password";

describe("Company Employee Routes - Authentication & Authorization", () => {
  let app: FastifyInstance;
  let companyToken: string;
  let clientToken: string;
  let professionalToken: string;
  let companyId: string;
  let clientId: string;
  let professionalId: string;
  let employeeId: string;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  beforeEach(async () => {
    // Limpar dados de teste
    await prisma.companyEmployeeReview.deleteMany();
    await prisma.companyEmployeeAppointment.deleteMany();
    await prisma.companyEmployee.deleteMany();
    await prisma.user.deleteMany();

    // Criar usuário empresa
    const company = await prisma.user.create({
      data: {
        email: "empresa@test.com",
        name: "Empresa Teste",
        passwordHash: await hashPassword("password123"),
        userType: "COMPANY",
      },
    });
    companyId = company.id;

    // Criar usuário cliente
    const client = await prisma.user.create({
      data: {
        email: "cliente@test.com",
        name: "Cliente Teste",
        passwordHash: await hashPassword("password123"),
        userType: "CLIENT",
      },
    });
    clientId = client.id;

    // Criar usuário profissional
    const professional = await prisma.user.create({
      data: {
        email: "profissional@test.com",
        name: "Profissional Teste",
        passwordHash: await hashPassword("password123"),
        userType: "PROFESSIONAL",
      },
    });
    professionalId = professional.id;

    // Criar funcionário da empresa
    const employee = await prisma.companyEmployee.create({
      data: {
        companyId,
        name: "Funcionário Teste",
        email: "funcionario@test.com",
        position: "Cabeleireira",
        specialties: ["Corte", "Coloração"],
      },
    });
    employeeId = employee.id;

    // Simular tokens (em um ambiente real, estes seriam gerados pelo Better Auth)
    companyToken = "company-token";
    clientToken = "client-token";
    professionalToken = "professional-token";
  });

  afterEach(async () => {
    await prisma.companyEmployeeReview.deleteMany();
    await prisma.companyEmployeeAppointment.deleteMany();
    await prisma.companyEmployee.deleteMany();
    await prisma.user.deleteMany();
  });

  describe("GET /api/v1/company-employees", () => {
    it("should allow COMPANY user to list employees", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/company-employees",
        headers: {
          authorization: `Bearer ${companyToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.employees).toHaveLength(1);
      expect(data.employees[0].name).toBe("Funcionário Teste");
    });

    it("should reject CLIENT user from listing employees", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/company-employees",
        headers: {
          authorization: `Bearer ${clientToken}`,
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it("should reject PROFESSIONAL user from listing employees", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/company-employees",
        headers: {
          authorization: `Bearer ${professionalToken}`,
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it("should reject unauthenticated request", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/company-employees",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("POST /api/v1/company-employees", () => {
    it("should allow COMPANY user to create employee", async () => {
      const employeeData = {
        name: "Novo Funcionário",
        email: "novo@test.com",
        position: "Manicure",
        specialties: ["Manicure", "Pedicure"],
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/company-employees",
        headers: {
          authorization: `Bearer ${companyToken}`,
          "content-type": "application/json",
        },
        payload: employeeData,
      });

      expect(response.statusCode).toBe(201);
      const data = response.json();
      expect(data.name).toBe("Novo Funcionário");
    });

    it("should reject CLIENT user from creating employee", async () => {
      const employeeData = {
        name: "Novo Funcionário",
        email: "novo@test.com",
        position: "Manicure",
        specialties: ["Manicure", "Pedicure"],
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/company-employees",
        headers: {
          authorization: `Bearer ${clientToken}`,
          "content-type": "application/json",
        },
        payload: employeeData,
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe("GET /api/v1/company-employees/:id", () => {
    it("should allow COMPANY user to get their own employee", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/api/v1/company-employees/${employeeId}`,
        headers: {
          authorization: `Bearer ${companyToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = response.json();
      expect(data.name).toBe("Funcionário Teste");
    });

    it("should reject CLIENT user from getting employee", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/api/v1/company-employees/${employeeId}`,
        headers: {
          authorization: `Bearer ${clientToken}`,
        },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe("POST /api/v1/company-employees/appointments", () => {
    it("should allow CLIENT user to create appointment", async () => {
      const appointmentData = {
        employeeId,
        clientId,
        serviceId: "service-123",
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        locationType: "AT_LOCATION",
        clientNotes: "Corte e escova",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/company-employees/appointments",
        headers: {
          authorization: `Bearer ${clientToken}`,
          "content-type": "application/json",
        },
        payload: appointmentData,
      });

      expect(response.statusCode).toBe(201);
    });

    it("should allow COMPANY user to create appointment", async () => {
      const appointmentData = {
        employeeId,
        clientId,
        serviceId: "service-123",
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        locationType: "AT_LOCATION",
        clientNotes: "Corte e escova",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/company-employees/appointments",
        headers: {
          authorization: `Bearer ${companyToken}`,
          "content-type": "application/json",
        },
        payload: appointmentData,
      });

      expect(response.statusCode).toBe(201);
    });

    it("should reject PROFESSIONAL user from creating appointment", async () => {
      const appointmentData = {
        employeeId,
        clientId,
        serviceId: "service-123",
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        locationType: "AT_LOCATION",
        clientNotes: "Corte e escova",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/company-employees/appointments",
        headers: {
          authorization: `Bearer ${professionalToken}`,
          "content-type": "application/json",
        },
        payload: appointmentData,
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe("POST /api/v1/company-employees/reviews", () => {
    it("should allow CLIENT user to create review", async () => {
      // Primeiro criar um agendamento
      const appointment = await prisma.companyEmployeeAppointment.create({
        data: {
          employeeId,
          clientId,
          serviceId: "service-123",
          scheduledDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Ontem
          status: "COMPLETED",
          locationType: "AT_LOCATION",
        },
      });

      const reviewData = {
        appointmentId: appointment.id,
        employeeId,
        rating: 5,
        comment: "Excelente atendimento!",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/company-employees/reviews",
        headers: {
          authorization: `Bearer ${clientToken}`,
          "content-type": "application/json",
        },
        payload: reviewData,
      });

      expect(response.statusCode).toBe(201);
    });

    it("should reject COMPANY user from creating review", async () => {
      const reviewData = {
        appointmentId: "appointment-123",
        employeeId,
        rating: 5,
        comment: "Excelente atendimento!",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/company-employees/reviews",
        headers: {
          authorization: `Bearer ${companyToken}`,
          "content-type": "application/json",
        },
        payload: reviewData,
      });

      expect(response.statusCode).toBe(403);
    });

    it("should reject PROFESSIONAL user from creating review", async () => {
      const reviewData = {
        appointmentId: "appointment-123",
        employeeId,
        rating: 5,
        comment: "Excelente atendimento!",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/company-employees/reviews",
        headers: {
          authorization: `Bearer ${professionalToken}`,
          "content-type": "application/json",
        },
        payload: reviewData,
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid token format", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/company-employees",
        headers: {
          authorization: "InvalidToken",
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should handle missing authorization header", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/company-employees",
      });

      expect(response.statusCode).toBe(401);
    });

    it("should handle expired token", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/company-employees",
        headers: {
          authorization: "Bearer expired-token",
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
