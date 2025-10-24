import { z } from "zod";

// ========================================
// BASE SCHEMAS
// ========================================

export const ReviewBaseSchema = z.object({
  appointmentId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// ========================================
// CREATE SCHEMAS
// ========================================

export const CreateReviewInputSchema = ReviewBaseSchema;

export const CreateReviewResponseSchema = z.object({
  id: z.string().cuid(),
  appointmentId: z.string().cuid(),
  reviewerId: z.string().cuid(),
  professionalId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// ========================================
// UPDATE SCHEMAS
// ========================================

export const UpdateReviewInputSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
});

export const UpdateReviewResponseSchema = CreateReviewResponseSchema;

// ========================================
// QUERY SCHEMAS
// ========================================

export const GetReviewsQuerySchema = z.object({
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
  professionalId: z.string().cuid().optional(),
  reviewerId: z.string().cuid().optional(),
  minRating: z
    .string()
    .regex(/^[1-5]$/)
    .transform(Number)
    .pipe(z.number().min(1).max(5))
    .optional(),
  maxRating: z
    .string()
    .regex(/^[1-5]$/)
    .transform(Number)
    .pipe(z.number().min(1).max(5))
    .optional(),
});

export const GetReviewsResponseSchema = z.object({
  reviews: z.array(
    CreateReviewResponseSchema.extend({
      reviewer: z.object({
        id: z.string().cuid(),
        name: z.string(),
        email: z.string().email(),
      }),
      professional: z.object({
        id: z.string().cuid(),
        name: z.string(),
        email: z.string().email(),
      }),
      appointment: z.object({
        id: z.string().cuid(),
        scheduledDate: z.string().datetime(),
        service: z.object({
          id: z.string().cuid(),
          name: z.string(),
          category: z.object({
            id: z.string().cuid(),
            name: z.string(),
            slug: z.string(),
          }),
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

export const ReviewParamsSchema = z.object({
  id: z.string().cuid(),
});

export const AppointmentParamsSchema = z.object({
  appointmentId: z.string().cuid(),
});

// ========================================
// STATISTICS SCHEMAS
// ========================================

export const GetProfessionalStatsQuerySchema = z.object({
  professionalId: z.string().cuid(),
});

export const GetProfessionalStatsResponseSchema = z.object({
  professionalId: z.string().cuid(),
  totalReviews: z.number(),
  averageRating: z.number(),
  ratingDistribution: z.object({
    "1": z.number(),
    "2": z.number(),
    "3": z.number(),
    "4": z.number(),
    "5": z.number(),
  }),
  recentReviews: z.array(CreateReviewResponseSchema),
});

// ========================================
// TYPE EXPORTS
// ========================================

export type CreateReviewInput = z.infer<typeof CreateReviewInputSchema>;
export type CreateReviewResponse = z.infer<typeof CreateReviewResponseSchema>;
export type UpdateReviewInput = z.infer<typeof UpdateReviewInputSchema>;
export type UpdateReviewResponse = z.infer<typeof UpdateReviewResponseSchema>;
export type GetReviewsQuery = z.infer<typeof GetReviewsQuerySchema>;
export type GetReviewsResponse = z.infer<typeof GetReviewsResponseSchema>;
export type ReviewParams = z.infer<typeof ReviewParamsSchema>;
export type AppointmentParams = z.infer<typeof AppointmentParamsSchema>;
export type GetProfessionalStatsQuery = z.infer<
  typeof GetProfessionalStatsQuerySchema
>;
export type GetProfessionalStatsResponse = z.infer<
  typeof GetProfessionalStatsResponseSchema
>;
