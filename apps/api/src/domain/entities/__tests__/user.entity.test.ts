/**
 * Testes da Entidade User
 *
 * Seguindo TDD (Test-Driven Development):
 * - Red: Escrever teste que falha
 * - Green: Implementar código mínimo para passar
 * - Refactor: Melhorar código mantendo testes passando
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import { User, CreateUserData } from "../user.entity";
import { UserType } from "../../interfaces/user.interface";

describe("User Entity", () => {
  let validUserData: CreateUserData;

  beforeEach(() => {
    validUserData = {
      id: "user-123",
      email: "test@example.com",
      name: "João Silva",
      phone: "(11) 99999-9999",
      userType: UserType.CLIENT,
      isEmailVerified: false,
    };
  });

  describe("create", () => {
    it("deve criar usuário com dados válidos", () => {
      const user = User.create(validUserData);

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe("user-123");
      expect(user.email).toBe("test@example.com");
      expect(user.name).toBe("João Silva");
      expect(user.phone).toBe("(11) 99999-9999");
      expect(user.userType).toBe(UserType.CLIENT);
      expect(user.isEmailVerified).toBe(false);
    });

    it("deve criar usuário sem telefone", () => {
      const dataWithoutPhone = { ...validUserData, phone: undefined };
      const user = User.create(dataWithoutPhone);

      expect(user.phone).toBeUndefined();
    });

    it("deve definir isEmailVerified como false por padrão", () => {
      const dataWithoutEmailVerified = {
        ...validUserData,
        isEmailVerified: undefined,
      };
      const user = User.create(dataWithoutEmailVerified);

      expect(user.isEmailVerified).toBe(false);
    });

    it("deve definir datas de criação e atualização por padrão", () => {
      const dataWithoutDates = {
        ...validUserData,
        createdAt: undefined,
        updatedAt: undefined,
      };
      const user = User.create(dataWithoutDates);

      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("validações", () => {
    it("deve lançar erro se ID não for fornecido", () => {
      const invalidData = { ...validUserData, id: "" };

      expect(() => User.create(invalidData)).toThrow(
        "ID do usuário é obrigatório"
      );
    });

    it("deve lançar erro se email não for fornecido", () => {
      const invalidData = { ...validUserData, email: "" };

      expect(() => User.create(invalidData)).toThrow("Email é obrigatório");
    });

    it("deve lançar erro se email for inválido", () => {
      const invalidData = { ...validUserData, email: "email-invalido" };

      expect(() => User.create(invalidData)).toThrow("Email inválido");
    });

    it("deve lançar erro se nome não for fornecido", () => {
      const invalidData = { ...validUserData, name: "" };

      expect(() => User.create(invalidData)).toThrow("Nome é obrigatório");
    });

    it("deve lançar erro se nome tiver menos de 2 caracteres", () => {
      const invalidData = { ...validUserData, name: "A" };

      expect(() => User.create(invalidData)).toThrow(
        "Nome deve ter pelo menos 2 caracteres"
      );
    });

    it("deve lançar erro se telefone for inválido", () => {
      const invalidData = { ...validUserData, phone: "telefone-invalido" };

      expect(() => User.create(invalidData)).toThrow("Telefone inválido");
    });

    it("deve lançar erro se tipo de usuário for inválido", () => {
      const invalidData = { ...validUserData, userType: "INVALID" as any };

      expect(() => User.create(invalidData)).toThrow(
        "Tipo de usuário inválido"
      );
    });
  });

  describe("métodos de domínio", () => {
    let clientUser: User;
    let professionalUser: User;
    let companyUser: User;

    beforeEach(() => {
      clientUser = User.create({ ...validUserData, userType: UserType.CLIENT });
      professionalUser = User.create({
        ...validUserData,
        userType: UserType.PROFESSIONAL,
      });
      companyUser = User.create({
        ...validUserData,
        userType: UserType.COMPANY,
      });
    });

    describe("canCreateAppointment", () => {
      it("deve retornar true para cliente", () => {
        expect(clientUser.canCreateAppointment()).toBe(true);
      });

      it("deve retornar false para profissional", () => {
        expect(professionalUser.canCreateAppointment()).toBe(false);
      });

      it("deve retornar false para empresa", () => {
        expect(companyUser.canCreateAppointment()).toBe(false);
      });
    });

    describe("canReceiveAppointments", () => {
      it("deve retornar false para cliente", () => {
        expect(clientUser.canReceiveAppointments()).toBe(false);
      });

      it("deve retornar true para profissional", () => {
        expect(professionalUser.canReceiveAppointments()).toBe(true);
      });

      it("deve retornar true para empresa", () => {
        expect(companyUser.canReceiveAppointments()).toBe(true);
      });
    });

    describe("getProfileType", () => {
      it('deve retornar "client" para cliente', () => {
        expect(clientUser.getProfileType()).toBe("client");
      });

      it('deve retornar "professional" para profissional', () => {
        expect(professionalUser.getProfileType()).toBe("professional");
      });

      it('deve retornar "company" para empresa', () => {
        expect(companyUser.getProfileType()).toBe("company");
      });
    });

    describe("métodos de tipo", () => {
      it("deve identificar cliente corretamente", () => {
        expect(clientUser.isClient()).toBe(true);
        expect(clientUser.isProfessional()).toBe(false);
        expect(clientUser.isCompany()).toBe(false);
      });

      it("deve identificar profissional corretamente", () => {
        expect(professionalUser.isClient()).toBe(false);
        expect(professionalUser.isProfessional()).toBe(true);
        expect(professionalUser.isCompany()).toBe(false);
      });

      it("deve identificar empresa corretamente", () => {
        expect(companyUser.isClient()).toBe(false);
        expect(companyUser.isProfessional()).toBe(false);
        expect(companyUser.isCompany()).toBe(true);
      });
    });

    describe("métodos de permissão", () => {
      it("deve permitir que empresa gerencie funcionários", () => {
        expect(companyUser.canManageEmployees()).toBe(true);
        expect(clientUser.canManageEmployees()).toBe(false);
        expect(professionalUser.canManageEmployees()).toBe(false);
      });

      it("deve permitir que profissional e empresa ofereçam serviços", () => {
        expect(professionalUser.canOfferServices()).toBe(true);
        expect(companyUser.canOfferServices()).toBe(true);
        expect(clientUser.canOfferServices()).toBe(false);
      });

      it("deve permitir que cliente agende consultas", () => {
        expect(clientUser.canBookAppointments()).toBe(true);
        expect(professionalUser.canBookAppointments()).toBe(false);
        expect(companyUser.canBookAppointments()).toBe(false);
      });
    });
  });

  describe("fromPersistence", () => {
    it("deve reconstruir usuário a partir de dados de persistência", () => {
      const persistenceData = {
        id: "user-123",
        email: "test@example.com",
        name: "João Silva",
        phone: "(11) 99999-9999",
        userType: UserType.CLIENT,
        isEmailVerified: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      };

      const user = User.fromPersistence(persistenceData);

      expect(user.id).toBe("user-123");
      expect(user.email).toBe("test@example.com");
      expect(user.name).toBe("João Silva");
      expect(user.phone).toBe("(11) 99999-9999");
      expect(user.userType).toBe(UserType.CLIENT);
      expect(user.isEmailVerified).toBe(true);
      expect(user.createdAt).toEqual(new Date("2024-01-01"));
      expect(user.updatedAt).toEqual(new Date("2024-01-02"));
    });
  });
});
