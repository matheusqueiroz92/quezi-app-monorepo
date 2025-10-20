import { describe, it, expect } from "@jest/globals";
import {
  CreateProfileInputSchema,
  UpdateProfileInputSchema,
  GetProfilesQuerySchema,
  SearchProfilesQuerySchema,
  ProfileParamsSchema,
  TimeSlotSchema,
  DayScheduleSchema,
  WorkingHoursSchema,
  UpdatePortfolioSchema,
  UpdateWorkingHoursSchema,
  ToggleActiveSchema,
  ServiceModeEnum,
} from "../profiles.schema";

describe("Professional Profiles Schema", () => {
  describe("ServiceModeEnum", () => {
    it("deve validar modos de serviço válidos", () => {
      expect(ServiceModeEnum.safeParse("AT_LOCATION").success).toBe(true);
      expect(ServiceModeEnum.safeParse("AT_DOMICILE").success).toBe(true);
      expect(ServiceModeEnum.safeParse("BOTH").success).toBe(true);
    });

    it("deve rejeitar modo de serviço inválido", () => {
      expect(ServiceModeEnum.safeParse("INVALID").success).toBe(false);
    });
  });

  describe("TimeSlotSchema", () => {
    it("deve validar time slot válido", () => {
      const validSlot = {
        start: "09:00",
        end: "18:00",
      };

      const result = TimeSlotSchema.safeParse(validSlot);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar horário com formato inválido", () => {
      const invalidSlot = {
        start: "9:00",
        end: "18:00",
      };

      const result = TimeSlotSchema.safeParse(invalidSlot);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar horário fora do range 00:00-23:59", () => {
      const invalidSlot = {
        start: "25:00",
        end: "18:00",
      };

      const result = TimeSlotSchema.safeParse(invalidSlot);
      expect(result.success).toBe(false);
    });
  });

  describe("DayScheduleSchema", () => {
    it("deve validar dia aberto com slots", () => {
      const validDay = {
        isOpen: true,
        slots: [
          { start: "09:00", end: "12:00" },
          { start: "14:00", end: "18:00" },
        ],
      };

      const result = DayScheduleSchema.safeParse(validDay);
      expect(result.success).toBe(true);
    });

    it("deve validar dia fechado sem slots", () => {
      const validDay = {
        isOpen: false,
      };

      const result = DayScheduleSchema.safeParse(validDay);
      expect(result.success).toBe(true);
    });
  });

  describe("WorkingHoursSchema", () => {
    it("deve validar horários completos da semana", () => {
      const validHours = {
        MONDAY: {
          isOpen: true,
          slots: [{ start: "09:00", end: "18:00" }],
        },
        TUESDAY: {
          isOpen: true,
          slots: [{ start: "09:00", end: "18:00" }],
        },
        SUNDAY: {
          isOpen: false,
        },
      };

      const result = WorkingHoursSchema.safeParse(validHours);
      expect(result.success).toBe(true);
    });

    it("deve aceitar horários vazios", () => {
      const result = WorkingHoursSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe("CreateProfileInputSchema", () => {
    it("deve validar perfil válido completo", () => {
      const validProfile = {
        userId: "clx1234567890abcdef",
        bio: "Profissional experiente",
        city: "São Paulo",
        address: "Rua Exemplo, 123",
        serviceMode: "BOTH",
        photoUrl: "https://example.com/photo.jpg",
        portfolioImages: ["https://example.com/img1.jpg"],
        workingHours: {
          MONDAY: { isOpen: true, slots: [{ start: "09:00", end: "18:00" }] },
        },
        yearsOfExperience: 5,
        specialties: ["Corte", "Barba"],
        certifications: ["Certificado A"],
        languages: ["Português", "Inglês"],
      };

      const result = CreateProfileInputSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it("deve validar perfil mínimo obrigatório", () => {
      const minimalProfile = {
        userId: "clx1234567890abcdef",
        city: "Rio de Janeiro",
        serviceMode: "AT_LOCATION",
      };

      const result = CreateProfileInputSchema.safeParse(minimalProfile);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar userId inválido", () => {
      const invalidProfile = {
        userId: "invalid-id",
        city: "São Paulo",
        serviceMode: "BOTH",
      };

      const result = CreateProfileInputSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar bio muito longa", () => {
      const invalidProfile = {
        userId: "clx1234567890abcdef",
        bio: "a".repeat(1001),
        city: "São Paulo",
        serviceMode: "BOTH",
      };

      const result = CreateProfileInputSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar cidade muito curta", () => {
      const invalidProfile = {
        userId: "clx1234567890abcdef",
        city: "S",
        serviceMode: "BOTH",
      };

      const result = CreateProfileInputSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar photoUrl inválida", () => {
      const invalidProfile = {
        userId: "clx1234567890abcdef",
        city: "São Paulo",
        serviceMode: "BOTH",
        photoUrl: "not-a-url",
      };

      const result = CreateProfileInputSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar mais de 20 imagens no portfólio", () => {
      const invalidProfile = {
        userId: "clx1234567890abcdef",
        city: "São Paulo",
        serviceMode: "BOTH",
        portfolioImages: Array(21).fill("https://example.com/img.jpg"),
      };

      const result = CreateProfileInputSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar anos de experiência negativos", () => {
      const invalidProfile = {
        userId: "clx1234567890abcdef",
        city: "São Paulo",
        serviceMode: "BOTH",
        yearsOfExperience: -1,
      };

      const result = CreateProfileInputSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar anos de experiência muito altos", () => {
      const invalidProfile = {
        userId: "clx1234567890abcdef",
        city: "São Paulo",
        serviceMode: "BOTH",
        yearsOfExperience: 71,
      };

      const result = CreateProfileInputSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar mais de 20 especialidades", () => {
      const invalidProfile = {
        userId: "clx1234567890abcdef",
        city: "São Paulo",
        serviceMode: "BOTH",
        specialties: Array(21).fill("Especialidade"),
      };

      const result = CreateProfileInputSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateProfileInputSchema", () => {
    it("deve validar atualização completa", () => {
      const validUpdate = {
        bio: "Nova bio",
        city: "Belo Horizonte",
        serviceMode: "AT_DOMICILE",
        yearsOfExperience: 10,
        isActive: false,
      };

      const result = UpdateProfileInputSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it("deve validar atualização parcial", () => {
      const validUpdate = {
        bio: "Apenas bio atualizada",
      };

      const result = UpdateProfileInputSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it("deve aceitar objeto vazio", () => {
      const result = UpdateProfileInputSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("deve rejeitar valores inválidos", () => {
      const invalidUpdate = {
        city: "S",
      };

      const result = UpdateProfileInputSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });

  describe("GetProfilesQuerySchema", () => {
    it("deve validar query com valores padrão", () => {
      const result = GetProfilesQuerySchema.safeParse({});
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.page).toBe("1");
        expect(result.data.limit).toBe("10");
        expect(result.data.sortBy).toBe("rating");
        expect(result.data.sortOrder).toBe("desc");
      }
    });

    it("deve validar query com todos os filtros", () => {
      const validQuery = {
        page: "2",
        limit: "20",
        city: "São Paulo",
        serviceMode: "BOTH",
        minRating: "4.5",
        specialty: "Corte",
        isActive: "true",
        isVerified: "true",
        sortBy: "experience",
        sortOrder: "asc",
      };

      const result = GetProfilesQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it("deve converter strings para números", () => {
      const validQuery = {
        page: "3",
        limit: "15",
        minRating: "4.0",
      };

      const result = GetProfilesQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(typeof result.data.page).toBe("number");
        expect(typeof result.data.limit).toBe("number");
        expect(typeof result.data.minRating).toBe("number");
      }
    });

    it("deve converter isActive para boolean", () => {
      const validQuery = {
        isActive: "true",
      };

      const result = GetProfilesQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.isActive).toBe(true);
      }
    });

    it("deve rejeitar sortBy inválido", () => {
      const invalidQuery = {
        sortBy: "invalid",
      };

      const result = GetProfilesQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar minRating fora do range", () => {
      const invalidQuery = {
        minRating: "6",
      };

      const result = GetProfilesQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });
  });

  describe("SearchProfilesQuerySchema", () => {
    it("deve validar busca válida", () => {
      const validSearch = {
        query: "barbeiro",
        city: "São Paulo",
        serviceMode: "BOTH",
      };

      const result = SearchProfilesQuerySchema.safeParse(validSearch);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar query muito curta", () => {
      const invalidSearch = {
        query: "a",
      };

      const result = SearchProfilesQuerySchema.safeParse(invalidSearch);
      expect(result.success).toBe(false);
    });

    it("deve validar busca com paginação", () => {
      const validSearch = {
        query: "cabeleireiro",
        page: "2",
        limit: "20",
      };

      const result = SearchProfilesQuerySchema.safeParse(validSearch);
      expect(result.success).toBe(true);
    });
  });

  describe("ProfileParamsSchema", () => {
    it("deve validar userId válido", () => {
      const validParams = {
        userId: "clx1234567890abcdef",
      };

      const result = ProfileParamsSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar userId inválido", () => {
      const invalidParams = {
        userId: "invalid-id",
      };

      const result = ProfileParamsSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdatePortfolioSchema", () => {
    it("deve validar portfolio com imagens válidas", () => {
      const validPortfolio = {
        portfolioImages: [
          "https://example.com/img1.jpg",
          "https://example.com/img2.jpg",
        ],
      };

      const result = UpdatePortfolioSchema.safeParse(validPortfolio);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar portfolio vazio", () => {
      const invalidPortfolio = {
        portfolioImages: [],
      };

      const result = UpdatePortfolioSchema.safeParse(invalidPortfolio);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar mais de 20 imagens", () => {
      const invalidPortfolio = {
        portfolioImages: Array(21).fill("https://example.com/img.jpg"),
      };

      const result = UpdatePortfolioSchema.safeParse(invalidPortfolio);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar URLs inválidas", () => {
      const invalidPortfolio = {
        portfolioImages: ["not-a-url"],
      };

      const result = UpdatePortfolioSchema.safeParse(invalidPortfolio);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateWorkingHoursSchema", () => {
    it("deve validar horários de trabalho válidos", () => {
      const validHours = {
        workingHours: {
          MONDAY: { isOpen: true, slots: [{ start: "09:00", end: "18:00" }] },
          TUESDAY: { isOpen: true, slots: [{ start: "09:00", end: "18:00" }] },
        },
      };

      const result = UpdateWorkingHoursSchema.safeParse(validHours);
      expect(result.success).toBe(true);
    });
  });

  describe("ToggleActiveSchema", () => {
    it("deve validar isActive true", () => {
      const validToggle = { isActive: true };

      const result = ToggleActiveSchema.safeParse(validToggle);
      expect(result.success).toBe(true);
    });

    it("deve validar isActive false", () => {
      const validToggle = { isActive: false };

      const result = ToggleActiveSchema.safeParse(validToggle);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar valor não-boolean", () => {
      const invalidToggle = { isActive: "true" };

      const result = ToggleActiveSchema.safeParse(invalidToggle);
      expect(result.success).toBe(false);
    });
  });
});

