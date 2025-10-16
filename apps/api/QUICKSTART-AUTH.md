# ⚡ Quick Start - Autenticação Quezi API

## 🚀 Início Rápido (5 minutos)

### Passo 1: Iniciar API

```bash
cd apps/api
npm run dev
```

### Passo 2: Abrir Swagger

Acesse: **http://localhost:3333/docs**

### Passo 3: Registrar Usuário

No Swagger:
1. Expanda `POST /api/v1/auth/sign-up/email`
2. Clique em **"Try it out"**
3. Cole este JSON:

```json
{
  "email": "seu-email@teste.com",
  "password": "SenhaForte123",
  "name": "Seu Nome"
}
```

4. Clique em **"Execute"**
5. **Copie o `token`** da resposta!

### Passo 4: Autenticar no Swagger

1. Clique no botão **"Authorize"** (cadeado no topo)
2. Cole o token que você copiou
3. Clique em **"Authorize"**
4. Feche o modal

### Passo 5: Testar Rota Protegida

1. Expanda `GET /api/v1/auth/me`
2. Clique em **"Try it out"**
3. Clique em **"Execute"**
4. ✅ Você verá seu perfil de usuário!

---

## 🎯 Endpoints Principais

### 📝 Registro

```
POST /api/v1/auth/sign-up/email
```

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "SenhaForte123",
  "name": "Usuário Teste"
}
```

**Retorna:** `{ user: {...}, session: { token: "..." } }`

---

### 🔐 Login

```
POST /api/v1/auth/sign-in/email
```

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "SenhaForte123"
}
```

**Retorna:** `{ user: {...}, session: { token: "..." } }`

---

### 👤 Perfil do Usuário

```
GET /api/v1/auth/me
Authorization: Bearer SEU_TOKEN
```

**Retorna:** Dados do usuário autenticado

---

### 🚪 Logout

```
POST /api/v1/auth/sign-out
Authorization: Bearer SEU_TOKEN
```

---

## 💻 Testando com PowerShell

### Script Completo

```powershell
# 1. Registrar
$registerBody = @{
    email = "teste@powershell.com"
    password = "SenhaForte123"
    name = "Teste PowerShell"
} | ConvertTo-Json

$registerResponse = Invoke-RestMethod `
    -Uri http://localhost:3333/api/v1/auth/sign-up/email `
    -Method Post `
    -Body $registerBody `
    -ContentType "application/json"

$token = $registerResponse.session.token
Write-Host "✅ Token obtido: $token"

# 2. Obter perfil
$headers = @{ Authorization = "Bearer $token" }

$profile = Invoke-RestMethod `
    -Uri http://localhost:3333/api/v1/auth/me `
    -Method Get `
    -Headers $headers

Write-Host "✅ Perfil: $($profile | ConvertTo-Json)"
```

---

## 📱 OAuth Social (Opcional)

### Google

1. Configure no [Google Cloud Console](https://console.cloud.google.com/)
2. Adicione ao `.env`:
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```
3. Acesse: http://localhost:3333/api/v1/auth/signin/google

### GitHub

1. Configure no [GitHub](https://github.com/settings/developers)
2. Adicione ao `.env`:
   ```
   GITHUB_CLIENT_ID=...
   GITHUB_CLIENT_SECRET=...
   ```
3. Acesse: http://localhost:3333/api/v1/auth/signin/github

**Guia completo:** Ver `OAUTH-SETUP.md`

---

## 🛡️ Requisitos de Senha

- ✅ Mínimo **8 caracteres**
- ✅ Pelo menos **1 letra maiúscula**
- ✅ Pelo menos **1 letra minúscula**
- ✅ Pelo menos **1 número**

---

## ✅ Verificar se Está Funcionando

### 1. Teste Manual Rápido

```bash
# Criar usuário
curl -X POST http://localhost:3333/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste-rapido@example.com",
    "password": "Senha123",
    "name": "Teste Rápido",
    "userType": "CLIENT"
  }'
```

### 2. Verificar no Prisma Studio

```bash
npm run prisma:studio
```

Acesse: http://localhost:5555

- Clique em **"users"**
- Você verá o usuário criado
- Note que o `passwordHash` está com hash BCrypt! ✅

### 3. Testar Login

Use o Swagger em `/docs` ou:

```bash
curl -X POST http://localhost:3333/api/v1/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste-rapido@example.com",
    "password": "Senha123"
  }'
```

---

## 📚 Documentação Completa

- **Guia de Autenticação:** `AUTHENTICATION.md`
- **Configuração OAuth:** `OAUTH-SETUP.md`
- **Exemplos HTTP:** `test-auth.http` (25 exemplos)
- **Swagger UI:** http://localhost:3333/docs
- **Better Auth Docs:** https://www.better-auth.com/docs/introduction

---

## 🎉 Pronto!

Agora você tem:
- ✅ Autenticação completa com Better Auth
- ✅ Hash de senhas com BCrypt
- ✅ 71 testes unitários (100% passando)
- ✅ OAuth social (Google/GitHub)
- ✅ RBAC e organizações
- ✅ 2FA disponível
- ✅ Documentação completa

**Comece a usar agora mesmo pelo Swagger:** http://localhost:3333/docs

