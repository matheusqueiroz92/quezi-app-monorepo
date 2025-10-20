import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { ReviewsRepository } from "../reviews.repository";
import { AppError } from "../../../utils/app-error";

// Mock do Prisma Client
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(),
}));

describe("ReviewsRepository", () => {
  let repository: ReviewsRepository;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      review: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn(),
      },
      appointment: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      professionalProfile: {
        update: jest.fn(),
      },
    };

    repository = new ReviewsRepository(prismaMock as any);
  });

  describe("create", () => {
    it("deve criar review com sucesso", async () => {
      const mockAppointment = {
        id: "appt-1",
        status: "COMPLETED",
        service: { id: "service-1", name: "Service" },
      };

      const mockReview = {
        id: "review-1",
        appointmentId: "appt-1",
        reviewerId: "client-1",
        professionalId: "prof-1",
        rating: 5,
        comment: "Excelente!",
        createdAt: new Date(),
        updatedAt: new Date(),
        reviewer: {
          id: "client-1",
          name: "Cliente",
          email: "cliente@test.com",
        },
        appointment: mockAppointment,
      };

      prismaMock.appointment.findUnique.mockResolvedValue(mockAppointment);
      prismaMock.review.findUnique.mockResolvedValue(null);
      prismaMock.review.create.mockResolvedValue(mockReview);
      prismaMock.review.aggregate.mockResolvedValue({
        _avg: { rating: 5 },
        _count: { id: 1 },
      });

      const input = {
        appointmentId: "appt-1",
        reviewerId: "client-1",
        professionalId: "prof-1",
        rating: 5,
        comment: "Excelente!",
      };

      const result = await repository.create(input);

      expect(result).toEqual(mockReview);
      expect(prismaMock.review.create).toHaveBeenCalled();
      expect(prismaMock.appointment.update).toHaveBeenCalledWith({
        where: { id: "appt-1" },
        data: { isReviewed: true },
      });
    });

    it("deve lançar erro se agendamento não existir", async () => {
      prismaMock.appointment.findUnique.mockResolvedValue(null);

      const input = {
        appointmentId: "non-existent",
        reviewerId: "client-1",
        professionalId: "prof-1",
        rating: 5,
      };

      await expect(repository.create(input)).rejects.toThrow(AppError);
      await expect(repository.create(input)).rejects.toThrow(
        "Agendamento não encontrado"
      );
    });

    it("deve lançar erro se agendamento não estiver concluído", async () => {
      const mockAppointment = {
        id: "appt-1",
        status: "PENDING",
      };

      prismaMock.appointment.findUnique.mockResolvedValue(mockAppointment);

      const input = {
        appointmentId: "appt-1",
        reviewerId: "client-1",
        professionalId: "prof-1",
        rating: 5,
      };

      await expect(repository.create(input)).rejects.toThrow(AppError);
      await expect(repository.create(input)).rejects.toThrow(
        "Apenas agendamentos concluídos podem ser avaliados"
      );
    });

    it("deve lançar erro se já existir review para o agendamento", async () => {
      const mockAppointment = {
        id: "appt-1",
        status: "COMPLETED",
      };

      const existingReview = {
        id: "review-1",
        appointmentId: "appt-1",
      };

      prismaMock.appointment.findUnique.mockResolvedValue(mockAppointment);
      prismaMock.review.findUnique.mockResolvedValue(existingReview);

      const input = {
        appointmentId: "appt-1",
        reviewerId: "client-1",
        professionalId: "prof-1",
        rating: 5,
      };

      await expect(repository.create(input)).rejects.toThrow(AppError);
      await expect(repository.create(input)).rejects.toThrow(
        "Este agendamento já foi avaliado"
      );
    });
  });

  describe("findById", () => {
    it("deve buscar review por ID", async () => {
      const mockReview = {
        id: "review-1",
        rating: 5,
        comment: "Ótimo",
        reviewer: {
          id: "client-1",
          name: "Cliente",
          email: "cliente@test.com",
        },
        appointment: {
          professional: {
            id: "prof-1",
            name: "Profissional",
            email: "prof@test.com",
          },
          service: {
            id: "service-1",
            name: "Service",
            category: { id: "cat-1", name: "Category" },
          },
        },
      };

      prismaMock.review.findUnique.mockResolvedValue(mockReview);

      const result = await repository.findById("review-1");

      expect(result).toEqual(mockReview);
    });

    it("deve lançar erro se review não encontrada", async () => {
      prismaMock.review.findUnique.mockResolvedValue(null);

      await expect(repository.findById("non-existent")).rejects.toThrow(
        AppError
      );
      await expect(repository.findById("non-existent")).rejects.toThrow(
        "Avaliação não encontrada"
      );
    });
  });

  describe("findMany", () => {
    it("deve listar reviews com paginação", async () => {
      const mockReviews = [
        { id: "review-1", rating: 5 },
        { id: "review-2", rating: 4 },
      ];

      prismaMock.review.findMany.mockResolvedValue(mockReviews);
      prismaMock.review.count.mockResolvedValue(2);

      const query = {
        page: 1,
        limit: 10,
      };

      const result = await repository.findMany(query);

      expect(result.reviews).toEqual(mockReviews);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it("deve filtrar por professionalId", async () => {
      prismaMock.review.findMany.mockResolvedValue([]);
      prismaMock.review.count.mockResolvedValue(0);

      const query = {
        page: 1,
        limit: 10,
        professionalId: "prof-1",
      };

      await repository.findMany(query);

      expect(prismaMock.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            professionalId: "prof-1",
          }),
        })
      );
    });

    it("deve filtrar por minRating e maxRating", async () => {
      prismaMock.review.findMany.mockResolvedValue([]);
      prismaMock.review.count.mockResolvedValue(0);

      const query = {
        page: 1,
        limit: 10,
        minRating: 4,
        maxRating: 5,
      };

      await repository.findMany(query);

      expect(prismaMock.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            rating: {
              gte: 4,
              lte: 5,
            },
          }),
        })
      );
    });
  });

  describe("update", () => {
    it("deve atualizar review com sucesso", async () => {
      const existingReview = {
        id: "review-1",
        professionalId: "prof-1",
        rating: 4,
      };

      const updatedReview = {
        ...existingReview,
        rating: 5,
        comment: "Atualizado",
      };

      prismaMock.review.findUnique.mockResolvedValue(existingReview);
      prismaMock.review.update.mockResolvedValue(updatedReview);
      prismaMock.review.aggregate.mockResolvedValue({
        _avg: { rating: 5 },
        _count: { id: 1 },
      });

      const result = await repository.update("review-1", {
        rating: 5,
        comment: "Atualizado",
      });

      expect(result.rating).toBe(5);
    });

    it("deve lançar erro se review não encontrada", async () => {
      prismaMock.review.findUnique.mockResolvedValue(null);

      await expect(
        repository.update("non-existent", { rating: 5 })
      ).rejects.toThrow(AppError);
    });
  });

  describe("delete", () => {
    it("deve deletar review com sucesso", async () => {
      const mockReview = {
        id: "review-1",
        appointmentId: "appt-1",
        professionalId: "prof-1",
        appointment: { id: "appt-1" },
      };

      prismaMock.review.findUnique.mockResolvedValue(mockReview);
      prismaMock.review.delete.mockResolvedValue(mockReview);
      prismaMock.review.aggregate.mockResolvedValue({
        _avg: { rating: 0 },
        _count: { id: 0 },
      });

      const result = await repository.delete("review-1");

      expect(result).toEqual({ success: true });
      expect(prismaMock.appointment.update).toHaveBeenCalledWith({
        where: { id: "appt-1" },
        data: { isReviewed: false },
      });
    });

    it("deve lançar erro se review não encontrada", async () => {
      prismaMock.review.findUnique.mockResolvedValue(null);

      await expect(repository.delete("non-existent")).rejects.toThrow(AppError);
    });
  });

  describe("findByAppointment", () => {
    it("deve buscar review por appointmentId", async () => {
      const mockReview = {
        id: "review-1",
        appointmentId: "appt-1",
        rating: 5,
      };

      prismaMock.review.findUnique.mockResolvedValue(mockReview);

      const result = await repository.findByAppointment("appt-1");

      expect(result).toEqual(mockReview);
    });

    it("deve retornar null se não houver review", async () => {
      prismaMock.review.findUnique.mockResolvedValue(null);

      const result = await repository.findByAppointment("appt-no-review");

      expect(result).toBeNull();
    });
  });

  describe("getProfessionalStats", () => {
    it("deve retornar estatísticas do profissional", async () => {
      const mockReviews = [
        { rating: 5 },
        { rating: 4 },
        { rating: 5 },
        { rating: 3 },
      ];

      prismaMock.review.findMany
        .mockResolvedValueOnce(mockReviews)
        .mockResolvedValueOnce([{ id: "review-1", rating: 5 }]);

      const result = await repository.getProfessionalStats({
        professionalId: "prof-1",
      });

      expect(result.totalReviews).toBe(4);
      expect(result.averageRating).toBe(4.25);
      expect(result.ratingDistribution["5"]).toBe(2);
      expect(result.ratingDistribution["4"]).toBe(1);
      expect(result.ratingDistribution["3"]).toBe(1);
    });

    it("deve retornar estatísticas vazias se não houver reviews", async () => {
      prismaMock.review.findMany.mockResolvedValue([]);

      const result = await repository.getProfessionalStats({
        professionalId: "prof-no-reviews",
      });

      expect(result.totalReviews).toBe(0);
      expect(result.averageRating).toBe(0);
      expect(result.recentReviews).toEqual([]);
    });
  });

  describe("findByProfessional", () => {
    it("deve buscar reviews do profissional", async () => {
      const mockReviews = [
        { id: "review-1", professionalId: "prof-1", rating: 5 },
        { id: "review-2", professionalId: "prof-1", rating: 4 },
      ];

      prismaMock.review.findMany.mockResolvedValue(mockReviews);

      const result = await repository.findByProfessional("prof-1");

      expect(result).toEqual(mockReviews);
    });

    it("deve respeitar limite customizado", async () => {
      prismaMock.review.findMany.mockResolvedValue([]);

      await repository.findByProfessional("prof-1", 5);

      expect(prismaMock.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        })
      );
    });
  });

  describe("countByProfessional", () => {
    it("deve contar reviews do profissional", async () => {
      prismaMock.review.count.mockResolvedValue(15);

      const result = await repository.countByProfessional("prof-1");

      expect(result).toBe(15);
    });
  });
});

