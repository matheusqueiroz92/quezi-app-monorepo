# 🚀 Guia Rápido - Testar Admin Panel

## ✅ Pré-requisitos

- [x] Banco de dados PostgreSQL rodando
- [x] Seed executado (Super Admin criado)
- [x] API rodando em `http://localhost:3333`

---

## 🔐 Credenciais do Super Admin

```
📧 Email: admin@quezi.com
🔑 Senha: Admin@2025
🛡️  Role: SUPER_ADMIN
```

---

## 🧪 Testes Rápidos

### 1️⃣ Fazer Login

```http
POST http://localhost:3333/api/v1/admin/auth/login
Content-Type: application/json

{
  "email": "admin@quezi.com",
  "password": "Admin@2025"
}
```

**Resposta esperada (200):**

```json
{
  "admin": {
    "id": "clx...",
    "email": "admin@quezi.com",
    "name": "Super Admin",
    "role": "SUPER_ADMIN",
    ...
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**➡️ Copie o `token` para usar nas próximas requisições!**

---

### 2️⃣ Buscar Sessão Atual

```http
GET http://localhost:3333/api/v1/admin/auth/session
Authorization: Bearer SEU_TOKEN_AQUI
```

---

### 3️⃣ Ver Dashboard Stats

```http
GET http://localhost:3333/api/v1/admin/dashboard
Authorization: Bearer SEU_TOKEN_AQUI
```

**Resposta esperada:**

```json
{
  "users": {
    "total": 0,
    "clients": 0,
    "professionals": 0,
    "newToday": 0
  },
  "appointments": {
    "total": 0,
    "pending": 0,
    "completed": 0,
    "completionRate": 0
  },
  "reviews": {
    "total": 0,
    "averageRating": 0,
    "reportedPending": 0
  },
  "revenue": {
    "total": 0,
    "commission": 0,
    "today": 0
  }
}
```

---

### 4️⃣ Listar Todos os Usuários

```http
GET http://localhost:3333/api/v1/admin/users?page=1&limit=10
Authorization: Bearer SEU_TOKEN_AQUI
```

---

### 5️⃣ Criar Novo Admin (Moderador)

```http
POST http://localhost:3333/api/v1/admin/admins
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json

{
  "email": "moderador@quezi.com",
  "password": "Moderador123",
  "name": "João Moderador",
  "role": "MODERATOR"
}
```

---

### 6️⃣ Listar Todos os Admins

```http
GET http://localhost:3333/api/v1/admin/admins?page=1&limit=10
Authorization: Bearer SEU_TOKEN_AQUI
```

---

### 7️⃣ Ver Log de Ações Administrativas

```http
GET http://localhost:3333/api/v1/admin/actions?page=1&limit=10
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## 🎯 Endpoints Principais do Admin

| Método | Endpoint                     | Descrição               | Requer Auth    |
| ------ | ---------------------------- | ----------------------- | -------------- |
| POST   | `/admin/auth/login`          | Login admin             | ❌             |
| GET    | `/admin/auth/session`        | Sessão atual            | ✅             |
| POST   | `/admin/admins`              | Criar admin             | ✅ SUPER_ADMIN |
| GET    | `/admin/admins`              | Listar admins           | ✅             |
| GET    | `/admin/admins/:id`          | Buscar admin            | ✅             |
| PUT    | `/admin/admins/:id`          | Atualizar admin         | ✅ SUPER_ADMIN |
| DELETE | `/admin/admins/:id`          | Deletar admin           | ✅ SUPER_ADMIN |
| PUT    | `/admin/admins/:id/password` | Trocar senha            | ✅             |
| GET    | `/admin/users`               | Listar usuários         | ✅             |
| GET    | `/admin/users/:id`           | Detalhes usuário        | ✅             |
| PUT    | `/admin/users/:id/suspend`   | Suspender usuário       | ✅             |
| PUT    | `/admin/users/:id/activate`  | Ativar usuário          | ✅             |
| DELETE | `/admin/users/:id/permanent` | Deletar permanentemente | ✅ SUPER_ADMIN |
| GET    | `/admin/dashboard`           | Estatísticas            | ✅             |
| GET    | `/admin/actions`             | Log de ações            | ✅             |

---

## 📁 Arquivo de Teste Completo

Use o arquivo **`test-admin.http`** que contém 26 requisições prontas:

```
apps/api/test-admin.http
```

### Como usar (VS Code):

1. Instale a extensão **REST Client**
2. Abra o arquivo `test-admin.http`
3. Clique em **"Send Request"** acima de cada requisição
4. Copie o token do login e cole nas outras requisições

---

## 🔄 Fluxo de Teste Completo

### Passo a Passo:

1. ✅ **Inicie o banco de dados**

   ```bash
   npm run docker:up
   ```

2. ✅ **Execute as migrations**

   ```bash
   npm run prisma:migrate
   ```

3. ✅ **Execute o seed**

   ```bash
   npm run prisma:seed
   ```

4. ✅ **Inicie a API**

   ```bash
   npm run dev
   ```

5. ✅ **Teste o login**

   - Use o arquivo `test-admin.http`
   - Ou use curl/Postman/Insomnia

6. ✅ **Copie o token**

   - Use nas próximas requisições

7. ✅ **Teste os endpoints**
   - Dashboard, usuários, admins, etc.

---

## 💡 Dicas

### REST Client (VS Code)

Instale a extensão e use variáveis:

```http
### Variáveis
@baseUrl = http://localhost:3333/api/v1
@token = SEU_TOKEN_AQUI

### Login
POST {{baseUrl}}/admin/auth/login
Content-Type: application/json

{
  "email": "admin@quezi.com",
  "password": "Admin@2025"
}

### Dashboard (usa variável)
GET {{baseUrl}}/admin/dashboard
Authorization: Bearer {{token}}
```

### Postman/Insomnia

Configure um **Environment** com:

- `baseUrl`: `http://localhost:3333/api/v1`
- `token`: (copie após o login)

---

## 🎉 Pronto!

Agora você pode:

- ✅ Fazer login como Super Admin
- ✅ Gerenciar outros admins
- ✅ Visualizar estatísticas
- ✅ Gerenciar usuários
- ✅ Ver logs de ações

**Divirta-se testando! 🚀**
