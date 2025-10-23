import { FastifyInstance } from "fastify";
import { buildApp } from "../../../app";
import { prisma } from "../../../lib/prisma";
import { hashPassword } from "../../../utils/password";

describe("Company Employee Security Tests", () => {
  let app: FastifyInstance;
  let companyUser: any;
  let clientUser: any;
  let companySession: any;
  let clientSession: any;

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

    // Criar sessões válidas
    companySession = await prisma.session.create({
      data: {
        id: "company-session-123",
        userId: companyUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        token: "company-session-token",
      },
    });

    clientSession = await prisma.session.create({
      data: {
        id: "client-session-123",
        userId: clientUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        token: "client-session-token",
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

  describe("SQL Injection Protection", () => {
    it("should prevent SQL injection in employee search", async () => {
      const maliciousSearch = "'; DROP TABLE users; --";

      const response = await app.inject({
        method: "GET",
        url: `/api/v1/company-employees?search=${encodeURIComponent(
          maliciousSearch
        )}`,
        headers: {
          authorization: `Bearer ${companySession.token}`,
        },
      });

      expect(response.statusCode).toBe(200);
      // Verificar se a tabela ainda existe
      const users = await prisma.user.findMany();
      expect(users).toBeDefined();
    });

    it("should prevent SQL injection in employee ID parameter", async () => {
      const maliciousId = "'; DROP TABLE users; --";

      const response = await app.inject({
        method: "GET",
        url: `/api/v1/company-employees/${encodeURIComponent(maliciousId)}`,
        headers: {
          authorization: `Bearer ${companySession.token}`,
        },
      });

      expect(response.statusCode).toBe(404);
      // Verificar se a tabela ainda existe
      const users = await prisma.user.findMany();
      expect(users).toBeDefined();
    });
  });

  describe("Authorization Bypass Attempts", () => {
    it("should prevent CLIENT from accessing employee management via direct ID manipulation", async () => {
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
          authorization: `Bearer ${clientSession.token}`,
        },
      });

      expect(response.statusCode).toBe(403);
    });

    it("should prevent CLIENT from updating employee via direct ID manipulation", async () => {
      const employee = await prisma.companyEmployee.create({
        data: {
          companyId: companyUser.id,
          name: "Funcionário Teste",
          email: "funcionario@test.com",
          position: "Cabeleireira",
        },
      });

      const updateData = {
        name: "Funcionário Hackeado",
        position: "Hacker",
      };

      const response = await app.inject({
        method: "PUT",
        url: `/api/v1/company-employees/${employee.id}`,
        headers: {
          authorization: `Bearer ${clientSession.token}`,
          "content-type": "application/json",
        },
        payload: updateData,
      });

      expect(response.statusCode).toBe(403);
    });

    it("should prevent CLIENT from deleting employee via direct ID manipulation", async () => {
      const employee = await prisma.companyEmployee.create({
        data: {
          companyId: companyUser.id,
          name: "Funcionário Teste",
          email: "funcionario@test.com",
          position: "Cabeleireira",
        },
      });

      const response = await app.inject({
        method: "DELETE",
        url: `/api/v1/company-employees/${employee.id}`,
        headers: {
          authorization: `Bearer ${clientSession.token}`,
        },
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe("Data Isolation", () => {
    it("should prevent COMPANY from accessing another company's employees", async () => {
      // Criar outra empresa
      const otherCompany = await prisma.user.create({
        data: {
          email: "outra-empresa@test.com",
          name: "Outra Empresa",
          passwordHash: await hashPassword("password123"),
          userType: "COMPANY",
        },
      });

      const otherCompanySession = await prisma.session.create({
        data: {
          id: "other-company-session-123",
          userId: otherCompany.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          token: "other-company-session-token",
        },
      });

      const employee = await prisma.companyEmployee.create({
        data: {
          companyId: companyUser.id,
          name: "Funcionário da Empresa Original",
          email: "funcionario@test.com",
          position: "Cabeleireira",
        },
      });

      const response = await app.inject({
        method: "GET",
        url: `/api/v1/company-employees/${employee.id}`,
        headers: {
          authorization: `Bearer ${otherCompanySession.token}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it("should prevent CLIENT from accessing appointments of other clients", async () => {
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

      const otherClientSession = await prisma.session.create({
        data: {
          id: "other-client-session-123",
          userId: otherClient.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          token: "other-client-session-token",
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
          authorization: `Bearer ${otherClientSession.token}`,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe("Input Validation", () => {
    it("should reject malformed JSON in request body", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/company-employees",
        headers: {
          authorization: `Bearer ${companySession.token}`,
          "content-type": "application/json",
        },
        payload: "invalid json{",
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject oversized request body", async () => {
      const oversizedData = {
        name: "A".repeat(10000), // Nome muito longo
        email: "test@test.com",
        position: "Cabeleireira",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/company-employees",
        headers: {
          authorization: `Bearer ${companySession.token}`,
          "content-type": "application/json",
        },
        payload: oversizedData,
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject invalid email format", async () => {
      const invalidData = {
        name: "Funcionário Teste",
        email: "email-invalido",
        position: "Cabeleireira",
      };

      const response = await app.inject({
        method: "POST",
        url: "/api/v1/company-employees",
        headers: {
          authorization: `Bearer ${companySession.token}`,
          "content-type": "application/json",
        },
        payload: invalidData,
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("Rate Limiting", () => {
    it("should handle multiple rapid requests gracefully", async () => {
      const requests = [];

      // Fazer 10 requisições rapidamente
      for (let i = 0; i < 10; i++) {
        requests.push(
          app.inject({
            method: "GET",
            url: "/api/v1/company-employees",
            headers: {
              authorization: `Bearer ${companySession.token}`,
            },
          })
        );
      }

      const responses = await Promise.all(requests);

      // Todas as requisições devem ser processadas
      responses.forEach((response) => {
        expect(response.statusCode).toBe(200);
      });
    });
  });

  describe("Session Security", () => {
    it("should invalidate session after user deletion", async () => {
      // Deletar usuário
      await prisma.user.delete({
        where: { id: companyUser.id },
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/company-employees",
        headers: {
          authorization: `Bearer ${companySession.token}`,
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should reject session with invalid user ID", async () => {
      // Criar sessão com ID de usuário inexistente
      const invalidSession = await prisma.session.create({
        data: {
          id: "invalid-session-123",
          userId: "user-inexistente",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          token: "invalid-session-token",
        },
      });

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/company-employees",
        headers: {
          authorization: `Bearer ${invalidSession.token}`,
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
