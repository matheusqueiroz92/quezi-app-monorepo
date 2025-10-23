import { FastifyInstance } from "fastify";
import { buildApp } from "../../../app";
import { prisma } from "../../../lib/prisma";
import { hashPassword } from "../../../utils/password";
import { auth } from "../../../lib/auth";

describe("Company Employee Auth Integration", () => {
  let app: FastifyInstance;
  let companyUser: any;
  let clientUser: any;
  let professionalUser: any;
  let companySession: any;
  let clientSession: any;
  let professionalSession: any;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  beforeEach(async () => {
    // Limpar dados de teste
    await prisma.companyEmployeeReview.deleteMany();
    await prisma.companyEmployeeAppointment.deleteMany();
    await prisma.companyEmployee.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();

    // Criar usuários
    companyUser = await prisma.user.create({
      data: {
        email: "empresa@test.com",
        name: "Empresa Teste",
        passwordHash: await hashPassword("password123"),
        userType: "COMPANY",
      },
    });

    clientUser = await prisma.user.create({
      data: {
        email: "cliente@test.com",
        name: "Cliente Teste",
        passwordHash: await hashPassword("password123"),
        userType: "CLIENT",
      },
    });

    professionalUser = await prisma.user.create({
      data: {
        email: "profissional@test.com",
        name: "Profissional Teste",
        passwordHash: await hashPassword("password123"),
        userType: "PROFESSIONAL",
      },
    });

    // Criar sessões válidas
    companySession = await prisma.session.create({
      data: {
        id: "company-session-123",
        userId: companyUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        token: "company-session-token",
      },
    });

    clientSession = await prisma.session.create({
      data: {
        id: "client-session-123",
        userId: clientUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        token: "client-session-token",
      },
    });

    professionalSession = await prisma.session.create({
      data: {
        id: "professional-session-123",
        userId: professionalUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        token: "professional-session-token",
      },
    });
  });

  afterEach(async () => {
    await prisma.companyEmployeeReview.deleteMany();
    await prisma.companyEmployeeAppointment.deleteMany();
    await prisma.companyEmployee.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  describe("Authentication with Real Sessions", () => {
    it("should authenticate COMPANY user with valid session", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/company-employees",
        headers: {
          authorization: `Bearer ${companySession.token}`,
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it("should authenticate CLIENT user with valid session", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/company-employees/appointments",
        headers: {
          authorization: `Bearer ${clientSession.token}`,
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it("should reject invalid session token", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/company-employees",
        headers: {
          authorization: "Bearer invalid-token",
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should reject expired session", async () => {
      // Criar sessão expirada
      const expiredSession = await prisma.session.create({
        data: {
          id: "expired-session-123",
          userId: companyUser.id,
          expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Ontem
          token: "expired-session-token",
        },
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/company-employees",
        headers: {
          authorization: `Bearer ${expiredSession.token}`,
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("Authorization with Real User Types", () => {
    it("should allow COMPANY user to access employee management", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/company-employees",
        headers: {
          authorization: `Bearer ${companySession.token}`,
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it("should reject CLIENT user from employee management", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/company-employees",
        headers: {
          authorization: `Bearer ${clientSession.token}`,
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it("should reject PROFESSIONAL user from employee management", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/company-employees",
        headers: {
          authorization: `Bearer ${professionalSession.token}`,
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it("should allow CLIENT user to create appointments", async () => {
      // Criar funcionário primeiro
      const employee = await prisma.companyEmployee.create({
        data: {
          companyId: companyUser.id,
          name: "Funcionário Teste",
          email: "funcionario@test.com",
          position: "Cabeleireira",
        },
      });

      const appointmentData = {
        employeeId: employee.id,
        clientId: clientUser.id,
        serviceId: "service-123",
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        locationType: "AT_LOCATION",
        clientNotes: "Corte e escova",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/company-employees/appointments",
        headers: {
          authorization: `Bearer ${clientSession.token}`,
          "content-type": "application/json",
        },
        payload: appointmentData,
      });

      expect(response.statusCode).toBe(201);
    });

    it("should allow COMPANY user to create appointments", async () => {
      // Criar funcionário primeiro
      const employee = await prisma.companyEmployee.create({
        data: {
          companyId: companyUser.id,
          name: "Funcionário Teste",
          email: "funcionario@test.com",
          position: "Cabeleireira",
        },
      });

      const appointmentData = {
        employeeId: employee.id,
        clientId: clientUser.id,
        serviceId: "service-123",
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        locationType: "AT_LOCATION",
        clientNotes: "Corte e escova",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/company-employees/appointments",
        headers: {
          authorization: `Bearer ${companySession.token}`,
          "content-type": "application/json",
        },
        payload: appointmentData,
      });

      expect(response.statusCode).toBe(201);
    });

    it("should reject PROFESSIONAL user from creating appointments", async () => {
      const appointmentData = {
        employeeId: "employee-123",
        clientId: clientUser.id,
        serviceId: "service-123",
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        locationType: "AT_LOCATION",
        clientNotes: "Corte e escova",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/company-employees/appointments",
        headers: {
          authorization: `Bearer ${professionalSession.token}`,
          "content-type": "application/json",
        },
        payload: appointmentData,
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe("Resource Ownership Validation", () => {
    it("should allow COMPANY user to access their own employee", async () => {
      const employee = await prisma.companyEmployee.create({
        data: {
          companyId: companyUser.id,
          name: "Funcionário Teste",
          email: "funcionario@test.com",
          position: "Cabeleireira",
        },
      });

      const response = await app.inject({
        method: "GET",
        url: `/api/v1/company-employees/${employee.id}`,
        headers: {
          authorization: `Bearer ${companySession.token}`,
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it("should reject COMPANY user from accessing another company's employee", async () => {
      // Criar outra empresa
      const otherCompany = await prisma.user.create({
        data: {
          email: "outra-empresa@test.com",
          name: "Outra Empresa",
          passwordHash: await hashPassword("password123"),
          userType: "COMPANY",
        },
      });

      const employee = await prisma.companyEmployee.create({
        data: {
          companyId: otherCompany.id,
          name: "Funcionário de Outra Empresa",
          email: "funcionario-outra@test.com",
          position: "Cabeleireira",
        },
      });

      const response = await app.inject({
        method: "GET",
        url: `/api/v1/company-employees/${employee.id}`,
        headers: {
          authorization: `Bearer ${companySession.token}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it("should allow CLIENT user to access their own appointment", async () => {
      const employee = await prisma.companyEmployee.create({
        data: {
          companyId: companyUser.id,
          name: "Funcionário Teste",
          email: "funcionario@test.com",
          position: "Cabeleireira",
        },
      });

      const appointment = await prisma.companyEmployeeAppointment.create({
        data: {
          employeeId: employee.id,
          clientId: clientUser.id,
          serviceId: "service-123",
          scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: "PENDING",
          locationType: "AT_LOCATION",
        },
      });

      const response = await app.inject({
        method: "GET",
        url: `/api/v1/company-employees/appointments/${appointment.id}`,
        headers: {
          authorization: `Bearer ${clientSession.token}`,
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it("should reject CLIENT user from accessing another client's appointment", async () => {
      const employee = await prisma.companyEmployee.create({
        data: {
          companyId: companyUser.id,
          name: "Funcionário Teste",
          email: "funcionario@test.com",
          position: "Cabeleireira",
        },
      });

      // Criar outro cliente
      const otherClient = await prisma.user.create({
        data: {
          email: "outro-cliente@test.com",
          name: "Outro Cliente",
          passwordHash: await hashPassword("password123"),
          userType: "CLIENT",
        },
      });

      const appointment = await prisma.companyEmployeeAppointment.create({
        data: {
          employeeId: employee.id,
          clientId: otherClient.id,
          serviceId: "service-123",
          scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          status: "PENDING",
          locationType: "AT_LOCATION",
        },
      });

      const response = await app.inject({
        method: "GET",
        url: `/api/v1/company-employees/appointments/${appointment.id}`,
        headers: {
          authorization: `Bearer ${clientSession.token}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
