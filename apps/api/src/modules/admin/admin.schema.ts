import { z } from "zod";
import { AdminRole } from "@prisma/client";

/**
 * Schemas Zod para validação do módulo Admin
 */

// Schema para login de admin
export const adminLoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

// Schema para criação de admin
export const createAdminSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  role: z.nativeEnum(AdminRole, { message: "Role de admin inválida" }),
  permissions: z.record(z.string(), z.any()).optional(),
});

// Schema para atualização de admin
export const updateAdminSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").optional(),
  role: z
    .nativeEnum(AdminRole, { message: "Role de admin inválida" })
    .optional(),
  permissions: z.record(z.string(), z.any()).optional(),
  isActive: z.boolean().optional(),
});

// Schema para atualização de senha
export const updateAdminPasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
});

// Schema para parâmetros de ID
export const adminIdSchema = z.object({
  id: z.string().cuid("ID de admin inválido"),
});

// Schema para listagem de admins
export const listAdminsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  role: z.nativeEnum(AdminRole).optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

// ========================================
// SCHEMAS DE GESTÃO DE USUÁRIOS
// ========================================

export const userIdSchema = z.object({
  id: z.string().cuid("ID de usuário inválido"),
});

export const suspendUserSchema = z.object({
  reason: z.string().min(10, "Motivo deve ter no mínimo 10 caracteres"),
  suspendedUntil: z.string().datetime().optional(), // ISO 8601 date
  permanent: z.boolean().default(false),
});

export const getUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  userType: z.enum(["CLIENT", "PROFESSIONAL"]).optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "name", "email"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ========================================
// SCHEMAS DE GESTÃO DE PROFISSIONAIS
// ========================================

export const professionalIdSchema = z.object({
  id: z.string().cuid("ID de profissional inválido"),
});

export const approveProfessionalSchema = z.object({
  notes: z.string().optional(),
  verificationLevel: z.enum(["BASIC", "VERIFIED", "PREMIUM"]).default("BASIC"),
});

export const rejectProfessionalSchema = z.object({
  reason: z.string().min(10, "Motivo deve ter no mínimo 10 caracteres"),
});

// ========================================
// SCHEMAS DE MODERAÇÃO DE CONTEÚDO
// ========================================

export const reviewIdSchema = z.object({
  id: z.string().cuid("ID de avaliação inválido"),
});

export const serviceIdSchema = z.object({
  id: z.string().cuid("ID de serviço inválido"),
});

export const moderateContentSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "DELETE"]),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export const getReportedContentQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  type: z.enum(["REVIEW", "SERVICE", "PROFILE"]).optional(),
  status: z.enum(["PENDING", "RESOLVED", "DISMISSED"]).optional(),
});

// ========================================
// SCHEMAS DE ANALYTICS
// ========================================

export const getDashboardStatsQuery = z.object({
  period: z.enum(["day", "week", "month", "year"]).default("week"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const getUserStatsQuery = z.object({
  period: z.enum(["day", "week", "month", "year"]).default("month"),
  userType: z.enum(["CLIENT", "PROFESSIONAL", "ALL"]).default("ALL"),
});

export const getRevenueStatsQuery = z.object({
  period: z.enum(["day", "week", "month", "year"]).default("month"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// ========================================
// SCHEMAS DE LOG DE AÇÕES
// ========================================

export const getAdminActionsQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  adminId: z.string().cuid().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const createAdminActionSchema = z.object({
  action: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  details: z.record(z.string(), z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

// ========================================
// TIPOS INFERIDOS
// ========================================

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;
export type UpdateAdminPasswordInput = z.infer<
  typeof updateAdminPasswordSchema
>;
export type AdminIdParams = z.infer<typeof adminIdSchema>;
export type ListAdminsQuery = z.infer<typeof listAdminsQuerySchema>;

export type UserIdParams = z.infer<typeof userIdSchema>;
export type SuspendUserInput = z.infer<typeof suspendUserSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;

export type ProfessionalIdParams = z.infer<typeof professionalIdSchema>;
export type ApproveProfessionalInput = z.infer<
  typeof approveProfessionalSchema
>;
export type RejectProfessionalInput = z.infer<typeof rejectProfessionalSchema>;

export type ReviewIdParams = z.infer<typeof reviewIdSchema>;
export type ServiceIdParams = z.infer<typeof serviceIdSchema>;
export type ModerateContentInput = z.infer<typeof moderateContentSchema>;
export type GetReportedContentQuery = z.infer<typeof getReportedContentQuery>;

export type GetDashboardStatsQuery = z.infer<typeof getDashboardStatsQuery>;
export type GetUserStatsQuery = z.infer<typeof getUserStatsQuery>;
export type GetRevenueStatsQuery = z.infer<typeof getRevenueStatsQuery>;

export type GetAdminActionsQuery = z.infer<typeof getAdminActionsQuery>;
export type CreateAdminActionInput = z.infer<typeof createAdminActionSchema>;
