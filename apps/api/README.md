# 🚀 Quezi API

API REST moderna para a plataforma Quezi (marketplace de serviços), construída com Node.js, Fastify e TypeScript, seguindo Clean Architecture, DDD e princípios SOLID. Este README reflete o estado atual da API após a consolidação da arquitetura e otimizações recentes.

## 🧰 Stack e Ferramentas

- Node.js 18+
- Fastify 5
- TypeScript 5
- PostgreSQL + Prisma ORM
- Better Auth (autenticação)
- Zod (validação)
- Jest (testes)
- Docker/Docker Compose (infra local)

## 🏗️ Arquitetura (Clean Architecture)

```
src/
├─ domain/                      # Regras de domínio
│  ├─ entities/                 # Entidades de domínio
│  └─ interfaces/               # Contratos (interfaces)
├─ application/                 # Casos de uso/serviços de aplicação
│  └─ services/                 # Regras de negócio orquestradas
├─ infrastructure/              # Acesso a dados/integrações
│  └─ repositories/             # Implementações de repositórios (Prisma)
├─ presentation/                # Borda HTTP
│  ├─ controllers/              # Handlers (Fastify)
│  └─ routes/                   # Registro de rotas
├─ middlewares/                 # Autenticação, RBAC e erros
├─ lib/                         # Prisma e Auth clients
├─ utils/                       # Erros e utilidades
├─ config/                      # Config e env
├─ app.ts, routes.ts, server.ts # Bootstrap da aplicação
```

Princípios:

- Separação clara de camadas e responsabilidades.
- Dependência de dentro para fora (domain não depende de nada).
- Repositórios injetáveis (testabilidade).

## ⚙️ Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm 9+ (ou pnpm/yarn se preferir)

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` em `apps/api` (ou use o ambiente do seu host/CI):

```
DATABASE_URL=postgresql://userquezi-app:passwordquezi-app@localhost:5432/quezi-app_db
BETTER_AUTH_SECRET=changeme
BETTER_AUTH_URL=http://localhost:3333
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=changeme
JWT_EXPIRES_IN=7d
SWAGGER_ENABLED=true
```

Observações:

- O Better Auth está configurado com basePath `/api/v1/auth`.
- Ajuste `DATABASE_URL` conforme o seu Docker Compose.

## 🐘 Banco de Dados (Prisma)

Comandos úteis:

```
npm run prisma:generate   # gera o client
npm run prisma:migrate    # aplica migrations (dev)
npm run prisma:studio     # abre o Prisma Studio
```

## 🌱 Seed (cria o primeiro Super Admin)

O seed cria um usuário `SUPER_ADMIN` e categorias iniciais.

Arquivo: `prisma/seed.ts`

- Email: `admin@quezi.com`
- Senha: `Admin@2025` (troque em produção)

Executar:

```
npm run seed
```

Para personalizar as credenciais, edite `apps/api/prisma/seed.ts` (campos `email` e `adminPassword`).

## ▶️ Execução

Local (dev):

```
# na raiz do workspace (ou em apps/api)
cd apps/api
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Docker (banco):

```
npm run docker:up
# depois rode as migrations e o app como acima
```

Build e produção:

```
npm run build
npm start
```

## 🔑 Autenticação (Better Auth)

Base path: `/api/v1/auth`

Endpoints principais:

- `POST /auth/sign-up` — registrar por email/senha
- `POST /auth/sign-in` — login por email/senha
- `POST /auth/sign-out` — logout
- `POST /auth/forgot-password` — iniciar fluxo de recuperação
- `POST /auth/reset-password` — redefinir senha
- `GET  /auth/me` — dados da sessão/usuário atual

Config em `src/lib/auth.ts`. O proxy de rotas está nos controllers de auth em `presentation/controllers/auth.controller.ts` e registradas em `routes.ts`.

## 👥 Autorização (RBAC)

- Middleware: `src/middlewares/rbac.middleware.ts`
- Exemplo: `rbacMiddleware(["ADMIN"])`
- O `authMiddleware` adiciona `request.user` com `id`, `email`, `name` e `userType`.

## 📚 Módulos Principais

- Users: CRUD e perfis simplificados (cliente/profissional/empresa/admin)
- Admin: gestão administrativa e estatísticas
- Appointments: agendamentos, conflitos e estados
- Offered Services (Service): oferta de serviços de profissionais/empresas
- Reviews (CompanyEmployeeReview): avaliações e métricas
- Professional Profile: dados avançados de profissionais
- Company Employee: funcionários de empresas

Controllers em `presentation/controllers`, services em `application/services` e repositórios em `infrastructure/repositories`.

## 🧪 Testes

Comandos:

```
npm test            # todos os testes
npm run test:watch  # modo watch
npm run test:coverage
```

Abrangência:

- Unitários: serviços, repositórios e middlewares
- Integração: controllers selecionados

## 📜 Convenções de Código

- TypeScript em todas as camadas
- Nomes descritivos (Clean Code)
- Serviços com injeção de dependências para testabilidade
- Zod para validação (quando aplicável)
- Tratamento de erros centralizado (`utils/app-error.ts` + `middlewares/error-handler.ts`)

## 🗺️ Rotas Principais (resumo)

Prefixo global: `/api/v1`

- Auth: `/auth/*`
- Users: `/users/*`
- Admin: `/admin/*`
- Appointments: `/appointments/*`
- Offered Services: `/offered-services/*`
- Reviews: `/reviews/*`
- Professional Profiles: `/professional-profiles/*`
- Company Employees: `/company-employees/*`

Consulte `src/routes.ts` e controllers em `presentation/controllers` para detalhes.

## 🧱 Índices e Performance

Foram adicionados índices nos modelos de `Service`, `Appointment`, `Review` e `CompanyEmployeeReview` para acelerar buscas por profissional/cliente, data, status e rating. Veja `prisma/schema.prisma`.

## 🧩 Scripts úteis (package.json)

```
"dev": "tsx --watch --env-file=.env src/server.ts",
"build": "tsc",
"start": "node dist/server.js",
"test": "jest --passWithNoTests",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage",
"test:unit": "jest --testPathPattern=\\.test\\.ts$",
"prisma:generate": "prisma generate",
"prisma:migrate": "prisma migrate dev",
"prisma:studio": "prisma studio",
"prisma:seed": "tsx prisma/seed.ts",
"seed": "npm run prisma:seed",
"docker:up": "docker-compose up -d",
"docker:down": "docker-compose down",
"docker:logs": "docker-compose logs -f"
```

## ❓ Troubleshooting

- Conexão DB: valide `DATABASE_URL` e se o container está up (`npm run docker:up`).
- Prisma Client: rode `npm run prisma:generate` após mudanças no schema.
- Auth: confira `BETTER_AUTH_SECRET` e `BETTER_AUTH_URL`.

## 📄 Licença

Uso interno do projeto Quezi.
