import { describe, it, expect } from "vitest";
import {
  CreateAppointmentInputSchema,
  UpdateAppointmentInputSchema,
  GetAppointmentsQuerySchema,
  AppointmentParamsSchema,
  UpdateAppointmentStatusInputSchema,
  CheckAvailabilityQuerySchema,
  GetAppointmentStatsQuerySchema,
  AppointmentStatusEnum,
  ServiceModeEnum,
} from "../appointments.schema";

describe("Appointments Schema", () => {
  describe("CreateAppointmentInputSchema", () => {
    it("should validate valid appointment creation input", () => {
      const validInput = {
        clientId: "clx1234567890abcdef",
        professionalId: "clx0987654321fedcba",
        serviceId: "clx1122334455667788",
        scheduledDate: "2024-02-15T14:30:00Z",
        locationType: "AT_LOCATION",
        clientAddress: "Rua das Flores, 123",
        clientNotes: "Primeira consulta",
      };

      const result = CreateAppointmentInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should reject invalid location type", () => {
      const invalidInput = {
        clientId: "clx1234567890abcdef",
        professionalId: "clx0987654321fedcba",
        serviceId: "clx1122334455667788",
        scheduledDate: "2024-02-15T14:30:00Z",
        locationType: "INVALID_TYPE",
      };

      const result = CreateAppointmentInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject invalid date format", () => {
      const invalidInput = {
        clientId: "clx1234567890abcdef",
        professionalId: "clx0987654321fedcba",
        serviceId: "clx1122334455667788",
        scheduledDate: "2024-02-15 14:30:00",
        locationType: "AT_LOCATION",
      };

      const result = CreateAppointmentInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject client notes that are too long", () => {
      const invalidInput = {
        clientId: "clx1234567890abcdef",
        professionalId: "clx0987654321fedcba",
        serviceId: "clx1122334455667788",
        scheduledDate: "2024-02-15T14:30:00Z",
        locationType: "AT_LOCATION",
        clientNotes: "a".repeat(501), // 501 characters
      };

      const result = CreateAppointmentInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateAppointmentInputSchema", () => {
    it("should validate valid update input", () => {
      const validInput = {
        scheduledDate: "2024-02-16T15:30:00Z",
        locationType: "AT_DOMICILE",
        clientAddress: "Nova Rua, 456",
        clientNotes: "Observação atualizada",
      };

      const result = UpdateAppointmentInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should allow partial updates", () => {
      const partialInput = {
        clientNotes: "Apenas observações",
      };

      const result = UpdateAppointmentInputSchema.safeParse(partialInput);
      expect(result.success).toBe(true);
    });
  });

  describe("GetAppointmentsQuerySchema", () => {
    it("should validate valid query parameters", () => {
      const validQuery = {
        page: "1",
        limit: "10",
        status: "PENDING",
        clientId: "clx1234567890abcdef",
        professionalId: "clx0987654321fedcba",
        serviceId: "clx1122334455667788",
        dateFrom: "2024-01-01T00:00:00Z",
        dateTo: "2024-12-31T23:59:59Z",
      };

      const result = GetAppointmentsQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it("should use default values for page and limit", () => {
      const queryWithoutDefaults = {
        status: "ACCEPTED",
      };

      const result = GetAppointmentsQuerySchema.safeParse(queryWithoutDefaults);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });

    it("should reject invalid page number", () => {
      const invalidQuery = {
        page: "0",
        limit: "10",
      };

      const result = GetAppointmentsQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it("should reject invalid limit", () => {
      const invalidQuery = {
        page: "1",
        limit: "101",
      };

      const result = GetAppointmentsQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });
  });

  describe("AppointmentParamsSchema", () => {
    it("should validate valid appointment ID", () => {
      const validParams = {
        id: "clx1234567890abcdef",
      };

      const result = AppointmentParamsSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it("should reject invalid appointment ID", () => {
      const invalidParams = {
        id: "invalid-id",
      };

      const result = AppointmentParamsSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateAppointmentStatusInputSchema", () => {
    it("should validate valid status update", () => {
      const validInput = {
        status: "ACCEPTED",
      };

      const result = UpdateAppointmentStatusInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const invalidInput = {
        status: "INVALID_STATUS",
      };

      const result = UpdateAppointmentStatusInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("CheckAvailabilityQuerySchema", () => {
    it("should validate valid availability check", () => {
      const validQuery = {
        professionalId: "clx0987654321fedcba",
        serviceId: "clx1122334455667788",
        date: "2024-02-15",
      };

      const result = CheckAvailabilityQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it("should reject invalid date format", () => {
      const invalidQuery = {
        professionalId: "clx0987654321fedcba",
        serviceId: "clx1122334455667788",
        date: "2024/02/15",
      };

      const result = CheckAvailabilityQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });
  });

  describe("GetAppointmentStatsQuerySchema", () => {
    it("should validate valid stats query", () => {
      const validQuery = {
        professionalId: "clx0987654321fedcba",
        dateFrom: "2024-01-01T00:00:00Z",
        dateTo: "2024-12-31T23:59:59Z",
      };

      const result = GetAppointmentStatsQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it("should allow empty query", () => {
      const emptyQuery = {};

      const result = GetAppointmentStatsQuerySchema.safeParse(emptyQuery);
      expect(result.success).toBe(true);
    });
  });

  describe("Enums", () => {
    it("should validate AppointmentStatusEnum", () => {
      expect(AppointmentStatusEnum.safeParse("PENDING").success).toBe(true);
      expect(AppointmentStatusEnum.safeParse("ACCEPTED").success).toBe(true);
      expect(AppointmentStatusEnum.safeParse("REJECTED").success).toBe(true);
      expect(AppointmentStatusEnum.safeParse("COMPLETED").success).toBe(true);
      expect(AppointmentStatusEnum.safeParse("INVALID").success).toBe(false);
    });

    it("should validate ServiceModeEnum", () => {
      expect(ServiceModeEnum.safeParse("AT_LOCATION").success).toBe(true);
      expect(ServiceModeEnum.safeParse("AT_DOMICILE").success).toBe(true);
      expect(ServiceModeEnum.safeParse("BOTH").success).toBe(true);
      expect(ServiceModeEnum.safeParse("INVALID").success).toBe(false);
    });
  });
});
