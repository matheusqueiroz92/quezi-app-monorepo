# 🔐 Credenciais de Admin - Quezi API

## 👤 Super Admin Padrão

O sistema já possui um **Super Admin** criado automaticamente através do seed do banco de dados.

### Credenciais de Acesso

```
📧 Email: admin@quezi.com
🔑 Senha: Admin@2025
🛡️  Role: SUPER_ADMIN
```

⚠️ **IMPORTANTE:** Em produção, troque essa senha imediatamente após o primeiro acesso!

---

## 🚀 Como Executar o Seed

Se o Super Admin ainda não foi criado no banco de dados, execute:

### 1. Via NPM (recomendado)

```bash
cd apps/api
npm run seed
```

### 2. Via Prisma

```bash
cd apps/api
npx prisma db seed
```

### Saída Esperada:

```
🌱 Iniciando seed do banco de dados...

📋 Criando categorias...
✅ 6 categorias criadas/atualizadas

👤 Criando Super Admin...
✅ Super Admin criado: admin@quezi.com
   📧 Email: admin@quezi.com
   🔑 Senha: Admin@2025
   ⚠️  IMPORTANTE: Troque a senha em produção!

✨ Seed concluído com sucesso!
```

---

## 🔑 Como Fazer Login

### Via HTTP Request (arquivo `test-admin.http`)

```http
### 1. Login Admin
POST http://localhost:3333/api/v1/admin/auth/login
Content-Type: application/json

{
  "email": "admin@quezi.com",
  "password": "Admin@2025"
}
```

### Via cURL

```bash
curl -X POST http://localhost:3333/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@quezi.com",
    "password": "Admin@2025"
  }'
```

### Resposta Esperada:

```json
{
  "admin": {
    "id": "clx...",
    "email": "admin@quezi.com",
    "name": "Super Admin",
    "role": "SUPER_ADMIN",
    "isActive": true,
    "permissions": null,
    "lastLogin": "2025-10-22T...",
    "createdAt": "2025-10-22T...",
    "updatedAt": "2025-10-22T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🛠️ Criar Novos Admins

Após fazer login como Super Admin, você pode criar novos admins:

### Endpoint: `POST /api/v1/admin/admins`

**Requer:**

- Header: `Authorization: Bearer {token_do_super_admin}`
- Role: `SUPER_ADMIN`

**Body:**

```json
{
  "email": "moderador@quezi.com",
  "password": "SenhaForte123",
  "name": "Nome do Moderador",
  "role": "MODERATOR"
}
```

### Roles Disponíveis:

- `SUPER_ADMIN` - Acesso total à plataforma
- `ADMIN` - Gestão de usuários e moderação
- `MODERATOR` - Apenas moderação de conteúdo
- `SUPPORT` - Apenas suporte a usuários
- `ANALYST` - Apenas visualização de métricas

---

## 🔐 Trocar Senha do Admin

### Endpoint: `PUT /api/v1/admin/admins/:id/password`

**Requer:**

- Header: `Authorization: Bearer {token}`
- O admin só pode trocar sua própria senha (exceto SUPER_ADMIN)

**Body:**

```json
{
  "currentPassword": "Admin@2025",
  "newPassword": "NovaSenhaSegura123"
}
```

---

## 📋 Verificar Admin Logado

### Endpoint: `GET /api/v1/admin/auth/session`

**Requer:**

- Header: `Authorization: Bearer {token}`

**Resposta:**

```json
{
  "admin": {
    "id": "clx...",
    "email": "admin@quezi.com",
    "name": "Super Admin",
    "role": "SUPER_ADMIN",
    ...
  }
}
```

---

## 🔍 Verificar se Admin Existe no Banco

### Via Prisma Studio:

```bash
cd apps/api
npx prisma studio
```

Depois acesse a tabela `admins` no navegador.

### Via PostgreSQL:

```sql
SELECT * FROM admins WHERE email = 'admin@quezi.com';
```

---

## ⚙️ Resetar o Banco (se necessário)

Se precisar recriar o banco e o admin:

```bash
cd apps/api

# 1. Resetar banco
npx prisma migrate reset --force

# 2. Aplicar migrations
npx prisma migrate deploy

# 3. Executar seed
npm run seed
```

---

## 📝 Arquivo de Teste HTTP

Use o arquivo `apps/api/test-admin.http` para testar todos os endpoints admin. Ele já contém 26 requisições de exemplo prontas para uso.

**Dica:** Use a extensão REST Client do VS Code para executar as requisições diretamente do arquivo.

---

## 🔒 Segurança

### Boas Práticas:

1. ✅ **Troque a senha padrão** imediatamente em produção
2. ✅ **Use senhas fortes** (mínimo 8 caracteres, maiúscula, minúscula, número)
3. ✅ **Nunca compartilhe** credenciais de SUPER_ADMIN
4. ✅ **Use roles apropriadas** para cada administrador
5. ✅ **Monitore logs** de ações administrativas

### Tokens JWT:

- **Validade:** 8 horas
- **Renovação:** Fazer novo login após expiração
- **Armazenamento:** Nunca armazene tokens em localStorage (use httpOnly cookies em produção)

---

## 🆘 Problemas Comuns

### "Credenciais inválidas"

- Verifique se o seed foi executado
- Confirme que o email e senha estão corretos
- Verifique se o admin está ativo (`isActive: true`)

### "Token inválido ou expirado"

- Faça login novamente para obter novo token
- Verifique se o JWT_SECRET está configurado no `.env`

### "Apenas SUPER_ADMIN pode executar esta ação"

- Confirme que você está logado com o Super Admin
- Verifique o role no token JWT

---

**Pronto para usar! 🚀**

Para qualquer dúvida, consulte a documentação completa em `apps/api/docs/`.
