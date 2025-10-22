import { z } from "zod";

/**
 * Schemas Zod reutilizáveis para validações
 */

// ========================================
// VALIDAÇÕES BÁSICAS
// ========================================

export const emailSchema = z
  .string()
  .min(1, "Email é obrigatório")
  .email("Email inválido")
  .toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, "Senha deve ter no mínimo 8 caracteres")
  .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
  .regex(/[0-9]/, "Senha deve conter pelo menos um número")
  .regex(
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
    "Senha deve conter pelo menos um caractere especial"
  );

export const phoneSchema = z
  .string()
  .min(1, "Telefone é obrigatório")
  .regex(
    /^\(\d{2}\) \d{4,5}-\d{4}$/,
    "Telefone inválido. Use o formato (99) 99999-9999"
  );

export const nameSchema = z
  .string()
  .min(3, "Nome deve ter no mínimo 3 caracteres")
  .max(100, "Nome deve ter no máximo 100 caracteres")
  .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras");

export const cpfSchema = z
  .string()
  .regex(
    /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    "CPF inválido. Use o formato 999.999.999-99"
  );

export const cepSchema = z
  .string()
  .regex(/^\d{5}-\d{3}$/, "CEP inválido. Use o formato 99999-999");

// ========================================
// SCHEMAS DE AUTENTICAÇÃO
// ========================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha é obrigatória"),
});

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    phone: phoneSchema.optional(),
    userType: z.enum(["CLIENT", "PROFESSIONAL"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

// ========================================
// SCHEMAS DE PERFIL
// ========================================

export const updateProfileSchema = z.object({
  name: nameSchema,
  phone: phoneSchema.optional(),
  bio: z.string().max(500, "Bio deve ter no máximo 500 caracteres").optional(),
  city: z.string().min(2, "Cidade é obrigatória").optional(),
  photoUrl: z.string().url("URL da foto inválida").optional(),
});

export const professionalProfileSchema = z.object({
  bio: z.string().max(500, "Bio deve ter no máximo 500 caracteres"),
  city: z.string().min(2, "Cidade é obrigatória"),
  address: z.string().optional(),
  serviceMode: z.enum(["AT_LOCATION", "AT_DOMICILE", "BOTH"]),
  yearsOfExperience: z.number().int().min(0).max(50).optional(),
  specialties: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
});

// ========================================
// SCHEMAS DE SERVIÇOS
// ========================================

export const serviceSchema = z.object({
  name: z.string().min(3, "Nome do serviço é obrigatório"),
  description: z.string().max(500, "Descrição muito longa").optional(),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  price: z.number().positive("Preço deve ser maior que zero"),
  priceType: z.enum(["FIXED", "HOURLY"]),
  durationMinutes: z
    .number()
    .int()
    .min(15, "Duração mínima: 15 minutos")
    .max(480, "Duração máxima: 8 horas"),
});

// ========================================
// SCHEMAS DE AGENDAMENTO
// ========================================

export const appointmentSchema = z.object({
  professionalId: z.string().min(1, "Profissional é obrigatório"),
  serviceId: z.string().min(1, "Serviço é obrigatório"),
  scheduledDate: z.date().min(new Date(), "Data deve ser futura"),
  locationType: z.enum(["AT_LOCATION", "AT_DOMICILE"]),
  clientAddress: z.string().optional(),
  clientNotes: z.string().max(500, "Observação muito longa").optional(),
});

// ========================================
// SCHEMAS DE AVALIAÇÃO
// ========================================

export const reviewSchema = z.object({
  appointmentId: z.string().min(1, "Agendamento é obrigatório"),
  rating: z
    .number()
    .int()
    .min(1, "Avaliação mínima: 1")
    .max(5, "Avaliação máxima: 5"),
  comment: z.string().max(500, "Comentário muito longo").optional(),
});

// ========================================
// SCHEMAS DE BUSCA E FILTROS
// ========================================

export const searchFilterSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  minRating: z.number().min(0).max(5).optional(),
  serviceMode: z.enum(["AT_LOCATION", "AT_DOMICILE", "BOTH"]).optional(),
  city: z.string().optional(),
  sortBy: z
    .enum(["relevance", "price_asc", "price_desc", "rating", "distance"])
    .optional(),
});

// ========================================
// TYPES INFERIDOS
// ========================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ProfessionalProfileInput = z.infer<
  typeof professionalProfileSchema
>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type SearchFilterInput = z.infer<typeof searchFilterSchema>;
