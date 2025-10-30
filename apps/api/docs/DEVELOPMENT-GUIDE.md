# 👨‍💻 Guia de Desenvolvimento - Quezi API

## 🎯 Visão Geral

Este guia contém as diretrizes e padrões para desenvolvimento na **Quezi API**, seguindo **Clean Architecture**, **DDD** e princípios **SOLID**.

## 🏗️ Arquitetura e Padrões

### **Clean Architecture**

A API segue a **Clean Architecture** com 4 camadas bem definidas:

```
┌─────────────────────────────────────┐
│           PRESENTATION              │ ← Controllers, Routes, Schemas
├─────────────────────────────────────┤
│           APPLICATION               │ ← Services, Use Cases
├─────────────────────────────────────┤
│             DOMAIN                  │ ← Entities, Interfaces
├─────────────────────────────────────┤
│          INFRASTRUCTURE             │ ← Repositories, Database
└─────────────────────────────────────┘
```

### **Princípios SOLID**

- **S** - Single Responsibility: Cada classe tem uma responsabilidade
- **O** - Open/Closed: Aberto para extensão, fechado para modificação
- **L** - Liskov Substitution: Substituição de implementações
- **I** - Interface Segregation: Interfaces específicas
- **D** - Dependency Inversion: Dependências invertidas

## 📁 Estrutura de Arquivos

### **Padrão de Nomenclatura**

```
src/
├── domain/
│   ├── entities/
│   │   └── {entity-name}.entity.ts
│   └── interfaces/
│       └── {interface-name}.interface.ts
├── application/
│   └── services/
│       └── {service-name}.service.ts
├── infrastructure/
│   └── repositories/
│       └── {repository-name}.repository.ts
└── presentation/
    ├── controllers/
    │   └── {controller-name}.controller.ts
    ├── routes/
    │   └── {route-name}.routes.ts
    └── schemas/
        └── {schema-name}.schema.ts
```

### **Convenções de Nomenclatura**

- **Classes**: PascalCase (`UserService`, `AppointmentRepository`)
- **Interfaces**: PascalCase com prefixo `I` (`IUser`, `IUserRepository`)
- **Métodos**: camelCase (`createUser`, `findById`)
- **Variáveis**: camelCase (`userId`, `appointmentData`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)
- **Arquivos**: kebab-case (`user-service.ts`, `appointment-repository.ts`)

## 🎨 Padrões de Código

### **Documentação de Arquivos**

```typescript
/**
 * {ClassName}
 *
 * {Descrição da classe}
 * Camada de {Domain/Application/Infrastructure/Presentation} - Clean Architecture
 *
 * Responsabilidades:
 * - {Responsabilidade 1}
 * - {Responsabilidade 2}
 * - {Responsabilidade 3}
 */

import { /* imports organizados */ };

export class ClassName {
  // implementação
}
```

### **Organização de Imports**

```typescript
// 1. Imports do Node.js/Externos
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

// 2. Imports internos - Camada de Domínio
import { IUser } from "../../domain/interfaces/user.interface";

// 3. Imports internos - Camada de Aplicação
import { UserService } from "../../application/services/user.service";

// 4. Imports internos - Camada de Infraestrutura
import { UserRepository } from "../../infrastructure/repositories/user.repository";

// 5. Imports internos - Utilitários
import { NotFoundError, BadRequestError } from "../../utils/app-error";
```

### **Padrão de Métodos**

```typescript
/**
 * {Descrição do método}
 *
 * @param {param1} - {Descrição do parâmetro}
 * @param {param2} - {Descrição do parâmetro}
 * @returns {Promise<ReturnType>} - {Descrição do retorno}
 * @throws {ErrorType} - {Quando o erro é lançado}
 */
async methodName(param1: Type1, param2: Type2): Promise<ReturnType> {
  try {
    // Validações de entrada
    if (!param1) {
      throw new BadRequestError("Parâmetro obrigatório");
    }

    // Lógica de negócio
    const result = await this.repository.find(param1);

    // Validações de saída
    if (!result) {
      throw new NotFoundError("Recurso não encontrado");
    }

    return result;
  } catch (error) {
    // Tratamento de erros
    if (error instanceof AppError) {
      throw error;
    }
    throw new InternalServerError("Erro interno do servidor");
  }
}
```

## 🧪 Padrões de Testes

### **Estrutura de Testes**

```typescript
describe("{ClassName}", () => {
  let service: ClassName;
  let mockRepository: jest.Mocked<RepositoryType>;

  beforeEach(() => {
    // Setup dos mocks
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      // ... outros métodos
    };

    // Instanciação do serviço com mocks
    service = new ClassName(mockRepository);
  });

  describe("{methodName}", () => {
    it("deve {descrição do comportamento esperado}", async () => {
      // Arrange
      const input = {
        /* dados de entrada */
      };
      const expectedOutput = {
        /* resultado esperado */
      };
      mockRepository.create.mockResolvedValue(expectedOutput);

      // Act
      const result = await service.methodName(input);

      // Assert
      expect(result).toEqual(expectedOutput);
      expect(mockRepository.create).toHaveBeenCalledWith(input);
    });

    it("deve lançar erro quando {condição de erro}", async () => {
      // Arrange
      const input = {
        /* dados inválidos */
      };
      mockRepository.create.mockRejectedValue(new Error("Erro do banco"));

      // Act & Assert
      await expect(service.methodName(input)).rejects.toThrow("Erro do banco");
    });
  });
});
```

### **Cobertura de Testes**

- **Unitários**: 100% dos serviços e repositórios
- **Integração**: Controllers e middlewares
- **E2E**: Fluxos críticos (planejado)

## 🗄️ Padrões de Banco de Dados

### **Nomenclatura de Tabelas**

- **Tabelas**: snake_case (`users`, `appointments`, `company_employees`)
- **Colunas**: snake_case (`user_id`, `created_at`, `is_active`)
- **Índices**: `idx_{tabela}_{colunas}` (`idx_appointments_professional_date`)

### **Índices de Performance**

```sql
-- Índices compostos para queries frequentes
@@index([professionalId, scheduledDate])
@@index([clientId, status])
@@index([createdAt, rating])

-- Índices únicos para constraints
@@unique([email])
@@unique([appointmentId])
```

### **Migrations**

```typescript
// Nome do arquivo: YYYYMMDDHHMMSS_{descricao}.sql
-- Exemplo: 20241201120000_add_appointment_indexes.sql

-- Adicionar índices
CREATE INDEX idx_appointments_professional_date
ON appointments(professional_id, scheduled_date);

-- Adicionar colunas
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
```

## 🛡️ Padrões de Segurança

### **Validação de Entrada**

```typescript
// Usar Zod schemas para validação
const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  userType: z.enum(["CLIENT", "PROFESSIONAL", "COMPANY", "ADMIN"]),
});

// Aplicar no controller
app.post("/users", {
  schema: {
    body: createUserSchema,
  },
  handler: async (request, reply) => {
    // request.body já está validado
  },
});
```

### **Autorização**

```typescript
// Usar RBAC middleware
app.post("/admin/users", {
  preHandler: rbacMiddleware(["ADMIN"]),
  handler: async (request, reply) => {
    // Apenas admins podem acessar
  },
});
```

### **Tratamento de Erros**

```typescript
// Usar AppError customizada
if (!user) {
  throw new NotFoundError("Usuário não encontrado");
}

if (user.userType !== "PROFESSIONAL") {
  throw new ForbiddenError("Apenas profissionais podem acessar");
}
```

## 📊 Padrões de Performance

### **Queries Otimizadas**

```typescript
// Usar select específico
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    // Apenas campos necessários
  },
  where: {
    userType: "PROFESSIONAL",
    isActive: true,
  },
  take: 10,
  skip: 0,
});
```

### **Paginação**

```typescript
// Implementar paginação consistente
interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## 🔄 Padrões de Git

### **Commits**

```
feat: adicionar funcionalidade de agendamentos
fix: corrigir validação de email
docs: atualizar documentação da API
test: adicionar testes para UserService
refactor: reorganizar estrutura de pastas
perf: otimizar queries do banco de dados
```

### **Branches**

```
feature/appointment-booking
fix/user-validation
docs/api-documentation
refactor/clean-architecture
```

## 🚀 Checklist de Desenvolvimento

### **Antes de Commitar**

- [ ] Código compila sem erros (`npm run build`)
- [ ] Testes passam (`npm test`)
- [ ] Cobertura de testes mantida
- [ ] Documentação atualizada
- [ ] Padrões de código seguidos
- [ ] Validações implementadas
- [ ] Tratamento de erros adequado

### **Antes de Fazer PR**

- [ ] Revisão de código feita
- [ ] Testes de integração executados
- [ ] Documentação atualizada
- [ ] Performance verificada
- [ ] Segurança validada

## 📚 Recursos Adicionais

- **Clean Architecture**: [Uncle Bob's Blog](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- **DDD**: [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- **SOLID**: [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- **Fastify**: [Documentação Oficial](https://www.fastify.io/)
- **Prisma**: [Documentação Oficial](https://www.prisma.io/docs)

---

**Mantenha este guia atualizado conforme a evolução do projeto! 🚀**
