import { describe, it, expect } from "@jest/globals";
import {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  listUsersQuerySchema,
} from "../user.schema";

describe("User Schemas", () => {
  describe("createUserSchema", () => {
    it("deve validar dados corretos", () => {
      // Arrange
      const validData = {
        email: "teste@example.com",
        password: "SenhaForte123",
        name: "João Silva",
        phone: "+5511999999999",
        userType: "CLIENT",
      };

      // Act
      const result = createUserSchema.parse(validData);

      // Assert
      expect(result).toEqual(validData);
    });

    it("deve rejeitar email inválido", () => {
      // Arrange
      const invalidData = {
        email: "email-invalido",
        password: "SenhaForte123",
        name: "João Silva",
        userType: "CLIENT",
      };

      // Act & Assert
      expect(() => createUserSchema.parse(invalidData)).toThrow();
    });

    it("deve rejeitar senha fraca (sem letra maiúscula)", () => {
      // Arrange
      const invalidData = {
        email: "teste@example.com",
        password: "senhafraca123",
        name: "João Silva",
        userType: "CLIENT",
      };

      // Act & Assert
      expect(() => createUserSchema.parse(invalidData)).toThrow(
        "Senha deve conter pelo menos uma letra maiúscula"
      );
    });

    it("deve rejeitar senha fraca (sem letra minúscula)", () => {
      // Arrange
      const invalidData = {
        email: "teste@example.com",
        password: "SENHAFORTE123",
        name: "João Silva",
        userType: "CLIENT",
      };

      // Act & Assert
      expect(() => createUserSchema.parse(invalidData)).toThrow(
        "Senha deve conter pelo menos uma letra minúscula"
      );
    });

    it("deve rejeitar senha fraca (sem número)", () => {
      // Arrange
      const invalidData = {
        email: "teste@example.com",
        password: "SenhaForte",
        name: "João Silva",
        userType: "CLIENT",
      };

      // Act & Assert
      expect(() => createUserSchema.parse(invalidData)).toThrow(
        "Senha deve conter pelo menos um número"
      );
    });

    it("deve rejeitar senha muito curta", () => {
      // Arrange
      const invalidData = {
        email: "teste@example.com",
        password: "Senh1",
        name: "João Silva",
        userType: "CLIENT",
      };

      // Act & Assert
      expect(() => createUserSchema.parse(invalidData)).toThrow(
        "Senha deve ter no mínimo 8 caracteres"
      );
    });

    it("deve rejeitar nome muito curto", () => {
      // Arrange
      const invalidData = {
        email: "teste@example.com",
        password: "SenhaForte123",
        name: "Jo",
        userType: "CLIENT",
      };

      // Act & Assert
      expect(() => createUserSchema.parse(invalidData)).toThrow(
        "Nome deve ter no mínimo 3 caracteres"
      );
    });

    it("deve rejeitar userType inválido", () => {
      // Arrange
      const invalidData = {
        email: "teste@example.com",
        password: "SenhaForte123",
        name: "João Silva",
        userType: "INVALID_TYPE",
      };

      // Act & Assert
      expect(() => createUserSchema.parse(invalidData)).toThrow();
    });

    it("deve aceitar phone opcional", () => {
      // Arrange
      const validData = {
        email: "teste@example.com",
        password: "SenhaForte123",
        name: "João Silva",
        userType: "CLIENT",
      };

      // Act
      const result = createUserSchema.parse(validData);

      // Assert
      expect(result.phone).toBeUndefined();
    });
  });

  describe("updateUserSchema", () => {
    it("deve validar atualização com todos os campos", () => {
      // Arrange
      const validData = {
        email: "novo@example.com",
        name: "Novo Nome",
        phone: "+5511988888888",
      };

      // Act
      const result = updateUserSchema.parse(validData);

      // Assert
      expect(result).toEqual(validData);
    });

    it("deve validar atualização parcial", () => {
      // Arrange
      const validData = {
        name: "Apenas Nome Novo",
      };

      // Act
      const result = updateUserSchema.parse(validData);

      // Assert
      expect(result).toEqual(validData);
    });

    it("deve aceitar objeto vazio", () => {
      // Arrange
      const validData = {};

      // Act
      const result = updateUserSchema.parse(validData);

      // Assert
      expect(result).toEqual({});
    });

    it("deve rejeitar email inválido", () => {
      // Arrange
      const invalidData = {
        email: "email-invalido",
      };

      // Act & Assert
      expect(() => updateUserSchema.parse(invalidData)).toThrow();
    });
  });

  describe("userIdSchema", () => {
    it("deve validar ID válido (CUID)", () => {
      // Arrange
      const validId = {
        id: "clx1234567890abcdef",
      };

      // Act
      const result = userIdSchema.parse(validId);

      // Assert
      expect(result).toEqual(validId);
    });

    it("deve rejeitar ID vazio", () => {
      // Arrange
      const invalidId = {
        id: "",
      };

      // Act & Assert
      expect(() => userIdSchema.parse(invalidId)).toThrow("ID inválido");
    });
  });

  describe("listUsersQuerySchema", () => {
    it("deve validar query com todos os parâmetros", () => {
      // Arrange
      const validQuery = {
        page: "1",
        limit: "10",
        userType: "CLIENT",
        search: "Silva",
      };

      // Act
      const result = listUsersQuerySchema.parse(validQuery);

      // Assert
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.userType).toBe("CLIENT");
      expect(result.search).toBe("Silva");
    });

    it("deve usar valores padrão quando não fornecidos", () => {
      // Arrange
      const emptyQuery = {};

      // Act
      const result = listUsersQuerySchema.parse(emptyQuery);

      // Assert
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.userType).toBeUndefined();
      expect(result.search).toBeUndefined();
    });

    it("deve converter strings para números", () => {
      // Arrange
      const queryWithStrings = {
        page: "2",
        limit: "25",
      };

      // Act
      const result = listUsersQuerySchema.parse(queryWithStrings);

      // Assert
      expect(typeof result.page).toBe("number");
      expect(typeof result.limit).toBe("number");
      expect(result.page).toBe(2);
      expect(result.limit).toBe(25);
    });

    it("deve rejeitar limit maior que 100", () => {
      // Arrange
      const invalidQuery = {
        page: 1,
        limit: 150,
      };

      // Act & Assert
      expect(() => listUsersQuerySchema.parse(invalidQuery)).toThrow();
    });

    it("deve rejeitar page negativa", () => {
      // Arrange
      const invalidQuery = {
        page: -1,
        limit: 10,
      };

      // Act & Assert
      expect(() => listUsersQuerySchema.parse(invalidQuery)).toThrow();
    });
  });
});
