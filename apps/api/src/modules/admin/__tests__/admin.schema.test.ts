import { describe, it, expect } from "@jest/globals";
import {
  adminLoginSchema,
  createAdminSchema,
  updateAdminSchema,
  updateAdminPasswordSchema,
  listAdminsQuerySchema,
  suspendUserSchema,
  getUsersQuerySchema,
  approveProfessionalSchema,
  rejectProfessionalSchema,
} from "../admin.schema";

describe("Admin Schema Validation", () => {
  describe("adminLoginSchema", () => {
    it("deve validar login válido", () => {
      const input = {
        email: "admin@quezi.com",
        password: "Admin@2025",
      };

      const result = adminLoginSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar email inválido", () => {
      const input = {
        email: "invalid-email",
        password: "Admin@2025",
      };

      const result = adminLoginSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar senha muito curta", () => {
      const input = {
        email: "admin@quezi.com",
        password: "123",
      };

      const result = adminLoginSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("createAdminSchema", () => {
    it("deve validar criação de admin válida", () => {
      const input = {
        email: "newadmin@quezi.com",
        password: "Admin@2025",
        name: "Novo Admin",
        role: "MODERATOR",
      };

      const result = createAdminSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar senha sem letra maiúscula", () => {
      const input = {
        email: "admin@quezi.com",
        password: "admin@2025",
        name: "Admin",
        role: "MODERATOR",
      };

      const result = createAdminSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar senha sem número", () => {
      const input = {
        email: "admin@quezi.com",
        password: "Admin@Test",
        name: "Admin",
        role: "MODERATOR",
      };

      const result = createAdminSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar role inválida", () => {
      const input = {
        email: "admin@quezi.com",
        password: "Admin@2025",
        name: "Admin",
        role: "INVALID_ROLE",
      };

      const result = createAdminSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("updateAdminSchema", () => {
    it("deve validar atualização parcial", () => {
      const input = {
        name: "Nome Atualizado",
      };

      const result = updateAdminSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("deve validar atualização de role", () => {
      const input = {
        role: "ADMIN",
      };

      const result = updateAdminSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("deve validar objeto vazio", () => {
      const input = {};

      const result = updateAdminSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("updateAdminPasswordSchema", () => {
    it("deve validar atualização de senha válida", () => {
      const input = {
        currentPassword: "OldPass@123",
        newPassword: "NewPass@456",
      };

      const result = updateAdminPasswordSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar nova senha fraca", () => {
      const input = {
        currentPassword: "OldPass@123",
        newPassword: "weak",
      };

      const result = updateAdminPasswordSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("listAdminsQuerySchema", () => {
    it("deve usar valores padrão", () => {
      const input = {};

      const result = listAdminsQuerySchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });

    it("deve converter strings para números", () => {
      const input = {
        page: "2",
        limit: "20",
      };

      const result = listAdminsQuerySchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(20);
      }
    });

    it("deve validar role filter", () => {
      const input = {
        role: "SUPER_ADMIN",
      };

      const result = listAdminsQuerySchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("suspendUserSchema", () => {
    it("deve validar suspensão com motivo", () => {
      const input = {
        reason: "Violação dos termos de uso da plataforma",
        permanent: false,
      };

      const result = suspendUserSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar motivo muito curto", () => {
      const input = {
        reason: "Curto",
        permanent: false,
      };

      const result = suspendUserSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("deve validar suspensão permanente", () => {
      const input = {
        reason: "Violação grave dos termos de uso",
        permanent: true,
      };

      const result = suspendUserSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.permanent).toBe(true);
      }
    });
  });

  describe("getUsersQuerySchema", () => {
    it("deve validar query com filtros", () => {
      const input = {
        page: "1",
        limit: "20",
        userType: "PROFESSIONAL",
        search: "João",
        sortBy: "name",
        sortOrder: "asc",
      };

      const result = getUsersQuerySchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("deve usar valores padrão", () => {
      const input = {};

      const result = getUsersQuerySchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
        expect(result.data.sortBy).toBe("createdAt");
        expect(result.data.sortOrder).toBe("desc");
      }
    });
  });

  describe("approveProfessionalSchema", () => {
    it("deve validar aprovação com nível de verificação", () => {
      const input = {
        notes: "Documentos verificados",
        verificationLevel: "VERIFIED",
      };

      const result = approveProfessionalSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("deve usar valor padrão para verificationLevel", () => {
      const input = {
        notes: "Aprovado",
      };

      const result = approveProfessionalSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.verificationLevel).toBe("BASIC");
      }
    });
  });

  describe("rejectProfessionalSchema", () => {
    it("deve validar rejeição com motivo", () => {
      const input = {
        reason: "Documentos inválidos ou incompletos fornecidos",
      };

      const result = rejectProfessionalSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar motivo muito curto", () => {
      const input = {
        reason: "Curto",
      };

      const result = rejectProfessionalSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});
