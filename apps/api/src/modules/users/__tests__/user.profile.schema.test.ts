import { describe, it, expect } from "@jest/globals";
import {
  updateProfileSchema,
  notificationPrefsSchema,
  updateNotificationPrefsSchema,
} from "../user.schema";

describe("User Profile Schemas", () => {
  describe("updateProfileSchema", () => {
    it("deve validar perfil completo", () => {
      const input = {
        photoUrl: "https://example.com/photo.jpg",
        bio: "Minha bio atualizada",
        defaultAddress: "Rua Exemplo, 123",
        city: "São Paulo",
      };

      const result = updateProfileSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("deve validar perfil parcial", () => {
      const input = {
        city: "Rio de Janeiro",
      };

      const result = updateProfileSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar photoUrl inválida", () => {
      const input = {
        photoUrl: "not-a-url",
      };

      const result = updateProfileSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar bio muito longa", () => {
      const input = {
        bio: "a".repeat(501),
      };

      const result = updateProfileSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar cidade muito curta", () => {
      const input = {
        city: "a",
      };

      const result = updateProfileSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("notificationPrefsSchema", () => {
    it("deve validar preferências completas", () => {
      const input = {
        email: true,
        sms: false,
        push: true,
        appointmentReminder: true,
        appointmentConfirmation: true,
        reviewReminder: false,
        marketing: false,
      };

      const result = notificationPrefsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("deve usar valores padrão", () => {
      const input = {};

      const result = notificationPrefsSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe(true);
        expect(result.data.sms).toBe(false);
        expect(result.data.push).toBe(true);
        expect(result.data.marketing).toBe(false);
      }
    });
  });

  describe("updateNotificationPrefsSchema", () => {
    it("deve validar atualização de preferências", () => {
      const input = {
        notificationPrefs: {
          email: false,
          sms: true,
          push: false,
          appointmentReminder: false,
          appointmentConfirmation: true,
          reviewReminder: true,
          marketing: true,
        },
      };

      const result = updateNotificationPrefsSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar sem notificationPrefs", () => {
      const input = {};

      const result = updateNotificationPrefsSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});
