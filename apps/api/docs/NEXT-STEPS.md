# 🚀 Próximos Passos - Frontend Quezi

## ✅ **O Que Já Foi Feito (Backend Completo)**

- ✅ API com Clean Architecture + DDD
- ✅ Autenticação completa (Better Auth + BCrypt + OAuth)
- ✅ Organizations e RBAC
- ✅ 90 testes unitários (100% passando)
- ✅ Documentação completa
- ✅ Zero erros

---

## 🎨 **Próxima Etapa: Frontend Next.js 15**

### 1. Instalar Dependências do Frontend

```bash
cd apps/web
npm install next@latest react@latest react-dom@latest typescript @types/react @types/node @types/react-dom
npm install tailwindcss postcss autoprefixer
npm install @hookform/resolvers react-hook-form zod axios js-cookie lodash date-fns
npm install lucide-react clsx tailwind-merge class-variance-authority
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react
```

### 2. Configurar Tailwind com Paleta Quezi

**tailwind.config.ts:**
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Quezi
        marsala: {
          DEFAULT: "#8B4660",
          light: "#A15468",
          dark: "#954D5F",
        },
        dourado: {
          DEFAULT: "#D4AF37",
          light: "#F2E3B3",
          medium: "#E8C68A",
        },
        neutral: {
          white: "#FFFFFF",
          pearl: "#F5F5F5",
          medium: "#E0E0E0",
          graphite: "#6B6B6B",
        },
        accent: {
          blush: "#F4E4E6",
          champagne: "#F9F4EF",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        quezi: "12px",
        "quezi-lg": "20px",
      },
    },
  },
  plugins: [],
};

export default config;
```

### 3. Instalar ShadCN/UI

```bash
npx shadcn@latest init
```

Selecione:
- Style: Default
- Base color: Neutral
- CSS variables: Yes

Instale componentes:
```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add form
npx shadcn@latest add dialog
npx shadcn@latest add avatar
npx shadcn@latest add badge
npx shadcn@latest add tabs
npx shadcn@latest add calendar
```

### 4. Criar Estrutura de Pastas

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx (Home)
│   │   ├── organizations/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx (Landing)
│   └── globals.css
├── components/
│   ├── ui/ (ShadCN components)
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── organizations/
│   │   ├── OrganizationCard.tsx
│   │   ├── CreateOrgModal.tsx
│   │   └── InviteMemberModal.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── lib/
│   ├── api.ts (Axios client)
│   ├── auth.ts (Auth helpers)
│   └── utils.ts
├── hooks/
│   ├── use-auth.ts
│   ├── use-organizations.ts
│   └── use-toast.ts
├── types/
│   └── index.ts
└── __tests__/
    └── (testes com Vitest)
```

### 5. Configurar API Client (Axios)

**lib/api.ts:**
```typescript
import axios from "axios";
import Cookies from "js-cookie";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = Cookies.get("quezi_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("quezi_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### 6. Criar Hook de Autenticação

**hooks/use-auth.ts:**
```typescript
import { useState } from "react";
import { api } from "@/lib/api";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/sign-in/email", {
        email,
        password,
      });
      
      Cookies.set("quezi_token", response.data.session.token, { expires: 7 });
      router.push("/");
      return response.data;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/sign-up/email", data);
      Cookies.set("quezi_token", response.data.session.token, { expires: 7 });
      router.push("/");
      return response.data;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove("quezi_token");
    router.push("/login");
  };

  return { login, register, logout, isLoading };
}
```

### 7. Criar Tela de Login

**app/(auth)/login/page.tsx:**
```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    await login(data.email, data.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent-champagne">
      <div className="w-full max-w-md p-8 bg-white rounded-quezi-lg shadow-xl">
        <h1 className="font-display text-3xl text-marsala mb-6 text-center">
          Bem-vinda ao Quezi
        </h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              {...register("email")}
              type="email"
              placeholder="Email"
              className="border-neutral-medium focus:border-marsala"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Input
              {...register("password")}
              type="password"
              placeholder="Senha"
              className="border-neutral-medium focus:border-marsala"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-marsala hover:bg-marsala-dark text-white"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-neutral-graphite text-sm">
            Não tem conta?{" "}
            <a href="/register" className="text-marsala hover:underline">
              Cadastre-se
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## 📚 **Documentação Para Frontend**

Criei um guia completo em `NEXT-STEPS.md` com:
- ✅ Instalação completa
- ✅ Configuração Tailwind com paleta Quezi
- ✅ Setup ShadCN/UI
- ✅ Estrutura de pastas
- ✅ Exemplos de código
- ✅ Integração com a API

---

## 🎯 **Para Continuar:**

**Quando a conexão estabilizar:**

```bash
cd apps/web

# Instalar dependências (tente novamente)
npm install

# Ou instalar manualmente seguindo NEXT-STEPS.md
```

**Ou posso:**
1. ✅ Criar apenas os arquivos de configuração e estrutura
2. ✅ Implementar mais módulos no backend (Services, Appointments)
3. ✅ Melhorar documentação existente

**O que você prefere que eu faça?** 🚀
