import { z } from "zod";
import { ServicePriceType } from "@prisma/client";

/**
 * Schema para validação de criação de serviço
 */
export const createServiceSchema = z.object({
  name: z
    .string()
    .min(1, "Nome do serviço é obrigatório")
    .max(100, "Nome do serviço deve ter no máximo 100 caracteres"),

  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional(),

  price: z
    .number()
    .positive("Preço deve ser um valor positivo")
    .max(999999.99, "Preço muito alto"),

  priceType: z.nativeEnum(ServicePriceType),

  durationMinutes: z
    .number()
    .int("Duração deve ser um número inteiro")
    .min(15, "Duração mínima é de 15 minutos")
    .max(480, "Duração máxima é de 8 horas"),

  categoryId: z.string().min(1, "Categoria é obrigatória"),
});

/**
 * Schema para validação de atualização de serviço
 */
export const updateServiceSchema = createServiceSchema.partial();

/**
 * Schema para validação de parâmetros de busca
 */
export const getServicesQuerySchema = z.object({
  // Filtros
  categoryId: z.string().optional(),
  professionalId: z.string().optional(),
  priceType: z.nativeEnum(ServicePriceType).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),

  // Busca por texto
  search: z.string().optional(),

  // Paginação
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),

  // Ordenação
  sortBy: z.enum(["name", "price", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Schema para validação de parâmetros de ID
 */
export const serviceParamsSchema = z.object({
  id: z.string().min(1, "ID do serviço é obrigatório"),
});

/**
 * Schema para validação de categoria
 */
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Nome da categoria é obrigatório")
    .max(50, "Nome da categoria deve ter no máximo 50 caracteres"),

  slug: z
    .string()
    .min(1, "Slug da categoria é obrigatório")
    .max(50, "Slug deve ter no máximo 50 caracteres")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug deve conter apenas letras minúsculas, números e hífens"
    ),
});

/**
 * Schema para atualização de categoria
 */
export const updateCategorySchema = createCategorySchema.partial();

/**
 * Schema para parâmetros de categoria
 */
export const categoryParamsSchema = z.object({
  id: z.string().min(1, "ID da categoria é obrigatório"),
});

/**
 * Schema para resposta de serviço
 */
export const serviceResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  priceType: z.nativeEnum(ServicePriceType),
  durationMinutes: z.number(),
  professionalId: z.string(),
  categoryId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),

  // Relações populadas
  professional: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      userType: z.string(),
    })
    .optional(),

  category: z
    .object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
    })
    .optional(),
});

/**
 * Schema para resposta de categoria
 */
export const categoryResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  services: z.array(serviceResponseSchema).optional(),
});

/**
 * Schema para resposta paginada
 */
export const paginatedResponseSchema = z.object({
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

// Tipos TypeScript derivados dos schemas
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type GetServicesQuery = z.infer<typeof getServicesQuerySchema>;
export type ServiceParams = z.infer<typeof serviceParamsSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryParams = z.infer<typeof categoryParamsSchema>;
export type ServiceResponse = z.infer<typeof serviceResponseSchema>;
export type CategoryResponse = z.infer<typeof categoryResponseSchema>;
export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};
