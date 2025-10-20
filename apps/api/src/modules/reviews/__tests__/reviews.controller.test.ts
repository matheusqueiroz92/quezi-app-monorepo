import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { ReviewsController } from "../reviews.controller";
import { ReviewsService } from "../reviews.service";
import { AppError } from "../../../utils/app-error";

// Mock do service
jest.mock("../reviews.service");

describe("ReviewsController", () => {
  let controller: ReviewsController;
  let serviceMock: any;
  let requestMock: any;
  let replyMock: any;

  beforeEach(() => {
    serviceMock = {
      createReview: jest.fn(),
      getReview: jest.fn(),
      getReviews: jest.fn(),
      updateReview: jest.fn(),
      deleteReview: jest.fn(),
      getReviewByAppointment: jest.fn(),
      getProfessionalStats: jest.fn(),
    };

    controller = new ReviewsController(serviceMock);

    requestMock = {
      user: { id: "user-1" },
      body: {},
      params: {},
      query: {},
    };

    replyMock = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe("createReview", () => {
    it("deve criar review com sucesso", async () => {
      const mockReview = {
        id: "clx1234567890abcdef",
        appointmentId: "clx0987654321fedcba",
        reviewerId: "user-1",
        professionalId: "prof-1",
        rating: 5,
        comment: "Excelente serviço!",
      };

      requestMock.body = {
        appointmentId: "clx0987654321fedcba",
        rating: 5,
        comment: "Excelente serviço!",
      };

      serviceMock.createReview.mockResolvedValue(mockReview);

      await controller.createReview(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(201);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        data: mockReview,
        message: "Avaliação criada com sucesso",
      });
    });

    it("deve retornar 401 se não autenticado", async () => {
      requestMock.user = undefined;
      requestMock.body = {
        appointmentId: "clx0987654321fedcba",
        rating: 5,
      };

      await controller.createReview(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(401);
    });

    it("deve tratar erros", async () => {
      requestMock.body = {
        appointmentId: "clx0987654321fedcba",
        rating: 5,
      };

      serviceMock.createReview.mockRejectedValue(new Error("DB error"));

      await controller.createReview(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getReview", () => {
    it("deve buscar review com sucesso", async () => {
      const mockReview = {
        id: "clx1234567890abcdef",
        rating: 5,
      };

      requestMock.params = { id: "clx1234567890abcdef" };

      serviceMock.getReview.mockResolvedValue(mockReview);

      await controller.getReview(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        data: mockReview,
      });
    });

    it("deve retornar 401 se não autenticado", async () => {
      requestMock.user = undefined;
      requestMock.params = { id: "clx1234567890abcdef" };

      await controller.getReview(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(401);
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

      requestMock.query = { page: "1", limit: "10" };

      serviceMock.getReviews.mockResolvedValue(mockResult);

      await controller.getReviews(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        data: mockResult.reviews,
        pagination: mockResult.pagination,
      });
    });

    it("deve tratar erros", async () => {
      requestMock.query = {};

      serviceMock.getReviews.mockRejectedValue(new Error("DB error"));

      await controller.getReviews(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(500);
    });
  });

  describe("updateReview", () => {
    it("deve atualizar review com sucesso", async () => {
      const mockReview = {
        id: "clx1234567890abcdef",
        rating: 4,
        comment: "Atualizado",
      };

      requestMock.params = { id: "clx1234567890abcdef" };
      requestMock.body = {
        rating: 4,
        comment: "Atualizado",
      };

      serviceMock.updateReview.mockResolvedValue(mockReview);

      await controller.updateReview(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        data: mockReview,
        message: "Avaliação atualizada com sucesso",
      });
    });

    it("deve tratar erros", async () => {
      requestMock.params = { id: "clx1234567890abcdef" };
      requestMock.body = { rating: 3 };

      serviceMock.updateReview.mockRejectedValue(new Error("Error"));

      await controller.updateReview(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(500);
    });
  });

  describe("deleteReview", () => {
    it("deve deletar review com sucesso", async () => {
      requestMock.params = { id: "clx1234567890abcdef" };

      serviceMock.deleteReview.mockResolvedValue({ success: true });

      await controller.deleteReview(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        message: "Avaliação deletada com sucesso",
      });
    });

    it("deve retornar 401 se não autenticado", async () => {
      requestMock.user = undefined;
      requestMock.params = { id: "clx1234567890abcdef" };

      await controller.deleteReview(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(401);
    });
  });

  describe("getReviewByAppointment", () => {
    it("deve buscar review por appointmentId", async () => {
      const mockReview = {
        id: "review-1",
        appointmentId: "clx0987654321fedcba",
        rating: 5,
      };

      requestMock.params = { appointmentId: "clx0987654321fedcba" };

      serviceMock.getReviewByAppointment.mockResolvedValue(mockReview);

      await controller.getReviewByAppointment(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        data: mockReview,
      });
    });

    it("deve tratar erros", async () => {
      requestMock.params = { appointmentId: "clx0987654321fedcba" };

      serviceMock.getReviewByAppointment.mockRejectedValue(new Error("Error"));

      await controller.getReviewByAppointment(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getProfessionalStats", () => {
    it("deve buscar estatísticas com sucesso", async () => {
      const mockStats = {
        professionalId: "clx1234567890abcdef",
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

      requestMock.query = { professionalId: "clx1234567890abcdef" };

      serviceMock.getProfessionalStats.mockResolvedValue(mockStats);

      await controller.getProfessionalStats(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(200);
      expect(replyMock.send).toHaveBeenCalledWith({
        success: true,
        data: mockStats,
      });
    });

    it("deve retornar 401 se não autenticado", async () => {
      requestMock.user = undefined;
      requestMock.query = { professionalId: "clx1234567890abcdef" };

      await controller.getProfessionalStats(requestMock, replyMock);

      expect(replyMock.status).toHaveBeenCalledWith(401);
    });
  });
});

