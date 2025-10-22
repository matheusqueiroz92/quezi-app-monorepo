"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { post, getErrorMessage } from "@/lib/api-client";
import { setAuthToken, redirectByRole } from "@/lib/auth-utils";
import { loginSchema, type LoginInput } from "@/lib/validators";

export default function LoginPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);

    try {
      const response = await post<{ token: string }>(
        "/auth/sign-in/email",
        data
      );

      setAuthToken(response.token, true);

      toast({
        title: "Login realizado!",
        description: "Bem-vinda de volta ao Quezi!",
      });

      setTimeout(() => {
        redirectByRole();
      }, 500);
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      toast({
        title: "Erro ao fazer login",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: string) => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api/v1";
    window.location.href = `${apiUrl}/auth/oauth/${provider}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-champagne via-neutral-pearl to-accent-blush p-4">
      <div className="w-full max-w-md">
        {/* Card de Login */}
        <div className="bg-white rounded-quezi-lg shadow-xl p-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-marsala mb-2">
              Bem-vinda de volta!
            </h1>
            <p className="text-neutral-graphite">
              Acesse sua conta e continue sua jornada de beleza
            </p>
          </div>

          {/* Botões de OAuth */}
          <div className="space-y-3 mb-6">
            {/* Google */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-quezi border-neutral-medium hover:border-marsala hover:bg-accent-blush transition-all"
              onClick={() => handleOAuthLogin("google")}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar com Google
            </Button>

            {/* Facebook */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-quezi border-neutral-medium hover:border-marsala hover:bg-accent-blush transition-all"
              onClick={() => handleOAuthLogin("facebook")}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-3" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continuar com Facebook
            </Button>

            {/* Apple */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-quezi border-neutral-medium hover:border-marsala hover:bg-accent-blush transition-all"
              onClick={() => handleOAuthLogin("apple")}
              disabled={isLoading}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Continuar com Apple
            </Button>

            {/* Instagram */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-quezi border-neutral-medium hover:border-marsala hover:bg-accent-blush transition-all"
              onClick={() => handleOAuthLogin("instagram")}
              disabled={isLoading}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="url(#instagram-gradient)"
                viewBox="0 0 24 24"
              >
                <defs>
                  <linearGradient
                    id="instagram-gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#F58529" />
                    <stop offset="50%" stopColor="#DD2A7B" />
                    <stop offset="100%" stopColor="#8134AF" />
                  </linearGradient>
                </defs>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              Continuar com Instagram
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-neutral-graphite">
                Ou entre com email
              </span>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-graphite">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-graphite" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10 h-12 rounded-quezi border-neutral-medium focus:border-marsala focus:ring-marsala"
                  {...register("email")}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-neutral-graphite">
                  Senha
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-marsala hover:text-marsala-dark transition-colors"
                >
                  Esqueceu?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-graphite" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 rounded-quezi border-neutral-medium focus:border-marsala focus:ring-marsala"
                  {...register("password")}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-graphite hover:text-marsala transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Botão de Login */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-marsala hover:bg-marsala-dark text-white font-semibold rounded-quezi transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>

        {/* Link para cadastro */}
        <div className="text-center mt-6">
          <p className="text-sm text-neutral-graphite">
            Não tem uma conta?{" "}
            <Link
              href="/register"
              className="text-marsala hover:text-marsala-dark font-semibold transition-colors"
            >
              Cadastre-se gratuitamente
            </Link>
          </p>
        </div>

        {/* Link para admin */}
        <div className="text-center mt-4">
          <Link
            href="/admin/login"
            className="text-xs text-neutral-graphite/70 hover:text-marsala transition-colors"
          >
            Acesso administrativo
          </Link>
        </div>
      </div>
    </div>
  );
}
