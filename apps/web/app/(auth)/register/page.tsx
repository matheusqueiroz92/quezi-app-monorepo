"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Schema de validação do formulário de registro
 * Segue as mesmas validações da API
 */
const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
  userType: z.enum(["CLIENT", "PROFESSIONAL"], {
    message: "Selecione um tipo de usuário",
  }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedUserType, setSelectedUserType] = useState<
    "CLIENT" | "PROFESSIONAL" | null
  >(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur", // Valida ao sair do campo
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
    } catch (err) {
      // Erro já tratado pelo hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-champagne via-neutral-white to-accent-blush p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-4">
            <h1 className="font-display text-4xl text-marsala">Quezi</h1>
            <div className="h-1 w-20 bg-gradient-to-r from-marsala to-dourado mx-auto mt-2 rounded-full" />
          </div>

          <CardTitle className="text-2xl">Crie sua conta</CardTitle>
          <CardDescription>
            {step === 1
              ? "Como você quer usar a Quezi?"
              : "Preencha seus dados para começar"}
          </CardDescription>

          {/* Progress */}
          <div className="flex gap-2 pt-4">
            <div
              role="progressbar"
              aria-valuenow={step >= 1 ? 100 : 0}
              aria-valuemin={0}
              aria-valuemax={100}
              className={`h-1 flex-1 rounded-full transition-colors ${
                step >= 1 ? "bg-marsala" : "bg-neutral-medium"
              }`}
            />
            <div
              role="progressbar"
              aria-valuenow={step >= 2 ? 100 : 0}
              aria-valuemin={0}
              aria-valuemax={100}
              className={`h-1 flex-1 rounded-full transition-colors ${
                step >= 2 ? "bg-marsala" : "bg-neutral-medium"
              }`}
            />
          </div>
        </CardHeader>

        <CardContent>
          {/* Step 1: Selecionar tipo de usuário */}
          {step === 1 && (
            <div className="space-y-4">
              <div
                onClick={() => {
                  setSelectedUserType("CLIENT");
                  setValue("userType", "CLIENT");
                }}
                className={`p-6 rounded-quezi-lg border-2 cursor-pointer transition-all ${
                  selectedUserType === "CLIENT"
                    ? "border-marsala bg-accent-blush"
                    : "border-neutral-medium hover:border-marsala/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">💆‍♀️</div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl text-marsala mb-2">
                      Sou Cliente
                    </h3>
                    <p className="text-sm text-neutral-graphite">
                      Quero encontrar e agendar serviços com profissionais
                    </p>
                  </div>
                  {selectedUserType === "CLIENT" && (
                    <div className="text-2xl text-marsala">✓</div>
                  )}
                </div>
              </div>

              <div
                onClick={() => {
                  setSelectedUserType("PROFESSIONAL");
                  setValue("userType", "PROFESSIONAL");
                }}
                className={`p-6 rounded-quezi-lg border-2 cursor-pointer transition-all ${
                  selectedUserType === "PROFESSIONAL"
                    ? "border-marsala bg-accent-blush"
                    : "border-neutral-medium hover:border-marsala/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">💼</div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl text-marsala mb-2">
                      Sou Profissional
                    </h3>
                    <p className="text-sm text-neutral-graphite">
                      Quero oferecer meus serviços e gerenciar agendamentos
                    </p>
                  </div>
                  {selectedUserType === "PROFESSIONAL" && (
                    <div className="text-2xl text-marsala">✓</div>
                  )}
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!selectedUserType}
                className="w-full bg-marsala hover:bg-marsala-dark"
              >
                Continuar
              </Button>
            </div>
          )}

          {/* Step 2: Dados pessoais */}
          {step === 2 && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Maria Silva"
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className={errors.password ? "border-red-500" : ""}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-graphite hover:text-marsala"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
                <div className="text-xs text-neutral-graphite space-y-1 mt-2">
                  <p>A senha deve conter:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li>Mínimo 8 caracteres</li>
                    <li>Uma letra maiúscula</li>
                    <li>Uma letra minúscula</li>
                    <li>Um número</li>
                  </ul>
                </div>
              </div>

              {/* Erro da API */}
              {error && (
                <div className="p-3 rounded-quezi bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-marsala hover:bg-marsala-dark"
                >
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-neutral-graphite">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="text-marsala hover:underline font-semibold"
            >
              Faça login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
