"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Briefcase,
  ShoppingBag,
  MapPin,
  FileText,
} from "lucide-react";

import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { post, getErrorMessage } from "@/lib/api-client";
import { setAuthToken, redirectByRole } from "@/lib/auth-utils";
import { z } from "zod";

// Schemas de validação por etapa
const step1Schema = z.object({
  userType: z.enum(["CLIENT", "PROFESSIONAL"], {
    required_error: "Selecione um tipo de conta",
  }),
});

const step2Schema = z
  .object({
    name: z
      .string()
      .min(3, "Nome deve ter no mínimo 3 caracteres")
      .max(100, "Nome deve ter no máximo 100 caracteres")
      .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
    email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
    password: z
      .string()
      .min(8, "Senha deve ter no mínimo 8 caracteres")
      .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
      .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
      .regex(/[0-9]/, "Senha deve conter pelo menos um número")
      .regex(
        /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
        "Senha deve conter pelo menos um caractere especial"
      ),
    confirmPassword: z.string(),
    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

const step3Schema = z.object({
  city: z.string().min(2, "Cidade é obrigatória"),
  bio: z.string().optional(),
  specialties: z.string().optional(),
});

type RegisterFormData = z.infer<typeof step1Schema> &
  z.infer<typeof step2Schema> &
  z.infer<typeof step3Schema>;

type UserType = "CLIENT" | "PROFESSIONAL";

const TOTAL_STEPS = 4;

export default function RegisterPage() {
  const _router = useRouter();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [_userType, setUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Salvar progresso no localStorage
  const [savedProgress, setSavedProgress, clearProgress] = useLocalStorage<
    Partial<RegisterFormData>
  >("register_progress", {});

  const {
    register,
    _handleSubmit,
    formState: { _errors },
    watch,
    setValue,
    _trigger,
    getValues,
  } = useForm<RegisterFormData>({
    mode: "onChange",
    defaultValues: {
      name: savedProgress.name || "",
      email: savedProgress.email || "",
      password: "",
      confirmPassword: "",
      phone: savedProgress.phone || "",
      userType: savedProgress.userType || undefined,
      city: savedProgress.city || "",
      bio: savedProgress.bio || "",
      specialties: savedProgress.specialties || "",
    },
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const watchedUserType = watch("userType");

  // Validações da senha
  const passwordValidations = {
    minLength: password?.length >= 8,
    hasUpperCase: /[A-Z]/.test(password || ""),
    hasLowerCase: /[a-z]/.test(password || ""),
    hasNumber: /[0-9]/.test(password || ""),
    hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password || ""),
  };

  // Validação de confirmação de senha
  const passwordMatch =
    password === confirmPassword && confirmPassword.length > 0;

  const allValidationsPassed = Object.values(passwordValidations).every(
    (v) => v
  );

  // Progresso visual
  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  // Próxima etapa
  const handleNext = async () => {
    const values = getValues();

    try {
      // Validação com Zod por etapa
      if (currentStep === 1) {
        step1Schema.parse(values);
      } else if (currentStep === 2) {
        step2Schema.parse(values);
      } else if (currentStep === 3) {
        step3Schema.parse(values);
      }

      // Salvar progresso
      setSavedProgress({
        ...values,
      });

      // Avançar para próxima etapa
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    } catch (error) {
      if (
        error instanceof z.ZodError &&
        error.errors &&
        error.errors.length > 0
      ) {
        const firstError = error.errors[0];
        toast({
          title: "Campo inválido",
          description: firstError.message,
          variant: "destructive",
        });
      }
    }
  };

  // Etapa anterior
  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Selecionar tipo de usuário
  const handleSelectUserType = (type: UserType) => {
    setUserType(type);
    setValue("userType", type);
    setSavedProgress({ ...savedProgress, userType: type });
  };

  // Submit final
  const onSubmit = async () => {
    setIsLoading(true);

    const values = getValues();

    // Debug: verificar valores
    console.log("📝 Dados do cadastro:", {
      name: values.name,
      email: values.email,
      userType: values.userType,
      city: values.city,
    });

    try {
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
        userType: values.userType,
        phone: values.phone || undefined,
        // Campos adicionais para profissional
        ...(values.userType === "PROFESSIONAL" && {
          bio: values.bio,
          city: values.city,
          specialties: values.specialties?.split(",").map((s) => s.trim()),
        }),
        // Campos adicionais para cliente
        ...(values.userType === "CLIENT" && {
          city: values.city,
        }),
      };

      console.log("📤 Payload enviado para API:", payload);

      const response = await post<{ token: string }>(
        "/auth/sign-up/email",
        payload
      );

      setAuthToken(response.token, true);

      toast({
        title: "Cadastro realizado!",
        description: "Bem-vinda ao Quezi!",
      });

      // Limpar progresso salvo
      clearProgress();

      setTimeout(() => {
        redirectByRole();
      }, 500);
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      toast({
        title: "Erro ao criar conta",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-champagne via-neutral-pearl to-accent-blush p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-quezi-lg shadow-xl p-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>

          {/* Progresso */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-neutral-graphite">
                Etapa {currentStep} de {TOTAL_STEPS}
              </span>
              <span className="text-sm text-neutral-graphite">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div>
            {/* Step 1: Seleção de Perfil */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-4 duration-300">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-display font-bold text-marsala mb-2">
                    Como você quer usar o Quezi?
                  </h2>
                  <p className="text-neutral-graphite">
                    Selecione o tipo de conta que melhor se adequa a você
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Cliente */}
                  <button
                    type="button"
                    onClick={() => handleSelectUserType("CLIENT")}
                    className={`p-6 rounded-quezi-lg border-2 transition-all duration-200 ${
                      watchedUserType === "CLIENT"
                        ? "border-marsala bg-accent-blush shadow-lg scale-105"
                        : "border-neutral-medium hover:border-marsala/50 hover:bg-accent-blush/30"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`p-4 rounded-full mb-4 ${
                          watchedUserType === "CLIENT"
                            ? "bg-marsala"
                            : "bg-neutral-pearl"
                        }`}
                      >
                        <ShoppingBag
                          className={`w-8 h-8 ${
                            watchedUserType === "CLIENT"
                              ? "text-white"
                              : "text-marsala"
                          }`}
                        />
                      </div>
                      <h3 className="text-xl font-display font-bold text-marsala mb-2">
                        Cliente
                      </h3>
                      <p className="text-sm text-neutral-graphite">
                        Quero agendar e contratar serviços de beleza e estética
                      </p>
                    </div>
                  </button>

                  {/* Profissional */}
                  <button
                    type="button"
                    onClick={() => handleSelectUserType("PROFESSIONAL")}
                    className={`p-6 rounded-quezi-lg border-2 transition-all duration-200 ${
                      watchedUserType === "PROFESSIONAL"
                        ? "border-marsala bg-accent-blush shadow-lg scale-105"
                        : "border-neutral-medium hover:border-marsala/50 hover:bg-accent-blush/30"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`p-4 rounded-full mb-4 ${
                          watchedUserType === "PROFESSIONAL"
                            ? "bg-marsala"
                            : "bg-neutral-pearl"
                        }`}
                      >
                        <Briefcase
                          className={`w-8 h-8 ${
                            watchedUserType === "PROFESSIONAL"
                              ? "text-white"
                              : "text-marsala"
                          }`}
                        />
                      </div>
                      <h3 className="text-xl font-display font-bold text-marsala mb-2">
                        Profissional
                      </h3>
                      <p className="text-sm text-neutral-graphite">
                        Quero oferecer meus serviços e gerenciar meus
                        agendamentos
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Dados Básicos */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-display font-bold text-marsala mb-2">
                    Criar sua conta
                  </h2>
                  <p className="text-neutral-graphite text-sm">
                    Preencha seus dados básicos
                  </p>
                </div>

                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-graphite" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      className="pl-10 h-12 rounded-quezi"
                      {...register("name")}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-graphite" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10 h-12 rounded-quezi"
                      {...register("email")}
                    />
                  </div>
                </div>

                {/* Telefone (opcional) */}
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Telefone{" "}
                    <span className="text-neutral-graphite/50">(opcional)</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-graphite" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(99) 99999-9999"
                      className="pl-10 h-12 rounded-quezi"
                      {...register("phone")}
                    />
                  </div>
                </div>

                {/* Senha */}
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-graphite" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-12 rounded-quezi"
                      {...register("password")}
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

                  {/* Validações da senha */}
                  {password && (
                    <div className="space-y-1 mt-2 p-3 bg-neutral-pearl/50 rounded-quezi">
                      <ValidationItem
                        isValid={passwordValidations.minLength}
                        text="Mínimo 8 caracteres"
                      />
                      <ValidationItem
                        isValid={passwordValidations.hasUpperCase}
                        text="Uma letra maiúscula"
                      />
                      <ValidationItem
                        isValid={passwordValidations.hasLowerCase}
                        text="Uma letra minúscula"
                      />
                      <ValidationItem
                        isValid={passwordValidations.hasNumber}
                        text="Um número"
                      />
                      <ValidationItem
                        isValid={passwordValidations.hasSpecialChar}
                        text="Um caractere especial"
                      />
                    </div>
                  )}
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-graphite" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`pl-10 pr-10 h-12 rounded-quezi ${
                        confirmPassword && !passwordMatch
                          ? "border-red-500 focus:border-red-500"
                          : confirmPassword && passwordMatch
                          ? "border-green-500 focus:border-green-500"
                          : ""
                      }`}
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-graphite hover:text-marsala transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Validação de confirmação de senha */}
                  {confirmPassword && (
                    <div className="mt-2">
                      <ValidationItem
                        isValid={passwordMatch}
                        text={
                          passwordMatch
                            ? "Senhas coincidem"
                            : "As senhas não coincidem"
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Informações Adicionais */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-display font-bold text-marsala mb-2">
                    {watchedUserType === "PROFESSIONAL"
                      ? "Informações Profissionais"
                      : "Informações Adicionais"}
                  </h2>
                  <p className="text-neutral-graphite text-sm">
                    {watchedUserType === "PROFESSIONAL"
                      ? "Conte-nos mais sobre você e seus serviços"
                      : "Complete seu perfil para melhorar sua experiência"}
                  </p>
                </div>

                {/* Cidade */}
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-graphite" />
                    <Input
                      id="city"
                      type="text"
                      placeholder="São Paulo, SP"
                      className="pl-10 h-12 rounded-quezi"
                      {...register("city")}
                    />
                  </div>
                </div>

                {/* Campos específicos para Profissional */}
                {watchedUserType === "PROFESSIONAL" && (
                  <>
                    {/* Bio */}
                    <div className="space-y-2">
                      <Label htmlFor="bio">
                        Sobre você{" "}
                        <span className="text-neutral-graphite/50 text-sm font-normal">
                          (máx. 500 caracteres)
                        </span>
                      </Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 w-5 h-5 text-neutral-graphite" />
                        <Textarea
                          id="bio"
                          placeholder="Conte um pouco sobre sua experiência, especialidades e o que te diferencia..."
                          className="pl-10 min-h-[120px] rounded-quezi resize-none"
                          maxLength={500}
                          {...register("bio")}
                        />
                      </div>
                    </div>

                    {/* Especialidades */}
                    <div className="space-y-2">
                      <Label htmlFor="specialties">
                        Especialidades{" "}
                        <span className="text-neutral-graphite/50 text-sm font-normal">
                          (separadas por vírgula)
                        </span>
                      </Label>
                      <Input
                        id="specialties"
                        type="text"
                        placeholder="Ex: Corte, Coloração, Penteados"
                        className="h-12 rounded-quezi"
                        {...register("specialties")}
                      />
                      <p className="text-xs text-neutral-graphite/70">
                        Liste suas principais especialidades separadas por
                        vírgula
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 4: Confirmação */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-green-50 rounded-full">
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-display font-bold text-marsala mb-2">
                    Quase lá!
                  </h2>
                  <p className="text-neutral-graphite text-sm">
                    Revise seus dados e confirme para criar sua conta
                  </p>
                </div>

                {/* Resumo dos dados */}
                <div className="space-y-4 p-6 bg-neutral-pearl/50 rounded-quezi">
                  <div>
                    <p className="text-xs text-neutral-graphite/70 mb-1">
                      Tipo de conta
                    </p>
                    <p className="font-semibold text-marsala">
                      {watchedUserType === "CLIENT"
                        ? "Cliente"
                        : "Profissional"}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs text-neutral-graphite/70 mb-1">
                      Nome
                    </p>
                    <p className="font-semibold">{watch("name")}</p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-graphite/70 mb-1">
                      Email
                    </p>
                    <p className="font-semibold">{watch("email")}</p>
                  </div>

                  {watch("phone") && (
                    <div>
                      <p className="text-xs text-neutral-graphite/70 mb-1">
                        Telefone
                      </p>
                      <p className="font-semibold">{watch("phone")}</p>
                    </div>
                  )}

                  {watch("city") && (
                    <div>
                      <p className="text-xs text-neutral-graphite/70 mb-1">
                        Cidade
                      </p>
                      <p className="font-semibold">{watch("city")}</p>
                    </div>
                  )}
                </div>

                {/* Termos de Uso */}
                <div className="p-4 bg-accent-blush rounded-quezi">
                  <p className="text-xs text-center text-neutral-graphite">
                    Ao criar sua conta, você concorda com nossos{" "}
                    <Link
                      href="/terms"
                      className="text-marsala hover:underline"
                    >
                      Termos de Uso
                    </Link>{" "}
                    e{" "}
                    <Link
                      href="/privacy"
                      className="text-marsala hover:underline"
                    >
                      Política de Privacidade
                    </Link>
                    .
                  </p>
                </div>
              </div>
            )}

            {/* Botões de Navegação */}
            <div className="flex items-center gap-3 mt-8">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 h-12 rounded-quezi"
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              )}

              {currentStep < TOTAL_STEPS ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 h-12 bg-marsala hover:bg-marsala-dark text-white rounded-quezi"
                  disabled={
                    (currentStep === 1 && !watchedUserType) ||
                    (currentStep === 2 &&
                      (!allValidationsPassed || !passwordMatch))
                  }
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={onSubmit}
                  disabled={isLoading}
                  className="flex-1 h-12 bg-marsala hover:bg-marsala-dark text-white rounded-quezi shadow-md hover:shadow-lg transition-all"
                >
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Link para login */}
        <div className="text-center mt-6">
          <p className="text-sm text-neutral-graphite">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="text-marsala hover:text-marsala-dark font-semibold transition-colors"
            >
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para validação de senha
function ValidationItem({ isValid, text }: { isValid: boolean; text: string }) {
  return (
    <div
      className={`text-xs flex items-center gap-2 transition-colors ${
        isValid ? "text-green-600" : "text-neutral-graphite"
      }`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full transition-colors ${
          isValid ? "bg-green-600" : "bg-neutral-medium"
        }`}
      />
      {text}
    </div>
  );
}
