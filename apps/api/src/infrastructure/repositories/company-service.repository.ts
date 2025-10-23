/**
 * Repositório CompanyService - Camada de Infraestrutura
 *
 * Implementação concreta para persistência de serviços de empresa
 * Seguindo os princípios SOLID e Clean Architecture
 */

import { CompanyService } from "../../domain/entities/company-service.entity";
import { prisma } from "../../lib/prisma";
import { BadRequestError, NotFoundError } from "../../utils/app-error";

/**
 * Repositório concreto para CompanyService
 */
export class CompanyServiceRepository {
  /**
   * Cria um novo serviço de empresa
   */
  async create(data: any): Promise<CompanyService> {
    try {
      const service = await prisma.companyService.create({
        data: {
          id: data.id,
          companyId: data.companyId,
          categoryId: data.categoryId,
          name: data.name,
          description: data.description,
          price: data.price,
          priceType: data.priceType,
          duration: data.duration,
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      });

      return CompanyService.fromPersistence(service);
    } catch (error: any) {
      throw new BadRequestError(`Erro ao criar serviço: ${error.message}`);
    }
  }

  /**
   * Busca serviço por ID
   */
  async findById(id: string): Promise<CompanyService | null> {
    try {
      const service = await prisma.companyService.findUnique({
        where: { id },
        include: {
          company: true,
          category: true,
        },
      });

      if (!service) {
        return null;
      }

      return CompanyService.fromPersistence(service);
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
        companyId,
        categoryId,
        isActive,
        search,
      } = filters;

      const where: any = {};
      if (companyId) where.companyId = companyId;
      if (categoryId) where.categoryId = categoryId;
      if (isActive !== undefined) where.isActive = isActive;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const [services, total] = await Promise.all([
        prisma.companyService.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
          include: {
            company: true,
            category: true,
          },
        }),
        prisma.companyService.count({ where }),
      ]);

      return {
        data: services.map((service) =>
          CompanyService.fromPersistence(service)
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
  async update(id: string, data: any): Promise<CompanyService> {
    try {
      const service = await prisma.companyService.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          priceType: data.priceType,
          duration: data.duration,
          isActive: data.isActive,
        },
      });

      return CompanyService.fromPersistence(service);
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
      await prisma.companyService.delete({
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
      const service = await prisma.companyService.findUnique({
        where: { id },
        select: { id: true },
      });

      return !!service;
    } catch (error: any) {
      throw new BadRequestError(`Erro ao verificar serviço: ${error.message}`);
    }
  }

  /**
   * Busca serviços por empresa
   */
  async findByCompany(companyId: string): Promise<CompanyService[]> {
    try {
      const services = await prisma.companyService.findMany({
        where: { companyId },
        include: {
          category: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return services.map((service) => CompanyService.fromPersistence(service));
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao buscar serviços da empresa: ${error.message}`
      );
    }
  }

  /**
   * Busca serviços por categoria
   */
  async findByCategory(categoryId: string): Promise<CompanyService[]> {
    try {
      const services = await prisma.companyService.findMany({
        where: { categoryId, isActive: true },
        include: {
          company: true,
          category: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return services.map((service) => CompanyService.fromPersistence(service));
    } catch (error: any) {
      throw new BadRequestError(
        `Erro ao buscar serviços da categoria: ${error.message}`
      );
    }
  }

  /**
   * Ativa serviço
   */
  async activate(id: string): Promise<CompanyService> {
    try {
      const service = await prisma.companyService.update({
        where: { id },
        data: { isActive: true },
      });

      return CompanyService.fromPersistence(service);
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
  async deactivate(id: string): Promise<CompanyService> {
    try {
      const service = await prisma.companyService.update({
        where: { id },
        data: { isActive: false },
      });

      return CompanyService.fromPersistence(service);
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new NotFoundError("Serviço não encontrado");
      }
      throw new BadRequestError(`Erro ao desativar serviço: ${error.message}`);
    }
  }
}
