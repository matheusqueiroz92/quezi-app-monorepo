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
  baseURL:
    env.NODE_ENV === "production"
      ? "https://your-production-url.com"
      : `http://${env.HOST}:${env.PORT}`,

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
      async sendInvitationEmail(data) {
        // TODO: Implementar envio de email de convite
        console.log("📧 Convite de organização:", {
          email: data.email,
          organizationName: data.organization.name,
          inviterName: data.inviter.name,
        });
      },

      // Roles disponíveis nas organizações
      roles: {
        admin: {
          name: "Admin",
          description: "Administrador com acesso total",
        },
        member: {
          name: "Member",
          description: "Membro com acesso limitado",
        },
        owner: {
          name: "Owner",
          description: "Dono da organização",
        },
      },
    }),

    // Plugin de 2FA
    twoFactor({
      // Configuração de TOTP (Google Authenticator, etc)
      totp: {
        enabled: true,
      },
    }),
  ],

  // Configurações avançadas
  advanced: {
    // Usar BCrypt para hash de senhas
    useSecureCookies: env.NODE_ENV === "production",
    cookieName: "quezi_session",
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
    // Callback após criar usuário
    async onSignUp(user) {
      console.log("✅ Novo usuário registrado:", {
        id: user.id,
        email: user.email,
        name: user.name,
      });

      // TODO: Enviar email de boas-vindas
    },

    // Callback após login
    async onSignIn(user) {
      console.log("🔐 Usuário fez login:", {
        id: user.id,
        email: user.email,
      });
    },
  },
});

/**
 * Tipos do Better Auth para uso no código
 */
export type Auth = typeof auth;
export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;
export type User = Session["user"];
