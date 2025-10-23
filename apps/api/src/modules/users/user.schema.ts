import { z } from "zod";
import { type UserType } from "@prisma/client";

/**
 * Schemas Zod para validação do módulo Users
 */

// Schema para criação de usuário
export const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  phone: z.string().optional(),
  userType: z.enum(["CLIENT", "PROFESSIONAL", "COMPANY"], {
    message: "Tipo de usuário inválido",
  }) as z.ZodType<UserType>,
});

// Schema para atualização de usuário
export const updateUserSchema = z.object({
  email: z.string().email("Email inválido").optional(),
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").optional(),
  phone: z.string().optional(),
  photoUrl: z.string().url("URL da foto inválida").optional(),
  bio: z
    .string()
    .max(500, "Bio não pode ter mais de 500 caracteres")
    .optional(),
  defaultAddress: z.string().optional(),
  city: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres").optional(),
  notificationPrefs: z.any().optional(), // JSON de preferências
});

// Schema para atualização de perfil (foto, bio, endereço, cidade)
export const updateProfileSchema = z.object({
  photoUrl: z.string().url("URL da foto inválida").optional(),
  bio: z
    .string()
    .max(500, "Bio não pode ter mais de 500 caracteres")
    .optional(),
  defaultAddress: z.string().optional(),
  city: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres").optional(),
});

// Schemas para preferências de notificação
export const notificationPrefsSchema = z.object({
  email: z.boolean().default(true),
  sms: z.boolean().default(false),
  push: z.boolean().default(true),
  appointmentReminder: z.boolean().default(true),
  appointmentConfirmation: z.boolean().default(true),
  reviewReminder: z.boolean().default(true),
  marketing: z.boolean().default(false),
});

export const updateNotificationPrefsSchema = z.object({
  notificationPrefs: notificationPrefsSchema,
});

// Schema para parâmetros de ID
export const userIdSchema = z.object({
  id: z.string().min(1, "ID inválido"), // CUID format, não UUID
});

// Schema para query de listagem
export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  userType: (
    z.enum(["CLIENT", "PROFESSIONAL", "COMPANY"]) as z.ZodType<UserType>
  ).optional(),
  search: z.string().optional(),
});

// Tipos inferidos dos schemas
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type NotificationPrefs = z.infer<typeof notificationPrefsSchema>;
export type UpdateNotificationPrefsInput = z.infer<
  typeof updateNotificationPrefsSchema
>;
export type UserIdParams = z.infer<typeof userIdSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
