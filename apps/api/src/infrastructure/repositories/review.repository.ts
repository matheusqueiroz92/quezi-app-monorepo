/**
 * Repositório Review - Camada de Infraestrutura
 *
 * Implementação concreta para persistência de avaliações
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { Review } from "../../domain/entities/review.entity";
import { prisma } from "../../lib/prisma";
import { BadRequestError, NotFoundError } from "../../utils/app-error";

/**
 * Repositório concreto para Review
 */
export class ReviewRepository {
  /**
   * Cria uma nova avaliação
   */
  async create(data: any): Promise<Review> {
    try {
      const review = await prisma.review.create({
        data: {
          id: data.id,
          appointmentId: data.appointmentId,
          clientId: data.clientId,
          professionalId: data.professionalId,
          rating: data.rating,
          comment: data.comment,
        },
        include: {
          appointment: {
            include: {
              client: true,
              professional: true,
              service: true,
            },
          },
          client: true,
          professional: true,
        },
      });

      return Review.fromPersistence(review);
    } catch (error: any) {
      throw new BadRequestError(`Erro ao criar avaliação: ${error.message}`);
    }
  }

  /**
   * Busca avaliação por ID
   */
  async findById(id: string): Promise<Review | null> {
    try {
      const review = await prisma.review.findUnique({
        where: { id },
        include: {
          appointment: {
            include: {
              client: true,
              professional: true,
              service: true,
            },
          },
          client: true,
          professional: true,
        },
      });

      if (!review) {
        return null;
      }

      return Review.fromPersistence(review);
    } catch (error: any) {
      throw new BadRequestError(`Erro ao buscar avaliação: ${error.message}`);
    }
  }

  /**
   * Busca avaliação por agendamento
   */
  async findByAppointment(appointmentId: string): Promise<Review | null> {
    try {
      const review = await prisma.review.findUnique({
        where: { appointmentId },
        include: {
          appointment: {
            include: {
              client: true,
              professional: true,
              service: true,
            },
          },
          client: true,
          professional: true,
        },
      });

      if (!review) {
        return null;
      }

      return Review.fromPersistence(review);
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao buscar avaliação do agendamento: ${error.message}`
      );
    }
  }

  /**
   * Lista avaliações com filtros
   */
  async findMany(filters: any): Promise<any> {
    try {
      const {
        skip = 0,
        take = 10,
        professionalId,
        clientId,
        rating,
        dateFrom,
        dateTo,
      } = filters;

      const where: any = {};
      if (professionalId) where.professionalId = professionalId;
      if (clientId) where.clientId = clientId;
      if (rating) where.rating = rating;
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
      }

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
          include: {
            appointment: {
              include: {
                client: true,
                professional: true,
                service: true,
              },
            },
            client: true,
            professional: true,
          },
        }),
        prisma.review.count({ where }),
      ]);

      return {
        data: reviews.map((review) => Review.fromPersistence(review)),
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        hasNext: skip + take < total,
        hasPrev: skip > 0,
      };
    } catch (error: any) {
      throw new BadRequestError(`Erro ao listar avaliações: ${error.message}`);
    }
  }

  /**
   * Atualiza avaliação
   */
  async update(id: string, data: any): Promise<Review> {
    try {
      const review = await prisma.review.update({
        where: { id },
        data: {
          rating: data.rating,
          comment: data.comment,
        },
        include: {
          appointment: {
            include: {
              client: true,
              professional: true,
              service: true,
            },
          },
          client: true,
          professional: true,
        },
      });

      return Review.fromPersistence(review);
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new NotFoundError("Avaliação não encontrada");
      }
      throw new BadRequestError(
        `Erro ao atualizar avaliação: ${error.message}`
      );
    }
  }

  /**
   * Remove avaliação
   */
  async delete(id: string): Promise<void> {
    try {
      await prisma.review.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new NotFoundError("Avaliação não encontrada");
      }
      throw new BadRequestError(`Erro ao remover avaliação: ${error.message}`);
    }
  }

  /**
   * Verifica se avaliação existe
   */
  async exists(id: string): Promise<boolean> {
    try {
      const review = await prisma.review.findUnique({
        where: { id },
        select: { id: true },
      });

      return !!review;
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao verificar avaliação: ${error.message}`
      );
    }
  }

  /**
   * Verifica se já existe avaliação para o agendamento
   */
  async existsForAppointment(appointmentId: string): Promise<boolean> {
    try {
      const review = await prisma.review.findUnique({
        where: { appointmentId },
        select: { id: true },
      });

      return !!review;
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao verificar avaliação do agendamento: ${error.message}`
      );
    }
  }

  /**
   * Busca avaliações por profissional
   */
  async findByProfessional(
    professionalId: string,
    filters: any = {}
  ): Promise<any> {
    try {
      const { skip = 0, take = 10, rating, dateFrom, dateTo } = filters;

      const where: any = { professionalId };
      if (rating) where.rating = rating;
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
      }

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
          include: {
            appointment: {
              include: {
                client: true,
                professional: true,
                service: true,
              },
            },
            client: true,
            professional: true,
          },
        }),
        prisma.review.count({ where }),
      ]);

      return {
        data: reviews.map((review) => Review.fromPersistence(review)),
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        hasNext: skip + take < total,
        hasPrev: skip > 0,
      };
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao buscar avaliações do profissional: ${error.message}`
      );
    }
  }

  /**
   * Busca avaliações por cliente
   */
  async findByClient(clientId: string, filters: any = {}): Promise<any> {
    try {
      const { skip = 0, take = 10, rating, dateFrom, dateTo } = filters;

      const where: any = { clientId };
      if (rating) where.rating = rating;
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
      }

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
          include: {
            appointment: {
              include: {
                client: true,
                professional: true,
                service: true,
              },
            },
            client: true,
            professional: true,
          },
        }),
        prisma.review.count({ where }),
      ]);

      return {
        data: reviews.map((review) => Review.fromPersistence(review)),
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        hasNext: skip + take < total,
        hasPrev: skip > 0,
      };
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao buscar avaliações do cliente: ${error.message}`
      );
    }
  }

  /**
   * Obtém estatísticas de avaliações
   */
  async getStats(filters: any = {}): Promise<any> {
    try {
      const { professionalId, clientId, dateFrom, dateTo } = filters;

      const where: any = {};
      if (professionalId) where.professionalId = professionalId;
      if (clientId) where.clientId = clientId;
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
      }

      const [total, averageRating, ratingDistribution] = await Promise.all([
        prisma.review.count({ where }),
        prisma.review.aggregate({
          where,
          _avg: { rating: true },
        }),
        prisma.review.groupBy({
          by: ["rating"],
          where,
          _count: { rating: true },
        }),
      ]);

      return {
        total,
        averageRating: averageRating._avg.rating || 0,
        ratingDistribution: ratingDistribution.reduce((acc, item) => {
          acc[item.rating] = item._count.rating;
          return acc;
        }, {} as Record<number, number>),
      };
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao buscar estatísticas: ${error.message}`
      );
    }
  }
}
