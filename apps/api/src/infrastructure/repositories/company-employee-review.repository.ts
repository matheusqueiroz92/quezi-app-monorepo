/**
 * Repositório CompanyEmployeeReview - Camada de Infraestrutura
 *
 * Implementação concreta para persistência de avaliações de funcionários de empresa
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { CompanyEmployeeReview } from "../../domain/entities/company-employee-review.entity";
import { prisma } from "../../lib/prisma";
import { BadRequestError, NotFoundError } from "../../utils/app-error";

/**
 * Repositório concreto para CompanyEmployeeReview
 */
export class CompanyEmployeeReviewRepository {
  /**
   * Cria uma nova avaliação de funcionário
   */
  async create(data: any): Promise<CompanyEmployeeReview> {
    try {
      const review = await prisma.companyEmployeeReview.create({
        data: {
          id: data.id,
          appointmentId: data.appointmentId,
          clientId: data.clientId,
          companyId: data.companyId,
          employeeId: data.employeeId,
          rating: data.rating,
          comment: data.comment,
        },
        include: {
          appointment: {
            include: {
              client: true,
              company: true,
              employee: true,
              service: true,
            },
          },
          client: true,
          company: true,
          employee: true,
        },
      });

      return CompanyEmployeeReview.fromPersistence(review);
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao criar avaliação de funcionário: ${error.message}`
      );
    }
  }

  /**
   * Busca avaliação por ID
   */
  async findById(id: string): Promise<CompanyEmployeeReview | null> {
    try {
      const review = await prisma.companyEmployeeReview.findUnique({
        where: { id },
        include: {
          appointment: {
            include: {
              client: true,
              company: true,
              employee: true,
              service: true,
            },
          },
          client: true,
          company: true,
          employee: true,
        },
      });

      if (!review) {
        return null;
      }

      return CompanyEmployeeReview.fromPersistence(review);
    } catch (error: any) {
      throw new BadRequestError(`Erro ao buscar avaliação: ${error.message}`);
    }
  }

  /**
   * Busca avaliação por agendamento
   */
  async findByAppointment(
    appointmentId: string
  ): Promise<CompanyEmployeeReview | null> {
    try {
      const review = await prisma.companyEmployeeReview.findUnique({
        where: { appointmentId },
        include: {
          appointment: {
            include: {
              client: true,
              company: true,
              employee: true,
              service: true,
            },
          },
          client: true,
          company: true,
          employee: true,
        },
      });

      if (!review) {
        return null;
      }

      return CompanyEmployeeReview.fromPersistence(review);
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
        companyId,
        employeeId,
        clientId,
        rating,
        dateFrom,
        dateTo,
      } = filters;

      const where: any = {};
      if (companyId) where.companyId = companyId;
      if (employeeId) where.employeeId = employeeId;
      if (clientId) where.clientId = clientId;
      if (rating) where.rating = rating;
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
      }

      const [reviews, total] = await Promise.all([
        prisma.companyEmployeeReview.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
          include: {
            appointment: {
              include: {
                client: true,
                company: true,
                employee: true,
                service: true,
              },
            },
            client: true,
            company: true,
            employee: true,
          },
        }),
        prisma.companyEmployeeReview.count({ where }),
      ]);

      return {
        data: reviews.map((review) =>
          CompanyEmployeeReview.fromPersistence(review)
        ),
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
  async update(id: string, data: any): Promise<CompanyEmployeeReview> {
    try {
      const review = await prisma.companyEmployeeReview.update({
        where: { id },
        data: {
          rating: data.rating,
          comment: data.comment,
        },
        include: {
          appointment: {
            include: {
              client: true,
              company: true,
              employee: true,
              service: true,
            },
          },
          client: true,
          company: true,
          employee: true,
        },
      });

      return CompanyEmployeeReview.fromPersistence(review);
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
      await prisma.companyEmployeeReview.delete({
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
      const review = await prisma.companyEmployeeReview.findUnique({
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
      const review = await prisma.companyEmployeeReview.findUnique({
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
   * Busca avaliações por empresa
   */
  async findByCompany(companyId: string, filters: any = {}): Promise<any> {
    try {
      const { skip = 0, take = 10, rating, dateFrom, dateTo } = filters;

      const where: any = { companyId };
      if (rating) where.rating = rating;
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
      }

      const [reviews, total] = await Promise.all([
        prisma.companyEmployeeReview.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
          include: {
            appointment: {
              include: {
                client: true,
                company: true,
                employee: true,
                service: true,
              },
            },
            client: true,
            company: true,
            employee: true,
          },
        }),
        prisma.companyEmployeeReview.count({ where }),
      ]);

      return {
        data: reviews.map((review) =>
          CompanyEmployeeReview.fromPersistence(review)
        ),
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        hasNext: skip + take < total,
        hasPrev: skip > 0,
      };
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao buscar avaliações da empresa: ${error.message}`
      );
    }
  }

  /**
   * Busca avaliações por funcionário
   */
  async findByEmployee(employeeId: string, filters: any = {}): Promise<any> {
    try {
      const { skip = 0, take = 10, rating, dateFrom, dateTo } = filters;

      const where: any = { employeeId };
      if (rating) where.rating = rating;
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
      }

      const [reviews, total] = await Promise.all([
        prisma.companyEmployeeReview.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
          include: {
            appointment: {
              include: {
                client: true,
                company: true,
                employee: true,
                service: true,
              },
            },
            client: true,
            company: true,
            employee: true,
          },
        }),
        prisma.companyEmployeeReview.count({ where }),
      ]);

      return {
        data: reviews.map((review) =>
          CompanyEmployeeReview.fromPersistence(review)
        ),
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        hasNext: skip + take < total,
        hasPrev: skip > 0,
      };
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao buscar avaliações do funcionário: ${error.message}`
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
        prisma.companyEmployeeReview.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
          include: {
            appointment: {
              include: {
                client: true,
                company: true,
                employee: true,
                service: true,
              },
            },
            client: true,
            company: true,
            employee: true,
          },
        }),
        prisma.companyEmployeeReview.count({ where }),
      ]);

      return {
        data: reviews.map((review) =>
          CompanyEmployeeReview.fromPersistence(review)
        ),
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
      const { companyId, employeeId, clientId, dateFrom, dateTo } = filters;

      const where: any = {};
      if (companyId) where.companyId = companyId;
      if (employeeId) where.employeeId = employeeId;
      if (clientId) where.clientId = clientId;
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
      }

      const [total, averageRating, ratingDistribution] = await Promise.all([
        prisma.companyEmployeeReview.count({ where }),
        prisma.companyEmployeeReview.aggregate({
          where,
          _avg: { rating: true },
        }),
        prisma.companyEmployeeReview.groupBy({
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
