/**
 * Setup do Jest para testes com Next.js 15 e React Testing Library
 */

import "@testing-library/jest-dom";

// Mock do Next.js Navigation
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      pathname: "/",
    };
  },
  usePathname() {
    return "/";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  redirect: jest.fn(),
}));

// Mock do localStorage
class LocalStorageMock {
  public store: Record<string, string> = {};

  getItem = jest.fn((key: string): string | null => {
    return this.store[key] || null;
  });

  setItem = jest.fn((key: string, value: string): void => {
    // Verificar se value não é undefined/null antes de chamar toString
    this.store[key] = value != null ? String(value) : "";
  });

  removeItem = jest.fn((key: string): void => {
    delete this.store[key];
  });

  clear = jest.fn((): void => {
    this.store = {};
  });

  get length(): number {
    return Object.keys(this.store).length;
  }

  key = jest.fn((index: number): string | null => {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  });
}

const localStorageMock = new LocalStorageMock();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Mock do fetch (caso necessário)
global.fetch = jest.fn();

// Limpar todos os mocks antes de cada teste
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  localStorageMock.store = {}; // Reset do store interno
});
