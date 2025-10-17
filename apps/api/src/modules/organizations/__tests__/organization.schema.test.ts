import { describe, it, expect } from "@jest/globals";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  organizationIdSchema,
} from "../organization.schema";

/**
 * TDD - Testes para schemas de Organizations
 */
describe("Organization Schemas", () => {
  describe("createOrganizationSchema", () => {
    it("deve validar dados corretos de criação", () => {
      // Arrange
      const validData = {
        name: "Salão Beleza Total",
        slug: "salao-beleza-total",
        description: "Salão de beleza completo",
      };

      // Act
      const result = createOrganizationSchema.parse(validData);

      // Assert
      expect(result).toEqual(validData);
    });

    it("deve rejeitar nome muito curto", () => {
      // Arrange
      const invalidData = {
        name: "AB",
        slug: "ab",
      };

      // Act & Assert
      expect(() => createOrganizationSchema.parse(invalidData)).toThrow(
        "Nome deve ter no mínimo 3 caracteres"
      );
    });

    it("deve rejeitar slug com caracteres especiais", () => {
      // Arrange
      const invalidData = {
        name: "Salão ABC",
        slug: "salão@abc#123",
      };

      // Act & Assert
      expect(() => createOrganizationSchema.parse(invalidData)).toThrow();
    });

    it("deve aceitar description opcional", () => {
      // Arrange
      const validData = {
        name: "Salão XYZ",
        slug: "salao-xyz",
      };

      // Act
      const result = createOrganizationSchema.parse(validData);

      // Assert
      expect(result.description).toBeUndefined();
    });
  });

  describe("inviteMemberSchema", () => {
    it("deve validar convite com dados corretos", () => {
      // Arrange
      const validData = {
        organizationId: "123e4567-e89b-12d3-a456-426614174000",
        email: "novo@membro.com",
        role: "member",
      };

      // Act
      const result = inviteMemberSchema.parse(validData);

      // Assert
      expect(result).toEqual(validData);
    });

    it("deve aceitar roles válidas (owner, admin, member)", () => {
      // Arrange
      const roles = ["owner", "admin", "member"];

      // Act & Assert
      roles.forEach((role) => {
        const data = {
          organizationId: "123e4567-e89b-12d3-a456-426614174000",
          email: "teste@example.com",
          role,
        };
        expect(() => inviteMemberSchema.parse(data)).not.toThrow();
      });
    });

    it("deve rejeitar role inválida", () => {
      // Arrange
      const invalidData = {
        organizationId: "123e4567-e89b-12d3-a456-426614174000",
        email: "teste@example.com",
        role: "superadmin",
      };

      // Act & Assert
      expect(() => inviteMemberSchema.parse(invalidData)).toThrow();
    });

    it("deve rejeitar email inválido", () => {
      // Arrange
      const invalidData = {
        organizationId: "123e4567-e89b-12d3-a456-426614174000",
        email: "email-invalido",
        role: "member",
      };

      // Act & Assert
      expect(() => inviteMemberSchema.parse(invalidData)).toThrow();
    });
  });

  describe("updateMemberRoleSchema", () => {
    it("deve validar atualização de role", () => {
      // Arrange
      const validData = {
        organizationId: "123e4567-e89b-12d3-a456-426614174000",
        memberId: "987e6543-e21b-12d3-a456-426614174999",
        role: "admin",
      };

      // Act
      const result = updateMemberRoleSchema.parse(validData);

      // Assert
      expect(result).toEqual(validData);
    });
  });
});
