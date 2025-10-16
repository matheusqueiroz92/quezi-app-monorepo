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
│   ├── modules/          # Módulos de domínio
│   │   ├── users/        # Gestão de usuários
│   │   ├── appointments/ # Gestão de agendamentos
│   │   └── offered-services/ # Gestão de serviços oferecidos
│   ├── lib/              # Bibliotecas compartilhadas
│   │   └── prisma.ts     # Cliente Prisma (singleton)
│   ├── routes.ts         # Agregador de rotas
│   ├── app.ts            # Configuração do Fastify
│   └── server.ts         # Ponto de entrada
├── prisma/
│   ├── schema.prisma     # Schema do banco de dados
│   └── migrations/       # Migrações do banco
└── docker-compose.yml    # Configuração Docker
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

A API estará disponível em: `http://localhost:3333`

## 📜 Scripts Disponíveis

| Script                    | Descrição                                                |
| ------------------------- | -------------------------------------------------------- |
| `npm run dev`             | Inicia o servidor em modo desenvolvimento com hot-reload |
| `npm run build`           | Compila o TypeScript para JavaScript                     |
| `npm start`               | Inicia o servidor em produção                            |
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

## 📚 Próximos Passos

- [ ] Implementar módulos (Users, Appointments, Services)
- [ ] Configurar autenticação JWT
- [ ] Implementar OAuth 2.0 (Google)
- [ ] Adicionar validações com Zod
- [ ] Configurar Swagger para documentação
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
