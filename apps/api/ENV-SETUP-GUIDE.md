# 🔧 Guia de Configuração de Variáveis de Ambiente

## 🎯 Opção 1: Usar start-dev.bat (Atual) ✅

Você já está usando! Basta atualizar as chaves em `apps/api/start-dev.bat`:

```batch
@echo off
echo Starting Quezi API...

set DATABASE_URL="postgresql://postgres:password@localhost:5432/quezi_db"
set JWT_SECRET="HVyzEbvoqcJ855hEHCQUEtiIT861Rie07VKrXa7Ek2I="
set BETTER_AUTH_SECRET="N7D43GX291XrfKw0NggqD7RoYTO+wM53M7ziCTRueXk="
set BETTER_AUTH_URL="http://localhost:3333"
set CORS_ORIGIN="http://localhost:3000"
set SWAGGER_ENABLED="true"
set NODE_ENV="development"

cd apps/api
npm run dev
```

**Vantagens:**
- ✅ Funciona no Windows
- ✅ Tudo em um arquivo
- ✅ Fácil de executar

**Desvantagem:**
- ⚠️ Precisa commitar (sem as chaves reais!)

---

## 🎯 Opção 2: Usar arquivo .env (Recomendado)

Crie o arquivo `apps/api/.env`:

```env
# ========================================
# BANCO DE DADOS
# ========================================
DATABASE_URL="postgresql://postgres:password@localhost:5432/quezi_db"

# ========================================
# BETTER AUTH
# ========================================
BETTER_AUTH_SECRET="N7D43GX291XrfKw0NggqD7RoYTO+wM53M7ziCTRueXk="
JWT_SECRET="HVyzEbvoqcJ855hEHCQUEtiIT861Rie07VKrXa7Ek2I="
BETTER_AUTH_URL="http://localhost:3333"

# ========================================
# OAUTH (Opcional)
# ========================================
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# ========================================
# SERVIDOR
# ========================================
PORT="3333"
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
SWAGGER_ENABLED="true"
```

**Vantagens:**
- ✅ Padrão da indústria
- ✅ Não precisa commitar
- ✅ Já está no .gitignore

**Para usar:**
```bash
cd apps/api
npm run dev
```

---

## 🚀 Gerar Novas Chaves

### **Sempre que precisar de novas chaves:**

```bash
# Executar o script helper
node apps/api/generate-secrets.js
```

**Output exemplo:**
```
🔐 Gerando credenciais do Better Auth...

✨ BETTER_AUTH_SECRET:
N7D43GX291XrfKw0NggqD7RoYTO+wM53M7ziCTRueXk=

✨ JWT_SECRET:
HVyzEbvoqcJ855hEHCQUEtiIT861Rie07VKrXa7Ek2I=
```

---

## 📝 Diferentes Ambientes

### **Desenvolvimento (Local)**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/quezi_db"
BETTER_AUTH_URL="http://localhost:3333"
NODE_ENV="development"
```

### **Staging/Beta (Supabase Free)**
```env
DATABASE_URL="postgresql://postgres.xxx:senha@db.xxx.supabase.co:5432/postgres"
BETTER_AUTH_URL="https://api-staging.quezi.app"
NODE_ENV="staging"
```

### **Produção (Supabase Pro)**
```env
DATABASE_URL="postgresql://postgres.xxx:senha@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
BETTER_AUTH_URL="https://api.quezi.app"
NODE_ENV="production"
```

**ATENÇÃO:** Use chaves **DIFERENTES** em cada ambiente!

---

## 🔐 Gerenciamento de Secrets em Produção

### **Vercel (Frontend + API)**
```bash
# Adicionar variáveis via CLI
vercel env add BETTER_AUTH_SECRET
vercel env add JWT_SECRET
vercel env add DATABASE_URL

# Ou via dashboard: Settings → Environment Variables
```

### **Railway (API)**
```bash
# Adicionar variáveis via CLI
railway variables set BETTER_AUTH_SECRET="xxx"
railway variables set JWT_SECRET="xxx"

# Ou via dashboard: Variables tab
```

### **Render (API)**
```bash
# Via dashboard: Environment → Environment Variables
```

---

## ✅ Verificar se está funcionando

```bash
# Iniciar API
cd apps/api
.\start-dev.bat

# Logs devem mostrar:
✅ Configuração de ambiente validada!
✅ Banco de dados conectado!
🚀 Servidor rodando em http://localhost:3333
```

**Se aparecer erro "Configuração de ambiente inválida":**
- Verifique se as chaves têm 32+ caracteres
- Verifique se DATABASE_URL está correta
- Execute `node generate-secrets.js` novamente

---

## 🎯 Recomendação Final

### **Para o Quezi App:**

1. ✅ **Agora:** Use `start-dev.bat` com chaves geradas
2. ✅ **Antes do MVP:** Crie arquivo `.env` (mais seguro)
3. ✅ **Em produção:** Use variáveis de ambiente do host

**Execute agora:**
```bash
node apps/api/generate-secrets.js
```

**Copie as chaves para `start-dev.bat` ou crie um `.env`!** 🚀

