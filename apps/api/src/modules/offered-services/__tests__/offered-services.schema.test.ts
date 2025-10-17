import { describe, expect, test } from "@jest/globals";
import { ServicePriceType } from "@prisma/client";
import {
  createServiceSchema,
  updateServiceSchema,
  getServicesQuerySchema,
  serviceParamsSchema,
  createCategorySchema,
  updateCategorySchema,
  categoryParamsSchema,
} from "../services.schema";

describe("Services Schema Validation", () => {
  describe("createServiceSchema", () => {
    test("deve validar um serviço válido", () => {
      const validService = {
        name: "Corte de Cabelo",
        description: "Corte masculino tradicional",
        price: 50.0,
        priceType: ServicePriceType.FIXED,
        durationMinutes: 30,
        categoryId: "clxxx1234567890",
      };

      const result = createServiceSchema.safeParse(validService);
      expect(result.success).toBe(true);
    });

    test("deve rejeitar serviço sem nome", () => {
      const invalidService = {
        description: "Descrição",
        price: 50.0,
        priceType: ServicePriceType.FIXED,
        durationMinutes: 30,
        categoryId: "clxxx1234567890",
      };

      const result = createServiceSchema.safeParse(invalidService);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
        expect(result.error.issues[0].path).toContain("name");
      }
    });

    test("deve rejeitar nome muito longo", () => {
      const invalidService = {
        name: "A".repeat(101),
        price: 50.0,
        priceType: ServicePriceType.FIXED,
        durationMinutes: 30,
        categoryId: "clxxx1234567890",
      };

      const result = createServiceSchema.safeParse(invalidService);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "no máximo 100 caracteres"
        );
      }
    });

    test("deve rejeitar preço negativo", () => {
      const invalidService = {
        name: "Corte",
        price: -10.0,
        priceType: ServicePriceType.FIXED,
        durationMinutes: 30,
        categoryId: "clxxx1234567890",
      };

      const result = createServiceSchema.safeParse(invalidService);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("positivo");
      }
    });

    test("deve rejeitar preço muito alto", () => {
      const invalidService = {
        name: "Corte",
        price: 9999999.99,
        priceType: ServicePriceType.FIXED,
        durationMinutes: 30,
        categoryId: "clxxx1234567890",
      };

      const result = createServiceSchema.safeParse(invalidService);
      expect(result.success).toBe(false);
    });

    test("deve rejeitar tipo de preço inválido", () => {
      const invalidService = {
        name: "Corte",
        price: 50.0,
        priceType: "INVALID" as any,
        durationMinutes: 30,
        categoryId: "clxxx1234567890",
      };

      const result = createServiceSchema.safeParse(invalidService);
      expect(result.success).toBe(false);
    });

    test("deve rejeitar duração menor que 15 minutos", () => {
      const invalidService = {
        name: "Corte",
        price: 50.0,
        priceType: ServicePriceType.FIXED,
        durationMinutes: 10,
        categoryId: "clxxx1234567890",
      };

      const result = createServiceSchema.safeParse(invalidService);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("15 minutos");
      }
    });

    test("deve rejeitar duração maior que 8 horas", () => {
      const invalidService = {
        name: "Corte",
        price: 50.0,
        priceType: ServicePriceType.FIXED,
        durationMinutes: 500,
        categoryId: "clxxx1234567890",
      };

      const result = createServiceSchema.safeParse(invalidService);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("8 horas");
      }
    });

    test("deve aceitar descrição opcional", () => {
      const validService = {
        name: "Corte",
        price: 50.0,
        priceType: ServicePriceType.FIXED,
        durationMinutes: 30,
        categoryId: "clxxx1234567890",
      };

      const result = createServiceSchema.safeParse(validService);
      expect(result.success).toBe(true);
    });

    test("deve rejeitar descrição muito longa", () => {
      const invalidService = {
        name: "Corte",
        description: "A".repeat(501),
        price: 50.0,
        priceType: ServicePriceType.FIXED,
        durationMinutes: 30,
        categoryId: "clxxx1234567890",
      };

      const result = createServiceSchema.safeParse(invalidService);
      expect(result.success).toBe(false);
    });
  });

  describe("updateServiceSchema", () => {
    test("deve validar atualização parcial", () => {
      const partialUpdate = {
        name: "Novo Nome",
      };

      const result = updateServiceSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    test("deve validar atualização de múltiplos campos", () => {
      const partialUpdate = {
        name: "Novo Nome",
        price: 75.0,
        durationMinutes: 45,
      };

      const result = updateServiceSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    test("deve validar atualização vazia", () => {
      const emptyUpdate = {};

      const result = updateServiceSchema.safeParse(emptyUpdate);
      expect(result.success).toBe(true);
    });
  });

  describe("getServicesQuerySchema", () => {
    test("deve validar query com valores padrão", () => {
      const query = {};

      const result = getServicesQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
        expect(result.data.sortBy).toBe("createdAt");
        expect(result.data.sortOrder).toBe("desc");
      }
    });

    test("deve validar query com todos os filtros", () => {
      const query = {
        categoryId: "clxxx1234567890",
        professionalId: "clxxx0987654321",
        priceType: ServicePriceType.FIXED,
        minPrice: "10",
        maxPrice: "100",
        search: "corte",
        page: "2",
        limit: "20",
        sortBy: "price",
        sortOrder: "asc",
      };

      const result = getServicesQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(20);
        expect(result.data.minPrice).toBe(10);
        expect(result.data.maxPrice).toBe(100);
      }
    });

    test("deve rejeitar página menor que 1", () => {
      const query = { page: "0" };

      const result = getServicesQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    test("deve rejeitar limit maior que 100", () => {
      const query = { limit: "101" };

      const result = getServicesQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    test("deve rejeitar sortBy inválido", () => {
      const query = { sortBy: "invalid" };

      const result = getServicesQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    test("deve rejeitar sortOrder inválido", () => {
      const query = { sortOrder: "invalid" };

      const result = getServicesQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });
  });

  describe("serviceParamsSchema", () => {
    test("deve validar ID válido", () => {
      const params = { id: "clxxx1234567890" };

      const result = serviceParamsSchema.safeParse(params);
      expect(result.success).toBe(true);
    });

    test("deve rejeitar ID vazio", () => {
      const params = { id: "" };

      const result = serviceParamsSchema.safeParse(params);
      expect(result.success).toBe(false);
    });
  });

  describe("createCategorySchema", () => {
    test("deve validar categoria válida", () => {
      const validCategory = {
        name: "Cabelo",
        slug: "cabelo",
      };

      const result = createCategorySchema.safeParse(validCategory);
      expect(result.success).toBe(true);
    });

    test("deve rejeitar categoria sem nome", () => {
      const invalidCategory = {
        slug: "cabelo",
      };

      const result = createCategorySchema.safeParse(invalidCategory);
      expect(result.success).toBe(false);
    });

    test("deve rejeitar slug com caracteres inválidos", () => {
      const invalidCategory = {
        name: "Cabelo",
        slug: "Cabelo & Barba",
      };

      const result = createCategorySchema.safeParse(invalidCategory);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("letras minúsculas");
      }
    });

    test("deve aceitar slug com hífen", () => {
      const validCategory = {
        name: "Cabelo e Barba",
        slug: "cabelo-e-barba",
      };

      const result = createCategorySchema.safeParse(validCategory);
      expect(result.success).toBe(true);
    });

    test("deve rejeitar nome muito longo", () => {
      const invalidCategory = {
        name: "A".repeat(51),
        slug: "slug",
      };

      const result = createCategorySchema.safeParse(invalidCategory);
      expect(result.success).toBe(false);
    });
  });

  describe("updateCategorySchema", () => {
    test("deve validar atualização parcial de categoria", () => {
      const partialUpdate = {
        name: "Novo Nome",
      };

      const result = updateCategorySchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });
  });

  describe("categoryParamsSchema", () => {
    test("deve validar ID de categoria válido", () => {
      const params = { id: "clxxx1234567890" };

      const result = categoryParamsSchema.safeParse(params);
      expect(result.success).toBe(true);
    });

    test("deve rejeitar ID de categoria vazio", () => {
      const params = { id: "" };

      const result = categoryParamsSchema.safeParse(params);
      expect(result.success).toBe(false);
    });
  });
});
