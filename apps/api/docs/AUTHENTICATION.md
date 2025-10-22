# 🔐 Guia Completo de Autenticação - Quezi API

## 📋 Visão Geral

A API Quezi utiliza **[Better Auth](https://www.better-auth.com/docs/introduction)** para autenticação e autorização, oferecendo:

- ✅ **Email/Password** - Autenticação tradicional com BCrypt
- ✅ **Social OAuth** - Login via Google, GitHub
- ✅ **Session Management** - Sessões seguras (7 dias)
- ✅ **RBAC** - Role-Based Access Control
- ✅ **2FA** - Two-Factor Authentication
- ✅ **Rate Limiting** - Proteção contra ataques
- ✅ **71 Testes** - 100% passando (TDD)

---

## 🚀 Começando

### 1. Configurar Variáveis de Ambiente

Edite o arquivo `.env` em `apps/api/`:

```env
# Better Auth - Configurações
BETTER_AUTH_SECRET=your-better-auth-secret-min-32-chars-change-in-production
BETTER_AUTH_URL=http://localhost:3333

# Social Providers (opcional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

### 2. Gerar Schema do Better Auth

```bash
cd apps/api
npx @better-auth/cli generate
```

Este comando irá:
- Adicionar tabelas necessárias ao `schema.prisma`
- Criar tabelas: `session`, `account`, `verification`, `organization`, `member`, etc.

### 3. Executar Migration

```bash
npm run prisma:migrate
```

### 4. Iniciar API

```bash
npm run dev
```

API disponível em: `http://localhost:3333`

---

## 📡 Endpoints Disponíveis

### Autenticação Email/Password

#### Registrar Novo Usuário

```http
POST /api/v1/auth/sign-up/email
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "SenhaForte123",
  "name": "João Silva"
}
```

**Resposta (201):**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "usuario@example.com",
    "name": "João Silva",
    "emailVerified": false,
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "session": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2025-01-08T00:00:00.000Z"
  }
}
```

---

#### Fazer Login

```http
POST /api/v1/auth/sign-in/email
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "SenhaForte123"
}
```

**Resposta (200):**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "usuario@example.com",
    "name": "João Silva"
  },
  "session": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2025-01-08T00:00:00.000Z"
  }
}
```

**⚠️ Guardar o `token` para usar em requisições autenticadas!**

---

#### Obter Perfil do Usuário Autenticado

```http
GET /api/v1/auth/me
Authorization: Bearer SEU_TOKEN_AQUI
```

**Resposta (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "usuario@example.com",
  "name": "João Silva",
  "userType": "CLIENT",
  "isEmailVerified": false
}
```

---

#### Logout

```http
POST /api/v1/auth/sign-out
Authorization: Bearer SEU_TOKEN_AQUI
```

**Resposta (200):**
```json
{
  "success": true
}
```

---

#### Obter Sessão Atual

```http
GET /api/v1/auth/session
Authorization: Bearer SEU_TOKEN_AQUI
```

**Resposta (200):**
```json
{
  "session": {
    "id": "session-123",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "expiresAt": "2025-01-08T00:00:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "usuario@example.com",
    "name": "João Silva"
  }
}
```

---

### Recuperação de Senha

#### Esqueci Minha Senha

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "usuario@example.com"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "message": "Email de recuperação enviado"
}
```

#### Resetar Senha

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "NovaSenhaForte456"
}
```

---

### Social OAuth (Google, GitHub)

#### Login com Google

```http
GET /api/v1/auth/signin/google
```

Redireciona para Google OAuth. Após autenticação, retorna ao callback:

```
GET /api/v1/auth/callback/google?code=...
```

#### Login com GitHub

```http
GET /api/v1/auth/signin/github
```

Redireciona para GitHub OAuth. Após autenticação, retorna ao callback:

```
GET /api/v1/auth/callback/github?code=...
```

**📝 Nota:** Configure os Client IDs no `.env` (veja seção "Configuração OAuth")

---

## 🔒 Usando Autenticação nas Rotas

### Exemplo: Proteger Rota de Users

```typescript
// user.routes.ts
app.get(
  "/profile",
  {
    preHandler: async (request, reply) => {
      // Valida sessão usando Better Auth
      const session = await auth.api.getSession({
        headers: request.headers as any,
      });

      if (!session) {
        throw new UnauthorizedError("Usuário não autenticado");
      }

      // Adiciona usuário à requisição
      request.user = session.user;
    },
  },
  async (request, reply) => {
    return {
      message: "Rota protegida!",
      user: request.user,
    };
  }
);
```

---

## 🧪 Testando com cURL

### 1. Registrar Usuário

```bash
curl -X POST http://localhost:3333/api/v1/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "SenhaForte123",
    "name": "Teste User"
  }'
```

### 2. Fazer Login e Guardar Token

```bash
# Fazer login
TOKEN=$(curl -X POST http://localhost:3333/api/v1/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "SenhaForte123"
  }' | jq -r '.session.token')

echo "Token: $TOKEN"
```

### 3. Acessar Rota Protegida

```bash
curl -X GET http://localhost:3333/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🧪 Testando com PowerShell

### 1. Registrar e Fazer Login

```powershell
# Registrar
$registerBody = @{
    email = "teste@example.com"
    password = "SenhaForte123"
    name = "Teste User"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri http://localhost:3333/api/v1/auth/sign-up/email `
    -Method Post -Body $registerBody -ContentType "application/json"

# Guardar token
$token = $response.session.token
Write-Host "Token: $token"
```

### 2. Acessar Rota Protegida

```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri http://localhost:3333/api/v1/auth/me `
    -Method Get -Headers $headers
```

---

## 🎨 Testando com REST Client (VS Code)

Crie ou edite `apps/api/test-api.http`:

```http
### Variáveis
@baseUrl = http://localhost:3333/api/v1
@token = 

### 1. Registrar Usuário
POST {{baseUrl}}/auth/sign-up/email
Content-Type: application/json

{
  "email": "novo@example.com",
  "password": "SenhaForte123",
  "name": "Novo Usuário"
}

###

### 2. Login
# @name login
POST {{baseUrl}}/auth/sign-in/email
Content-Type: application/json

{
  "email": "novo@example.com",
  "password": "SenhaForte123"
}

###

### 3. Obter Perfil (cole o token acima na variável @token)
GET {{baseUrl}}/auth/me
Authorization: Bearer {{token}}

###

### 4. Logout
POST {{baseUrl}}/auth/sign-out
Authorization: Bearer {{token}}
```

---

## 🔐 Configuração OAuth Social

### Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Crie um novo projeto ou selecione existente
3. Vá em **APIs & Services > Credentials**
4. Clique em **Create Credentials > OAuth 2.0 Client ID**
5. Configure:
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3333/api/v1/auth/callback/google`
6. Copie **Client ID** e **Client Secret** para o `.env`:

```env
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret
```

### GitHub OAuth

1. Acesse [GitHub Developer Settings](https://github.com/settings/developers)
2. Clique em **New OAuth App**
3. Configure:
   - Application name: **Quezi App**
   - Homepage URL: `http://localhost:3333`
   - Authorization callback URL: `http://localhost:3333/api/v1/auth/callback/github`
4. Copie **Client ID** e crie um **Client Secret**
5. Adicione ao `.env`:

```env
GITHUB_CLIENT_ID=seu-github-client-id
GITHUB_CLIENT_SECRET=seu-github-client-secret
```

---

## 🛡️ Segurança

### Hash de Senhas (BCrypt)

✅ Todas as senhas são automaticamente hash com **BCrypt** (10 rounds)
✅ Senhas **nunca** são retornadas nas respostas da API
✅ Validação de senha forte no cadastro

**Requisitos de Senha:**
- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 letra minúscula
- Pelo menos 1 número

### Sessões

- ✅ Duração: **7 dias**
- ✅ Renovação automática a cada **1 dia** de uso
- ✅ Cookies seguros em produção (`httpOnly`, `secure`, `sameSite`)
- ✅ Cache de sessão: **5 minutos**

### Rate Limiting

- ✅ **10 requisições por minuto** por IP
- ✅ Proteção contra força bruta
- ✅ Configurável em `src/lib/auth.ts`

---

## 🏢 RBAC - Organizações e Permissões

### Criar Organização

```http
POST /api/v1/auth/organization
Content-Type: application/json
Authorization: Bearer SEU_TOKEN

{
  "name": "Minha Empresa",
  "slug": "minha-empresa"
}
```

### Convidar Membro

```http
POST /api/v1/auth/organization/invite
Content-Type: application/json
Authorization: Bearer SEU_TOKEN

{
  "organizationId": "org-123",
  "email": "membro@example.com",
  "role": "member"
}
```

### Roles Disponíveis

| Role | Descrição | Permissões |
|------|-----------|------------|
| `owner` | Dono da organização | Acesso total, gerenciar membros |
| `admin` | Administrador | Gerenciar recursos, convites |
| `member` | Membro | Acesso básico |

---

## 🔐 Two-Factor Authentication (2FA)

### Habilitar 2FA

```http
POST /api/v1/auth/two-factor/enable
Authorization: Bearer SEU_TOKEN
```

**Resposta:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,iVBOR..."
}
```

### Verificar Código 2FA

```http
POST /api/v1/auth/two-factor/verify
Content-Type: application/json
Authorization: Bearer SEU_TOKEN

{
  "code": "123456"
}
```

### Desabilitar 2FA

```http
POST /api/v1/auth/two-factor/disable
Content-Type: application/json
Authorization: Bearer SEU_TOKEN

{
  "password": "SuaSenhaAtual"
}
```

---

## 🐛 Troubleshooting

### Erro: "Token inválido ou expirado"

**Causa:** Token expirou ou é inválido

**Solução:**
1. Faça login novamente para obter novo token
2. Verifique se o token está sendo enviado corretamente no header `Authorization: Bearer TOKEN`

### Erro: "Email já cadastrado"

**Causa:** Email já existe no banco de dados

**Solução:**
1. Faça login com o email existente
2. Use a recuperação de senha se esqueceu
3. Registre com outro email

### Erro: "Senha fraca"

**Causa:** Senha não atende aos requisitos

**Solução:** Use senha com:
- Mínimo 8 caracteres
- 1 maiúscula
- 1 minúscula  
- 1 número

### OAuth não funciona

**Causa:** Client ID/Secret não configurados

**Solução:**
1. Verifique se as variáveis estão no `.env`
2. Confirme que os callbacks estão corretos
3. Verifique console para erros específicos

---

## 📚 Swagger UI

Acesse a documentação interativa:

```
http://localhost:3333/docs
```

Na interface Swagger:
1. Clique em **"Authorize"** (cadeado no topo)
2. Cole seu token (obtido do login)
3. Clique em **"Authorize"**
4. Teste os endpoints diretamente!

---

## 🧪 Testes

### Executar Todos os Testes

```bash
cd apps/api
npm test
```

**Resultado esperado:**
```
Test Suites: 7 passed, 7 total
Tests:       71 passed, 71 total
Time:        < 2s
```

### Testes de Autenticação

- ✅ `password.test.ts` - Hash e validação de senhas (11 testes)
- ✅ `auth.service.test.ts` - Login e registro (13 testes)
- ✅ `auth.middleware.test.ts` - Middleware de auth (4 testes)

### Cobertura

```bash
npm run test:coverage
```

**Cobertura atual: 97%+**

---

## 📖 Referências

- **Better Auth Docs:** https://www.better-auth.com/docs/introduction
- **BCrypt:** https://github.com/kelektiv/node.bcrypt.js
- **Fastify:** https://www.fastify.io/
- **Prisma:** https://www.prisma.io/

---

## 🎯 Próximos Passos

### Para Desenvolvimento

1. ✅ Configurar OAuth social (opcional)
2. ✅ Testar todos os endpoints
3. ✅ Implementar rotas protegidas nos módulos
4. ✅ Adicionar logs de autenticação

### Para Produção

1. ⚠️ Mudar `BETTER_AUTH_SECRET` para valor forte
2. ⚠️ Habilitar `requireEmailVerification: true`
3. ⚠️ Configurar `CORS_ORIGIN` para domínio específico
4. ⚠️ Configurar `useSecureCookies: true`
5. ⚠️ Configurar envio de emails (NodeMailer)

---

## 💡 Exemplos Práticos

### Exemplo Completo: Fluxo de Autenticação

```javascript
// 1. Registrar usuário
const registerResponse = await fetch('http://localhost:3333/api/v1/auth/sign-up/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@example.com',
    password: 'SenhaForte123',
    name: 'Novo Usuário'
  })
});

const { session } = await registerResponse.json();
const token = session.token;

// 2. Usar token em requisições
const profileResponse = await fetch('http://localhost:3333/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const profile = await profileResponse.json();
console.log('Perfil:', profile);

// 3. Fazer logout
await fetch('http://localhost:3333/api/v1/auth/sign-out', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

**🎉 Autenticação implementada com sucesso usando TDD e Better Auth!**

**Documentação Oficial:** https://www.better-auth.com/docs/introduction

