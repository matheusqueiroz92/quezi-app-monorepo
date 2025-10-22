# 🔒 Segurança - Controle de Autenticação nas Rotas

**Data:** 22 de outubro de 2025  
**Prioridade:** 🔴 **CRÍTICA**  
**Status:** 🚧 **EM ANDAMENTO**

---

## ⚠️ Vulnerabilidade Identificada

**Problema:** Rotas da API estão acessíveis sem autenticação, permitindo acesso não autorizado a dados sensíveis.

**Impacto:**

- 🔴 Listagem de usuários sem autenticação
- 🔴 Acesso a dados de usuários sem permissão
- 🔴 Possível manipulação de dados

---

## 🎯 Estratégia de Proteção

### Rotas Públicas (sem autenticação)

- ✅ Cadastro de usuário (`POST /users`)
- ✅ Login (`POST /auth/login`)
- ✅ Perfil público (`GET /users/:id/public-profile`)
- ✅ Busca de profissionais (`GET /profiles`)
- ✅ Busca de serviços (`GET /offered-services`)
- ✅ Visualização de categorias (`GET /categories`)

### Rotas Protegidas (requer autenticação)

- 🔒 **TODAS as outras rotas** devem exigir autenticação

---

## 📋 Correções Aplicadas

### ✅ Módulo Users (`user.controller.ts`)

| Rota                      | Método | Status       | Middleware       |
| ------------------------- | ------ | ------------ | ---------------- |
| `/`                       | POST   | ✅ Público   | -                |
| `/`                       | GET    | 🔒 Protegido | `authMiddleware` |
| `/:id`                    | GET    | 🔒 Protegido | `authMiddleware` |
| `/:id`                    | PUT    | 🔒 Protegido | `authMiddleware` |
| `/:id`                    | DELETE | 🔒 Protegido | `authMiddleware` |
| `/:id/profile`            | PUT    | 🔒 Protegido | `authMiddleware` |
| `/:id/public-profile`     | GET    | ✅ Público   | -                |
| `/:id/notification-prefs` | PUT    | 🔒 Protegido | `authMiddleware` |

---

## 🔧 Correções Necessárias nos Outros Módulos

### 1. 🔴 Appointments (`appointments.controller.ts`)

**TODAS as rotas devem ser protegidas:**

```typescript
import { authMiddleware } from "../../middlewares/auth.middleware";

// Exemplo:
app.post("/", {
  preHandler: [authMiddleware],  // ← Adicionar
  schema: { ... },
  handler: this.createAppointment.bind(this)
});
```

**Rotas a proteger:**

- ✅ POST `/` - Criar agendamento
- ✅ GET `/` - Listar agendamentos
- ✅ GET `/:id` - Buscar agendamento
- ✅ PUT `/:id` - Atualizar agendamento
- ✅ DELETE `/:id` - Cancelar agendamento
- ✅ PUT `/:id/status` - Atualizar status
- ✅ GET `/availability` - Verificar disponibilidade
- ✅ GET `/stats` - Estatísticas
- ✅ GET `/my-appointments` - Meus agendamentos
- ✅ GET `/upcoming` - Próximos agendamentos
- ✅ GET `/history` - Histórico

---

### 2. 🔴 Professional Profiles (`profiles.controller.ts`)

**Rotas Públicas:**

- ✅ GET `/` - Listar perfis
- ✅ GET `/search` - Buscar perfis
- ✅ GET `/:userId` - Ver perfil
- ✅ GET `/top-rated` - Perfis mais bem avaliados

**Rotas Protegidas:**

- 🔒 POST `/` - Criar perfil (authMiddleware)
- 🔒 PUT `/:userId` - Atualizar perfil (authMiddleware)
- 🔒 DELETE `/:userId` - Deletar perfil (authMiddleware)
- 🔒 PUT `/:userId/portfolio` - Atualizar portfólio (authMiddleware)
- 🔒 PUT `/:userId/working-hours` - Atualizar horários (authMiddleware)
- 🔒 PUT `/:userId/toggle-active` - Ativar/desativar (authMiddleware)
- 🔒 GET `/my-profile` - Meu perfil (authMiddleware)

---

### 3. 🔴 Offered Services (`offered-services.controller.ts`)

**Rotas Públicas:**

- ✅ GET `/` - Listar serviços
- ✅ GET `/:id` - Buscar serviço
- ✅ GET `/popular` - Serviços populares

**Rotas Protegidas:**

- 🔒 POST `/` - Criar serviço (authMiddleware)
- 🔒 PUT `/:id` - Atualizar serviço (authMiddleware)
- 🔒 DELETE `/:id` - Deletar serviço (authMiddleware)

**Categories (podem ser públicas):**

- ✅ GET `/categories` - Listar categorias
- ✅ GET `/categories/:id` - Buscar categoria
- ✅ GET `/categories/slug/:slug` - Buscar por slug

---

### 4. 🔴 Reviews (`reviews.controller.ts`)

**Rotas Públicas:**

- ✅ GET `/` - Listar reviews
- ✅ GET `/professional/:professionalId/stats` - Estatísticas

**Rotas Protegidas:**

- 🔒 POST `/` - Criar review (authMiddleware)
- 🔒 GET `/:id` - Buscar review (authMiddleware)
- 🔒 PUT `/:id` - Atualizar review (authMiddleware)
- 🔒 DELETE `/:id` - Deletar review (authMiddleware)
- 🔒 GET `/appointment/:appointmentId` - Review por agendamento (authMiddleware)

---

### 5. 🔴 Organizations (`organization.controller.ts`)

**TODAS as rotas devem ser protegidas:**

- 🔒 POST `/` - Criar organização (authMiddleware)
- 🔒 GET `/my-organizations` - Minhas organizações (authMiddleware)
- 🔒 POST `/invite` - Convidar membro (authMiddleware)
- 🔒 PUT `/member-role` - Atualizar role (authMiddleware)
- 🔒 DELETE `/remove-member` - Remover membro (authMiddleware)

---

### 6. ✅ Auth (`auth.routes.ts`)

**Todas as rotas devem ser públicas** (é o módulo de autenticação)

---

### 7. ✅ Admin (`admin.controller.ts`)

**Já está correto:**

- ✅ POST `/auth/login` - Público
- 🔒 Todas as outras rotas protegidas com `requireAdmin`

---

## 🛠️ Implementação do Fix

### Passo 1: Importar authMiddleware

```typescript
import { authMiddleware } from "../../middlewares/auth.middleware";
```

### Passo 2: Adicionar preHandler nas rotas

```typescript
app.get("/rota-protegida", {
  preHandler: [authMiddleware],  // ← Adicionar esta linha
  schema: { ... },
  handler: this.metodo.bind(this)
});
```

### Passo 3: Testar

```bash
# Sem token - deve retornar 401
GET http://localhost:3333/api/v1/users

# Com token - deve funcionar
GET http://localhost:3333/api/v1/users
Authorization: Bearer {token}
```

---

## 📊 Status de Implementação

| Módulo                    | Rotas Protegidas | Status          |
| ------------------------- | ---------------- | --------------- |
| **Users**                 | 5/8              | 🟡 Parcial      |
| **Appointments**          | 0/11             | 🔴 Vulnerável   |
| **Professional Profiles** | 0/10             | 🔴 Vulnerável   |
| **Offered Services**      | 0/8              | 🔴 Vulnerável   |
| **Reviews**               | 0/6              | 🔴 Vulnerável   |
| **Organizations**         | 0/5              | 🔴 Vulnerável   |
| **Admin**                 | 14/15            | ✅ OK           |
| **Auth**                  | 0/4              | ✅ OK (público) |

---

## 🔐 Middleware de Autenticação

### Como Funciona:

```typescript
// middlewares/auth.middleware.ts
export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
  validateSession: (token: string) => Promise<any>
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizedError("Token não fornecido");
  }

  const token = authHeader.replace("Bearer ", "");
  const session = await validateSession(token);

  if (!session) {
    throw new UnauthorizedError("Sessão inválida");
  }

  request.user = session.user;
}
```

### Como Usar:

```typescript
// No controller
import { authMiddleware } from "../../middlewares/auth.middleware";

app.get("/rota", {
  preHandler: [authMiddleware],
  handler: this.metodo.bind(this),
});
```

---

## ✅ Checklist de Segurança

- [x] Identificar rotas públicas vs protegidas
- [x] Adicionar authMiddleware no módulo Users
- [ ] Adicionar authMiddleware no módulo Appointments
- [ ] Adicionar authMiddleware no módulo Professional Profiles
- [ ] Adicionar authMiddleware no módulo Offered Services
- [ ] Adicionar authMiddleware no módulo Reviews
- [ ] Adicionar authMiddleware no módulo Organizations
- [ ] Testar todas as rotas protegidas
- [ ] Documentar mudanças

---

## 🚨 Próximos Passos URGENTES

1. **Aplicar authMiddleware** em TODOS os módulos
2. **Testar** cada rota sem token (deve retornar 401)
3. **Testar** cada rota com token (deve funcionar)
4. **Documentar** quais rotas são públicas
5. **Criar testes** de autorização

---

## 📝 Exemplo de Teste

### Antes (Vulnerável):

```http
GET http://localhost:3333/api/v1/users
# ✅ Retorna 200 (ERRADO - não deveria funcionar sem token)
```

### Depois (Seguro):

```http
GET http://localhost:3333/api/v1/users
# ❌ Retorna 401 Unauthorized (CORRETO)

GET http://localhost:3333/api/v1/users
Authorization: Bearer {token}
# ✅ Retorna 200 (CORRETO)
```

---

## 🎓 Boas Práticas de Segurança

1. ✅ **Princípio do menor privilégio** - Apenas rotas necessárias são públicas
2. ✅ **Autenticação obrigatória** - Todas as operações sensíveis exigem token
3. ✅ **Validação de token** - Middleware valida sessão em cada requisição
4. ✅ **Autorização** - Usuário só pode acessar/modificar seus próprios dados
5. ✅ **Logs de auditoria** - Registrar ações importantes

---

**⚠️ AÇÃO NECESSÁRIA: Aplicar authMiddleware nos módulos restantes!**
