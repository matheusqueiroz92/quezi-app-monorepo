import { describe, it, expect } from "@jest/globals";
import {
  CreateReviewInputSchema,
  UpdateReviewInputSchema,
  GetReviewsQuerySchema,
  ReviewParamsSchema,
  AppointmentParamsSchema,
  GetProfessionalStatsQuerySchema,
} from "../reviews.schema";

describe("Reviews Schema", () => {
  describe("CreateReviewInputSchema", () => {
    it("deve validar review válido", () => {
      const validInput = {
        appointmentId: "clx1234567890abcdef",
        rating: 5,
        comment: "Excelente serviço!",
      };

      const result = CreateReviewInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("deve validar review sem comentário", () => {
      const validInput = {
        appointmentId: "clx1234567890abcdef",
        rating: 4,
      };

      const result = CreateReviewInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar rating menor que 1", () => {
      const invalidInput = {
        appointmentId: "clx1234567890abcdef",
        rating: 0,
      };

      const result = CreateReviewInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar rating maior que 5", () => {
      const invalidInput = {
        appointmentId: "clx1234567890abcdef",
        rating: 6,
      };

      const result = CreateReviewInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar rating decimal", () => {
      const invalidInput = {
        appointmentId: "clx1234567890abcdef",
        rating: 4.5,
      };

      const result = CreateReviewInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar comentário muito longo", () => {
      const invalidInput = {
        appointmentId: "clx1234567890abcdef",
        rating: 5,
        comment: "a".repeat(1001),
      };

      const result = CreateReviewInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("deve aceitar comentário com exatamente 1000 caracteres", () => {
      const validInput = {
        appointmentId: "clx1234567890abcdef",
        rating: 5,
        comment: "a".repeat(1000),
      };

      const result = CreateReviewInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("deve validar todos os ratings válidos (1-5)", () => {
      [1, 2, 3, 4, 5].forEach((rating) => {
        const input = {
          appointmentId: "clx1234567890abcdef",
          rating,
        };
        const result = CreateReviewInputSchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("UpdateReviewInputSchema", () => {
    it("deve validar atualização completa", () => {
      const validInput = {
        rating: 4,
        comment: "Comentário atualizado",
      };

      const result = UpdateReviewInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("deve permitir atualizar apenas rating", () => {
      const validInput = {
        rating: 3,
      };

      const result = UpdateReviewInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("deve permitir atualizar apenas comentário", () => {
      const validInput = {
        comment: "Novo comentário",
      };

      const result = UpdateReviewInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("deve permitir objeto vazio", () => {
      const validInput = {};

      const result = UpdateReviewInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar rating inválido", () => {
      const invalidInput = {
        rating: 10,
      };

      const result = UpdateReviewInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("GetReviewsQuerySchema", () => {
    it("deve validar query com valores padrão", () => {
      const validQuery = {};

      const result = GetReviewsQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.page).toBe("1");
        expect(result.data.limit).toBe("10");
      }
    });

    it("deve validar query com todos os filtros", () => {
      const validQuery = {
        page: "2",
        limit: "20",
        professionalId: "clx1234567890abcdef",
        reviewerId: "clx0987654321fedcba",
        minRating: "3",
        maxRating: "5",
      };

      const result = GetReviewsQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it("deve converter strings para números", () => {
      const validQuery = {
        page: "3",
        limit: "15",
        minRating: "4",
      };

      const result = GetReviewsQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(15);
        expect(result.data.minRating).toBe(4);
      }
    });

    it("deve rejeitar page menor que 1", () => {
      const invalidQuery = {
        page: "0",
      };

      const result = GetReviewsQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar limit maior que 100", () => {
      const invalidQuery = {
        limit: "101",
      };

      const result = GetReviewsQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar minRating inválido", () => {
      const invalidQuery = {
        minRating: "6",
      };

      const result = GetReviewsQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar maxRating inválido", () => {
      const invalidQuery = {
        maxRating: "0",
      };

      const result = GetReviewsQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });
  });

  describe("ReviewParamsSchema", () => {
    it("deve validar ID válido", () => {
      const validParams = {
        id: "clx1234567890abcdef",
      };

      const result = ReviewParamsSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar ID inválido", () => {
      const invalidParams = {
        id: "invalid-id",
      };

      const result = ReviewParamsSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });
  });

  describe("AppointmentParamsSchema", () => {
    it("deve validar appointmentId válido", () => {
      const validParams = {
        appointmentId: "clx1234567890abcdef",
      };

      const result = AppointmentParamsSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar appointmentId inválido", () => {
      const invalidParams = {
        appointmentId: "not-a-cuid",
      };

      const result = AppointmentParamsSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });
  });

  describe("GetProfessionalStatsQuerySchema", () => {
    it("deve validar professionalId válido", () => {
      const validQuery = {
        professionalId: "clx1234567890abcdef",
      };

      const result = GetProfessionalStatsQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar professionalId inválido", () => {
      const invalidQuery = {
        professionalId: "invalid",
      };

      const result = GetProfessionalStatsQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });
  });
});

