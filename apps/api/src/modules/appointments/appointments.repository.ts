import { PrismaClient } from "@prisma/client";
import { AppError } from "../../lib/errors";
import {
  CreateAppointmentInput,
  UpdateAppointmentInput,
  GetAppointmentsQuery,
  AppointmentParams,
  UpdateAppointmentStatusInput,
  CheckAvailabilityQuery,
  GetAppointmentStatsQuery,
  AppointmentStatus,
} from "./appointments.schema";

export class AppointmentsRepository {
  constructor(private prisma: PrismaClient) {}

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  async create(data: CreateAppointmentInput) {
    try {
      // Verificar se o serviço existe e pertence ao profissional
      const service = await this.prisma.service.findFirst({
        where: {
          id: data.serviceId,
          professionalId: data.professionalId,
        },
        include: {
          professional: true,
          category: true,
        },
      });

      if (!service) {
        throw new AppError(
          "Serviço não encontrado ou não pertence ao profissional",
          404
        );
      }

      // Verificar se o profissional existe
      const professional = await this.prisma.user.findUnique({
        where: { id: data.professionalId },
      });

      if (!professional || professional.userType !== "PROFESSIONAL") {
        throw new AppError("Profissional não encontrado", 404);
      }

      // Verificar se o cliente existe
      const client = await this.prisma.user.findUnique({
        where: { id: data.clientId },
      });

      if (!client) {
        throw new AppError("Cliente não encontrado", 404);
      }

      // Verificar conflitos de horário para o profissional
      const conflictingAppointment = await this.prisma.appointment.findFirst({
        where: {
          professionalId: data.professionalId,
          status: {
            in: ["PENDING", "ACCEPTED"],
          },
          scheduledDate: {
            gte: new Date(data.scheduledDate),
            lt: new Date(
              new Date(data.scheduledDate).getTime() +
                service.durationMinutes * 60000
            ),
          },
        },
      });

      if (conflictingAppointment) {
        throw new AppError(
          "Profissional já possui agendamento neste horário",
          409
        );
      }

      // Criar o agendamento
      const appointment = await this.prisma.appointment.create({
        data: {
          ...data,
          scheduledDate: new Date(data.scheduledDate),
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          professional: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          service: {
            include: {
              category: true,
            },
          },
        },
      });

      return appointment;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao criar agendamento", 500);
    }
  }

  async findById(id: string) {
    try {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          professional: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          service: {
            include: {
              category: true,
            },
          },
          review: true,
        },
      });

      if (!appointment) {
        throw new AppError("Agendamento não encontrado", 404);
      }

      return appointment;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao buscar agendamento", 500);
    }
  }

  async findMany(query: GetAppointmentsQuery) {
    try {
      const {
        page,
        limit,
        status,
        clientId,
        professionalId,
        serviceId,
        dateFrom,
        dateTo,
      } = query;

      const where: any = {};

      if (status) where.status = status;
      if (clientId) where.clientId = clientId;
      if (professionalId) where.professionalId = professionalId;
      if (serviceId) where.serviceId = serviceId;

      if (dateFrom || dateTo) {
        where.scheduledDate = {};
        if (dateFrom) where.scheduledDate.gte = new Date(dateFrom);
        if (dateTo) where.scheduledDate.lte = new Date(dateTo);
      }

      const [appointments, total] = await Promise.all([
        this.prisma.appointment.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {
            scheduledDate: "desc",
          },
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            professional: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            service: {
              include: {
                category: true,
              },
            },
            review: true,
          },
        }),
        this.prisma.appointment.count({ where }),
      ]);

      return {
        appointments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new AppError("Erro ao buscar agendamentos", 500);
    }
  }

  async update(id: string, data: UpdateAppointmentInput) {
    try {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id },
      });

      if (!appointment) {
        throw new AppError("Agendamento não encontrado", 404);
      }

      // Se está alterando a data, verificar conflitos
      if (data.scheduledDate) {
        const service = await this.prisma.service.findUnique({
          where: { id: appointment.serviceId },
        });

        if (service) {
          const conflictingAppointment =
            await this.prisma.appointment.findFirst({
              where: {
                id: { not: id },
                professionalId: appointment.professionalId,
                status: {
                  in: ["PENDING", "ACCEPTED"],
                },
                scheduledDate: {
                  gte: new Date(data.scheduledDate),
                  lt: new Date(
                    new Date(data.scheduledDate).getTime() +
                      service.durationMinutes * 60000
                  ),
                },
              },
            });

          if (conflictingAppointment) {
            throw new AppError(
              "Profissional já possui agendamento neste horário",
              409
            );
          }
        }
      }

      const updatedAppointment = await this.prisma.appointment.update({
        where: { id },
        data: {
          ...data,
          ...(data.scheduledDate && {
            scheduledDate: new Date(data.scheduledDate),
          }),
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          professional: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          service: {
            include: {
              category: true,
            },
          },
          review: true,
        },
      });

      return updatedAppointment;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar agendamento", 500);
    }
  }

  async delete(id: string) {
    try {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id },
      });

      if (!appointment) {
        throw new AppError("Agendamento não encontrado", 404);
      }

      // Verificar se pode ser deletado (apenas se PENDING)
      if (appointment.status !== "PENDING") {
        throw new AppError(
          "Apenas agendamentos pendentes podem ser cancelados",
          400
        );
      }

      await this.prisma.appointment.delete({
        where: { id },
      });

      return { success: true };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao cancelar agendamento", 500);
    }
  }

  // ========================================
  // STATUS OPERATIONS
  // ========================================

  async updateStatus(id: string, data: UpdateAppointmentStatusInput) {
    try {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id },
      });

      if (!appointment) {
        throw new AppError("Agendamento não encontrado", 404);
      }

      const updatedAppointment = await this.prisma.appointment.update({
        where: { id },
        data: {
          status: data.status,
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          professional: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          service: {
            include: {
              category: true,
            },
          },
          review: true,
        },
      });

      return updatedAppointment;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar status do agendamento", 500);
    }
  }

  // ========================================
  // AVAILABILITY OPERATIONS
  // ========================================

  async checkAvailability(query: CheckAvailabilityQuery) {
    try {
      const { professionalId, serviceId, date } = query;

      // Verificar se o serviço existe e pertence ao profissional
      const service = await this.prisma.service.findFirst({
        where: {
          id: serviceId,
          professionalId,
        },
      });

      if (!service) {
        throw new AppError(
          "Serviço não encontrado ou não pertence ao profissional",
          404
        );
      }

      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      // Buscar agendamentos existentes no dia
      const existingAppointments = await this.prisma.appointment.findMany({
        where: {
          professionalId,
          status: {
            in: ["PENDING", "ACCEPTED"],
          },
          scheduledDate: {
            gte: startDate,
            lt: endDate,
          },
        },
        select: {
          scheduledDate: true,
          service: {
            select: {
              durationMinutes: true,
            },
          },
        },
      });

      // Gerar slots de horário (8h às 18h, intervalos de 30 minutos)
      const slots = [];
      const startHour = 8;
      const endHour = 18;

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotTime = new Date(startDate);
          slotTime.setHours(hour, minute, 0, 0);

          const slotEndTime = new Date(
            slotTime.getTime() + service.durationMinutes * 60000
          );

          // Verificar se o slot conflita com algum agendamento
          const hasConflict = existingAppointments.some((appointment) => {
            const appointmentEnd = new Date(
              appointment.scheduledDate.getTime() +
                appointment.service.durationMinutes * 60000
            );

            return (
              (slotTime >= appointment.scheduledDate &&
                slotTime < appointmentEnd) ||
              (slotEndTime > appointment.scheduledDate &&
                slotEndTime <= appointmentEnd) ||
              (slotTime <= appointment.scheduledDate &&
                slotEndTime >= appointmentEnd)
            );
          });

          slots.push({
            time: slotTime.toTimeString().slice(0, 5),
            available: !hasConflict,
            reason: hasConflict ? "Horário já ocupado" : undefined,
          });
        }
      }

      return {
        date,
        professionalId,
        serviceId,
        availableSlots: slots,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao verificar disponibilidade", 500);
    }
  }

  // ========================================
  // STATISTICS OPERATIONS
  // ========================================

  async getStats(query: GetAppointmentStatsQuery) {
    try {
      const { professionalId, clientId, dateFrom, dateTo } = query;

      const where: any = {};

      if (professionalId) where.professionalId = professionalId;
      if (clientId) where.clientId = clientId;

      if (dateFrom || dateTo) {
        where.scheduledDate = {};
        if (dateFrom) where.scheduledDate.gte = new Date(dateFrom);
        if (dateTo) where.scheduledDate.lte = new Date(dateTo);
      }

      const [stats, avgRating] = await Promise.all([
        this.prisma.appointment.groupBy({
          by: ["status"],
          where,
          _count: {
            status: true,
          },
        }),
        this.prisma.review.aggregate({
          where: {
            appointment: where,
          },
          _avg: {
            rating: true,
          },
        }),
      ]);

      const statusCounts = {
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        completed: 0,
      };

      stats.forEach((stat) => {
        const count = stat._count.status;
        statusCounts.total += count;
        statusCounts[stat.status.toLowerCase() as keyof typeof statusCounts] =
          count;
      });

      const completionRate =
        statusCounts.total > 0
          ? (statusCounts.completed / statusCounts.total) * 100
          : 0;

      return {
        ...statusCounts,
        completionRate: Math.round(completionRate * 100) / 100,
        averageRating: avgRating._avg.rating || null,
      };
    } catch (error) {
      throw new AppError("Erro ao buscar estatísticas", 500);
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  async findByUser(userId: string, userType: "CLIENT" | "PROFESSIONAL") {
    try {
      const where =
        userType === "CLIENT"
          ? { clientId: userId }
          : { professionalId: userId };

      const appointments = await this.prisma.appointment.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          professional: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          service: {
            include: {
              category: true,
            },
          },
          review: true,
        },
        orderBy: {
          scheduledDate: "desc",
        },
      });

      return appointments;
    } catch (error) {
      throw new AppError("Erro ao buscar agendamentos do usuário", 500);
    }
  }

  async countByStatus(status: AppointmentStatus) {
    try {
      return await this.prisma.appointment.count({
        where: { status },
      });
    } catch (error) {
      throw new AppError("Erro ao contar agendamentos", 500);
    }
  }
}
