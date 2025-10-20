import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { ReviewsService } from "../reviews.service";
import { ReviewsRepository } from "../reviews.repository";
import { AppError } from "../../../utils/app-error";

// Mock do repository
jest.mock("../reviews.repository");

describe("ReviewsService", () => {
  let service: ReviewsService;
  let repositoryMock: any;

  beforeEach(() => {
    repositoryMock = {
      create: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByAppointment: jest.fn(),
      getProfessionalStats: jest.fn(),
      findByProfessional: jest.fn(),
      countByProfessional: jest.fn(),
    };

    service = new ReviewsService(repositoryMock);
  });

  describe("createReview", () => {
    it("deve criar review com sucesso", async () => {
      const mockReview = {
        id: "review-1",
        appointmentId: "appt-1",
        reviewerId: "client-1",
        professionalId: "prof-1",
        rating: 5,
        comment: "Excelente!",
      };

      repositoryMock.create.mockResolvedValue(mockReview);

      const input = {
        appointmentId: "appt-1",
        rating: 5,
        comment: "Excelente!",
      };

      const result = await service.createReview(input, "client-1");

      expect(result).toEqual(mockReview);
    });
  });

  describe("getReview", () => {
    it("deve buscar review se usuário tem permissão", async () => {
      const mockReview = {
        id: "review-1",
        reviewerId: "client-1",
        professionalId: "prof-1",
        rating: 5,
      };

      repositoryMock.findById.mockResolvedValue(mockReview);

      const result = await service.getReview({ id: "review-1" }, "client-1");

      expect(result).toEqual(mockReview);
    });

    it("deve lançar erro se usuário sem permissão", async () => {
      const mockReview = {
        id: "review-1",
        reviewerId: "client-1",
        professionalId: "prof-1",
      };

      repositoryMock.findById.mockResolvedValue(mockReview);

      await expect(
        service.getReview({ id: "review-1" }, "other-user")
      ).rejects.toThrow(AppError);
      await expect(
        service.getReview({ id: "review-1" }, "other-user")
      ).rejects.toThrow("Você não tem permissão para acessar esta avaliação");
    });

    it("deve permitir acesso ao profissional avaliado", async () => {
      const mockReview = {
        id: "review-1",
        reviewerId: "client-1",
        professionalId: "prof-1",
      };

      repositoryMock.findById.mockResolvedValue(mockReview);

      const result = await service.getReview({ id: "review-1" }, "prof-1");

      expect(result).toEqual(mockReview);
    });
  });

  describe("getReviews", () => {
    it("deve listar reviews com sucesso", async () => {
      const mockResult = {
        reviews: [
          { id: "review-1", rating: 5 },
          { id: "review-2", rating: 4 },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      repositoryMock.findMany.mockResolvedValue(mockResult);

      const result = await service.getReviews({ page: 1, limit: 10 }, "user-1");

      expect(result).toEqual(mockResult);
    });
  });

  describe("updateReview", () => {
    it("deve atualizar review com sucesso", async () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 5); // 5 dias atrás

      const mockReview = {
        id: "review-1",
        reviewerId: "client-1",
        professionalId: "prof-1",
        rating: 4,
        createdAt: recentDate,
      };

      const updatedReview = {
        ...mockReview,
        rating: 5,
        comment: "Atualizado",
      };

      repositoryMock.findById.mockResolvedValue(mockReview);
      repositoryMock.update.mockResolvedValue(updatedReview);

      const result = await service.updateReview(
        { id: "review-1" },
        { rating: 5, comment: "Atualizado" },
        "client-1"
      );

      expect(result.rating).toBe(5);
    });

    it("deve lançar erro se não for o autor", async () => {
      const mockReview = {
        id: "review-1",
        reviewerId: "client-1",
        createdAt: new Date(),
      };

      repositoryMock.findById.mockResolvedValue(mockReview);

      await expect(
        service.updateReview(
          { id: "review-1" },
          { rating: 3 },
          "other-user"
        )
      ).rejects.toThrow(AppError);
      await expect(
        service.updateReview(
          { id: "review-1" },
          { rating: 3 },
          "other-user"
        )
      ).rejects.toThrow("Apenas o autor pode modificar esta avaliação");
    });

    it("deve lançar erro se review for muito antiga (>30 dias)", async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);

      const mockReview = {
        id: "review-1",
        reviewerId: "client-1",
        createdAt: oldDate,
      };

      repositoryMock.findById.mockResolvedValue(mockReview);

      await expect(
        service.updateReview(
          { id: "review-1" },
          { rating: 3 },
          "client-1"
        )
      ).rejects.toThrow(AppError);
      await expect(
        service.updateReview(
          { id: "review-1" },
          { rating: 3 },
          "client-1"
        )
      ).rejects.toThrow(
        "Avaliações só podem ser editadas até 30 dias após criação"
      );
    });
  });

  describe("deleteReview", () => {
    it("deve deletar review com sucesso", async () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 3);

      const mockReview = {
        id: "review-1",
        reviewerId: "client-1",
        createdAt: recentDate,
      };

      repositoryMock.findById.mockResolvedValue(mockReview);
      repositoryMock.delete.mockResolvedValue({ success: true });

      const result = await service.deleteReview({ id: "review-1" }, "client-1");

      expect(result).toEqual({ success: true });
    });

    it("deve lançar erro se não for o autor", async () => {
      const mockReview = {
        id: "review-1",
        reviewerId: "client-1",
        createdAt: new Date(),
      };

      repositoryMock.findById.mockResolvedValue(mockReview);

      await expect(
        service.deleteReview({ id: "review-1" }, "other-user")
      ).rejects.toThrow("Apenas o autor pode modificar esta avaliação");
    });

    it("deve lançar erro se review for muito antiga (>7 dias)", async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 8);

      const mockReview = {
        id: "review-1",
        reviewerId: "client-1",
        createdAt: oldDate,
      };

      repositoryMock.findById.mockResolvedValue(mockReview);

      await expect(
        service.deleteReview({ id: "review-1" }, "client-1")
      ).rejects.toThrow(
        "Avaliações só podem ser deletadas até 7 dias após criação"
      );
    });
  });

  describe("getReviewByAppointment", () => {
    it("deve buscar review por appointmentId", async () => {
      const mockReview = {
        id: "review-1",
        appointmentId: "appt-1",
        reviewerId: "client-1",
        professionalId: "prof-1",
      };

      repositoryMock.findByAppointment.mockResolvedValue(mockReview);

      const result = await service.getReviewByAppointment(
        { appointmentId: "appt-1" },
        "client-1"
      );

      expect(result).toEqual(mockReview);
    });

    it("deve lançar erro se não houver review", async () => {
      repositoryMock.findByAppointment.mockResolvedValue(null);

      await expect(
        service.getReviewByAppointment({ appointmentId: "appt-1" }, "client-1")
      ).rejects.toThrow("Avaliação não encontrada para este agendamento");
    });
  });

  describe("getProfessionalStats", () => {
    it("deve buscar estatísticas do profissional", async () => {
      const mockStats = {
        professionalId: "prof-1",
        totalReviews: 10,
        averageRating: 4.5,
        ratingDistribution: {
          "1": 0,
          "2": 1,
          "3": 2,
          "4": 3,
          "5": 4,
        },
        recentReviews: [],
      };

      repositoryMock.getProfessionalStats.mockResolvedValue(mockStats);

      const result = await service.getProfessionalStats(
        { professionalId: "prof-1" },
        "any-user"
      );

      expect(result).toEqual(mockStats);
    });
  });
});

