# Plano de Integração do Módulo Admin - Nova Arquitetura

## Análise do Módulo Admin Atual

### Estrutura Existente

```
src/modules/admin/
├── admin.controller.ts      # ✅ Já migrado
├── admin.routes.ts          # ✅ Já migrado
├── admin.schema.ts          # ✅ Já migrado
├── admin.service.ts         # ❌ Precisa migrar
├── admin.repository.ts     # ❌ Precisa migrar
├── middlewares/
│   ├── admin-auth.middleware.ts
│   └── admin-permission.middleware.ts
└── __tests__/
    └── [testes existentes]
```

### Funcionalidades do Admin

1. **Autenticação de Admin**

   - Login/logout
   - Sessão
   - Troca de senha

2. **Gestão de Administradores**

   - CRUD de admins
   - Diferentes níveis (SUPER_ADMIN, ADMIN, MODERATOR, etc.)
   - Permissões granulares

3. **Gestão de Usuários**

   - Listar todos os usuários
   - Suspender/ativar usuários
   - Detalhes de usuários
   - Deletar usuários

4. **Analytics e Dashboard**
   - Estatísticas gerais
   - Estatísticas de usuários
   - Log de ações administrativas

## Integração na Nova Arquitetura

### 1. Camada de Domínio

```typescript
// src/domain/entities/admin.entity.ts
export class Admin {
  // Entidade de domínio para administradores
}

// src/domain/entities/admin-action.entity.ts
export class AdminAction {
  // Entidade para log de ações administrativas
}
```

### 2. Camada de Aplicação

```typescript
// src/application/services/admin.service.ts
export class AdminService {
  // Lógica de negócio para administração
}

// src/application/services/admin-analytics.service.ts
export class AdminAnalyticsService {
  // Lógica para analytics e estatísticas
}
```

### 3. Camada de Infraestrutura

```typescript
// src/infrastructure/repositories/admin.repository.ts
export class AdminRepository {
  // Acesso a dados para administradores
}

// src/infrastructure/repositories/admin-action.repository.ts
export class AdminActionRepository {
  // Acesso a dados para log de ações
}
```

### 4. Camada de Apresentação

```typescript
// src/presentation/controllers/admin.controller.ts ✅ (já migrado)
// src/presentation/routes/admin.routes.ts ✅ (já migrado)
// src/presentation/schemas/admin.schema.ts ✅ (já migrado)
```

## Plano de Migração

### Fase 1: Migração de Serviços e Repositórios

1. **Migrar `admin.service.ts`**

   - Mover para `src/application/services/admin.service.ts`
   - Adaptar para nova arquitetura
   - Manter funcionalidades existentes

2. **Migrar `admin.repository.ts`**
   - Mover para `src/infrastructure/repositories/admin.repository.ts`
   - Implementar interface de repositório
   - Manter compatibilidade

### Fase 2: Criação de Entidades de Domínio

1. **Criar `Admin` entity**

   - Encapsular lógica de negócio
   - Validações de domínio
   - Métodos de fábrica

2. **Criar `AdminAction` entity**
   - Log de ações administrativas
   - Auditoria
   - Rastreamento de mudanças

### Fase 3: Middlewares de Segurança

1. **Migrar middlewares de admin**
   - `admin-auth.middleware.ts`
   - `admin-permission.middleware.ts`
   - Adaptar para nova estrutura

### Fase 4: Testes e Validação

1. **Migrar testes existentes**
2. **Criar novos testes para entidades**
3. **Testes de integração completos**

## Estrutura Final Proposta

```
src/
├── domain/
│   ├── entities/
│   │   ├── admin.entity.ts
│   │   └── admin-action.entity.ts
│   └── interfaces/
│       ├── admin.interface.ts
│       └── admin-repository.interface.ts
├── application/
│   └── services/
│       ├── admin.service.ts
│       └── admin-analytics.service.ts
├── infrastructure/
│   └── repositories/
│       ├── admin.repository.ts
│       └── admin-action.repository.ts
└── presentation/
    ├── controllers/
    │   └── admin.controller.ts ✅
    ├── routes/
    │   └── admin.routes.ts ✅
    └── schemas/
        └── admin.schema.ts ✅
```

## Considerações Especiais

### 1. **Segurança Administrativa**

- Middlewares de autenticação específicos
- Controle de acesso granular
- Log de todas as ações administrativas

### 2. **Performance**

- Cache para estatísticas
- Paginação otimizada
- Consultas eficientes

### 3. **Auditoria**

- Log completo de ações
- Rastreamento de mudanças
- Histórico de modificações

### 4. **Integração com Better Auth**

- Manter compatibilidade
- Aproveitar funcionalidades existentes
- Extensões específicas para admin

## Próximos Passos

1. **Migrar `admin.service.ts`** para `src/application/services/`
2. **Migrar `admin.repository.ts`** para `src/infrastructure/repositories/`
3. **Criar entidades de domínio** para Admin e AdminAction
4. **Migrar middlewares** para nova estrutura
5. **Atualizar imports** em controllers e rotas
6. **Testes abrangentes** da nova estrutura
7. **Documentação** atualizada
