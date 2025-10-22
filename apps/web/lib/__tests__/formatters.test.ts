/**
 * Testes completos para formatters.ts
 * Testa todas as funções de formatação
 */

import {
  formatCurrency,
  formatDate,
  formatTime,
  formatPhone,
  formatCPF,
  formatCEP,
  formatDuration,
  capitalize,
  capitalizeWords,
  truncate,
  formatPercentage,
  formatFileSize,
} from "../formatters";

describe("Formatters", () => {
  describe("formatCurrency", () => {
    it("deve formatar valores em reais", () => {
      expect(formatCurrency(100)).toBe("R$\u00A0100,00");
      expect(formatCurrency(1500.5)).toBe("R$\u00A01.500,50");
      expect(formatCurrency(0)).toBe("R$\u00A00,00");
    });

    it("deve formatar valores negativos", () => {
      expect(formatCurrency(-100)).toBe("-R$\u00A0100,00");
      expect(formatCurrency(-1500.5)).toBe("-R$\u00A01.500,50");
    });

    it("deve formatar valores com decimais", () => {
      expect(formatCurrency(100.5)).toBe("R$\u00A0100,50");
      expect(formatCurrency(1000.99)).toBe("R$\u00A01.000,99");
    });
  });

  describe("formatDate", () => {
    it("deve formatar datas em português", () => {
      // Usar uma data fixa para evitar problemas de timezone
      const date = new Date("2023-12-25T12:00:00.000Z");
      expect(formatDate(date)).toBe("25/12/2023");
    });

    it("deve formatar datas com string ISO", () => {
      expect(formatDate("2023-12-25")).toBe("25/12/2023");
    });
  });

  describe("formatTime", () => {
    it("deve formatar horários", () => {
      const date = new Date("2023-12-25T14:30:00");
      expect(formatTime(date)).toBe("14:30");
    });

    it("deve formatar horários com string ISO", () => {
      expect(formatTime("2023-12-25T14:30:00")).toBe("14:30");
    });
  });

  describe("formatPhone", () => {
    it("deve formatar telefones brasileiros", () => {
      expect(formatPhone("11999999999")).toBe("(11) 99999-9999");
      expect(formatPhone("1133334444")).toBe("(11) 3333-4444");
    });

    it("deve lidar com telefones já formatados", () => {
      expect(formatPhone("(11) 99999-9999")).toBe("(11) 99999-9999");
    });

    it("deve lidar com números inválidos", () => {
      expect(formatPhone("123")).toBe("123");
      expect(formatPhone("")).toBe("");
    });
  });

  describe("formatCPF", () => {
    it("deve formatar CPF", () => {
      expect(formatCPF("12345678901")).toBe("123.456.789-01");
    });

    it("deve lidar com CPF já formatado", () => {
      expect(formatCPF("123.456.789-01")).toBe("123.456.789-01");
    });

    it("deve lidar com números inválidos", () => {
      expect(formatCPF("123")).toBe("123");
      expect(formatCPF("")).toBe("");
    });
  });

  describe("formatCEP", () => {
    it("deve formatar CEP", () => {
      expect(formatCEP("12345678")).toBe("12345-678");
    });

    it("deve lidar com CEP já formatado", () => {
      expect(formatCEP("12345-678")).toBe("12345-678");
    });

    it("deve lidar com números inválidos", () => {
      expect(formatCEP("123")).toBe("123");
      expect(formatCEP("")).toBe("");
    });
  });

  describe("formatDuration", () => {
    it("deve formatar duração em minutos", () => {
      expect(formatDuration(30)).toBe("30min");
      expect(formatDuration(60)).toBe("1h");
      expect(formatDuration(90)).toBe("1h 30min");
    });

    it("deve lidar com valores zero", () => {
      expect(formatDuration(0)).toBe("0min");
    });
  });

  describe("capitalize", () => {
    it("deve capitalizar primeira letra", () => {
      expect(capitalize("texto")).toBe("Texto");
      expect(capitalize("TEXTO")).toBe("Texto");
    });
  });

  describe("capitalizeWords", () => {
    it("deve capitalizar primeira letra de cada palavra", () => {
      expect(capitalizeWords("texto em minúsculo")).toBe("Texto Em Minúsculo");
    });
  });

  describe("truncate", () => {
    it("deve truncar texto", () => {
      expect(truncate("Texto muito longo", 10)).toBe("Texto m...");
    });

    it("deve retornar texto original se menor que limite", () => {
      expect(truncate("Texto", 10)).toBe("Texto");
    });
  });

  describe("formatPercentage", () => {
    it("deve formatar porcentagens", () => {
      expect(formatPercentage(50)).toBe("50%");
      expect(formatPercentage(12.34)).toBe("12%");
    });

    it("deve formatar com casas decimais customizadas", () => {
      expect(formatPercentage(12.34, 1)).toBe("12.3%");
    });
  });

  describe("formatFileSize", () => {
    it("deve formatar tamanhos de arquivo", () => {
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1048576)).toBe("1 MB");
      expect(formatFileSize(1073741824)).toBe("1 GB");
    });

    it("deve formatar bytes", () => {
      expect(formatFileSize(500)).toBe("500 Bytes");
    });

    it("deve lidar com valores zero", () => {
      expect(formatFileSize(0)).toBe("0 Bytes");
    });
  });

  describe("Edge Cases", () => {
    it("deve lidar com strings vazias", () => {
      expect(formatPhone("")).toBe("");
      expect(formatCPF("")).toBe("");
      expect(formatCEP("")).toBe("");
    });

    it("deve lidar com valores inválidos", () => {
      expect(formatCurrency("invalid" as any)).toBe("R$ 0,00");
    });
  });
});
