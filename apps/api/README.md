# 🚀 Quezi API

API REST desenvolvida com Node.js, Fastify, TypeScript e PostgreSQL para a plataforma Quezi - facilitador de agendamento e prestação de serviços.

## 📋 Sobre o Projeto

A Quezi é uma plataforma que conecta profissionais prestadores de serviços (principalmente beleza e estética) com clientes que desejam contratar esses serviços. Funciona como um marketplace de serviços, similar ao iFood, mas para serviços ao invés de comida.

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **Fastify** - Framework web de alta performance
- **TypeScript** - Superset JavaScript com tipagem estática
- **PostgreSQL** - Banco de dados relacional
- **Prisma** - ORM moderno para TypeScript
- **Docker** - Containerização
- **Zod** - Validação de schemas
- **Swagger** - Documentação da API

## 📁 Arquitetura

O projeto segue uma **Arquitetura em Camadas** (Layered Architecture) com princípios de **DDD** (Domain-Driven Design) e **Clean Architecture**:

```
api/
├── src/
│   ├── modules/              # Módulos de domínio (Clean Architecture)
│   │   ├── users/            # ✅ Módulo Users (COMPLETO)
│   │   │   ├── user.controller.ts   # Camada de Apresentação
│   │   │   ├── user.service.ts      # Camada de Lógica de Negócio
│   │   │   ├── user.repository.ts   # Camada de Acesso a Dados
│   │   │   ├── user.schema.ts       # Validações Zod
│   │   │   ├── user.routes.ts       # Registro de rotas
│   │   │   └── index.ts             # Barrel export
│   │   ├── appointments/     # 🔜 Gestão de agendamentos
│   │   └── offered-services/ # 🔜 Gestão de serviços oferecidos
│   ├── config/               # Configurações
│   │   └── env.ts            # Validação de variáveis de ambiente
│   ├── types/                # Tipos TypeScript compartilhados
│   │   └── index.ts          # Interfaces e tipos globais
│   ├── middlewares/          # Middlewares globais
│   │   └── error-handler.ts  # Handler de erros centralizado
│   ├── utils/                # Utilitários
│   │   └── app-error.ts      # Classes de erro customizadas
│   ├── lib/                  # Bibliotecas compartilhadas
│   │   └── prisma.ts         # Cliente Prisma (singleton)
│   ├── routes.ts             # ✅ Agregador de rotas
│   ├── app.ts                # ✅ Configuração do Fastify + Plugins
│   └── server.ts             # ✅ Ponto de entrada
├── prisma/
│   ├── schema.prisma         # Schema do banco de dados
│   ├── migrations/           # Migrações do banco
│   └── seed.ts               # Seed com dados iniciais
└── docker-compose.yml        # Configuração Docker
```

## 🗃️ Modelo de Dados

### Entidades Principais

- **User** - Usuários do sistema (Cliente ou Profissional)
- **ProfessionalProfile** - Perfil profissional com serviços oferecidos
- **Category** - Categorias de serviços
- **Service** - Serviços oferecidos pelos profissionais
- **Appointment** - Agendamentos entre clientes e profissionais
- **Review** - Avaliações dos serviços prestados

### Enums

- `UserType`: CLIENT, PROFESSIONAL
- `ServiceMode`: AT_LOCATION, AT_DOMICILE, BOTH
- `ServicePriceType`: FIXED, HOURLY
- `AppointmentStatus`: PENDING, ACCEPTED, REJECTED, COMPLETED

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

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

As variáveis já estão configuradas para desenvolvimento local. Ajuste se necessário.

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

### Users (CRUD Completo)

- `POST /api/v1/users` - Cria novo usuário
- `GET /api/v1/users` - Lista usuários (com paginação e filtros)
- `GET /api/v1/users/:id` - Busca usuário por ID
- `PUT /api/v1/users/:id` - Atualiza usuário
- `DELETE /api/v1/users/:id` - Deleta usuário

**Exemplo de criação de usuário:**

```json
POST /api/v1/users
{
  "email": "joao@example.com",
  "password": "SenhaForte123",
  "name": "João Silva",
  "phone": "+5511999999999",
  "userType": "CLIENT"
}
```

**Exemplo de listagem com filtros:**

```
GET /api/v1/users?page=1&limit=10&userType=PROFESSIONAL&search=silva
```

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

## ✅ O Que Foi Implementado

- ✅ Estrutura de camadas (Clean Architecture + DDD)
- ✅ Configuração de variáveis de ambiente com Zod
- ✅ Tratamento global de erros
- ✅ Plugins Fastify (CORS, Swagger)
- ✅ **Módulo Users completo** (Controller, Service, Repository)
- ✅ Validações com Zod
- ✅ Documentação Swagger automática
- ✅ Paginação de listagens
- ✅ TypeScript com tipagem forte
- ✅ **Testes Unitários** - 56 testes com Jest
- ✅ **TDD** - Metodologia Test-Driven Development
- ✅ **Cobertura de Código** - 97%+ nas camadas principais

## 📚 Próximos Passos

- [ ] Implementar autenticação JWT com Better Auth
- [ ] Adicionar hash de senha com BCrypt
- [ ] Implementar módulo Appointments
- [ ] Implementar módulo Services
- [ ] Implementar módulo Reviews
- [ ] Implementar OAuth 2.0 (Google)
- [ ] Implementar testes (unitários, integração, e2e)
- [ ] Configurar envio de e-mails
- [ ] Implementar upload de arquivos

## 📄 Documentação

- [Documento de Requisitos Funcionais](./drf-quezi-app.md)
- [Regras do Projeto](./.cursor/rules/general.mdc)

## 👥 Tipos de Usuário

### Cliente

- Buscar e filtrar profissionais por categoria
- Visualizar perfis e serviços
- Solicitar agendamentos
- Avaliar serviços prestados

### Profissional

- Criar e gerenciar perfil profissional
- Cadastrar serviços oferecidos
- Gerenciar solicitações de agendamento
- Visualizar avaliações recebidas

## 📝 Licença

ISC
