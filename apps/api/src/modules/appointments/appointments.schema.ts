import { z } from "zod";

// ========================================
// ENUMS
// ========================================

export const AppointmentStatusEnum = z.enum([
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "COMPLETED",
]);

export const ServiceModeEnum = z.enum(["AT_LOCATION", "AT_DOMICILE", "BOTH"]);

// ========================================
// BASE SCHEMAS
// ========================================

export const AppointmentBaseSchema = z.object({
  clientId: z.string().cuid(),
  professionalId: z.string().cuid(),
  serviceId: z.string().cuid(),
  scheduledDate: z.string().datetime(),
  locationType: ServiceModeEnum,
  clientAddress: z.string().optional(),
  clientNotes: z.string().max(500).optional(),
});

// ========================================
// CREATE SCHEMAS
// ========================================

export const CreateAppointmentInputSchema = AppointmentBaseSchema;

export const CreateAppointmentResponseSchema = z.object({
  id: z.string().cuid(),
  clientId: z.string().cuid(),
  professionalId: z.string().cuid(),
  serviceId: z.string().cuid(),
  scheduledDate: z.string().datetime(),
  status: AppointmentStatusEnum,
  locationType: ServiceModeEnum,
  clientAddress: z.string().nullable(),
  clientNotes: z.string().nullable(),
  isReviewed: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// ========================================
// UPDATE SCHEMAS
// ========================================

export const UpdateAppointmentInputSchema = z.object({
  scheduledDate: z.string().datetime().optional(),
  status: AppointmentStatusEnum.optional(),
  locationType: ServiceModeEnum.optional(),
  clientAddress: z.string().optional(),
  clientNotes: z.string().max(500).optional(),
});

export const UpdateAppointmentResponseSchema = CreateAppointmentResponseSchema;

// ========================================
// QUERY SCHEMAS
// ========================================

export const GetAppointmentsQuerySchema = z.object({
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
    .pipe(z.number().min(1).max(100))
    .default("10"),
  status: AppointmentStatusEnum.optional(),
  clientId: z.string().cuid().optional(),
  professionalId: z.string().cuid().optional(),
  serviceId: z.string().cuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export const GetAppointmentsResponseSchema = z.object({
  appointments: z.array(
    CreateAppointmentResponseSchema.extend({
      client: z.object({
        id: z.string().cuid(),
        name: z.string(),
        email: z.string().email(),
        phone: z.string().nullable(),
      }),
      professional: z.object({
        id: z.string().cuid(),
        name: z.string(),
        email: z.string().email(),
        phone: z.string().nullable(),
      }),
      service: z.object({
        id: z.string().cuid(),
        name: z.string(),
        description: z.string().nullable(),
        price: z.number(),
        priceType: z.enum(["FIXED", "HOURLY"]),
        durationMinutes: z.number(),
        category: z.object({
          id: z.string().cuid(),
          name: z.string(),
          slug: z.string(),
        }),
      }),
    })
  ),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

// ========================================
// PARAMS SCHEMAS
// ========================================

export const AppointmentParamsSchema = z.object({
  id: z.string().cuid(),
});

// ========================================
// STATUS UPDATE SCHEMAS
// ========================================

export const UpdateAppointmentStatusInputSchema = z.object({
  status: AppointmentStatusEnum,
});

export const UpdateAppointmentStatusResponseSchema =
  CreateAppointmentResponseSchema;

// ========================================
// AVAILABILITY SCHEMAS
// ========================================

export const CheckAvailabilityQuerySchema = z.object({
  professionalId: z.string().cuid(),
  serviceId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const CheckAvailabilityResponseSchema = z.object({
  date: z.string(),
  professionalId: z.string().cuid(),
  serviceId: z.string().cuid(),
  availableSlots: z.array(
    z.object({
      time: z.string(),
      available: z.boolean(),
      reason: z.string().optional(),
    })
  ),
});

// ========================================
// STATISTICS SCHEMAS
// ========================================

export const GetAppointmentStatsQuerySchema = z.object({
  professionalId: z.string().cuid().optional(),
  clientId: z.string().cuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export const GetAppointmentStatsResponseSchema = z.object({
  total: z.number(),
  pending: z.number(),
  accepted: z.number(),
  rejected: z.number(),
  completed: z.number(),
  completionRate: z.number(),
  averageRating: z.number().nullable(),
});

// ========================================
// TYPE EXPORTS
// ========================================

export type AppointmentStatus = z.infer<typeof AppointmentStatusEnum>;
export type ServiceMode = z.infer<typeof ServiceModeEnum>;
export type CreateAppointmentInput = z.infer<
  typeof CreateAppointmentInputSchema
>;
export type CreateAppointmentResponse = z.infer<
  typeof CreateAppointmentResponseSchema
>;
export type UpdateAppointmentInput = z.infer<
  typeof UpdateAppointmentInputSchema
>;
export type UpdateAppointmentResponse = z.infer<
  typeof UpdateAppointmentResponseSchema
>;
export type GetAppointmentsQuery = z.infer<typeof GetAppointmentsQuerySchema>;
export type GetAppointmentsResponse = z.infer<
  typeof GetAppointmentsResponseSchema
>;
export type AppointmentParams = z.infer<typeof AppointmentParamsSchema>;
export type UpdateAppointmentStatusInput = z.infer<
  typeof UpdateAppointmentStatusInputSchema
>;
export type UpdateAppointmentStatusResponse = z.infer<
  typeof UpdateAppointmentStatusResponseSchema
>;
export type CheckAvailabilityQuery = z.infer<
  typeof CheckAvailabilityQuerySchema
>;
export type CheckAvailabilityResponse = z.infer<
  typeof CheckAvailabilityResponseSchema
>;
export type GetAppointmentStatsQuery = z.infer<
  typeof GetAppointmentStatsQuerySchema
>;
export type GetAppointmentStatsResponse = z.infer<
  typeof GetAppointmentStatsResponseSchema
>;
