import {
  format,
  formatDistance,
  formatDistanceToNow,
  parse,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Utilitários de formatação (dinheiro, data, telefone, etc)
 */

// ========================================
// FORMATAÇÃO DE DINHEIRO
// ========================================

/**
 * Formata valor para moeda brasileira (R$)
 */
export function formatCurrency(value: number | string): string {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  // Verificar se o valor é válido
  if (isNaN(numericValue)) {
    return "R$ 0,00";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericValue);
}

/**
 * Formata valor sem símbolo de moeda
 */
export function formatNumber(
  value: number | string,
  decimals: number = 2
): string {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numericValue);
}

/**
 * Parse de valor monetário para número
 */
export function parseCurrency(value: string): number {
  const cleanValue = value.replace(/[^\d,]/g, "").replace(",", ".");
  return parseFloat(cleanValue) || 0;
}

// ========================================
// FORMATAÇÃO DE DATA E HORA
// ========================================

/**
 * Formata data no padrão brasileiro (dd/MM/yyyy)
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "dd/MM/yyyy", { locale: ptBR });
}

/**
 * Formata data e hora (dd/MM/yyyy HH:mm)
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

/**
 * Formata apenas a hora (HH:mm)
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "HH:mm", { locale: ptBR });
}

/**
 * Formata data por extenso (Ex: 15 de janeiro de 2024)
 */
export function formatDateLong(date: Date | string): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

/**
 * Formata data relativa (Ex: há 2 dias, em 3 horas)
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: ptBR });
}

/**
 * Formata distância entre duas datas
 */
export function formatDateDistance(
  from: Date | string,
  to: Date | string
): string {
  const fromDate = typeof from === "string" ? parseISO(from) : from;
  const toDate = typeof to === "string" ? parseISO(to) : to;
  return formatDistance(fromDate, toDate, { locale: ptBR });
}

/**
 * Dia da semana por extenso
 */
export function formatWeekday(date: Date | string): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "EEEE", { locale: ptBR });
}

// ========================================
// FORMATAÇÃO DE TELEFONE
// ========================================

/**
 * Formata telefone brasileiro
 * Input: 11987654321 -> Output: (11) 98765-4321
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(
      7
    )}`;
  }

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(
      6
    )}`;
  }

  return phone;
}

/**
 * Remove formatação do telefone
 */
export function parsePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

// ========================================
// FORMATAÇÃO DE CPF/CNPJ
// ========================================

/**
 * Formata CPF
 * Input: 12345678900 -> Output: 123.456.789-00
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, "");

  if (cleaned.length !== 11) {
    return cpf;
  }

  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(
    6,
    9
  )}-${cleaned.slice(9)}`;
}

/**
 * Formata CNPJ
 * Input: 12345678000190 -> Output: 12.345.678/0001-90
 */
export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, "");

  if (cleaned.length !== 14) {
    return cnpj;
  }

  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(
    5,
    8
  )}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
}

// ========================================
// FORMATAÇÃO DE CEP
// ========================================

/**
 * Formata CEP
 * Input: 12345678 -> Output: 12345-678
 */
export function formatCEP(cep: string): string {
  const cleaned = cep.replace(/\D/g, "");

  if (cleaned.length !== 8) {
    return cep;
  }

  return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
}

// ========================================
// FORMATAÇÃO DE DURAÇÃO
// ========================================

/**
 * Formata duração em minutos para formato legível
 * Input: 90 -> Output: 1h 30min
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
}

// ========================================
// FORMATAÇÃO DE TEXTO
// ========================================

/**
 * Capitaliza primeira letra
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Capitaliza primeira letra de cada palavra
 */
export function capitalizeWords(text: string): string {
  return text.split(" ").map(capitalize).join(" ");
}

/**
 * Trunca texto com ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Cria slug a partir de texto
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ========================================
// FORMATAÇÃO DE PORCENTAGEM
// ========================================

/**
 * Formata porcentagem
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

// ========================================
// FORMATAÇÃO DE TAMANHO DE ARQUIVO
// ========================================

/**
 * Formata tamanho de arquivo
 * Input: 1024 -> Output: 1 KB
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
