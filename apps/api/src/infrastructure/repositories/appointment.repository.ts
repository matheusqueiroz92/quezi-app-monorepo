/**
 * AppointmentRepository
 *
 * Repositório para persistência de agendamentos
 * Camada de Infraestrutura - Clean Architecture
 *
 * Responsabilidades:
 * - Acesso aos dados de agendamentos
 * - Implementação de queries otimizadas
 * - Mapeamento entre domínio e banco de dados
 */

import { PrismaClient } from "@prisma/client";
import { IAppointmentRepository } from "../../domain/interfaces/repository.interface";

export class AppointmentRepository implements IAppointmentRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: any): Promise<any> {
    const appointment = await this.prisma.appointment.create({
      data: {
        clientId: data.clientId,
        professionalId: data.professionalId,
        serviceId: data.serviceId,
        scheduledDate: data.scheduledDate,
        status: data.status || "PENDING",
        locationType: data.locationType || "AT_LOCATION",
        clientAddress: data.clientAddress,
        clientNotes: data.clientNotes,
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
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            durationMinutes: true,
            priceType: true,
          },
        },
      },
    });

    return appointment;
  }

  async findById(id: string): Promise<any | null> {
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
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            durationMinutes: true,
            priceType: true,
          },
        },
      },
    });

    return appointment;
  }

  async findByUserId(userId: string): Promise<any[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: { clientId: userId },
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
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            durationMinutes: true,
            priceType: true,
          },
        },
      },
      orderBy: { scheduledDate: "desc" },
    });

    return appointments;
  }

  async findByProfessionalId(professionalId: string): Promise<any[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: { professionalId },
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
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            durationMinutes: true,
            priceType: true,
          },
        },
      },
      orderBy: { scheduledDate: "desc" },
    });

    return appointments;
  }

  async findByCompanyEmployeeId(companyEmployeeId: string): Promise<any[]> {
    // Para agendamentos de funcionários da empresa, usamos CompanyEmployeeAppointment
    const appointments = await this.prisma.companyEmployeeAppointment.findMany({
      where: { employeeId: companyEmployeeId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            durationMinutes: true,
            priceType: true,
          },
        },
      },
      orderBy: { scheduledDate: "desc" },
    });

    return appointments;
  }

  async update(id: string, data: any): Promise<any> {
    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        scheduledDate: data.scheduledDate,
        status: data.status,
        locationType: data.locationType,
        clientAddress: data.clientAddress,
        clientNotes: data.clientNotes,
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
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            durationMinutes: true,
            priceType: true,
          },
        },
      },
    });

    return appointment;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.appointment.delete({
      where: { id },
    });
  }

  async findMany(filters: any = {}): Promise<any[]> {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.professionalId) {
      where.professionalId = filters.professionalId;
    }

    if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters.startDate && filters.endDate) {
      where.scheduledDate = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

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
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            durationMinutes: true,
            priceType: true,
          },
        },
      },
      orderBy: { scheduledDate: "desc" },
      skip: filters.skip || 0,
      take: filters.take || 10,
    });

    return appointments;
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        scheduledDate: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: "REJECTED", // Usando status correto do enum
        },
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
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            durationMinutes: true,
            priceType: true,
          },
        },
      },
      orderBy: { scheduledDate: "asc" },
    });

    return appointments;
  }

  async findByStatus(status: string): Promise<any[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: { status: status as any }, // Cast para o enum correto
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
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            durationMinutes: true,
            priceType: true,
          },
        },
      },
      orderBy: { scheduledDate: "desc" },
    });

    return appointments;
  }

  async count(filters: any = {}): Promise<number> {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.professionalId) {
      where.professionalId = filters.professionalId;
    }

    if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters.startDate && filters.endDate) {
      where.scheduledDate = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    return await this.prisma.appointment.count({ where });
  }
}
