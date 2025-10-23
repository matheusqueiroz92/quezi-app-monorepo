/**
 * Testes unitários para ReviewService
 * Seguindo TDD e garantindo máxima cobertura
 */

import { ReviewService } from "../review.service";
import { ReviewRepository } from "../../../infrastructure/repositories/review.repository";
import { BadRequestError, NotFoundError } from "../../../utils/app-error";

// Mock do repositório
jest.mock("../../../infrastructure/repositories/review.repository");
const MockedReviewRepository = ReviewRepository as jest.MockedClass<
  typeof ReviewRepository
>;

describe("ReviewService", () => {
  let reviewService: ReviewService;
  let mockRepository: jest.Mocked<ReviewRepository>;

  beforeEach(() => {
    mockRepository =
      new MockedReviewRepository() as jest.Mocked<ReviewRepository>;
    reviewService = new ReviewService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createReview", () => {
    const validReviewData = {
      appointmentId: "appointment-123",
      clientId: "client-123",
      professionalId: "professional-123",
      rating: 5,
      comment: "Excelente serviço!",
    };

    it("deve criar uma avaliação com sucesso", async () => {
      // Arrange
      mockRepository.existsForAppointment.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue({
        id: "review-123",
        ...validReviewData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      // Act
      const result = await reviewService.createReview(validReviewData);

      // Assert
      expect(mockRepository.existsForAppointment).toHaveBeenCalledWith(
        validReviewData.appointmentId
      );
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          ...validReviewData,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );
      expect(result).toBeDefined();
    });

    it("deve lançar erro quando rating é inválido (menor que 1)", async () => {
      // Arrange
      const invalidReviewData = { ...validReviewData, rating: 0 };

      // Act & Assert
      await expect(
        reviewService.createReview(invalidReviewData)
      ).rejects.toThrow(new BadRequestError("Rating deve estar entre 1 e 5"));
    });

    it("deve lançar erro quando rating é inválido (maior que 5)", async () => {
      // Arrange
      const invalidReviewData = { ...validReviewData, rating: 6 };

      // Act & Assert
      await expect(
        reviewService.createReview(invalidReviewData)
      ).rejects.toThrow(new BadRequestError("Rating deve estar entre 1 e 5"));
    });

    it("deve lançar erro quando já existe avaliação para o agendamento", async () => {
      // Arrange
      mockRepository.existsForAppointment.mockResolvedValue(true);

      // Act & Assert
      await expect(reviewService.createReview(validReviewData)).rejects.toThrow(
        new BadRequestError("Já existe uma avaliação para este agendamento")
      );
    });
  });

  describe("getReviewById", () => {
    it("deve retornar avaliação quando encontrada", async () => {
      // Arrange
      const reviewId = "review-123";
      const mockReview = { id: reviewId, rating: 5 };
      mockRepository.findById.mockResolvedValue(mockReview as any);

      // Act
      const result = await reviewService.getReviewById(reviewId);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(reviewId);
      expect(result).toEqual(mockReview);
    });

    it("deve lançar erro quando avaliação não encontrada", async () => {
      // Arrange
      const reviewId = "review-123";
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(reviewService.getReviewById(reviewId)).rejects.toThrow(
        new NotFoundError("Avaliação não encontrada")
      );
    });
  });

  describe("getReviewByAppointment", () => {
    it("deve retornar avaliação do agendamento", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      const mockReview = { id: "review-123", appointmentId };
      mockRepository.findByAppointment.mockResolvedValue(mockReview as any);

      // Act
      const result = await reviewService.getReviewByAppointment(appointmentId);

      // Assert
      expect(mockRepository.findByAppointment).toHaveBeenCalledWith(
        appointmentId
      );
      expect(result).toEqual(mockReview);
    });

    it("deve retornar null quando não há avaliação para o agendamento", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      mockRepository.findByAppointment.mockResolvedValue(null);

      // Act
      const result = await reviewService.getReviewByAppointment(appointmentId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("listReviews", () => {
    it("deve listar avaliações com filtros", async () => {
      // Arrange
      const filters = { skip: 0, take: 10, professionalId: "professional-123" };
      const mockResult = {
        data: [{ id: "review-1" }, { id: "review-2" }],
        total: 2,
        page: 1,
        limit: 10,
        hasNext: false,
        hasPrev: false,
      };
      mockRepository.findMany.mockResolvedValue(mockResult);

      // Act
      const result = await reviewService.listReviews(filters);

      // Assert
      expect(mockRepository.findMany).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResult);
    });
  });

  describe("updateReview", () => {
    it("deve atualizar avaliação com sucesso", async () => {
      // Arrange
      const reviewId = "review-123";
      const updateData = { rating: 4, comment: "Muito bom!" };
      const existingReview = { id: reviewId, rating: 5 };
      const updatedReview = { ...existingReview, ...updateData };

      mockRepository.findById.mockResolvedValue(existingReview as any);
      mockRepository.update.mockResolvedValue(updatedReview as any);

      // Act
      const result = await reviewService.updateReview(reviewId, updateData);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(reviewId);
      expect(mockRepository.update).toHaveBeenCalledWith(
        reviewId,
        expect.objectContaining({
          ...updateData,
          updatedAt: expect.any(Date),
        })
      );
      expect(result).toEqual(updatedReview);
    });

    it("deve lançar erro quando avaliação não encontrada", async () => {
      // Arrange
      const reviewId = "review-123";
      const updateData = { rating: 4 };
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        reviewService.updateReview(reviewId, updateData)
      ).rejects.toThrow(new NotFoundError("Avaliação não encontrada"));
    });

    it("deve lançar erro quando rating é inválido na atualização", async () => {
      // Arrange
      const reviewId = "review-123";
      const updateData = { rating: 6 };
      const existingReview = { id: reviewId, rating: 5 };
      mockRepository.findById.mockResolvedValue(existingReview as any);

      // Act & Assert
      await expect(
        reviewService.updateReview(reviewId, updateData)
      ).rejects.toThrow(new BadRequestError("Rating deve estar entre 1 e 5"));
    });
  });

  describe("deleteReview", () => {
    it("deve deletar avaliação com sucesso", async () => {
      // Arrange
      const reviewId = "review-123";
      const review = { id: reviewId, rating: 5 };
      mockRepository.findById.mockResolvedValue(review as any);
      mockRepository.delete.mockResolvedValue();

      // Act
      await reviewService.deleteReview(reviewId);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(reviewId);
      expect(mockRepository.delete).toHaveBeenCalledWith(reviewId);
    });

    it("deve lançar erro quando avaliação não encontrada", async () => {
      // Arrange
      const reviewId = "review-123";
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(reviewService.deleteReview(reviewId)).rejects.toThrow(
        new NotFoundError("Avaliação não encontrada")
      );
    });
  });

  describe("getProfessionalReviews", () => {
    it("deve retornar avaliações do profissional", async () => {
      // Arrange
      const professionalId = "professional-123";
      const filters = { skip: 0, take: 10 };
      const mockResult = {
        data: [{ id: "review-1" }],
        total: 1,
        page: 1,
        limit: 10,
        hasNext: false,
        hasPrev: false,
      };
      mockRepository.findByProfessional.mockResolvedValue(mockResult);

      // Act
      const result = await reviewService.getProfessionalReviews(
        professionalId,
        filters
      );

      // Assert
      expect(mockRepository.findByProfessional).toHaveBeenCalledWith(
        professionalId,
        filters
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("getClientReviews", () => {
    it("deve retornar avaliações do cliente", async () => {
      // Arrange
      const clientId = "client-123";
      const filters = { skip: 0, take: 10 };
      const mockResult = {
        data: [{ id: "review-1" }],
        total: 1,
        page: 1,
        limit: 10,
        hasNext: false,
        hasPrev: false,
      };
      mockRepository.findByClient.mockResolvedValue(mockResult);

      // Act
      const result = await reviewService.getClientReviews(clientId, filters);

      // Assert
      expect(mockRepository.findByClient).toHaveBeenCalledWith(
        clientId,
        filters
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("getReviewStats", () => {
    it("deve retornar estatísticas de avaliações", async () => {
      // Arrange
      const filters = { professionalId: "professional-123" };
      const mockStats = {
        total: 10,
        averageRating: 4.5,
        ratingDistribution: { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 },
      };
      mockRepository.getStats.mockResolvedValue(mockStats);

      // Act
      const result = await reviewService.getReviewStats(filters);

      // Assert
      expect(mockRepository.getStats).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockStats);
    });
  });

  describe("getProfessionalAverageRating", () => {
    it("deve retornar avaliação média do profissional", async () => {
      // Arrange
      const professionalId = "professional-123";
      const mockStats = { averageRating: 4.5 };
      mockRepository.getStats.mockResolvedValue(mockStats);

      // Act
      const result = await reviewService.getProfessionalAverageRating(
        professionalId
      );

      // Assert
      expect(mockRepository.getStats).toHaveBeenCalledWith({ professionalId });
      expect(result).toBe(4.5);
    });
  });

  describe("getProfessionalRatingDistribution", () => {
    it("deve retornar distribuição de ratings do profissional", async () => {
      // Arrange
      const professionalId = "professional-123";
      const mockStats = {
        ratingDistribution: { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 },
      };
      mockRepository.getStats.mockResolvedValue(mockStats);

      // Act
      const result = await reviewService.getProfessionalRatingDistribution(
        professionalId
      );

      // Assert
      expect(mockRepository.getStats).toHaveBeenCalledWith({ professionalId });
      expect(result).toEqual({ 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 });
    });
  });

  describe("canClientReviewAppointment", () => {
    it("deve retornar true quando cliente pode avaliar", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      const clientId = "client-123";
      mockRepository.existsForAppointment.mockResolvedValue(false);

      // Act
      const result = await reviewService.canClientReviewAppointment(
        appointmentId,
        clientId
      );

      // Assert
      expect(mockRepository.existsForAppointment).toHaveBeenCalledWith(
        appointmentId
      );
      expect(result).toBe(true);
    });

    it("deve retornar false quando já existe avaliação", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      const clientId = "client-123";
      mockRepository.existsForAppointment.mockResolvedValue(true);

      // Act
      const result = await reviewService.canClientReviewAppointment(
        appointmentId,
        clientId
      );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("getRecentProfessionalReviews", () => {
    it("deve retornar avaliações recentes do profissional", async () => {
      // Arrange
      const professionalId = "professional-123";
      const limit = 5;
      const mockResult = {
        data: [{ id: "review-1" }, { id: "review-2" }],
        total: 2,
        page: 1,
        limit: 5,
        hasNext: false,
        hasPrev: false,
      };
      mockRepository.findByProfessional.mockResolvedValue(mockResult);

      // Act
      const result = await reviewService.getRecentProfessionalReviews(
        professionalId,
        limit
      );

      // Assert
      expect(mockRepository.findByProfessional).toHaveBeenCalledWith(
        professionalId,
        {
          skip: 0,
          take: limit,
        }
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("getReviewsByRating", () => {
    it("deve retornar avaliações por rating específico", async () => {
      // Arrange
      const rating = 5;
      const filters = { skip: 0, take: 10 };
      const mockResult = {
        data: [{ id: "review-1", rating: 5 }],
        total: 1,
        page: 1,
        limit: 10,
        hasNext: false,
        hasPrev: false,
      };
      mockRepository.findMany.mockResolvedValue(mockResult);

      // Act
      const result = await reviewService.getReviewsByRating(rating, filters);

      // Assert
      expect(mockRepository.findMany).toHaveBeenCalledWith({
        ...filters,
        rating,
      });
      expect(result).toEqual(mockResult);
    });
  });
});
