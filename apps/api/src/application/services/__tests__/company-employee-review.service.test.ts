/**
 * Testes unitários para CompanyEmployeeReviewService
 * Seguindo TDD e garantindo máxima cobertura
 */

import { CompanyEmployeeReviewService } from "../company-employee-review.service";
import { CompanyEmployeeReviewRepository } from "../../../infrastructure/repositories/company-employee-review.repository";
import { BadRequestError, NotFoundError } from "../../../utils/app-error";

// Mock do repositório
jest.mock(
  "../../../infrastructure/repositories/company-employee-review.repository"
);
const MockedCompanyEmployeeReviewRepository =
  CompanyEmployeeReviewRepository as jest.MockedClass<
    typeof CompanyEmployeeReviewRepository
  >;

describe("CompanyEmployeeReviewService", () => {
  let companyEmployeeReviewService: CompanyEmployeeReviewService;
  let mockRepository: jest.Mocked<CompanyEmployeeReviewRepository>;

  beforeEach(() => {
    mockRepository =
      new MockedCompanyEmployeeReviewRepository() as jest.Mocked<CompanyEmployeeReviewRepository>;
    companyEmployeeReviewService = new CompanyEmployeeReviewService(
      mockRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createReview", () => {
    const validReviewData = {
      appointmentId: "appointment-123",
      clientId: "client-123",
      companyId: "company-123",
      employeeId: "employee-123",
      rating: 5,
      comment: "Excelente funcionário!",
    };

    it("deve criar uma avaliação de funcionário com sucesso", async () => {
      // Arrange
      mockRepository.existsForAppointment.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue({
        id: "review-123",
        ...validReviewData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      // Act
      const result = await companyEmployeeReviewService.createReview(
        validReviewData
      );

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
        companyEmployeeReviewService.createReview(invalidReviewData)
      ).rejects.toThrow(new BadRequestError("Rating deve estar entre 1 e 5"));
    });

    it("deve lançar erro quando rating é inválido (maior que 5)", async () => {
      // Arrange
      const invalidReviewData = { ...validReviewData, rating: 6 };

      // Act & Assert
      await expect(
        companyEmployeeReviewService.createReview(invalidReviewData)
      ).rejects.toThrow(new BadRequestError("Rating deve estar entre 1 e 5"));
    });

    it("deve lançar erro quando já existe avaliação para o agendamento", async () => {
      // Arrange
      mockRepository.existsForAppointment.mockResolvedValue(true);

      // Act & Assert
      await expect(
        companyEmployeeReviewService.createReview(validReviewData)
      ).rejects.toThrow(
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
      const result = await companyEmployeeReviewService.getReviewById(reviewId);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(reviewId);
      expect(result).toEqual(mockReview);
    });

    it("deve lançar erro quando avaliação não encontrada", async () => {
      // Arrange
      const reviewId = "review-123";
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        companyEmployeeReviewService.getReviewById(reviewId)
      ).rejects.toThrow(new NotFoundError("Avaliação não encontrada"));
    });
  });

  describe("getReviewByAppointment", () => {
    it("deve retornar avaliação do agendamento", async () => {
      // Arrange
      const appointmentId = "appointment-123";
      const mockReview = { id: "review-123", appointmentId };
      mockRepository.findByAppointment.mockResolvedValue(mockReview as any);

      // Act
      const result = await companyEmployeeReviewService.getReviewByAppointment(
        appointmentId
      );

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
      const result = await companyEmployeeReviewService.getReviewByAppointment(
        appointmentId
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("listReviews", () => {
    it("deve listar avaliações com filtros", async () => {
      // Arrange
      const filters = { skip: 0, take: 10, companyId: "company-123" };
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
      const result = await companyEmployeeReviewService.listReviews(filters);

      // Assert
      expect(mockRepository.findMany).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResult);
    });
  });

  describe("updateReview", () => {
    it("deve atualizar avaliação com sucesso", async () => {
      // Arrange
      const reviewId = "review-123";
      const updateData = { rating: 4, comment: "Muito bom funcionário!" };
      const existingReview = { id: reviewId, rating: 5 };
      const updatedReview = { ...existingReview, ...updateData };

      mockRepository.findById.mockResolvedValue(existingReview as any);
      mockRepository.update.mockResolvedValue(updatedReview as any);

      // Act
      const result = await companyEmployeeReviewService.updateReview(
        reviewId,
        updateData
      );

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
        companyEmployeeReviewService.updateReview(reviewId, updateData)
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
        companyEmployeeReviewService.updateReview(reviewId, updateData)
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
      await companyEmployeeReviewService.deleteReview(reviewId);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(reviewId);
      expect(mockRepository.delete).toHaveBeenCalledWith(reviewId);
    });

    it("deve lançar erro quando avaliação não encontrada", async () => {
      // Arrange
      const reviewId = "review-123";
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        companyEmployeeReviewService.deleteReview(reviewId)
      ).rejects.toThrow(new NotFoundError("Avaliação não encontrada"));
    });
  });

  describe("getCompanyReviews", () => {
    it("deve retornar avaliações da empresa", async () => {
      // Arrange
      const companyId = "company-123";
      const filters = { skip: 0, take: 10 };
      const mockResult = {
        data: [{ id: "review-1" }],
        total: 1,
        page: 1,
        limit: 10,
        hasNext: false,
        hasPrev: false,
      };
      mockRepository.findByCompany.mockResolvedValue(mockResult);

      // Act
      const result = await companyEmployeeReviewService.getCompanyReviews(
        companyId,
        filters
      );

      // Assert
      expect(mockRepository.findByCompany).toHaveBeenCalledWith(
        companyId,
        filters
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("getEmployeeReviews", () => {
    it("deve retornar avaliações do funcionário", async () => {
      // Arrange
      const employeeId = "employee-123";
      const filters = { skip: 0, take: 10 };
      const mockResult = {
        data: [{ id: "review-1" }],
        total: 1,
        page: 1,
        limit: 10,
        hasNext: false,
        hasPrev: false,
      };
      mockRepository.findByEmployee.mockResolvedValue(mockResult);

      // Act
      const result = await companyEmployeeReviewService.getEmployeeReviews(
        employeeId,
        filters
      );

      // Assert
      expect(mockRepository.findByEmployee).toHaveBeenCalledWith(
        employeeId,
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
      const result = await companyEmployeeReviewService.getClientReviews(
        clientId,
        filters
      );

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
      const filters = { companyId: "company-123" };
      const mockStats = {
        total: 10,
        averageRating: 4.5,
        ratingDistribution: { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 },
      };
      mockRepository.getStats.mockResolvedValue(mockStats);

      // Act
      const result = await companyEmployeeReviewService.getReviewStats(filters);

      // Assert
      expect(mockRepository.getStats).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockStats);
    });
  });

  describe("getCompanyAverageRating", () => {
    it("deve retornar avaliação média da empresa", async () => {
      // Arrange
      const companyId = "company-123";
      const mockStats = { averageRating: 4.5 };
      mockRepository.getStats.mockResolvedValue(mockStats);

      // Act
      const result = await companyEmployeeReviewService.getCompanyAverageRating(
        companyId
      );

      // Assert
      expect(mockRepository.getStats).toHaveBeenCalledWith({ companyId });
      expect(result).toBe(4.5);
    });
  });

  describe("getEmployeeAverageRating", () => {
    it("deve retornar avaliação média do funcionário", async () => {
      // Arrange
      const employeeId = "employee-123";
      const mockStats = { averageRating: 4.5 };
      mockRepository.getStats.mockResolvedValue(mockStats);

      // Act
      const result =
        await companyEmployeeReviewService.getEmployeeAverageRating(employeeId);

      // Assert
      expect(mockRepository.getStats).toHaveBeenCalledWith({ employeeId });
      expect(result).toBe(4.5);
    });
  });

  describe("getCompanyRatingDistribution", () => {
    it("deve retornar distribuição de ratings da empresa", async () => {
      // Arrange
      const companyId = "company-123";
      const mockStats = {
        ratingDistribution: { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 },
      };
      mockRepository.getStats.mockResolvedValue(mockStats);

      // Act
      const result =
        await companyEmployeeReviewService.getCompanyRatingDistribution(
          companyId
        );

      // Assert
      expect(mockRepository.getStats).toHaveBeenCalledWith({ companyId });
      expect(result).toEqual({ 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 });
    });
  });

  describe("getEmployeeRatingDistribution", () => {
    it("deve retornar distribuição de ratings do funcionário", async () => {
      // Arrange
      const employeeId = "employee-123";
      const mockStats = {
        ratingDistribution: { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 },
      };
      mockRepository.getStats.mockResolvedValue(mockStats);

      // Act
      const result =
        await companyEmployeeReviewService.getEmployeeRatingDistribution(
          employeeId
        );

      // Assert
      expect(mockRepository.getStats).toHaveBeenCalledWith({ employeeId });
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
      const result =
        await companyEmployeeReviewService.canClientReviewAppointment(
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
      const result =
        await companyEmployeeReviewService.canClientReviewAppointment(
          appointmentId,
          clientId
        );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("getRecentCompanyReviews", () => {
    it("deve retornar avaliações recentes da empresa", async () => {
      // Arrange
      const companyId = "company-123";
      const limit = 5;
      const mockResult = {
        data: [{ id: "review-1" }, { id: "review-2" }],
        total: 2,
        page: 1,
        limit: 5,
        hasNext: false,
        hasPrev: false,
      };
      mockRepository.findByCompany.mockResolvedValue(mockResult);

      // Act
      const result = await companyEmployeeReviewService.getRecentCompanyReviews(
        companyId,
        limit
      );

      // Assert
      expect(mockRepository.findByCompany).toHaveBeenCalledWith(companyId, {
        skip: 0,
        take: limit,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe("getRecentEmployeeReviews", () => {
    it("deve retornar avaliações recentes do funcionário", async () => {
      // Arrange
      const employeeId = "employee-123";
      const limit = 5;
      const mockResult = {
        data: [{ id: "review-1" }, { id: "review-2" }],
        total: 2,
        page: 1,
        limit: 5,
        hasNext: false,
        hasPrev: false,
      };
      mockRepository.findByEmployee.mockResolvedValue(mockResult);

      // Act
      const result =
        await companyEmployeeReviewService.getRecentEmployeeReviews(
          employeeId,
          limit
        );

      // Assert
      expect(mockRepository.findByEmployee).toHaveBeenCalledWith(employeeId, {
        skip: 0,
        take: limit,
      });
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
      const result = await companyEmployeeReviewService.getReviewsByRating(
        rating,
        filters
      );

      // Assert
      expect(mockRepository.findMany).toHaveBeenCalledWith({
        ...filters,
        rating,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe("getCompanyEmployeeReviews", () => {
    it("deve retornar avaliações de empresa e funcionário", async () => {
      // Arrange
      const companyId = "company-123";
      const employeeId = "employee-123";
      const filters = { skip: 0, take: 10 };
      const mockResult = {
        data: [{ id: "review-1" }],
        total: 1,
        page: 1,
        limit: 10,
        hasNext: false,
        hasPrev: false,
      };
      mockRepository.findMany.mockResolvedValue(mockResult);

      // Act
      const result =
        await companyEmployeeReviewService.getCompanyEmployeeReviews(
          companyId,
          employeeId,
          filters
        );

      // Assert
      expect(mockRepository.findMany).toHaveBeenCalledWith({
        ...filters,
        companyId,
        employeeId,
      });
      expect(result).toEqual(mockResult);
    });
  });
});
