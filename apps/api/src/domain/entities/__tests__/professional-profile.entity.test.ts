/**
 * Testes para ProfessionalProfile Entity - Camada de Domínio
 *
 * Seguindo TDD e princípios SOLID
 */

import { describe, it, expect, jest } from "@jest/globals";
import { ProfessionalProfile } from "../professional-profile.entity";
import { BadRequestError } from "../../../utils/app-error";

describe("ProfessionalProfile Entity", () => {
  const validProfileData = {
    userId: "user-123",
    address: "Rua Teste, 123",
    city: "São Paulo",
    serviceMode: "BOTH",
    specialties: ["Corte", "Barba"],
    workingHours: {
      monday: { isAvailable: true, start: "09:00", end: "18:00" },
      tuesday: { isAvailable: true, start: "09:00", end: "18:00" },
      wednesday: { isAvailable: true, start: "09:00", end: "18:00" },
      thursday: { isAvailable: true, start: "09:00", end: "18:00" },
      friday: { isAvailable: true, start: "09:00", end: "18:00" },
      saturday: { isAvailable: false, start: "09:00", end: "18:00" },
      sunday: { isAvailable: false, start: "09:00", end: "18:00" },
    },
    certifications: [],
    portfolio: [],
  };

  describe("create", () => {
    it("deve criar perfil com dados válidos", () => {
      // Act
      const profile = ProfessionalProfile.create(validProfileData);

      // Assert
      expect(profile.userId).toBe("user-123");
      expect(profile.address).toBe("Rua Teste, 123");
      expect(profile.city).toBe("São Paulo");
      expect(profile.serviceMode).toBe("BOTH");
      expect(profile.specialties).toEqual(["Corte", "Barba"]);
      expect(profile.isActive).toBe(true);
      expect(profile.isVerified).toBe(false);
    });

    it("deve criar perfil com CPF válido", () => {
      // Arrange
      const dataWithCPF = {
        ...validProfileData,
        cpf: "11144477735",
      };

      // Act
      const profile = ProfessionalProfile.create(dataWithCPF);

      // Assert
      expect(profile.cpf).toBe("11144477735");
    });

    it("deve criar perfil com CNPJ válido", () => {
      // Arrange
      const dataWithCNPJ = {
        ...validProfileData,
        cnpj: "12345678000195",
      };

      // Act
      const profile = ProfessionalProfile.create(dataWithCNPJ);

      // Assert
      expect(profile.cnpj).toBe("12345678000195");
    });

    it("deve lançar erro se userId estiver vazio", () => {
      // Arrange
      const invalidData = { ...validProfileData, userId: "" };

      // Act & Assert
      expect(() => ProfessionalProfile.create(invalidData)).toThrow(
        new BadRequestError("ID do usuário é obrigatório")
      );
    });

    it("deve lançar erro se endereço estiver vazio", () => {
      // Arrange
      const invalidData = { ...validProfileData, address: "" };

      // Act & Assert
      expect(() => ProfessionalProfile.create(invalidData)).toThrow(
        new BadRequestError("Endereço é obrigatório")
      );
    });

    it("deve lançar erro se cidade estiver vazia", () => {
      // Arrange
      const invalidData = { ...validProfileData, city: "" };

      // Act & Assert
      expect(() => ProfessionalProfile.create(invalidData)).toThrow(
        new BadRequestError("Cidade é obrigatória")
      );
    });

    it("deve lançar erro se modo de serviço for inválido", () => {
      // Arrange
      const invalidData = { ...validProfileData, serviceMode: "INVALID" };

      // Act & Assert
      expect(() => ProfessionalProfile.create(invalidData)).toThrow(
        new BadRequestError("Modo de serviço inválido")
      );
    });

    it("deve lançar erro se CPF for inválido", () => {
      // Arrange
      const invalidData = { ...validProfileData, cpf: "12345678901" };

      // Act & Assert
      expect(() => ProfessionalProfile.create(invalidData)).toThrow(
        new BadRequestError("CPF inválido")
      );
    });

    it("deve lançar erro se CNPJ for inválido", () => {
      // Arrange
      const invalidData = { ...validProfileData, cnpj: "12345678901234" };

      // Act & Assert
      expect(() => ProfessionalProfile.create(invalidData)).toThrow(
        new BadRequestError("CNPJ inválido")
      );
    });
  });

  describe("addSpecialty", () => {
    it("deve adicionar especialidade válida", () => {
      // Arrange
      const profile = ProfessionalProfile.create(validProfileData);

      // Act
      const updatedProfile = profile.addSpecialty("Manicure");

      // Assert
      expect(updatedProfile.specialties).toContain("Manicure");
      expect(updatedProfile.specialties).toHaveLength(3);
    });

    it("deve lançar erro se especialidade estiver vazia", () => {
      // Arrange
      const profile = ProfessionalProfile.create(validProfileData);

      // Act & Assert
      expect(() => profile.addSpecialty("")).toThrow(
        new BadRequestError("Especialidade não pode ser vazia")
      );
    });

    it("deve lançar erro se especialidade já existir", () => {
      // Arrange
      const profile = ProfessionalProfile.create(validProfileData);

      // Act & Assert
      expect(() => profile.addSpecialty("Corte")).toThrow(
        new BadRequestError("Especialidade já existe")
      );
    });
  });

  describe("removeSpecialty", () => {
    it("deve remover especialidade existente", () => {
      // Arrange
      const profile = ProfessionalProfile.create(validProfileData);

      // Act
      const updatedProfile = profile.removeSpecialty("Corte");

      // Assert
      expect(updatedProfile.specialties).not.toContain("Corte");
      expect(updatedProfile.specialties).toHaveLength(1);
    });

    it("deve lançar erro se especialidade não existir", () => {
      // Arrange
      const profile = ProfessionalProfile.create(validProfileData);

      // Act & Assert
      expect(() => profile.removeSpecialty("Manicure")).toThrow(
        new BadRequestError("Especialidade não encontrada")
      );
    });
  });

  describe("addCertification", () => {
    it("deve adicionar certificação válida", () => {
      // Arrange
      const profile = ProfessionalProfile.create(validProfileData);
      const certification = {
        id: "cert-1",
        name: "Curso de Corte",
        institution: "Escola de Beleza",
        date: new Date("2023-01-01"),
        documentUrl: "https://example.com/cert.pdf",
        isVerified: true,
      };

      // Act
      const updatedProfile = profile.addCertification(certification);

      // Assert
      expect(updatedProfile.certifications).toContain(certification);
      expect(updatedProfile.certifications).toHaveLength(1);
    });

    it("deve lançar erro se certificação não tiver ID", () => {
      // Arrange
      const profile = ProfessionalProfile.create(validProfileData);
      const invalidCertification = {
        id: "",
        name: "Curso de Corte",
        institution: "Escola de Beleza",
        date: new Date("2023-01-01"),
        documentUrl: "https://example.com/cert.pdf",
        isVerified: true,
      };

      // Act & Assert
      expect(() => profile.addCertification(invalidCertification)).toThrow(
        new BadRequestError("ID da certificação é obrigatório")
      );
    });

    it("deve lançar erro se certificação não tiver nome", () => {
      // Arrange
      const profile = ProfessionalProfile.create(validProfileData);
      const invalidCertification = {
        id: "cert-1",
        name: "",
        institution: "Escola de Beleza",
        date: new Date("2023-01-01"),
        documentUrl: "https://example.com/cert.pdf",
        isVerified: true,
      };

      // Act & Assert
      expect(() => profile.addCertification(invalidCertification)).toThrow(
        new BadRequestError("Nome da certificação é obrigatório")
      );
    });

    it("deve lançar erro se certificação já existir", () => {
      // Arrange
      const profile = ProfessionalProfile.create(validProfileData);
      const certification = {
        id: "cert-1",
        name: "Curso de Corte",
        institution: "Escola de Beleza",
        date: new Date("2023-01-01"),
        documentUrl: "https://example.com/cert.pdf",
        isVerified: true,
      };
      const profileWithCert = profile.addCertification(certification);

      // Act & Assert
      expect(() => profileWithCert.addCertification(certification)).toThrow(
        new BadRequestError("Certificação já existe")
      );
    });
  });

  describe("addPortfolioItem", () => {
    it("deve adicionar item ao portfólio", () => {
      // Arrange
      const profile = ProfessionalProfile.create(validProfileData);

      // Act
      const updatedProfile = profile.addPortfolioItem(
        "https://example.com/photo1.jpg"
      );

      // Assert
      expect(updatedProfile.portfolio).toContain(
        "https://example.com/photo1.jpg"
      );
      expect(updatedProfile.portfolio).toHaveLength(1);
    });

    it("deve lançar erro se item estiver vazio", () => {
      // Arrange
      const profile = ProfessionalProfile.create(validProfileData);

      // Act & Assert
      expect(() => profile.addPortfolioItem("")).toThrow(
        new BadRequestError("Item do portfólio não pode ser vazio")
      );
    });

    it("deve lançar erro se item já existir", () => {
      // Arrange
      const profile = ProfessionalProfile.create(validProfileData);
      const profileWithItem = profile.addPortfolioItem(
        "https://example.com/photo1.jpg"
      );

      // Act & Assert
      expect(() =>
        profileWithItem.addPortfolioItem("https://example.com/photo1.jpg")
      ).toThrow(new BadRequestError("Item já existe no portfólio"));
    });
  });

  describe("updateWorkingHours", () => {
    it("deve atualizar horários de trabalho válidos", () => {
      // Arrange
      const profile = ProfessionalProfile.create(validProfileData);
      const newWorkingHours = {
        monday: { isAvailable: true, start: "08:00", end: "17:00" },
        tuesday: { isAvailable: true, start: "08:00", end: "17:00" },
        wednesday: { isAvailable: false, start: "09:00", end: "18:00" },
        thursday: { isAvailable: true, start: "08:00", end: "17:00" },
        friday: { isAvailable: true, start: "08:00", end: "17:00" },
        saturday: { isAvailable: false, start: "09:00", end: "18:00" },
        sunday: { isAvailable: false, start: "09:00", end: "18:00" },
      };

      // Act
      const updatedProfile = profile.updateWorkingHours(newWorkingHours);

      // Assert
      expect(updatedProfile.workingHours).toEqual(newWorkingHours);
    });

    it("deve lançar erro se horário de início for posterior ao fim", () => {
      // Arrange
      const profile = ProfessionalProfile.create(validProfileData);
      const invalidWorkingHours = {
        monday: { isAvailable: true, start: "18:00", end: "09:00" },
      };

      // Act & Assert
      expect(() => profile.updateWorkingHours(invalidWorkingHours)).toThrow(
        new BadRequestError(
          "Horário de monday: início deve ser anterior ao fim"
        )
      );
    });
  });

  describe("fromPersistence", () => {
    it("deve reconstruir perfil a partir de dados de persistência", () => {
      // Arrange
      const persistenceData = {
        userId: "user-123",
        cpf: "11144477735",
        cnpj: null,
        address: "Rua Teste, 123",
        city: "São Paulo",
        serviceMode: "BOTH",
        specialties: ["Corte", "Barba"],
        workingHours: {},
        certifications: [],
        portfolio: [],
        averageRating: 4.5,
        totalRatings: 10,
        isActive: true,
        isVerified: false,
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2023-01-02"),
      };

      // Act
      const profile = ProfessionalProfile.fromPersistence(persistenceData);

      // Assert
      expect(profile.userId).toBe("user-123");
      expect(profile.cpf).toBe("11144477735");
      expect(profile.address).toBe("Rua Teste, 123");
      expect(profile.averageRating).toBe(4.5);
      expect(profile.totalRatings).toBe(10);
    });
  });
});
