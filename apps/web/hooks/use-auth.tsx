"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { User } from "@/types";

/**
 * Hook de autenticação
 * Gerencia login, registro, logout e estado do usuário
 */

interface RegisterData {
  email: string;
  password: string;
  name: string;
  userType: "CLIENT" | "PROFESSIONAL";
}

interface AuthResponse {
  user: User;
  session: {
    token: string;
    expiresAt: string;
  };
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fazer login
   */
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await api.post<AuthResponse>("/auth/sign-in/email", {
          email,
          password,
        });

        const { user: userData, session } = response.data;

        // Armazenar token
        localStorage.setItem("quezi_token", session.token);

        // Atualizar estado
        setUser(userData);

        // Redirecionar para dashboard
        router.push("/dashboard");
      } catch (err: any) {
        const message =
          err.response?.data?.message ||
          "Erro ao fazer login. Tente novamente.";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  /**
   * Registrar novo usuário
   */
  const register = useCallback(
    async (data: RegisterData) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await api.post<AuthResponse>(
          "/auth/sign-up/email",
          data
        );

        const { user: userData, session } = response.data;

        // Armazenar token
        localStorage.setItem("quezi_token", session.token);

        // Atualizar estado
        setUser(userData);

        // Redirecionar para dashboard
        router.push("/dashboard");
      } catch (err: any) {
        const message =
          err.response?.data?.message ||
          "Erro ao criar conta. Tente novamente.";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  /**
   * Fazer logout
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);

      // Chamar API para invalidar sessão
      await api.post("/auth/sign-out").catch(() => {
        // Ignorar erros de logout da API
      });
    } finally {
      // Sempre limpar o estado local
      localStorage.removeItem("quezi_token");
      setUser(null);
      setError(null);
      setIsLoading(false);

      // Redirecionar para login
      router.push("/login");
    }
  }, [router]);

  /**
   * Buscar perfil do usuário autenticado
   */
  const getProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get<User>("/auth/me");
      setUser(response.data);

      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Não autorizado";
      setError(message);

      // Se não autenticado, redirecionar para login
      if (err.response?.status === 401) {
        localStorage.removeItem("quezi_token");
        router.push("/login");
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    getProfile,
  };
}
