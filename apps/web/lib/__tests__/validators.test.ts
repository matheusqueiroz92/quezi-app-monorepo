/**
 * Testes para validators.ts
 * Testa todas as validações de formulário, especialmente as validações de senha
 */

import { z } from "zod";
import {
  passwordSchema,
  registerSchema,
  resetPasswordSchema,
  emailSchema,
  nameSchema,
  phoneSchema,
} from "../validators";

describe("Validators", () => {
  describe("passwordSchema", () => {
    it("deve aceitar senha válida com todos os critérios", () => {
      const validPassword = "Senha@123";
      expect(() => passwordSchema.parse(validPassword)).not.toThrow();
    });

    it("deve rejeitar senha muito curta", () => {
      const shortPassword = "Sen@1";
      expect(() => passwordSchema.parse(shortPassword)).toThrow(
        "Senha deve ter no mínimo 8 caracteres"
      );
    });

    it("deve rejeitar senha sem letra maiúscula", () => {
      const noUpperCase = "senha@123";
      expect(() => passwordSchema.parse(noUpperCase)).toThrow(
        "Senha deve conter pelo menos uma letra maiúscula"
      );
    });

    it("deve rejeitar senha sem letra minúscula", () => {
      const noLowerCase = "SENHA@123";
      expect(() => passwordSchema.parse(noLowerCase)).toThrow(
        "Senha deve conter pelo menos uma letra minúscula"
      );
    });

    it("deve rejeitar senha sem número", () => {
      const noNumber = "Senha@abc";
      expect(() => passwordSchema.parse(noNumber)).toThrow(
        "Senha deve conter pelo menos um número"
      );
    });

    it("deve rejeitar senha sem caractere especial", () => {
      const noSpecialChar = "Senha123";
      expect(() => passwordSchema.parse(noSpecialChar)).toThrow(
        "Senha deve conter pelo menos um caractere especial"
      );
    });

    it("deve aceitar diferentes tipos de caracteres especiais", () => {
      const specialChars = [
        "Senha@123",
        "Senha#123",
        "Senha$123",
        "Senha%123",
        "Senha^123",
        "Senha&123",
        "Senha*123",
        "Senha(123",
        "Senha)123",
        "Senha-123",
        "Senha_123",
        "Senha+123",
        "Senha=123",
        "Senha[123",
        "Senha]123",
        "Senha{123",
        "Senha}123",
        "Senha:123",
        "Senha;123",
        "Senha'123",
        'Senha"123',
        "Senha\\123",
        "Senha|123",
        "Senha,123",
        "Senha.123",
        "Senha<123",
        "Senha>123",
        "Senha/123",
        "Senha?123",
      ];

      specialChars.forEach((password) => {
        expect(() => passwordSchema.parse(password)).not.toThrow();
      });
    });

    it("deve rejeitar string vazia", () => {
      expect(() => passwordSchema.parse("")).toThrow(
        "Senha deve ter no mínimo 8 caracteres"
      );
    });

    it("deve rejeitar undefined", () => {
      expect(() => passwordSchema.parse(undefined as any)).toThrow();
    });
  });

  describe("registerSchema", () => {
    const validRegisterData = {
      name: "Maria Silva",
      email: "maria@teste.com",
      password: "Senha@123",
      confirmPassword: "Senha@123",
      userType: "CLIENT" as const,
    };

    it("deve aceitar dados válidos de registro", () => {
      expect(() => registerSchema.parse(validRegisterData)).not.toThrow();
    });

    it("deve rejeitar quando senhas não coincidem", () => {
      const invalidData = {
        ...validRegisterData,
        confirmPassword: "Senha@456",
      };
      expect(() => registerSchema.parse(invalidData)).toThrow(
        "As senhas não coincidem"
      );
    });

    it("deve rejeitar nome inválido", () => {
      const invalidData = {
        ...validRegisterData,
        name: "Ma",
      };
      expect(() => registerSchema.parse(invalidData)).toThrow(
        "Nome deve ter no mínimo 3 caracteres"
      );
    });

    it("deve rejeitar email inválido", () => {
      const invalidData = {
        ...validRegisterData,
        email: "email-invalido",
      };
      expect(() => registerSchema.parse(invalidData)).toThrow("Email inválido");
    });

    it("deve rejeitar userType inválido", () => {
      const invalidData = {
        ...validRegisterData,
        userType: "INVALID" as any,
      };
      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it("deve aceitar telefone opcional", () => {
      const dataWithPhone = {
        ...validRegisterData,
        phone: "(11) 99999-9999",
      };
      expect(() => registerSchema.parse(dataWithPhone)).not.toThrow();
    });

    it("deve aceitar sem telefone", () => {
      const dataWithoutPhone = {
        ...validRegisterData,
        phone: undefined,
      };
      expect(() => registerSchema.parse(dataWithoutPhone)).not.toThrow();
    });
  });

  describe("resetPasswordSchema", () => {
    const validResetData = {
      password: "NovaSenha@123",
      confirmPassword: "NovaSenha@123",
    };

    it("deve aceitar dados válidos de reset", () => {
      expect(() => resetPasswordSchema.parse(validResetData)).not.toThrow();
    });

    it("deve rejeitar quando senhas não coincidem", () => {
      const invalidData = {
        ...validResetData,
        confirmPassword: "OutraSenha@123",
      };
      expect(() => resetPasswordSchema.parse(invalidData)).toThrow(
        "As senhas não coincidem"
      );
    });
  });

  describe("emailSchema", () => {
    it("deve aceitar email válido", () => {
      expect(() => emailSchema.parse("teste@exemplo.com")).not.toThrow();
    });

    it("deve rejeitar email inválido", () => {
      expect(() => emailSchema.parse("email-invalido")).toThrow(
        "Email inválido"
      );
    });

    it("deve converter para lowercase", () => {
      const result = emailSchema.parse("TESTE@EXEMPLO.COM");
      expect(result).toBe("teste@exemplo.com");
    });
  });

  describe("nameSchema", () => {
    it("deve aceitar nome válido", () => {
      expect(() => nameSchema.parse("Maria Silva")).not.toThrow();
    });

    it("deve aceitar nome com acentos", () => {
      expect(() => nameSchema.parse("José da Silva")).not.toThrow();
    });

    it("deve rejeitar nome muito curto", () => {
      expect(() => nameSchema.parse("Ma")).toThrow(
        "Nome deve ter no mínimo 3 caracteres"
      );
    });

    it("deve rejeitar nome com números", () => {
      expect(() => nameSchema.parse("Maria123")).toThrow(
        "Nome deve conter apenas letras"
      );
    });
  });

  describe("phoneSchema", () => {
    it("deve aceitar telefone válido", () => {
      expect(() => phoneSchema.parse("(11) 99999-9999")).not.toThrow();
    });

    it("deve aceitar telefone fixo", () => {
      expect(() => phoneSchema.parse("(11) 3333-4444")).not.toThrow();
    });

    it("deve rejeitar telefone inválido", () => {
      expect(() => phoneSchema.parse("11999999999")).toThrow(
        "Telefone inválido. Use o formato (99) 99999-9999"
      );
    });
  });
});
