import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

/**
 * Utilitários de autenticação
 */

export interface DecodedToken {
  userId: string;
  email: string;
  userType: "CLIENT" | "PROFESSIONAL" | "ADMIN";
  exp: number;
  iat: number;
}

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// ========================================
// TOKEN MANAGEMENT
// ========================================

/**
 * Salva o token de autenticação
 */
export function setAuthToken(token: string, rememberMe: boolean = false): void {
  const options = rememberMe ? { expires: 30 } : undefined; // 30 dias
  Cookies.set(TOKEN_KEY, token, options);
}

/**
 * Recupera o token de autenticação
 */
export function getAuthToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

/**
 * Remove o token de autenticação
 */
export function removeAuthToken(): void {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
}

/**
 * Salva o refresh token
 */
export function setRefreshToken(token: string): void {
  Cookies.set(REFRESH_TOKEN_KEY, token, { expires: 30 });
}

/**
 * Recupera o refresh token
 */
export function getRefreshToken(): string | undefined {
  return Cookies.get(REFRESH_TOKEN_KEY);
}

// ========================================
// TOKEN DECODING
// ========================================

/**
 * Decodifica o token JWT
 */
export function decodeToken(token?: string): DecodedToken | null {
  try {
    const authToken = token || getAuthToken();

    if (!authToken) {
      return null;
    }

    return jwtDecode<DecodedToken>(authToken);
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    return null;
  }
}

/**
 * Verifica se o token está expirado
 */
export function isTokenExpired(token?: string): boolean {
  const decoded = decodeToken(token);

  if (!decoded) {
    return true;
  }

  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
}

/**
 * Verifica se o usuário está autenticado
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();

  if (!token) {
    return false;
  }

  return !isTokenExpired(token);
}

// ========================================
// USER INFO
// ========================================

/**
 * Recupera informações do usuário do token
 */
export function getCurrentUser(): DecodedToken | null {
  if (!isAuthenticated()) {
    return null;
  }

  return decodeToken();
}

/**
 * Recupera o tipo de usuário (role)
 */
export function getUserType(): "CLIENT" | "PROFESSIONAL" | "ADMIN" | null {
  const user = getCurrentUser();
  return user?.userType || null;
}

/**
 * Verifica se o usuário é um cliente
 */
export function isClient(): boolean {
  return getUserType() === "CLIENT";
}

/**
 * Verifica se o usuário é um profissional
 */
export function isProfessional(): boolean {
  return getUserType() === "PROFESSIONAL";
}

/**
 * Verifica se o usuário é um admin
 */
export function isAdmin(): boolean {
  return getUserType() === "ADMIN";
}

// ========================================
// ROUTE GUARDS
// ========================================

/**
 * Redireciona para login se não autenticado
 */
export function requireAuth(redirectTo: string = "/login"): void {
  if (typeof window !== "undefined" && !isAuthenticated()) {
    window.location.href = redirectTo;
  }
}

/**
 * Redireciona se já estiver autenticado
 */
export function requireGuest(redirectTo: string = "/dashboard"): void {
  if (typeof window !== "undefined" && isAuthenticated()) {
    window.location.href = redirectTo;
  }
}

/**
 * Redireciona baseado na role do usuário
 */
export function redirectByRole(): void {
  if (typeof window === "undefined") return;

  const userType = getUserType();

  switch (userType) {
    case "ADMIN":
      window.location.href = "/admin/dashboard";
      break;
    case "PROFESSIONAL":
      window.location.href = "/professional/dashboard";
      break;
    case "CLIENT":
      window.location.href = "/client/dashboard";
      break;
    default:
      window.location.href = "/";
  }
}

// ========================================
// LOGOUT
// ========================================

/**
 * Faz logout do usuário
 */
export function logout(redirectTo: string = "/login"): void {
  removeAuthToken();

  if (typeof window !== "undefined") {
    window.location.href = redirectTo;
  }
}
