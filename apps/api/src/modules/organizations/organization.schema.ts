import { z } from "zod";

/**
 * Schemas Zod para validação do módulo Organizations
 */

// Enum de roles
export const organizationRoleEnum = z.enum(["owner", "admin", "member"], {
  message: "Role deve ser: owner, admin ou member",
});

// Schema para criação de organização
export const createOrganizationSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  slug: z
    .string()
    .min(3, "Slug deve ter no mínimo 3 caracteres")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug deve conter apenas letras minúsculas, números e hífens"
    ),
  description: z.string().optional(),
});

// Schema para atualização de organização
export const updateOrganizationSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").optional(),
  description: z.string().optional(),
  logoUrl: z.string().url("URL de logo inválida").optional(),
});

// Schema para convidar membro
export const inviteMemberSchema = z.object({
  organizationId: z.string().uuid("ID de organização inválido"),
  email: z.string().email("Email inválido"),
  role: organizationRoleEnum,
});

// Schema para atualizar role de membro
export const updateMemberRoleSchema = z.object({
  organizationId: z.string().uuid("ID de organização inválido"),
  memberId: z.string().uuid("ID de membro inválido"),
  role: organizationRoleEnum,
});

// Schema para parâmetros de ID
export const organizationIdSchema = z.object({
  id: z.string().uuid("ID de organização inválido"),
});

// Tipos inferidos dos schemas
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type OrganizationIdParams = z.infer<typeof organizationIdSchema>;
export type OrganizationRole = z.infer<typeof organizationRoleEnum>;
