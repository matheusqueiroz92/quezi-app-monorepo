import { PrismaClient } from "@prisma/client";
import { ICompanyEmployeeReviewRepository } from "../../domain/interfaces/repository.interface";
import { CompanyEmployeeReview } from "../../domain/entities/company-employee-review.entity";

export class CompanyEmployeeReviewRepository
  implements ICompanyEmployeeReviewRepository
{
  constructor(private prisma: PrismaClient) {}

  async create(data: any): Promise<any> {
    const review = await this.prisma.companyEmployeeReview.create({
      data: {
        appointmentId: data.appointmentId,
        reviewerId: data.reviewerId,
        employeeId: data.employeeId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        appointment: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
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
  }

  async findById(id: string): Promise<any | null> {
    const review = await this.prisma.companyEmployeeReview.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
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
  }

  async findByAppointmentId(appointmentId: string): Promise<any | null> {
    const review = await this.prisma.companyEmployeeReview.findUnique({
      where: { appointmentId },
      include: {
        appointment: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
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
  }

  async findMany(filters: any = {}): Promise<any[]> {
    const where: any = {};

    if (filters.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters.reviewerId) {
      where.reviewerId = filters.reviewerId;
    }

    if (filters.rating) {
      where.rating = filters.rating;
    }

    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    const reviews = await this.prisma.companyEmployeeReview.findMany({
      where,
      include: {
        appointment: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: filters.skip || 0,
      take: filters.take || 10,
    });

    return reviews;
  }

  async update(id: string, data: any): Promise<any> {
    const review = await this.prisma.companyEmployeeReview.update({
      where: { id },
      data: {
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        appointment: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
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
  }

  async delete(id: string): Promise<void> {
    await this.prisma.companyEmployeeReview.delete({
      where: { id },
    });
  }

  async findByEmployeeId(employeeId: string): Promise<any[]> {
    const reviews = await this.prisma.companyEmployeeReview.findMany({
      where: { employeeId },
      include: {
        appointment: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return reviews;
  }

  async findByReviewerId(reviewerId: string): Promise<any[]> {
    const reviews = await this.prisma.companyEmployeeReview.findMany({
      where: { reviewerId },
      include: {
        appointment: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            employee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return reviews;
  }

  async getAverageRating(employeeId: string): Promise<number> {
    const result = await this.prisma.companyEmployeeReview.aggregate({
      where: { employeeId },
      _avg: {
        rating: true,
      },
    });

    return result._avg.rating || 0;
  }

  async getRatingDistribution(employeeId: string): Promise<any> {
    const distribution = await this.prisma.companyEmployeeReview.groupBy({
      by: ["rating"],
      where: { employeeId },
      _count: {
        rating: true,
      },
    });

    return distribution.map((item) => ({
      rating: item.rating,
      count: item._count.rating,
    }));
  }

  async count(filters: any = {}): Promise<number> {
    const where: any = {};

    if (filters.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters.reviewerId) {
      where.reviewerId = filters.reviewerId;
    }

    if (filters.rating) {
      where.rating = filters.rating;
    }

    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    return await this.prisma.companyEmployeeReview.count({ where });
  }
}
