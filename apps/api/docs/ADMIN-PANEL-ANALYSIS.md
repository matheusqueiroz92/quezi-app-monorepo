# 🔐 Análise: Painel Administrativo - Quezi App

## 🤔 **SUA DÚVIDA:**

> "Como fica a parte administrativa da aplicação, para que a empresa que gerencia e mantém o app possa ter o total controle dos usuários (clientes e profissionais)?"

---

## 📋 **SITUAÇÃO ATUAL:**

### **O que JÁ existe:**

- ✅ RBAC (Role-Based Access Control) via Organizations
- ✅ Roles: OWNER, ADMIN, MEMBER
- ✅ Controle de acesso a recursos por organização
- ✅ Sistema de permissões implementado

### **O que NÃO existe:**

- ❌ Role de SUPER_ADMIN (admin da plataforma)
- ❌ Painel administrativo para gerenciar toda a plataforma
- ❌ Endpoints administrativos específicos
- ❌ Dashboard de métricas globais
- ❌ Moderação de conteúdo
- ❌ Gestão de usuários banidos/suspensos

---

## 🎯 **PROBLEMA A RESOLVER:**

A empresa Quezi precisa de:

1. **Controle Total de Usuários:**

   - Visualizar todos os usuários (clientes e profissionais)
   - Suspender/banir usuários problemáticos
   - Aprovar/rejeitar cadastros de profissionais
   - Verificar identidade de profissionais

2. **Moderação de Conteúdo:**

   - Revisar avaliações denunciadas
   - Moderar serviços oferecidos
   - Revisar perfis profissionais

3. **Gestão Financeira:**

   - Visualizar transações (quando implementar payments)
   - Gerar relatórios financeiros
   - Gerenciar comissões

4. **Analytics e Métricas:**

   - Dashboard com KPIs
   - Relatórios de uso da plataforma
   - Gráficos de crescimento

5. **Configurações da Plataforma:**
   - Gerenciar categorias de serviços
   - Configurar taxas e comissões
   - Definir políticas

---

## 💡 **SOLUÇÕES POSSÍVEIS:**

### **OPÇÃO 1: Estender RBAC Existente (Mais Simples)** ✅

**Conceito:** Adicionar role `SUPER_ADMIN` ao sistema existente

**Implementação:**

```prisma
enum UserType {
  CLIENT
  PROFESSIONAL
  SUPER_ADMIN  // 🆕 Admin da plataforma
}

model User {
  // ... campos existentes
  isSuperAdmin Boolean @default(false)  // Flag adicional
  adminPermissions Json?                // Permissões específicas
}
```

**Vantagens:**

- ✅ Rápido de implementar (2-3 horas)
- ✅ Usa infraestrutura existente
- ✅ Não quebra código atual
- ✅ Simples de manter

**Desvantagens:**

- ⚠️ Menos flexível
- ⚠️ Mistura usuários normais com admins

---

### **OPÇÃO 2: Módulo Admin Separado (Mais Robusto)** ⭐ **RECOMENDADO**

**Conceito:** Criar módulo `admin/` completamente separado

**Implementação:**

```prisma
model Admin {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  name          String
  role          AdminRole @default(MODERATOR)
  permissions   Json      // Permissões granulares
  isActive      Boolean   @default(true)
  lastLogin     DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relações
  actions       AdminAction[]  // Log de ações

  @@map("admins")
}

enum AdminRole {
  SUPER_ADMIN   // Acesso total
  ADMIN         // Acesso quase total
  MODERATOR     // Apenas moderação
  SUPPORT       // Apenas suporte
  ANALYST       // Apenas visualização
}

model AdminAction {
  id          String   @id @default(cuid())
  adminId     String
  action      String   // "USER_SUSPENDED", "REVIEW_DELETED", etc.
  entityType  String   // "User", "Review", "Service", etc.
  entityId    String
  details     Json?    // Detalhes da ação
  ipAddress   String?
  createdAt   DateTime @default(now())

  admin       Admin    @relation(fields: [adminId], references: [id])

  @@map("admin_actions")
}
```

**Estrutura do Módulo:**

```
src/modules/admin/
├── admin.controller.ts       # Endpoints administrativos
├── admin.service.ts          # Lógica de negócio admin
├── admin.repository.ts       # Acesso a dados admin
├── admin.schema.ts           # Validações Zod
├── admin.routes.ts           # Rotas administrativas
├── middlewares/
│   ├── admin-auth.middleware.ts    # Autenticação de admin
│   └── admin-permission.middleware.ts  # Permissões granulares
└── __tests__/                # Testes do módulo
```

**Vantagens:**

- ✅ Separação clara de responsabilidades
- ✅ Segurança aprimorada (admins separados)
- ✅ Permissões granulares
- ✅ Log completo de ações administrativas
- ✅ Escalável
- ✅ Auditoria facilitada

**Desvantagens:**

- ⚠️ Mais complexo (1-2 dias de implementação)
- ⚠️ Precisa de interface administrativa separada

---

### **OPÇÃO 3: Painel Admin Third-Party (Mais Rápido)** 🚀

**Conceito:** Usar ferramenta pronta como AdminJS, Retool, ou Forest Admin

**Ferramentas:**

1. **AdminJS** (Open Source)

   - ✅ Integração com Prisma
   - ✅ CRUD automático
   - ✅ Customizável
   - ✅ Gratuito

2. **Retool** (Pago)

   - ✅ Drag-and-drop
   - ✅ Muito poderoso
   - ⚠️ Caro ($10-50/usuário/mês)

3. **Forest Admin** (Freemium)
   - ✅ Específico para admin panels
   - ✅ Integrações prontas
   - ⚠️ Pricing pode crescer

**Vantagens:**

- ✅ Rápido de implementar (horas, não dias)
- ✅ UI pronta
- ✅ Suporte da comunidade/empresa

**Desvantagens:**

- ⚠️ Menos controle
- ⚠️ Pode ter custos recorrentes
- ⚠️ Dependência de terceiros

---

## 🏗️ **ARQUITETURA RECOMENDADA (OPÇÃO 2)**

### **1. Estrutura de Roles Admin:**

```typescript
enum AdminRole {
  SUPER_ADMIN = "SUPER_ADMIN", // Acesso total
  ADMIN = "ADMIN", // Gestão de usuários + moderação
  MODERATOR = "MODERATOR", // Apenas moderação de conteúdo
  SUPPORT = "SUPPORT", // Apenas suporte a usuários
  ANALYST = "ANALYST", // Apenas visualização de métricas
}
```

### **2. Sistema de Permissões Granulares:**

```typescript
interface AdminPermissions {
  users: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    suspend: boolean;
    verify: boolean;
  };
  professionals: {
    approve: boolean;
    reject: boolean;
    verify: boolean;
  };
  content: {
    moderate_reviews: boolean;
    moderate_services: boolean;
    delete_content: boolean;
  };
  financial: {
    view_transactions: boolean;
    manage_commissions: boolean;
    generate_reports: boolean;
  };
  platform: {
    manage_categories: boolean;
    manage_settings: boolean;
    view_analytics: boolean;
  };
}
```

### **3. Endpoints Administrativos:**

```
/api/v1/admin/
├── auth/
│   ├── POST /login              # Login de admin
│   ├── POST /logout             # Logout de admin
│   └── GET /session             # Sessão atual
├── users/
│   ├── GET /                    # Listar todos os usuários
│   ├── GET /:id                 # Detalhes de usuário
│   ├── PUT /:id/suspend         # Suspender usuário
│   ├── PUT /:id/activate        # Ativar usuário
│   └── DELETE /:id              # Deletar usuário permanentemente
├── professionals/
│   ├── GET /pending             # Profissionais pendentes de aprovação
│   ├── PUT /:id/approve         # Aprovar profissional
│   ├── PUT /:id/reject          # Rejeitar profissional
│   └── PUT /:id/verify          # Verificar identidade
├── content/
│   ├── GET /reviews/reported    # Avaliações denunciadas
│   ├── PUT /reviews/:id/approve # Aprovar avaliação
│   ├── DELETE /reviews/:id      # Deletar avaliação
│   ├── GET /services/pending    # Serviços pendentes
│   └── PUT /services/:id/approve # Aprovar serviço
├── analytics/
│   ├── GET /dashboard           # Dashboard principal
│   ├── GET /users/stats         # Estatísticas de usuários
│   ├── GET /appointments/stats  # Estatísticas de agendamentos
│   └── GET /revenue/stats       # Estatísticas financeiras
├── categories/
│   ├── GET /                    # Listar categorias
│   ├── POST /                   # Criar categoria
│   ├── PUT /:id                 # Atualizar categoria
│   └── DELETE /:id              # Deletar categoria
├── settings/
│   ├── GET /                    # Configurações da plataforma
│   └── PUT /                    # Atualizar configurações
└── logs/
    ├── GET /actions             # Log de ações administrativas
    └── GET /actions/:adminId    # Ações de um admin específico
```

### **4. Middleware de Autenticação Admin:**

```typescript
// admin-auth.middleware.ts
export const requireAdmin = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const token = request.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    throw new UnauthorizedError("Token de admin não fornecido");
  }

  // Validar token (JWT ou session)
  const admin = await validateAdminToken(token);

  if (!admin || !admin.isActive) {
    throw new UnauthorizedError("Admin inválido ou inativo");
  }

  // Anexar admin ao request
  (request as any).admin = admin;
};

// admin-permission.middleware.ts
export const requirePermission = (permission: string) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const admin = (request as any).admin;

    if (!admin) {
      throw new UnauthorizedError("Admin não autenticado");
    }

    // Super admin tem todas as permissões
    if (admin.role === AdminRole.SUPER_ADMIN) {
      return;
    }

    // Verificar permissão específica
    if (!hasPermission(admin.permissions, permission)) {
      throw new ForbiddenError("Permissão negada");
    }
  };
};
```

---

## 📊 **FUNCIONALIDADES DO PAINEL ADMIN:**

### **1. Dashboard Principal:**

```
┌─────────────────────────────────────────────┐
│  📊 Dashboard Quezi Admin                   │
├─────────────────────────────────────────────┤
│  👥 Usuários                                │
│  ├─ Total: 10,245                           │
│  ├─ Clientes: 8,120 (79%)                   │
│  ├─ Profissionais: 2,125 (21%)              │
│  └─ Novos (hoje): +47                       │
│                                              │
│  📅 Agendamentos                             │
│  ├─ Total: 5,432                            │
│  ├─ Pendentes: 234                          │
│  ├─ Concluídos: 4,890                       │
│  └─ Taxa de conclusão: 90%                  │
│                                              │
│  💰 Financeiro (quando implementar)          │
│  ├─ Receita total: R$ 125,450               │
│  ├─ Comissão: R$ 18,817 (15%)               │
│  └─ Receita (hoje): R$ 2,340                │
│                                              │
│  ⭐ Avaliações                               │
│  ├─ Total: 3,245                            │
│  ├─ Média geral: 4.7/5                      │
│  └─ Denúncias pendentes: 3                  │
└─────────────────────────────────────────────┘
```

### **2. Gestão de Usuários:**

- ✅ Listar todos os usuários (filtros, busca, paginação)
- ✅ Ver detalhes completos de um usuário
- ✅ Suspender usuário (temporário ou permanente)
- ✅ Banir usuário (com motivo)
- ✅ Editar informações de usuário
- ✅ Ver histórico de ações do usuário
- ✅ Exportar lista de usuários (CSV, Excel)

### **3. Gestão de Profissionais:**

- ✅ Aprovar cadastros de profissionais
- ✅ Verificar identidade (documentos)
- ✅ Verificar certificações
- ✅ Aprovar/reprovar serviços oferecidos
- ✅ Ver estatísticas de performance
- ✅ Gerenciar avaliações recebidas

### **4. Moderação de Conteúdo:**

- ✅ Ver avaliações denunciadas
- ✅ Aprovar/deletar avaliações
- ✅ Ver serviços denunciados
- ✅ Aprovar/rejeitar serviços
- ✅ Moderar descrições de perfis
- ✅ Moderar imagens de portfolio

### **5. Analytics e Relatórios:**

- ✅ Dashboard com KPIs principais
- ✅ Gráficos de crescimento de usuários
- ✅ Gráficos de agendamentos por período
- ✅ Relatório de receita (quando implementar payments)
- ✅ Exportar relatórios (PDF, Excel)
- ✅ Métricas por categoria de serviço
- ✅ Mapa de calor de uso da plataforma

### **6. Configurações da Plataforma:**

- ✅ Gerenciar categorias de serviços
- ✅ Configurar taxas e comissões
- ✅ Definir políticas de uso
- ✅ Configurar emails automáticos
- ✅ Gerenciar banners/promoções
- ✅ Configurar métodos de pagamento

### **7. Logs e Auditoria:**

- ✅ Log de todas as ações administrativas
- ✅ Log de login/logout de admins
- ✅ Histórico de moderações
- ✅ Histórico de suspensões/banimentos
- ✅ Rastreamento de alterações em dados sensíveis

---

## 🚀 **ROADMAP DE IMPLEMENTAÇÃO:**

### **FASE 1: Fundação (1-2 dias)** 🔨

1. ✅ Criar modelo `Admin` no Prisma
2. ✅ Criar modelo `AdminAction` (log)
3. ✅ Implementar enum `AdminRole`
4. ✅ Criar sistema de permissões
5. ✅ Migration e seed com primeiro super admin

### **FASE 2: Autenticação e Autorização (1 dia)** 🔐

1. ✅ Implementar login de admin (separado do Better Auth)
2. ✅ Middleware `requireAdmin`
3. ✅ Middleware `requirePermission`
4. ✅ Sistema de JWT para admins
5. ✅ Log de ações administrativas

### **FASE 3: Endpoints Administrativos (2-3 dias)** 📡

1. ✅ Gestão de usuários (10 endpoints)
2. ✅ Gestão de profissionais (5 endpoints)
3. ✅ Moderação de conteúdo (8 endpoints)
4. ✅ Analytics básico (5 endpoints)
5. ✅ Configurações (3 endpoints)

### **FASE 4: Dashboard e Analytics (1-2 dias)** 📊

1. ✅ Endpoint de dashboard principal
2. ✅ Estatísticas agregadas
3. ✅ Gráficos de crescimento
4. ✅ Relatórios exportáveis

### **FASE 5: Frontend Admin (3-5 dias)** 🎨

1. ✅ Interface de login admin
2. ✅ Dashboard principal
3. ✅ Tabelas de gestão de usuários
4. ✅ Formulários de moderação
5. ✅ Gráficos e relatórios

**TOTAL ESTIMADO: 8-13 dias (backend + frontend básico)**

---

## 💡 **MINHA RECOMENDAÇÃO:**

### **🎯 Abordagem Híbrida (Melhor Custo-Benefício):**

1. **Curto Prazo (AGORA):**

   - ✅ Implementar **Opção 2** (Módulo Admin separado)
   - ✅ Foco no backend primeiro (endpoints admin)
   - ✅ Criar apenas 1 super admin via seed
   - ✅ Usar **Postman/Insomnia** temporariamente

2. **Médio Prazo (1-2 meses):**

   - ✅ Considerar **AdminJS** para UI rápida
   - ✅ Customizar AdminJS conforme necessário
   - ✅ Adicionar analytics básicos

3. **Longo Prazo (3-6 meses):**
   - ✅ Desenvolver painel admin customizado
   - ✅ Dashboard rico com gráficos
   - ✅ Relatórios avançados
   - ✅ Automações administrativas

---

## 📋 **PRIMEIRA IMPLEMENTAÇÃO (MVP ADMIN):**

### **Endpoints Essenciais (Prioridade 1):**

```typescript
// USUÁRIOS
GET    /api/v1/admin/users              # Listar usuários
GET    /api/v1/admin/users/:id          # Ver detalhes
PUT    /api/v1/admin/users/:id/suspend  # Suspender
PUT    /api/v1/admin/users/:id/activate # Ativar

// PROFISSIONAIS
GET    /api/v1/admin/professionals/pending  # Pendentes
PUT    /api/v1/admin/professionals/:id/approve # Aprovar
PUT    /api/v1/admin/professionals/:id/reject  # Rejeitar

// MODERAÇÃO
GET    /api/v1/admin/reviews/reported    # Reviews denunciadas
DELETE /api/v1/admin/reviews/:id         # Deletar review

// ANALYTICS
GET    /api/v1/admin/dashboard           # Dashboard principal

// CATEGORIAS
GET    /api/v1/admin/categories          # Listar
POST   /api/v1/admin/categories          # Criar
PUT    /api/v1/admin/categories/:id      # Atualizar
DELETE /api/v1/admin/categories/:id      # Deletar
```

**Tempo Estimado:** 3-4 dias  
**Prioridade:** ALTA  
**Impacto:** Controle total da plataforma

---

## ✅ **CONCLUSÃO:**

### **Resposta Direta:**

**SIM, é essencial ter um painel administrativo!**

**RECOMENDAÇÃO:**

- ✅ Implementar **Módulo Admin separado** (Opção 2)
- ✅ Começar com **endpoints essenciais** (MVP)
- ✅ Usar **Postman** temporariamente
- ✅ Evoluir para **AdminJS** ou painel customizado depois

**BENEFÍCIOS:**

- ✅ Controle total de usuários
- ✅ Moderação de conteúdo
- ✅ Gestão de profissionais
- ✅ Analytics da plataforma
- ✅ Auditoria completa
- ✅ Escalável e seguro

**PRÓXIMO PASSO:**

1. ✅ Implementar Prisma models (`Admin`, `AdminAction`)
2. ✅ Criar autenticação de admin
3. ✅ Implementar endpoints essenciais
4. ✅ Criar seed com primeiro super admin
5. ✅ Testar com Postman

---

**Quer que eu implemente o módulo Admin agora?** 🚀

**Opções:**

- A) Implementar módulo Admin completo (2-3 dias)
- B) Implementar MVP Admin (endpoints essenciais - 1 dia)
- C) Apenas criar estrutura e deixar para depois

**Qual você prefere?** 🤔
