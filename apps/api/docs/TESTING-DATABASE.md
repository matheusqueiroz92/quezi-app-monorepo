# 🗄️ Guia de Testes do Banco de Dados

## 📋 Ferramentas Disponíveis

### 1. **Prisma Studio** ⭐ (Recomendado)

GUI visual oficial do Prisma para explorar e manipular dados em tempo real.

**Como usar:**

```bash
cd apps/api
npm run prisma:studio
```

**Acesse:** http://localhost:5555

**Recursos:**

- ✅ Visualizar todas as tabelas
- ✅ Adicionar, editar e deletar registros
- ✅ Filtrar e ordenar dados
- ✅ Ver relacionamentos entre tabelas
- ✅ Interface intuitiva e fácil de usar

---

### 2. **pgAdmin** (Já configurado no Docker)

Interface web completa para PostgreSQL.

**Como acessar:**

1. Acesse: http://localhost:5050
2. Login: `admin@quezi.com`
3. Senha: `admin_secure_password`

**Conectar ao banco:**

1. Clique em "Add New Server"
2. **General tab:**
   - Name: `Quezi DB`
3. **Connection tab:**
   - Host: `postgres_db` (ou `host.docker.internal` no Windows)
   - Port: `5432`
   - Database: `quezi_db`
   - Username: `quezi_user`
   - Password: `quezi_password`

---

### 3. **REST Client (VS Code)**

Use o arquivo `test-api.http` com a extensão REST Client.

**Instalar extensão:**

1. Abra VS Code
2. Instale: `REST Client` (humao.rest-client)
3. Abra o arquivo: `apps/api/test-api.http`
4. Clique em "Send Request" acima de cada requisição

---

### 4. **Script PowerShell**

Teste rápido da conexão e status do banco.

```bash
cd apps/api
.\scripts\test-database.ps1
```

---

## 🧪 Testando Passo a Passo

### Passo 1: Verificar Docker

```bash
npm run docker:up
docker ps
```

Deve mostrar:

- `quezi_db` (PostgreSQL)
- `quezi_pgadmin` (pgAdmin)

---

### Passo 2: Executar Migrations

```bash
cd apps/api
npm run prisma:migrate
```

Isso cria as tabelas no banco de dados.

---

### Passo 3: Popular com Dados Iniciais (Seed)

```bash
npm run prisma:seed
```

Isso adiciona 6 categorias de serviços:

- Cabelo
- Estética
- Maquiagem
- Manicure e Pedicure
- Massagem
- Outros

---

### Passo 4: Abrir Prisma Studio

```bash
npm run prisma:studio
```

Acesse: http://localhost:5555

Você verá:

- **users** - 0 registros
- **categories** - 6 registros (do seed)
- **professional_profiles** - 0 registros
- **services** - 0 registros
- **appointments** - 0 registros
- **reviews** - 0 registros

---

### Passo 5: Criar Usuário via API

**Opção A: Usando REST Client (VS Code)**

1. Abra `apps/api/test-api.http`
2. Localize "1. Criar Cliente"
3. Clique em "Send Request"

**Opção B: Usando curl**

```bash
curl -X POST http://localhost:3333/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "SenhaForte123",
    "name": "João Silva",
    "phone": "+5511999999999",
    "userType": "CLIENT"
  }'
```

**Opção C: Usando PowerShell**

```powershell
$body = @{
    email = "teste@example.com"
    password = "SenhaForte123"
    name = "João Silva"
    phone = "+5511999999999"
    userType = "CLIENT"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3333/api/v1/users -Method Post -Body $body -ContentType "application/json"
```

---

### Passo 6: Verificar no Prisma Studio

1. Volte ao Prisma Studio (http://localhost:5555)
2. Clique em "users" na barra lateral
3. Você deve ver o usuário criado! 🎉

---

### Passo 7: Testar Listagem

```bash
# Listar todos os usuários
curl http://localhost:3333/api/v1/users?page=1&limit=10

# Buscar por ID (substitua pelo ID real)
curl http://localhost:3333/api/v1/users/SEU-UUID-AQUI
```

---

## 📊 Queries SQL Úteis

Se preferir usar SQL direto no pgAdmin:

```sql
-- Ver todos os usuários
SELECT * FROM users;

-- Contar usuários por tipo
SELECT user_type, COUNT(*)
FROM users
GROUP BY user_type;

-- Ver categorias
SELECT * FROM categories;

-- Ver usuários com seus perfis profissionais
SELECT u.*, pp.*
FROM users u
LEFT JOIN professional_profiles pp ON u.id = pp.user_id;

-- Limpar todos os usuários (CUIDADO!)
TRUNCATE TABLE users CASCADE;
```

---

## ✅ Checklist de Testes

### Teste de Conexão

- [ ] Docker está rodando
- [ ] Containers estão ativos (postgres + pgadmin)
- [ ] Migrations foram executadas
- [ ] Seed foi executado (6 categorias)

### Teste CRUD Users

- [ ] ✅ CREATE - Criar usuário cliente
- [ ] ✅ CREATE - Criar usuário profissional
- [ ] ❌ CREATE - Email duplicado retorna erro 409
- [ ] ❌ CREATE - Senha fraca retorna erro 400
- [ ] ✅ READ - Listar usuários
- [ ] ✅ READ - Buscar por ID
- [ ] ✅ READ - Filtrar por tipo (CLIENT/PROFESSIONAL)
- [ ] ✅ READ - Buscar com paginação
- [ ] ✅ UPDATE - Atualizar nome
- [ ] ✅ UPDATE - Atualizar email e telefone
- [ ] ❌ UPDATE - Email duplicado retorna erro 409
- [ ] ❌ UPDATE - Usuário não existe retorna 404
- [ ] ✅ DELETE - Deletar usuário
- [ ] ❌ DELETE - Usuário já deletado retorna 404

### Verificação no Banco

- [ ] Dados aparecem no Prisma Studio
- [ ] Dados aparecem no pgAdmin
- [ ] Senha não é retornada nas respostas da API
- [ ] Timestamps (createdAt, updatedAt) são preenchidos
- [ ] UUIDs são gerados automaticamente

---

## 🐛 Troubleshooting

### Problema: "Cannot connect to database"

**Solução:**

```bash
# Reiniciar Docker
npm run docker:down
npm run docker:up

# Aguardar 5 segundos e testar
npm run prisma:migrate
```

---

### Problema: "Table doesn't exist"

**Solução:**

```bash
# Executar migrations novamente
cd apps/api
npm run prisma:migrate
```

---

### Problema: Prisma Studio não abre

**Solução:**

```bash
# Verificar se a porta 5555 está livre
netstat -ano | findstr :5555

# Matar processo se necessário
taskkill /PID <PID> /F

# Abrir novamente
npm run prisma:studio
```

---

### Problema: pgAdmin não conecta

**Solução no Windows:**

Use `host.docker.internal` ao invés de `postgres_db` na conexão.

---

## 📝 Exemplos de Testes Reais

### Cenário 1: Criar e Buscar Cliente

```bash
# 1. Criar
POST http://localhost:3333/api/v1/users
{
  "email": "cliente1@teste.com",
  "password": "Senha123",
  "name": "Cliente Teste",
  "userType": "CLIENT"
}

# Resposta: { id: "abc-123-...", ... }

# 2. Buscar
GET http://localhost:3333/api/v1/users/abc-123-...

# 3. Verificar no Prisma Studio
# http://localhost:5555 -> users -> deve aparecer
```

---

### Cenário 2: Testar Paginação

```bash
# Criar 15 usuários
# ...

# Listar primeira página (10 itens)
GET http://localhost:3333/api/v1/users?page=1&limit=10

# Listar segunda página (5 itens)
GET http://localhost:3333/api/v1/users?page=2&limit=10
```

---

### Cenário 3: Testar Validações

```bash
# Senha fraca - deve retornar erro
POST http://localhost:3333/api/v1/users
{
  "email": "teste@weak.com",
  "password": "123",
  "name": "Teste",
  "userType": "CLIENT"
}

# Resposta esperada: 400 Bad Request
# { error: "ValidationError", ... }
```

---

## 🎯 Próximos Testes

Quando implementar os próximos módulos:

### Professional Profiles

- [ ] Criar perfil profissional
- [ ] Verificar relacionamento com user
- [ ] Testar campo serviceMode

### Services

- [ ] Criar serviço
- [ ] Associar com categoria
- [ ] Associar com profissional

### Appointments

- [ ] Criar agendamento
- [ ] Verificar relacionamentos
- [ ] Testar status workflow

---

**📚 Documentação Oficial:**

- [Prisma Studio](https://www.prisma.io/studio)
- [pgAdmin](https://www.pgadmin.org/docs/)
- [REST Client Extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
