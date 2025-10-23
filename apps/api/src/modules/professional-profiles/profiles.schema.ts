import { z } from "zod";

// ========================================
// ENUMS
// ========================================

export const ServiceModeEnum = z.enum(["AT_LOCATION", "AT_DOMICILE", "BOTH"]);

export const DayOfWeekEnum = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

// ========================================
// WORKING HOURS SCHEMA
// ========================================

export const TimeSlotSchema = z.object({
  start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Horário deve estar no formato HH:MM (ex: 09:00)",
  }),
  end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Horário deve estar no formato HH:MM (ex: 18:00)",
  }),
});

export const DayScheduleSchema = z.object({
  isOpen: z.boolean(),
  slots: z.array(TimeSlotSchema).optional(),
});

export const WorkingHoursSchema = z.object({
  MONDAY: DayScheduleSchema.optional(),
  TUESDAY: DayScheduleSchema.optional(),
  WEDNESDAY: DayScheduleSchema.optional(),
  THURSDAY: DayScheduleSchema.optional(),
  FRIDAY: DayScheduleSchema.optional(),
  SATURDAY: DayScheduleSchema.optional(),
  SUNDAY: DayScheduleSchema.optional(),
});

// ========================================
// CREATE SCHEMAS
// ========================================

export const CreateProfileInputSchema = z.object({
  userId: z.string().cuid({
    message: "ID de usuário inválido",
  }),
  bio: z
    .string()
    .max(1000, "Bio não pode ter mais de 1000 caracteres")
    .optional(),
  city: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres"),
  address: z.string().optional(),
  serviceMode: ServiceModeEnum,
  photoUrl: z.string().url("URL da foto inválida").optional(),
  portfolioImages: z
    .array(z.string().url("URL de imagem inválida"))
    .max(20, "Máximo de 20 imagens no portfólio")
    .optional(),
  workingHours: WorkingHoursSchema.optional(),
  yearsOfExperience: z
    .number()
    .int()
    .min(0, "Anos de experiência não pode ser negativo")
    .max(70, "Anos de experiência muito alto")
    .optional(),
  specialties: z
    .array(z.string().min(2, "Especialidade muito curta"))
    .max(20, "Máximo de 20 especialidades")
    .optional(),
  certifications: z
    .array(z.string().min(3, "Certificação muito curta"))
    .max(15, "Máximo de 15 certificações")
    .optional(),
  languages: z
    .array(z.string().min(2, "Idioma muito curto"))
    .max(10, "Máximo de 10 idiomas")
    .optional(),
});

// ========================================
// UPDATE SCHEMAS
// ========================================

export const UpdateProfileInputSchema = z.object({
  bio: z
    .string()
    .max(1000, "Bio não pode ter mais de 1000 caracteres")
    .optional(),
  city: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres").optional(),
  address: z.string().optional(),
  serviceMode: ServiceModeEnum.optional(),
  photoUrl: z.string().url("URL da foto inválida").optional(),
  portfolioImages: z
    .array(z.string().url("URL de imagem inválida"))
    .max(20, "Máximo de 20 imagens no portfólio")
    .optional(),
  workingHours: WorkingHoursSchema.optional(),
  yearsOfExperience: z
    .number()
    .int()
    .min(0, "Anos de experiência não pode ser negativo")
    .max(70, "Anos de experiência muito alto")
    .optional(),
  specialties: z
    .array(z.string().min(2, "Especialidade muito curta"))
    .max(20, "Máximo de 20 especialidades")
    .optional(),
  certifications: z
    .array(z.string().min(3, "Certificação muito curta"))
    .max(15, "Máximo de 15 certificações")
    .optional(),
  languages: z
    .array(z.string().min(2, "Idioma muito curto"))
    .max(10, "Máximo de 10 idiomas")
    .optional(),
  isActive: z.boolean().optional(),
});

// ========================================
// QUERY SCHEMAS
// ========================================

export const GetProfilesQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().min(1))
    .default(1),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .default(10),
  city: z.string().optional(),
  serviceMode: ServiceModeEnum.optional(),
  minRating: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .transform(Number)
    .pipe(z.number().min(0).max(5))
    .optional(),
  specialty: z.string().optional(),
  isActive: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  isVerified: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  sortBy: z
    .enum(["rating", "experience", "reviews", "createdAt"])
    .default("rating"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const SearchProfilesQuerySchema = z.object({
  query: z.string().min(2, "Busca deve ter pelo menos 2 caracteres"),
  city: z.string().optional(),
  serviceMode: ServiceModeEnum.optional(),
  page: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().min(1))
    .default("1"),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().min(1).max(50))
    .default("10"),
});

// ========================================
// PARAMS SCHEMAS
// ========================================

export const ProfileParamsSchema = z.object({
  userId: z.string().cuid({
    message: "ID de usuário inválido",
  }),
});

// ========================================
// SPECIFIC SCHEMAS
// ========================================

export const UpdatePortfolioSchema = z.object({
  portfolioImages: z
    .array(z.string().url("URL de imagem inválida"))
    .min(1, "Pelo menos uma imagem é necessária")
    .max(20, "Máximo de 20 imagens no portfólio"),
});

export const UpdateWorkingHoursSchema = z.object({
  workingHours: WorkingHoursSchema,
});

export const ToggleActiveSchema = z.object({
  isActive: z.boolean(),
});

// ========================================
// TYPE EXPORTS
// ========================================

export type ServiceMode = z.infer<typeof ServiceModeEnum>;
export type DayOfWeek = z.infer<typeof DayOfWeekEnum>;
export type TimeSlot = z.infer<typeof TimeSlotSchema>;
export type DaySchedule = z.infer<typeof DayScheduleSchema>;
export type WorkingHours = z.infer<typeof WorkingHoursSchema>;
export type CreateProfileInput = z.infer<typeof CreateProfileInputSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;
export type GetProfilesQuery = z.infer<typeof GetProfilesQuerySchema>;
export type SearchProfilesQuery = z.infer<typeof SearchProfilesQuerySchema>;
export type ProfileParams = z.infer<typeof ProfileParamsSchema>;
export type UpdatePortfolio = z.infer<typeof UpdatePortfolioSchema>;
export type UpdateWorkingHoursInput = z.infer<typeof UpdateWorkingHoursSchema>;
export type ToggleActive = z.infer<typeof ToggleActiveSchema>;
