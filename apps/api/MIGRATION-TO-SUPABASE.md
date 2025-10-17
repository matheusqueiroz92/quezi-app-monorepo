# 🚀 Guia de Migração: PostgreSQL Local → Supabase

## ⏱️ Tempo estimado: 15 minutos

---

## 📋 Pré-requisitos

- ✅ Aplicação funcionando localmente
- ✅ Conta no GitHub (para login no Supabase)
- ✅ Dados de desenvolvimento no PostgreSQL local

---

## 🔧 Passo 1: Criar Conta no Supabase

1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub
4. É gratuito! ✅

---

## 🗄️ Passo 2: Criar Projeto

1. No dashboard, clique em "New Project"
2. Preencha:

   - **Name:** `quezi-app` (ou nome de sua preferência)
   - **Database Password:** Gere uma senha forte (guarde ela!)
   - **Region:** `South America (São Paulo)` (mais próximo do Brasil)
   - **Pricing Plan:** `Free` (para começar)

3. Clique em "Create new project"
4. Aguarde ~2 minutos (Supabase está provisionando seu banco)

---

## 🔑 Passo 3: Obter Credenciais

1. No dashboard do projeto, vá em **Settings** (ícone de engrenagem)
2. Clique em **Database** no menu lateral
3. Role até **Connection string**
4. Copie a **URI** (modo URI)

Exemplo:

```
postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijklmnop.supabase.co:5432/postgres
```

5. Substitua `[YOUR-PASSWORD]` pela senha que você criou

---

## 📝 Passo 4: Atualizar Configuração Local

### 4.1. Atualizar arquivo `.env` (apps/api/.env)

```env
# Comentar a linha antiga
# DATABASE_URL="postgresql://postgres:password@localhost:5432/quezi_db"

# Adicionar a nova (Supabase)
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJECT-REF].supabase.co:5432/postgres?sslmode=require"
```

### 4.2. Atualizar `start-dev.bat` (apps/api/start-dev.bat)

```batch
@echo off
echo Starting Quezi API...

REM Atualizar esta linha com a URL do Supabase
set DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJECT-REF].supabase.co:5432/postgres?sslmode=require"

set JWT_SECRET="your-super-secret-jwt-key-with-at-least-32-characters"
set BETTER_AUTH_SECRET="your-super-secret-better-auth-key-with-at-least-32-characters"
set BETTER_AUTH_URL="http://localhost:3333"
set CORS_ORIGIN="http://localhost:3000"
set SWAGGER_ENABLED="true"
set NODE_ENV="development"

cd apps/api
npm run dev
```

---

## 🔄 Passo 5: Rodar Migrations

```bash
# No diretório apps/api
cd apps/api

# Aplicar migrations no Supabase
npx prisma migrate deploy

# Verificar se funcionou
npx prisma studio
```

---

## ✅ Passo 6: Testar Conexão

### 6.1. Iniciar API

```bash
cd apps/api
.\start-dev.bat
```

### 6.2. Verificar Logs

Você deve ver:

```
✅ Banco de dados conectado!
🚀 Servidor rodando em http://localhost:3333
📚 Documentação em http://localhost:3333/docs
```

### 6.3. Testar Endpoint

Acesse: http://localhost:3333/api/v1/test

Deve retornar:

```json
{
  "message": "Quezi API está funcionando! 🚀",
  "timestamp": "2025-..."
}
```

---

## 📊 Passo 7: Visualizar Dados no Supabase

1. No dashboard do Supabase
2. Vá em **Table Editor** (ícone de tabela)
3. Você verá todas as tabelas do Prisma:
   - ✅ users
   - ✅ sessions
   - ✅ accounts
   - ✅ categories
   - ✅ services (offered_services)
   - ✅ appointments
   - ✅ etc...

---

## 🔐 Passo 8: Configurar Backup (Opcional mas Recomendado)

O Supabase faz backup automático por 7 dias no plano gratuito!

Para backups manuais:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref [SEU-PROJECT-REF]

# Criar backup manual
supabase db dump -f backup.sql
```

---

## 🌐 Passo 9: Atualizar Frontend (se já estiver rodando)

### apps/web/.env.local

```env
# Não precisa mudar nada!
# O frontend continua chamando http://localhost:3333
NEXT_PUBLIC_API_URL="http://localhost:3333"
```

---

## 🚨 Troubleshooting

### Erro: "Connection refused"

**Solução:**

- Verifique se a senha está correta na URL
- Certifique-se que `?sslmode=require` está no final da URL
- Verifique se o projeto Supabase está ativo (não pausado)

### Erro: "SSL connection required"

**Solução:**
Adicione ao final da URL: `?sslmode=require`

### Erro: "Table already exists"

**Solução:**

```bash
# Resetar banco (CUIDADO: apaga todos os dados)
npx prisma migrate reset

# Ou, aplicar apenas novas migrations
npx prisma migrate deploy
```

### Erro: "Too many connections"

**Solução:**

- O plano gratuito tem limite de conexões
- Use connection pooling:

```env
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:6543/postgres?pgbouncer=true"
```

---

## 📈 Monitoramento

### Verificar Uso

1. No dashboard do Supabase
2. Vá em **Settings** → **Usage**
3. Monitore:
   - Database size
   - Bandwidth
   - API requests

### Alertas

Configure alertas quando atingir 80% do plano gratuito:

- Settings → Billing → Usage alerts

---

## 💰 Quando Fazer Upgrade?

### Considere o Supabase Pro ($25/mês) quando:

- ✅ Banco > 400 MB (80% do limite gratuito)
- ✅ Mais de 500 usuários ativos
- ✅ Necessidade de backup > 7 dias
- ✅ Suporte prioritário
- ✅ Mais performance

---

## 🎯 Checklist Final

- [ ] Conta no Supabase criada
- [ ] Projeto criado
- [ ] DATABASE_URL atualizada
- [ ] Migrations aplicadas
- [ ] API testada e funcionando
- [ ] Frontend conectado
- [ ] Backup configurado
- [ ] Monitoramento ativo

---

## 📚 Próximos Passos

1. **Deploy da API:** Vercel, Railway, ou Render
2. **Deploy do Frontend:** Vercel (recomendado para Next.js)
3. **Domínio customizado:** Conectar seu domínio
4. **CI/CD:** Automatizar deploys com GitHub Actions

---

## 🆘 Precisa de Ajuda?

- **Documentação Supabase:** https://supabase.com/docs
- **Discord Supabase:** https://discord.supabase.com
- **Prisma Docs:** https://www.prisma.io/docs

---

## ✨ Benefícios da Migração

✅ **Gratuito** até 500 MB  
✅ **Backup automático** (7 dias)  
✅ **SSL/TLS** incluído  
✅ **Monitoramento** em tempo real  
✅ **Escalável** conforme necessário  
✅ **API REST** automática  
✅ **Dashboard visual** para dados

**Parabéns! 🎉 Seu banco agora está na nuvem e pronto para escalar!**
