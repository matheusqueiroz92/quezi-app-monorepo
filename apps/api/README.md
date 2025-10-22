# 🚀 Quezi API

API REST desenvolvida com Node.js, Fastify, TypeScript e PostgreSQL para a plataforma Quezi - facilitador de agendamento e prestação de serviços.

## 📋 Sobre o Projeto

A Quezi é uma plataforma que conecta profissionais prestadores de serviços (principalmente beleza e estética) com clientes que desejam contratar esses serviços. Funciona como um marketplace de serviços, similar ao iFood, mas para compra/venda de serviços ao invés de comida.

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **Fastify** - Framework web de alta performance
- **TypeScript** - Superset JavaScript com tipagem estática
- **PostgreSQL** - Banco de dados relacional
- **Prisma** - ORM moderno para TypeScript
- **Better Auth** - Biblioteca universal de autenticação
- **Docker** - Containerização
- **Zod** - Validação de schemas
- **Swagger** - Documentação da API
- **Jest** - Framework de testes

## 📁 Arquitetura

O projeto segue uma **Arquitetura em Camadas** (Layered Architecture) com princípios de **DDD** (Domain-Driven Design) e **Clean Architecture**:

```
api/
├── src/
│   ├── modules/                    # Módulos de domínio (Clean Architecture)
│   │   ├── auth/                   # ✅ Autenticação Better Auth
│   │   ├── users/                  # ✅ Gestão de usuários (CRUD + Perfis)
│   │   ├── organizations/          # ✅ Organizações e RBAC
│   │   ├── offered-services/       # ✅ Serviços oferecidos e categorias
│   │   ├── appointments/           # ✅ Gestão de agendamentos
│   │   ├── reviews/                # ✅ Sistema de avaliações
│   │   ├── professional-profiles/  # ✅ Perfis profissionais completos
│   │   └── admin/                  # ✅ Painel administrativo (NOVO)
│   ├── config/                     # Configurações
│   │   └── env.ts                  # Validação de variáveis de ambiente
│   ├── types/                      # Tipos TypeScript compartilhados
│   ├── middlewares/                # Middlewares globais
│   │   ├── error-handler.ts        # Handler de erros centralizado
│   │   ├── auth.middleware.ts      # Middleware de autenticação
│   │   └── rbac.middleware.ts      # Middleware de controle de acesso
│   ├── utils/                      # Utilitários
│   │   ├── app-error.ts            # Classes de erro customizadas
│   │   └── password.ts             # Utilitários de senha (hash/verify)
│   ├── lib/                        # Bibliotecas compartilhadas
│   │   ├── prisma.ts               # Cliente Prisma (singleton)
│   │   └── auth.ts                 # Cliente Better Auth
│   ├── routes.ts                   # ✅ Agregador de rotas
│   ├── app.ts                      # ✅ Configuração do Fastify + Plugins
│   └── server.ts                   # ✅ Ponto de entrada
├── prisma/
│   ├── schema.prisma               # Schema do banco de dados
│   ├── migrations/                 # Migrações do banco
│   └── seed.ts                     # Seed com dados iniciais
├── docs/                           # 📚 Documentação técnica completa
│   ├── README.md                   # Índice de documentação
│   ├── QUICKSTART-AUTH.md          # Guia rápido de autenticação
│   ├── DATABASE-GUIDE.md           # Guia de banco de dados
│   ├── APPOINTMENTS-MODULE.md      # Doc do módulo de agendamentos
│   ├── REVIEWS-MODULE.md           # Doc do módulo de reviews
│   └── ... (24 arquivos)
└── docker-compose.yml              # Configuração Docker
```

## 🗃️ Modelo de Dados

### Entidades Principais

- **User** - Usuários do sistema (Cliente ou Profissional) com perfis estendidos
- **Account** - Contas de autenticação (Better Auth)
- **Session** - Sessões ativas (Better Auth)
- **Organization** - Organizações com controle de acesso (RBAC)
- **OrganizationMember** - Membros de organizações com roles
- **ProfessionalProfile** - Perfil profissional detalhado (bio, portfolio, horários, etc.)
- **Category** - Categorias de serviços
- **OfferedServices** - Serviços oferecidos pelos profissionais
- **Appointment** - Agendamentos entre clientes e profissionais
- **Review** - Avaliações dos serviços prestados
- **Admin** - Administradores da plataforma (NOVO)
- **AdminAction** - Log de ações administrativas (NOVO)

### Enums

- `UserType`: CLIENT, PROFESSIONAL
- `ServiceMode`: AT_LOCATION, AT_DOMICILE, BOTH
- `ServicePriceType`: FIXED, HOURLY
- `AppointmentStatus`: PENDING, ACCEPTED, REJECTED, COMPLETED
- `OrganizationRole`: OWNER, ADMIN, MEMBER
- `AdminRole`: SUPER_ADMIN, ADMIN, MODERATOR, SUPPORT, ANALYST (NOVO)

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ instalado
- Docker Desktop instalado e rodando
- NPM ou Yarn

### 1. Instalação das Dependências

```bash
npm install
```

### 2. Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Database
DATABASE_URL="postgresql://userquize:passwordquize@localhost:5432/quize_db"

# Better Auth
BETTER_AUTH_SECRET="your-secret-here"
BETTER_AUTH_URL="http://localhost:3333"
JWT_SECRET="your-jwt-secret-here"

# OAuth (opcional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

📖 **Veja o guia completo:** [ENV-SETUP-GUIDE.md](./docs/ENV-SETUP-GUIDE.md)

### 3. Iniciar o Banco de Dados

```bash
npm run docker:up
```

Isso irá iniciar:

- PostgreSQL na porta `5432`
- pgAdmin na porta `5050` (http://localhost:5050)

### 4. Executar as Migrações

```bash
npm run prisma:migrate
```

### 5. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

A API estará disponível em:

- **API Base**: `http://localhost:3333/api/v1`
- **Health Check**: `http://localhost:3333/health`
- **Documentação Swagger**: `http://localhost:3333/docs`

## 📡 Endpoints Disponíveis

### Health Check

- `GET /health` - Verifica status da API
- `GET /api/v1/test` - Endpoint de teste

### Authentication (Better Auth)

- `POST /api/v1/auth/sign-up/email` - Registro com email/senha
- `POST /api/v1/auth/sign-in/email` - Login com email/senha
- `POST /api/v1/auth/sign-out` - Logout
- `GET /api/v1/auth/session` - Buscar sessão atual
- `GET /api/v1/auth/oauth/{provider}` - OAuth (Google, GitHub)

### Users

- `POST /api/v1/users` - Criar usuário
- `GET /api/v1/users` - Listar usuários (paginação, filtros)
- `GET /api/v1/users/:id` - Buscar usuário por ID
- `PUT /api/v1/users/:id` - Atualizar usuário
- `DELETE /api/v1/users/:id` - Deletar usuário
- `PUT /api/v1/users/:id/profile` - Atualizar perfil (foto, bio, cidade) 🆕
- `GET /api/v1/users/:id/public-profile` - Buscar perfil público 🆕
- `PUT /api/v1/users/:id/notification-prefs` - Atualizar preferências 🆕

### Organizations

- `POST /api/v1/organizations` - Criar organização
- `POST /api/v1/organizations/:id/invite` - Convidar membro
- `PUT /api/v1/organizations/:organizationId/members/:memberId/role` - Atualizar role
- `GET /api/v1/organizations/me` - Listar minhas organizações

### Offered Services

- `POST /api/v1/services` - Criar serviço
- `GET /api/v1/services` - Listar serviços (filtros, paginação)
- `GET /api/v1/services/:id` - Buscar serviço por ID
- `PUT /api/v1/services/:id` - Atualizar serviço
- `DELETE /api/v1/services/:id` - Deletar serviço
- `GET /api/v1/services/popular` - Serviços mais populares

### Categories

- `POST /api/v1/categories` - Criar categoria
- `GET /api/v1/categories` - Listar categorias
- `GET /api/v1/categories/:id` - Buscar por ID
- `GET /api/v1/categories/slug/:slug` - Buscar por slug
- `PUT /api/v1/categories/:id` - Atualizar categoria
- `DELETE /api/v1/categories/:id` - Deletar categoria

### Appointments

- `POST /api/v1/appointments` - Criar agendamento
- `GET /api/v1/appointments` - Listar agendamentos (filtros, paginação)
- `GET /api/v1/appointments/:id` - Buscar por ID
- `PUT /api/v1/appointments/:id` - Atualizar agendamento
- `DELETE /api/v1/appointments/:id` - Cancelar agendamento
- `PUT /api/v1/appointments/:id/status` - Atualizar status
- `GET /api/v1/appointments/availability` - Verificar disponibilidade
- `GET /api/v1/appointments/stats` - Estatísticas

### Reviews

- `POST /api/v1/reviews` - Criar avaliação
- `GET /api/v1/reviews` - Listar avaliações (filtros, paginação)
- `GET /api/v1/reviews/:id` - Buscar por ID
- `PUT /api/v1/reviews/:id` - Atualizar avaliação
- `DELETE /api/v1/reviews/:id` - Deletar avaliação
- `GET /api/v1/reviews/appointment/:appointmentId` - Buscar por agendamento
- `GET /api/v1/reviews/professional/:professionalId/stats` - Estatísticas

### Professional Profiles

- `POST /api/v1/profiles` - Criar perfil profissional
- `GET /api/v1/profiles` - Listar perfis (filtros, ordenação)
- `GET /api/v1/profiles/search` - Buscar perfis
- `GET /api/v1/profiles/:userId` - Buscar perfil por ID
- `PUT /api/v1/profiles/:userId` - Atualizar perfil
- `DELETE /api/v1/profiles/:userId` - Deletar perfil
- `PUT /api/v1/profiles/:userId/portfolio` - Atualizar portfólio
- `PUT /api/v1/profiles/:userId/working-hours` - Atualizar horários
- `PUT /api/v1/profiles/:userId/active` - Ativar/desativar perfil
- `GET /api/v1/profiles/top-rated` - Perfis mais bem avaliados

### Admin (Painel Administrativo) 🆕

**Autenticação:**

- `POST /api/v1/admin/auth/login` - Login de admin
- `GET /api/v1/admin/auth/session` - Sessão atual

**Gestão de Admins:**

- `POST /api/v1/admin/admins` - Criar admin (SUPER_ADMIN)
- `GET /api/v1/admin/admins` - Listar admins
- `GET /api/v1/admin/admins/:id` - Buscar admin
- `PUT /api/v1/admin/admins/:id` - Atualizar admin (SUPER_ADMIN)
- `DELETE /api/v1/admin/admins/:id` - Deletar admin (SUPER_ADMIN)
- `PUT /api/v1/admin/admins/:id/password` - Trocar senha

**Gestão de Usuários:**

- `GET /api/v1/admin/users` - Listar todos os usuários
- `GET /api/v1/admin/users/:id` - Detalhes de usuário
- `PUT /api/v1/admin/users/:id/suspend` - Suspender usuário
- `PUT /api/v1/admin/users/:id/activate` - Ativar usuário
- `DELETE /api/v1/admin/users/:id` - Deletar permanentemente

**Analytics:**

- `GET /api/v1/admin/dashboard` - Dashboard principal
- `GET /api/v1/admin/stats/users` - Estatísticas de usuários

**Log:**

- `GET /api/v1/admin/actions` - Log de ações administrativas

📖 **Documentação completa dos endpoints:** [Swagger UI](http://localhost:3333/docs)

## 📜 Scripts Disponíveis

| Script                    | Descrição                                                |
| ------------------------- | -------------------------------------------------------- |
| `npm run dev`             | Inicia o servidor em modo desenvolvimento com hot-reload |
| `npm run build`           | Compila o TypeScript para JavaScript                     |
| `npm start`               | Inicia o servidor em produção                            |
| `npm test`                | Executa todos os testes                                  |
| `npm run test:watch`      | Executa testes em modo watch                             |
| `npm run test:coverage`   | Gera relatório de cobertura de testes                    |
| `npm run prisma:generate` | Gera o Prisma Client                                     |
| `npm run prisma:migrate`  | Cria e aplica migrações                                  |
| `npm run prisma:studio`   | Abre o Prisma Studio (GUI para o banco)                  |
| `npm run docker:up`       | Inicia os containers Docker                              |
| `npm run docker:down`     | Para os containers Docker                                |
| `npm run docker:logs`     | Visualiza logs dos containers                            |

## 🔗 Acesso ao pgAdmin

Para acessar o pgAdmin e gerenciar o banco de dados visualmente:

1. Acesse: http://localhost:5050
2. Login: `admin@quize.com`
3. Senha: `admin_secure_password`
4. Adicione um novo servidor com:
   - Host: `postgres_db` (ou `host.docker.internal` no Windows)
   - Port: `5432`
   - Database: `quize_db`
   - Username: `userquize`
   - Password: `passwordquize`

## ✅ Status do Projeto

### **Estatísticas Atuais:**

- **Módulos Implementados:** 9 (🆕 +Admin)
- **Endpoints API:** ~75 (+15 Admin)
- **Cobertura de Testes:** ~77%
- **Testes Passando:** 628/628 (100%)
- **Status:** ✅ **Production-Ready**

### **Módulos Completos:**

1. ✅ **Auth** - Autenticação Better Auth (OAuth, JWT, Sessions)
2. ✅ **Users** - Gerenciamento de usuários + perfis estendidos (83.87%)
3. ✅ **Organizations** - Organizações com RBAC (86.86%)
4. ✅ **Offered Services** - Serviços e categorias (86.55%)
5. ✅ **Appointments** - Sistema completo de agendamentos (83.01%)
6. ✅ **Reviews** - Avaliações e estatísticas (80.45%)
7. ✅ **Professional Profiles** - Perfis profissionais detalhados (80.73%)
8. ✅ **Admin** - Painel administrativo completo (85%+) 🆕
9. ✅ **Utils** - Utilitários e helpers (96%)

### **Recursos Implementados:**

- ✅ Estrutura de camadas (Clean Architecture + DDD)
- ✅ Better Auth com OAuth (Google, GitHub)
- ✅ RBAC (Role-Based Access Control)
- ✅ Painel administrativo completo 🆕
- ✅ Sistema de permissões granulares 🆕
- ✅ Log de auditoria administrativa 🆕
- ✅ Validações com Zod
- ✅ Documentação Swagger automática
- ✅ Sistema de paginação
- ✅ Filtros avançados e busca
- ✅ Testes unitários completos (TDD)
- ✅ Middlewares de autenticação
- ✅ Hash de senhas com BCrypt
- ✅ Tratamento global de erros
- ✅ CORS configurado
- ✅ TypeScript com tipagem forte
- ✅ Prisma ORM com migrations

## 📚 Próximos Passos

### **Alta Prioridade:**

- [ ] 🔔 Módulo de Notifications (email, SMS, push)
- [ ] 💳 Integração com Payments (Stripe, PayPal)
- [ ] 🔍 Busca avançada de profissionais (Elasticsearch)

### **Média Prioridade:**

- [ ] 📊 Dashboard de Analytics
- [ ] 🌍 Geolocalização e busca por proximidade
- [ ] 📱 Upload de imagens (Cloudinary, AWS S3)
- [ ] ⭐ Sistema de favoritos

### **Baixa Prioridade:**

- [ ] 🏆 Sistema de badges e gamificação
- [ ] 💬 Chat em tempo real (WebSocket)
- [ ] 📧 Templates de email personalizados
- [ ] 🌐 Internacionalização (i18n)

## 📄 Documentação

### **📚 Documentação Completa**

Toda a documentação técnica do projeto está organizada na pasta [`docs/`](./docs/):

- **[📖 Índice de Documentação](./docs/README.md)** - Acesse aqui para ver toda a documentação disponível

### **🚀 Guias de Início Rápido**

- [Autenticação](./docs/QUICKSTART-AUTH.md) - Comece aqui!
- [Configuração de Ambiente](./docs/ENV-SETUP-GUIDE.md) - Setup das variáveis
- [Banco de Dados](./docs/DATABASE-GUIDE.md) - Guia completo de BD

### **📦 Documentação dos Módulos**

- [Appointments](./docs/APPOINTMENTS-MODULE.md) - Sistema de agendamentos
- [Reviews](./docs/REVIEWS-MODULE.md) - Sistema de avaliações
- [User Profiles](./docs/USER-PROFILE-EXTENSION-REPORT.md) - Perfis de usuário
- [Admin Panel](./docs/ADMIN-MODULE-COMPLETE.md) - Painel administrativo 🆕
- [RBAC](./docs/RBAC-GUIDE.md) - Controle de acesso

### **📊 Relatórios e Cobertura**

- [Cobertura de Testes](./docs/COVERAGE-80-PERCENT-ACHIEVED.md) - Meta 80% atingida!
- [Relatório Final](./docs/FINAL-PROGRESS-REPORT.md) - Progresso completo
- [Análise Client Profiles](./docs/CLIENT-PROFILES-ANALYSIS.md) - Decisões arquiteturais

### **🔧 Outros Recursos**

- [Better Auth Credentials](./docs/BETTER-AUTH-CREDENTIALS.md) - Como gerar secrets
- [OAuth Setup](./docs/OAUTH-SETUP.md) - Configurar Google/GitHub
- [Migration to Supabase](./docs/MIGRATION-TO-SUPABASE.md) - Migrar para cloud
- [Regras do Projeto](./.cursor/rules/general.mdc)

## 👥 Tipos de Usuário

### Cliente

- ✅ Criar conta e fazer login (email ou OAuth)
- ✅ Personalizar perfil (foto, bio, cidade)
- ✅ Buscar e filtrar profissionais por categoria
- ✅ Visualizar perfis profissionais completos
- ✅ Solicitar agendamentos
- ✅ Gerenciar agendamentos (listar, cancelar)
- ✅ Avaliar serviços prestados
- ✅ Configurar preferências de notificação

### Profissional

- ✅ Criar conta e fazer login (email ou OAuth)
- ✅ Criar e gerenciar perfil profissional completo
  - Bio, portfolio, anos de experiência
  - Horários de trabalho
  - Especialidades, certificações, idiomas
- ✅ Cadastrar serviços oferecidos (preço, duração)
- ✅ Gerenciar solicitações de agendamento
  - Aceitar/rejeitar agendamentos
  - Atualizar status
  - Visualizar estatísticas
- ✅ Visualizar avaliações recebidas e estatísticas
- ✅ Ativar/desativar disponibilidade

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
npm test

# Com cobertura
npm run test:coverage

# Watch mode
npm run test:watch
```

### Cobertura Atual

- **Global:** 76.6%
- **565 testes** passando (100%)
- **30 suites** de testes

**Módulos com > 80% cobertura:**

- Utils: 96%
- Organizations: 86.86%
- Offered Services: 86.55%
- Users: 83.87%
- Appointments: 83.01%
- Professional Profiles: 80.73%
- Reviews: 80.45%

📖 **Relatório completo:** [COVERAGE-80-PERCENT-ACHIEVED.md](./docs/COVERAGE-80-PERCENT-ACHIEVED.md)

## 🤝 Contribuindo

Para contribuir com o projeto:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código

- Use TypeScript com tipagem forte
- Siga a arquitetura em camadas existente
- Escreva testes (TDD) para novas features
- Documente endpoints no Swagger
- Use Zod para validações
- Siga os padrões do ESLint/Prettier

## 📝 Licença

ISC

---

**Desenvolvido por [Matheus Queiroz](https://matheusqueiroz.dev.br)**

**Última Atualização:** 20 de Outubro de 2025  
**Versão:** v1.0  
**Status:** Production-Ready ✅
