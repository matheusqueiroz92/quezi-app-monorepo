import { describe, it, expect } from "@jest/globals";
import { hashPassword, verifyPassword } from "../password";

/**
 * TDD - Testes para funções de hash de senha
 *
 * Escrever testes PRIMEIRO, depois implementar
 */
describe("Password Utilities", () => {
  describe("hashPassword", () => {
    it("deve gerar hash de senha", async () => {
      // Arrange
      const password = "SenhaForte123";

      // Act
      const hash = await hashPassword(password);

      // Assert
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
      expect(hash).toMatch(/^\$2[aby]\$/); // BCrypt pattern
    });

    it("deve gerar hashes diferentes para mesma senha", async () => {
      // Arrange
      const password = "SenhaForte123";

      // Act
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      // Assert
      expect(hash1).not.toBe(hash2); // Salt diferente
    });

    it("deve lançar erro se senha estiver vazia", async () => {
      // Arrange
      const password = "";

      // Act & Assert
      await expect(hashPassword(password)).rejects.toThrow();
    });
  });

  describe("verifyPassword", () => {
    it("deve verificar senha correta", async () => {
      // Arrange
      const password = "SenhaForte123";
      const hash = await hashPassword(password);

      // Act
      const isValid = await verifyPassword(password, hash);

      // Assert
      expect(isValid).toBe(true);
    });

    it("deve rejeitar senha incorreta", async () => {
      // Arrange
      const password = "SenhaForte123";
      const wrongPassword = "SenhaErrada456";
      const hash = await hashPassword(password);

      // Act
      const isValid = await verifyPassword(wrongPassword, hash);

      // Assert
      expect(isValid).toBe(false);
    });

    it("deve retornar false para hash inválido", async () => {
      // Arrange
      const password = "SenhaForte123";
      const invalidHash = "hash-invalido";

      // Act
      const isValid = await verifyPassword(password, invalidHash);

      // Assert
      expect(isValid).toBe(false);
    });
  });
});
