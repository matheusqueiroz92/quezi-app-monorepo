/**
 * Repositório OfferedService - Camada de Infraestrutura
 *
 * Implementação concreta para persistência de serviços oferecidos
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { OfferedService } from "../../domain/entities/offered-service.entity";
import { prisma } from "../../lib/prisma";
import { BadRequestError, NotFoundError } from "../../utils/app-error";

/**
 * Repositório concreto para OfferedService
 */
export class OfferedServiceRepository {
  /**
   * Cria um novo serviço oferecido
   */
  async create(data: any): Promise<OfferedService> {
    try {
      const service = await prisma.service.create({
        data: {
          id: data.id,
          professionalId: data.professionalId,
          categoryId: data.categoryId,
          name: data.name,
          description: data.description,
          price: data.price,
          priceType: data.priceType,
          duration: data.duration,
          serviceMode: data.serviceMode,
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      });

      return OfferedService.fromPersistence(service);
    } catch (error: any) {
      throw new BadRequestError(`Erro ao criar serviço: ${error.message}`);
    }
  }

  /**
   * Busca serviço por ID
   */
  async findById(id: string): Promise<OfferedService | null> {
    try {
      const service = await prisma.service.findUnique({
        where: { id },
        include: {
          professional: true,
          category: true,
        },
      });

      if (!service) {
        return null;
      }

      return OfferedService.fromPersistence(service);
    } catch (error: any) {
      throw new BadRequestError(`Erro ao buscar serviço: ${error.message}`);
    }
  }

  /**
   * Lista serviços com filtros
   */
  async findMany(filters: any): Promise<any> {
    try {
      const {
        skip = 0,
        take = 10,
        professionalId,
        categoryId,
        isActive,
        search,
      } = filters;

      const where: any = {};
      if (professionalId) where.professionalId = professionalId;
      if (categoryId) where.categoryId = categoryId;
      if (isActive !== undefined) where.isActive = isActive;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const [services, total] = await Promise.all([
        prisma.service.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
          include: {
            professional: true,
            category: true,
          },
        }),
        prisma.service.count({ where }),
      ]);

      return {
        data: services.map((service) =>
          OfferedService.fromPersistence(service)
        ),
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        hasNext: skip + take < total,
        hasPrev: skip > 0,
      };
    } catch (error: any) {
      throw new BadRequestError(`Erro ao listar serviços: ${error.message}`);
    }
  }

  /**
   * Atualiza serviço
   */
  async update(id: string, data: any): Promise<OfferedService> {
    try {
      const service = await prisma.service.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          priceType: data.priceType,
          duration: data.duration,
          serviceMode: data.serviceMode,
          isActive: data.isActive,
        },
      });

      return OfferedService.fromPersistence(service);
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new NotFoundError("Serviço não encontrado");
      }
      throw new BadRequestError(`Erro ao atualizar serviço: ${error.message}`);
    }
  }

  /**
   * Remove serviço
   */
  async delete(id: string): Promise<void> {
    try {
      await prisma.service.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new NotFoundError("Serviço não encontrado");
      }
      throw new BadRequestError(`Erro ao remover serviço: ${error.message}`);
    }
  }

  /**
   * Verifica se serviço existe
   */
  async exists(id: string): Promise<boolean> {
    try {
      const service = await prisma.service.findUnique({
        where: { id },
        select: { id: true },
      });

      return !!service;
    } catch (error: any) {
      throw new BadRequestError(`Erro ao verificar serviço: ${error.message}`);
    }
  }

  /**
   * Busca serviços por profissional
   */
  async findByProfessional(professionalId: string): Promise<OfferedService[]> {
    try {
      const services = await prisma.service.findMany({
        where: { professionalId },
        include: {
          category: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return services.map((service) => OfferedService.fromPersistence(service));
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao buscar serviços do profissional: ${error.message}`
      );
    }
  }

  /**
   * Busca serviços por categoria
   */
  async findByCategory(categoryId: string): Promise<OfferedService[]> {
    try {
      const services = await prisma.service.findMany({
        where: { categoryId, isActive: true },
        include: {
          professional: true,
          category: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return services.map((service) => OfferedService.fromPersistence(service));
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao buscar serviços da categoria: ${error.message}`
      );
    }
  }

  /**
   * Ativa serviço
   */
  async activate(id: string): Promise<OfferedService> {
    try {
      const service = await prisma.service.update({
        where: { id },
        data: { isActive: true },
      });

      return OfferedService.fromPersistence(service);
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new NotFoundError("Serviço não encontrado");
      }
      throw new BadRequestError(`Erro ao ativar serviço: ${error.message}`);
    }
  }

  /**
   * Desativa serviço
   */
  async deactivate(id: string): Promise<OfferedService> {
    try {
      const service = await prisma.service.update({
        where: { id },
        data: { isActive: false },
      });

      return OfferedService.fromPersistence(service);
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new NotFoundError("Serviço não encontrado");
      }
      throw new BadRequestError(`Erro ao desativar serviço: ${error.message}`);
    }
  }
}
