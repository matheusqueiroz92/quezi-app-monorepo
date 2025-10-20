import { PrismaClient } from "@prisma/client";
import { AppError } from "../../utils/app-error";
import {
  CreateReviewInput,
  UpdateReviewInput,
  GetReviewsQuery,
  GetProfessionalStatsQuery,
} from "./reviews.schema";

export class ReviewsRepository {
  constructor(private prisma: PrismaClient) {}

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  async create(data: CreateReviewInput & { reviewerId: string; professionalId: string }) {
    try {
      // Verificar se o agendamento existe
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: data.appointmentId },
        include: {
          service: true,
        },
      });

      if (!appointment) {
        throw new AppError("Agendamento não encontrado", 404);
      }

      // Verificar se o agendamento está concluído
      if (appointment.status !== "COMPLETED") {
        throw new AppError(
          "Apenas agendamentos concluídos podem ser avaliados",
          400
        );
      }

      // Verificar se já existe review para este agendamento
      const existingReview = await this.prisma.review.findUnique({
        where: { appointmentId: data.appointmentId },
      });

      if (existingReview) {
        throw new AppError("Este agendamento já foi avaliado", 409);
      }

      // Criar a review
      const review = await this.prisma.review.create({
        data: {
          appointmentId: data.appointmentId,
          reviewerId: data.reviewerId,
          professionalId: data.professionalId,
          rating: data.rating,
          comment: data.comment || null,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          appointment: {
            include: {
              service: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });

      // Atualizar estatísticas do profissional
      await this.updateProfessionalStats(data.professionalId);

      // Marcar agendamento como avaliado
      await this.prisma.appointment.update({
        where: { id: data.appointmentId },
        data: { isReviewed: true },
      });

      return review;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao criar avaliação", 500);
    }
  }

  async findById(id: string) {
    try {
      const review = await this.prisma.review.findUnique({
        where: { id },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          appointment: {
            include: {
              professional: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              service: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });

      if (!review) {
        throw new AppError("Avaliação não encontrada", 404);
      }

      return review;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar avaliação", 500);
    }
  }

  async findMany(query: GetReviewsQuery) {
    try {
      const { page, limit, professionalId, reviewerId, minRating, maxRating } =
        query;

      const where: any = {};

      if (professionalId) where.professionalId = professionalId;
      if (reviewerId) where.reviewerId = reviewerId;

      if (minRating || maxRating) {
        where.rating = {};
        if (minRating) where.rating.gte = minRating;
        if (maxRating) where.rating.lte = maxRating;
      }

      const [reviews, total] = await Promise.all([
        this.prisma.review.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            appointment: {
              include: {
                professional: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                service: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        }),
        this.prisma.review.count({ where }),
      ]);

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new AppError("Erro ao buscar avaliações", 500);
    }
  }

  async update(id: string, data: UpdateReviewInput) {
    try {
      const review = await this.prisma.review.findUnique({
        where: { id },
      });

      if (!review) {
        throw new AppError("Avaliação não encontrada", 404);
      }

      const updatedReview = await this.prisma.review.update({
        where: { id },
        data,
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          appointment: {
            include: {
              service: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });

      // Se o rating foi alterado, atualizar estatísticas do profissional
      if (data.rating !== undefined) {
        await this.updateProfessionalStats(review.professionalId);
      }

      return updatedReview;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar avaliação", 500);
    }
  }

  async delete(id: string) {
    try {
      const review = await this.prisma.review.findUnique({
        where: { id },
        include: {
          appointment: true,
        },
      });

      if (!review) {
        throw new AppError("Avaliação não encontrada", 404);
      }

      await this.prisma.review.delete({
        where: { id },
      });

      // Desmarcar agendamento como avaliado
      await this.prisma.appointment.update({
        where: { id: review.appointmentId },
        data: { isReviewed: false },
      });

      // Atualizar estatísticas do profissional
      await this.updateProfessionalStats(review.professionalId);

      return { success: true };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao deletar avaliação", 500);
    }
  }

  // ========================================
  // SPECIFIC OPERATIONS
  // ========================================

  async findByAppointment(appointmentId: string) {
    try {
      const review = await this.prisma.review.findUnique({
        where: { appointmentId },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return review;
    } catch (error) {
      throw new AppError("Erro ao buscar avaliação do agendamento", 500);
    }
  }

  async getProfessionalStats(query: GetProfessionalStatsQuery) {
    try {
      const { professionalId } = query;

      // Buscar todas as reviews do profissional
      const reviews = await this.prisma.review.findMany({
        where: { professionalId },
        select: {
          rating: true,
        },
      });

      const totalReviews = reviews.length;

      if (totalReviews === 0) {
        return {
          professionalId,
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: {
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0,
            "5": 0,
          },
          recentReviews: [],
        };
      }

      // Calcular média
      const sumRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = Math.round((sumRatings / totalReviews) * 100) / 100;

      // Distribuição de ratings
      const ratingDistribution = {
        "1": reviews.filter((r) => r.rating === 1).length,
        "2": reviews.filter((r) => r.rating === 2).length,
        "3": reviews.filter((r) => r.rating === 3).length,
        "4": reviews.filter((r) => r.rating === 4).length,
        "5": reviews.filter((r) => r.rating === 5).length,
      };

      // Reviews recentes (últimas 5)
      const recentReviews = await this.prisma.review.findMany({
        where: { professionalId },
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        professionalId,
        totalReviews,
        averageRating,
        ratingDistribution,
        recentReviews,
      };
    } catch (error) {
      throw new AppError("Erro ao buscar estatísticas do profissional", 500);
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  private async updateProfessionalStats(professionalId: string) {
    try {
      // Calcular nova média e total de avaliações
      const stats = await this.prisma.review.aggregate({
        where: { professionalId },
        _avg: {
          rating: true,
        },
        _count: {
          id: true,
        },
      });

      // Atualizar perfil profissional
      await this.prisma.professionalProfile.update({
        where: { userId: professionalId },
        data: {
          averageRating: stats._avg.rating || 0,
          totalRatings: stats._count.id,
        },
      });
    } catch (error) {
      // Não lançar erro se falhar ao atualizar stats (operação secundária)
      console.error("Erro ao atualizar estatísticas do profissional:", error);
    }
  }

  async findByProfessional(professionalId: string, limit: number = 10) {
    try {
      const reviews = await this.prisma.review.findMany({
        where: { professionalId },
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          appointment: {
            include: {
              service: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });

      return reviews;
    } catch (error) {
      throw new AppError("Erro ao buscar avaliações do profissional", 500);
    }
  }

  async countByProfessional(professionalId: string) {
    try {
      return await this.prisma.review.count({
        where: { professionalId },
      });
    } catch (error) {
      throw new AppError("Erro ao contar avaliações", 500);
    }
  }
}

