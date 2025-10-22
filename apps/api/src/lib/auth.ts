import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization, twoFactor } from "better-auth/plugins";
import { prisma } from "./prisma";
import { env } from "../config/env";

/**
 * Configuração do Better Auth
 *
 * Recursos habilitados:
 * - Email/Password authentication
 * - Social OAuth (Google, GitHub)
 * - Organization & RBAC
 * - Two Factor Authentication
 * - Session management
 *
 * Docs: https://www.better-auth.com/docs/introduction
 */
export const auth = betterAuth({
  // Configuração do banco de dados
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Definir schema de usuário com campos customizados
  user: {
    additionalFields: {
      userType: {
        type: "string",
        required: false,
        defaultValue: "CLIENT",
        input: true, // Aceitar no input
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      bio: {
        type: "string",
        required: false,
        input: true,
      },
      city: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },

  // Configuração de email
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // TODO: Ativar quando configurar email
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  // Configuração de sessão
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // 1 dia
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutos
    },
  },

  // URLs da aplicação
  baseURL: env.BETTER_AUTH_URL || "http://localhost:3333",

  // Prefixo das rotas (importante: deve corresponder ao prefixo no routes.ts)
  basePath: "/api/v1/auth",

  // Origens confiáveis (frontend)
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
  ],

  // Configuração de social login
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID || "",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID || "",
      clientSecret: env.GITHUB_CLIENT_SECRET || "",
      enabled: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
    },
  },

  // Plugins
  plugins: [
    // Plugin de organizações e RBAC
    organization({
      async sendInvitationEmail(data: any) {
        // TODO: Implementar envio de email de convite
        console.log("📧 Convite de organização:", {
          email: data.email,
          organizationName: data.organization?.name || "Organização",
          inviterEmail: data.inviter?.email || "Convidador",
        });
      },
    }),

    // Plugin de 2FA
    twoFactor(),
  ],

  // Configurações avançadas
  advanced: {
    // Usar BCrypt para hash de senhas
    useSecureCookies: env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false,
    },
  },

  // Rate limiting
  rateLimit: {
    enabled: true,
    window: 60, // 1 minuto
    max: 10, // máximo de 10 requisições por minuto
  },

  // Callbacks
  callbacks: {
    // Callback ANTES de criar usuário - permite modificar dados
    async beforeUserCreate(user: any) {
      console.log("📝 Dados recebidos para criar usuário:", user);

      // Garantir que userType seja CLIENT se não fornecido
      if (!user.userType) {
        user.userType = "CLIENT";
      }

      console.log("✅ UserType definido como:", user.userType);

      return user;
    },

    // Callback após criar usuário
    async onSignUp(user: any, request: any) {
      console.log("✅ Novo usuário registrado:", {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
      });

      // TODO: Enviar email de boas-vindas
    },

    // Callback após login
    async onSignIn(user: any) {
      console.log("🔐 Usuário fez login:", {
        id: user.id,
        email: user.email,
        userType: user.userType,
      });
    },
  },
});

/**
 * Tipos do Better Auth para uso no código
 */
export type Auth = typeof auth;
