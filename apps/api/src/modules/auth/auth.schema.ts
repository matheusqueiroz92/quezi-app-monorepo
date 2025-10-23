import { z } from "zod";

/**
 * Schemas Zod para validação do módulo Auth
 */

// Schema para forgot password
export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

// Schema para reset password
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  newPassword: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
});

// Schema para verificar token
export const verifyResetTokenSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
});

// Tipos inferidos dos schemas
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyResetTokenInput = z.infer<typeof verifyResetTokenSchema>;
