"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { AuthResponse, User } from "@/types";

/**
 * Hook de Autenticação
 *
 * Integra com Better Auth da API
 */
export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  /**
   * Login com email e senha
   */
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<AuthResponse>("/auth/sign-in/email", {
        email,
        password,
      });

      const { session, user } = response.data;

      // Salva token no localStorage
      localStorage.setItem("quezi_token", session.token);

      setUser(user);
      router.push("/dashboard");

      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Erro ao fazer login. Tente novamente.";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registro de novo usuário
   */
  const register = async (data: {
    email: string;
    password: string;
    name: string;
    userType: "CLIENT" | "PROFESSIONAL";
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<AuthResponse>(
        "/auth/sign-up/email",
        data
      );

      const { session, user } = response.data;

      // Salva token no localStorage
      localStorage.setItem("quezi_token", session.token);

      setUser(user);
      router.push("/dashboard");

      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Erro ao criar conta. Tente novamente.";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      await api.post("/auth/sign-out");
    } catch {
      // Ignora erro de logout
    } finally {
      localStorage.removeItem("quezi_token");
      setUser(null);
      router.push("/login");
    }
  };

  /**
   * Obter perfil do usuário autenticado
   */
  const getProfile = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<User>("/auth/me");
      setUser(response.data);
      return response.data;
    } catch (err) {
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    login,
    register,
    logout,
    getProfile,
    isLoading,
    error,
  };
}
