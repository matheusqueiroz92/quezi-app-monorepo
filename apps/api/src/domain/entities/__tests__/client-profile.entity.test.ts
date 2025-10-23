/**
 * Testes da Entidade ClientProfile
 *
 * Seguindo TDD (Test-Driven Development):
 * - Red: Escrever teste que falha
 * - Green: Implementar código mínimo para passar
 * - Refactor: Melhorar código mantendo testes passando
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import {
  ClientProfile,
  CreateClientProfileData,
} from "../client-profile.entity";
import {
  Address,
  PaymentMethod,
  ClientPreferences,
} from "../../interfaces/user.interface";

describe("ClientProfile Entity", () => {
  let validProfileData: CreateClientProfileData;
  let validAddress: Address;
  let validPaymentMethod: PaymentMethod;

  beforeEach(() => {
    validAddress = {
      id: "addr-1",
      street: "Rua das Flores",
      number: "123",
      complement: "Apto 45",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234567",
      isDefault: true,
    };

    validPaymentMethod = {
      id: "pm-1",
      type: "credit_card",
      name: "Cartão de Crédito",
      isDefault: true,
      details: {
        last4: "1234",
        brand: "Visa",
      },
    };

    validProfileData = {
      userId: "user-123",
      cpf: "11144477735",
      addresses: [validAddress],
      paymentMethods: [validPaymentMethod],
      favoriteServices: ["service-1", "service-2"],
      preferences: {
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
        marketing: false,
        language: "pt-BR",
        timezone: "America/Sao_Paulo",
      },
    };
  });

  describe("create", () => {
    it("deve criar perfil de cliente com dados válidos", () => {
      const profile = ClientProfile.create(validProfileData);

      expect(profile).toBeInstanceOf(ClientProfile);
      expect(profile.userId).toBe("user-123");
      expect(profile.cpf).toBe("11144477735");
      expect(profile.addresses).toHaveLength(1);
      expect(profile.paymentMethods).toHaveLength(1);
      expect(profile.favoriteServices).toHaveLength(2);
      expect(profile.preferences).toBeDefined();
    });

    it("deve criar perfil com dados mínimos", () => {
      const minimalData = {
        userId: "user-123",
        cpf: "11144477735",
      };

      const profile = ClientProfile.create(minimalData);

      expect(profile.userId).toBe("user-123");
      expect(profile.cpf).toBe("11144477735");
      expect(profile.addresses).toHaveLength(0);
      expect(profile.paymentMethods).toHaveLength(0);
      expect(profile.favoriteServices).toHaveLength(0);
      expect(profile.preferences).toBeDefined();
    });

    it("deve definir preferências padrão quando não fornecidas", () => {
      const dataWithoutPreferences = {
        userId: "user-123",
        cpf: "11144477735",
      };

      const profile = ClientProfile.create(dataWithoutPreferences);

      expect(profile.preferences).toEqual({
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
        marketing: false,
        language: "pt-BR",
        timezone: "America/Sao_Paulo",
      });
    });
  });

  describe("validações", () => {
    it("deve lançar erro se userId não for fornecido", () => {
      const invalidData = { ...validProfileData, userId: "" };

      expect(() => ClientProfile.create(invalidData)).toThrow(
        "ID do usuário é obrigatório"
      );
    });

    it("deve lançar erro se CPF não for fornecido", () => {
      const invalidData = { ...validProfileData, cpf: "" };

      expect(() => ClientProfile.create(invalidData)).toThrow(
        "CPF é obrigatório"
      );
    });

    it("deve lançar erro se CPF for inválido", () => {
      const invalidData = { ...validProfileData, cpf: "123" };

      expect(() => ClientProfile.create(invalidData)).toThrow("CPF inválido");
    });

    it("deve lançar erro se CPF tiver todos os dígitos iguais", () => {
      const invalidData = { ...validProfileData, cpf: "11111111111" };

      expect(() => ClientProfile.create(invalidData)).toThrow("CPF inválido");
    });

    it("deve validar endereços fornecidos", () => {
      const invalidAddress = { ...validAddress, street: "" };
      const invalidData = { ...validProfileData, addresses: [invalidAddress] };

      expect(() => ClientProfile.create(invalidData)).toThrow(
        "Rua é obrigatória"
      );
    });

    it("deve validar métodos de pagamento fornecidos", () => {
      const invalidPaymentMethod = { ...validPaymentMethod, type: "invalid" };
      const invalidData = {
        ...validProfileData,
        paymentMethods: [invalidPaymentMethod],
      };

      expect(() => ClientProfile.create(invalidData)).toThrow(
        "Tipo de método de pagamento inválido"
      );
    });
  });

  describe("métodos de domínio", () => {
    let profile: ClientProfile;

    beforeEach(() => {
      profile = ClientProfile.create(validProfileData);
    });

    describe("addAddress", () => {
      it("deve adicionar endereço válido", () => {
        const newAddress: Address = {
          id: "addr-2",
          street: "Rua Nova",
          number: "456",
          neighborhood: "Vila Nova",
          city: "São Paulo",
          state: "SP",
          zipCode: "01234568",
          isDefault: false,
        };

        profile.addAddress(newAddress);

        expect(profile.addresses).toHaveLength(2);
        expect(profile.addresses[1]).toEqual(newAddress);
      });

      it("deve tornar primeiro endereço como padrão automaticamente", () => {
        const profileWithoutAddresses = ClientProfile.create({
          userId: "user-123",
          cpf: "11144477735",
        });

        const newAddress: Address = {
          id: "addr-1",
          street: "Rua Nova",
          number: "456",
          neighborhood: "Vila Nova",
          city: "São Paulo",
          state: "SP",
          zipCode: "01234568",
          isDefault: false,
        };

        profileWithoutAddresses.addAddress(newAddress);

        expect(profileWithoutAddresses.addresses[0].isDefault).toBe(true);
      });

      it("deve remover padrão dos outros endereços quando adicionar novo padrão", () => {
        const newDefaultAddress: Address = {
          id: "addr-2",
          street: "Rua Nova",
          number: "456",
          neighborhood: "Vila Nova",
          city: "São Paulo",
          state: "SP",
          zipCode: "01234568",
          isDefault: true,
        };

        profile.addAddress(newDefaultAddress);

        expect(profile.addresses[0].isDefault).toBe(false);
        expect(profile.addresses[1].isDefault).toBe(true);
      });

      it("deve lançar erro se endereço for inválido", () => {
        const invalidAddress = { ...validAddress, street: "" };

        expect(() => profile.addAddress(invalidAddress)).toThrow(
          "Rua é obrigatória"
        );
      });
    });

    describe("removeAddress", () => {
      it("deve remover endereço existente", () => {
        profile.removeAddress("addr-1");

        expect(profile.addresses).toHaveLength(0);
      });

      it("deve tornar outro endereço como padrão ao remover o padrão", () => {
        const secondAddress: Address = {
          id: "addr-2",
          street: "Rua Segunda",
          number: "789",
          neighborhood: "Bairro Segundo",
          city: "São Paulo",
          state: "SP",
          zipCode: "01234569",
          isDefault: false,
        };

        profile.addAddress(secondAddress);
        profile.removeAddress("addr-1");

        expect(profile.addresses).toHaveLength(1);
        expect(profile.addresses[0].isDefault).toBe(true);
      });

      it("deve lançar erro se endereço não existir", () => {
        expect(() => profile.removeAddress("addr-inexistente")).toThrow(
          "Endereço não encontrado"
        );
      });
    });

    describe("addPaymentMethod", () => {
      it("deve adicionar método de pagamento válido", () => {
        const newPaymentMethod: PaymentMethod = {
          id: "pm-2",
          type: "pix",
          name: "PIX",
          isDefault: false,
        };

        profile.addPaymentMethod(newPaymentMethod);

        expect(profile.paymentMethods).toHaveLength(2);
        expect(profile.paymentMethods[1]).toEqual(newPaymentMethod);
      });

      it("deve tornar primeiro método como padrão automaticamente", () => {
        const profileWithoutPaymentMethods = ClientProfile.create({
          userId: "user-123",
          cpf: "11144477735",
        });

        const newPaymentMethod: PaymentMethod = {
          id: "pm-1",
          type: "pix",
          name: "PIX",
          isDefault: false,
        };

        profileWithoutPaymentMethods.addPaymentMethod(newPaymentMethod);

        expect(profileWithoutPaymentMethods.paymentMethods[0].isDefault).toBe(
          true
        );
      });

      it("deve remover padrão dos outros métodos quando adicionar novo padrão", () => {
        const newDefaultPaymentMethod: PaymentMethod = {
          id: "pm-2",
          type: "pix",
          name: "PIX",
          isDefault: true,
        };

        profile.addPaymentMethod(newDefaultPaymentMethod);

        expect(profile.paymentMethods[0].isDefault).toBe(false);
        expect(profile.paymentMethods[1].isDefault).toBe(true);
      });

      it("deve lançar erro se método de pagamento for inválido", () => {
        const invalidPaymentMethod = { ...validPaymentMethod, type: "invalid" };

        expect(() => profile.addPaymentMethod(invalidPaymentMethod)).toThrow(
          "Tipo de método de pagamento inválido"
        );
      });
    });

    describe("removePaymentMethod", () => {
      it("deve remover método de pagamento existente", () => {
        profile.removePaymentMethod("pm-1");

        expect(profile.paymentMethods).toHaveLength(0);
      });

      it("deve tornar outro método como padrão ao remover o padrão", () => {
        const secondPaymentMethod: PaymentMethod = {
          id: "pm-2",
          type: "pix",
          name: "PIX",
          isDefault: false,
        };

        profile.addPaymentMethod(secondPaymentMethod);
        profile.removePaymentMethod("pm-1");

        expect(profile.paymentMethods).toHaveLength(1);
        expect(profile.paymentMethods[0].isDefault).toBe(true);
      });

      it("deve lançar erro se método não existir", () => {
        expect(() => profile.removePaymentMethod("pm-inexistente")).toThrow(
          "Método de pagamento não encontrado"
        );
      });
    });

    describe("addFavoriteService", () => {
      it("deve adicionar serviço aos favoritos", () => {
        profile.addFavoriteService("service-3");

        expect(profile.favoriteServices).toContain("service-3");
        expect(profile.favoriteServices).toHaveLength(3);
      });

      it("deve lançar erro se ID do serviço não for fornecido", () => {
        expect(() => profile.addFavoriteService("")).toThrow(
          "ID do serviço é obrigatório"
        );
      });

      it("deve lançar erro se serviço já estiver nos favoritos", () => {
        expect(() => profile.addFavoriteService("service-1")).toThrow(
          "Serviço já está nos favoritos"
        );
      });
    });

    describe("removeFavoriteService", () => {
      it("deve remover serviço dos favoritos", () => {
        profile.removeFavoriteService("service-1");

        expect(profile.favoriteServices).not.toContain("service-1");
        expect(profile.favoriteServices).toHaveLength(1);
      });

      it("deve lançar erro se serviço não estiver nos favoritos", () => {
        expect(() =>
          profile.removeFavoriteService("service-inexistente")
        ).toThrow("Serviço não está nos favoritos");
      });
    });

    describe("métodos de consulta", () => {
      it("deve retornar endereço padrão", () => {
        const defaultAddress = profile.getDefaultAddress();

        expect(defaultAddress).toBeDefined();
        expect(defaultAddress?.isDefault).toBe(true);
      });

      it("deve retornar método de pagamento padrão", () => {
        const defaultPaymentMethod = profile.getDefaultPaymentMethod();

        expect(defaultPaymentMethod).toBeDefined();
        expect(defaultPaymentMethod?.isDefault).toBe(true);
      });

      it("deve verificar se endereço existe", () => {
        expect(profile.hasAddress("addr-1")).toBe(true);
        expect(profile.hasAddress("addr-inexistente")).toBe(false);
      });

      it("deve verificar se método de pagamento existe", () => {
        expect(profile.hasPaymentMethod("pm-1")).toBe(true);
        expect(profile.hasPaymentMethod("pm-inexistente")).toBe(false);
      });

      it("deve verificar se serviço está nos favoritos", () => {
        expect(profile.isFavoriteService("service-1")).toBe(true);
        expect(profile.isFavoriteService("service-inexistente")).toBe(false);
      });
    });
  });

  describe("fromPersistence", () => {
    it("deve reconstruir perfil a partir de dados de persistência", () => {
      const persistenceData = {
        userId: "user-123",
        cpf: "11144477735",
        addresses: [validAddress],
        paymentMethods: [validPaymentMethod],
        favoriteServices: ["service-1"],
        preferences: {
          notifications: {
            email: true,
            sms: false,
            push: true,
          },
          marketing: false,
          language: "pt-BR",
          timezone: "America/Sao_Paulo",
        },
      };

      const profile = ClientProfile.fromPersistence(persistenceData);

      expect(profile.userId).toBe("user-123");
      expect(profile.cpf).toBe("11144477735");
      expect(profile.addresses).toHaveLength(1);
      expect(profile.paymentMethods).toHaveLength(1);
      expect(profile.favoriteServices).toHaveLength(1);
      expect(profile.preferences).toBeDefined();
    });
  });
});
