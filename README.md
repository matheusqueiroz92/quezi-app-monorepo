# 🚀 Quezi - Plataforma de Agendamento de Serviços

Monorepo da aplicação Quezi App, uma plataforma que conecta profissionais prestadores de serviços (principalmente beleza e estética) com clientes que desejam contratar esses serviços.

## 📦 Estrutura do Monorepo

Este projeto utiliza [Turborepo](https://turbo.build/repo) para gerenciar o monorepo com múltiplos aplicativos e pacotes compartilhados.

```
quezi-app/
├── apps/
│   ├── api/              # Backend API REST (Node.js + Fastify + PostgreSQL)
│   ├── web/              # Frontend Web (a ser implementado)
│   └── mobile/           # App Mobile (a ser implementado)
├── packages/
│   ├── typescript-config/    # Configurações TypeScript compartilhadas
│   └── eslint-config/        # Configurações ESLint compartilhadas
├── package.json          # Root package.json com workspaces
└── turbo.json           # Configuração do Turborepo
```

## 🛠️ Stack Tecnológica

### Backend (API)

- **Node.js** + **Fastify** - Framework web de alta performance
- **TypeScript** - Superset JavaScript com tipagem estática
- **PostgreSQL** - Banco de dados relacional
- **Prisma** - ORM moderno para TypeScript
- **Docker** - Containerização
- **Zod** - Validação de schemas
- **Swagger** - Documentação da API

### Frontend (Web) - _A ser implementado_

- Next.js / React + Vite
- TypeScript
- TailwindCSS

### Mobile - _A ser implementado_

- React Native / Expo
- TypeScript

## 🚀 Como Começar

### Pré-requisitos

- Node.js 18+ instalado
- Docker Desktop instalado e rodando
- NPM 9+

### 1. Instalação

Instale todas as dependências do monorepo:

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` na pasta da API:

```bash
cd apps/api
cp .env.example .env
cd ../..
```

### 3. Iniciar Banco de Dados

```bash
npm run docker:up
```

Isso irá iniciar:

- PostgreSQL na porta `5432`
- pgAdmin na porta `5050` (http://localhost:5050)

### 4. Executar Migrações

```bash
npm run prisma:migrate
```

### 5. Desenvolvimento

Para iniciar todos os aplicativos em modo de desenvolvimento:

```bash
npm run dev
```

Ou para iniciar apenas a API:

```bash
cd apps/api
npm run dev
```

A API estará disponível em: `http://localhost:3333`

## 📜 Scripts Disponíveis

### Scripts Globais (Raiz)

| Script                   | Descrição                                    |
| ------------------------ | -------------------------------------------- |
| `npm run dev`            | Inicia todos os apps em modo desenvolvimento |
| `npm run build`          | Build de todos os apps                       |
| `npm run start`          | Inicia todos os apps em produção             |
| `npm run lint`           | Executa lint em todos os apps                |
| `npm run test`           | Executa testes em todos os apps              |
| `npm run clean`          | Limpa arquivos de build                      |
| `npm run docker:up`      | Inicia containers Docker                     |
| `npm run docker:down`    | Para containers Docker                       |
| `npm run prisma:studio`  | Abre Prisma Studio                           |
| `npm run prisma:migrate` | Executa migrações                            |

### Scripts da API

Veja [apps/api/README.md](./apps/api/README.md) para scripts específicos da API.

## 📁 Aplicativos

### 🔧 API (Backend)

API REST desenvolvida com arquitetura limpa e DDD.

**Stack:** Node.js, Fastify, TypeScript, PostgreSQL, Prisma

**Documentação:** [apps/api/README.md](./apps/api/README.md)

**Porta:** 3333

### 🌐 Web (Frontend) - _Em breve_

Aplicação web para clientes e profissionais.

**Stack:** Next.js / React, TypeScript, TailwindCSS

**Porta:** 3000

### 📱 Mobile - _Em breve_

Aplicativo mobile para iOS e Android.

**Stack:** React Native / Expo, TypeScript

## 📦 Pacotes Compartilhados

### @quezi/typescript-config

Configurações TypeScript compartilhadas para todo o monorepo.

**Configurações disponíveis:**

- `base.json` - Configuração base
- `node.json` - Para projetos Node.js
- `react.json` - Para projetos React

### @quezi/eslint-config

Configurações ESLint compartilhadas para todo o monorepo.

**Configurações disponíveis:**

- `base.js` - Configuração base
- `node.js` - Para projetos Node.js
- `react.js` - Para projetos React

## 🗃️ Modelo de Dados

### Entidades Principais

- **User** - Usuários do sistema (Cliente ou Profissional)
- **ProfessionalProfile** - Perfil profissional com serviços oferecidos
- **Category** - Categorias de serviços
- **Service** - Serviços oferecidos pelos profissionais
- **Appointment** - Agendamentos entre clientes e profissionais
- **Review** - Avaliações dos serviços prestados

### Tipos de Usuário

#### 👤 Cliente

- Buscar e filtrar profissionais por categoria
- Visualizar perfis e serviços
- Solicitar agendamentos
- Avaliar serviços prestados

#### 💼 Profissional

- Criar e gerenciar perfil profissional
- Cadastrar serviços oferecidos
- Gerenciar solicitações de agendamento
- Visualizar avaliações recebidas

## 📚 Documentação Adicional

- [Documento de Requisitos Funcionais](./apps/api/drf-quezi-app.md)
- [Regras do Projeto](./apps/api/.cursor/rules/general.mdc)
- [Documentação da API](./apps/api/README.md)

## 🔗 Links Úteis

- **API**: http://localhost:3333
- **Web**: http://localhost:3000 _(em breve)_
- **pgAdmin**: http://localhost:5050
- **Prisma Studio**: Execute `npm run prisma:studio`

## 🧪 Testes

```bash
npm run test
```

## 🏗️ Build

Para fazer build de todos os aplicativos:

```bash
npm run build
```

## 🌿 Git Workflow

O projeto utiliza commits convencionais (Conventional Commits):

```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: tarefas gerais
```

## 📄 Licença

ISC

## 👥 Equipe

_A definir_

---

**Desenvolvido com ❤️ usando Turborepo**
