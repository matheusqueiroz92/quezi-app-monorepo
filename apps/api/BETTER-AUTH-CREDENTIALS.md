# 🔑 Gerando Credenciais do Better Auth

## ⚠️ IMPORTANTE: Você mesmo cria as chaves!

O Better Auth **NÃO fornece** credenciais. Você deve **gerar suas próprias chaves secretas**.

---

## 🎯 Credenciais Necessárias

### **1. BETTER_AUTH_SECRET**
- **O que é:** Chave secreta para criptografia de sessões
- **Requisito:** Mínimo 32 caracteres
- **Onde obter:** Você gera!

### **2. JWT_SECRET**
- **O que é:** Chave secreta para assinar tokens JWT
- **Requisito:** Mínimo 32 caracteres
- **Onde obter:** Você gera!

### **3. BETTER_AUTH_URL**
- **O que é:** URL base da sua API
- **Desenvolvimento:** `http://localhost:3333`
- **Produção:** `https://api.quezi.app` (seu domínio)

---

## 🔧 Como Gerar as Chaves

### **Método 1: Node.js (Recomendado)** ✅

```bash
# No terminal, execute:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Exemplo de output:**
```
K9$mP2#xR7@nQ4!vL8zT3&wY1*hN6^sA5%jD0+bF4=
```

Execute **duas vezes** (uma para BETTER_AUTH_SECRET, outra para JWT_SECRET).

---

### **Método 2: OpenSSL**

```bash
openssl rand -base64 32
```

---

### **Método 3: PowerShell (Windows)**

```powershell
# Executar no PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

### **Método 4: Online (Use apenas para desenvolvimento)**

⚠️ **ATENÇÃO:** Apenas para desenvolvimento! Em produção, gere localmente.

1. Acesse: https://generate-secret.vercel.app/32
2. OU: https://www.random.org/strings/

---

## 📝 Exemplo Completo

### **Gerar as chaves:**

```bash
# Gerar BETTER_AUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Output: xK9mP2nR7qT4vL8zW1hY6jD5bF0cG3sA

# Gerar JWT_SECRET (executar novamente)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Output: aB2eH5kN8pS1tW4yZ7cF0gJ3mQ6rU9vX
```

### **Adicionar ao .env:**

```env
# apps/api/.env
BETTER_AUTH_SECRET="xK9mP2nR7qT4vL8zW1hY6jD5bF0cG3sA"
JWT_SECRET="aB2eH5kN8pS1tW4yZ7cF0gJ3mQ6rU9vX"
BETTER_AUTH_URL="http://localhost:3333"
```

### **OU adicionar ao start-dev.bat:**

```batch
@echo off
echo Starting Quezi API...

set BETTER_AUTH_SECRET="xK9mP2nR7qT4vL8zW1hY6jD5bF0cG3sA"
set JWT_SECRET="aB2eH5kN8pS1tW4yZ7cF0gJ3mQ6rU9vX"
set BETTER_AUTH_URL="http://localhost:3333"

REM ... resto do arquivo
```

---

## 🔐 OAuth Credentials (Opcional)

### **Google OAuth**

1. Acesse: https://console.cloud.google.com/
2. Criar novo projeto (ou usar existente)
3. APIs & Services → Credentials
4. Create Credentials → OAuth 2.0 Client ID
5. Configure:
   - Application type: Web application
   - Authorized redirect URIs: 
     - `http://localhost:3333/api/v1/auth/callback/google` (dev)
     - `https://api.quezi.app/api/v1/auth/callback/google` (prod)
6. Copiar Client ID e Client Secret

```env
GOOGLE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abc123def456"
```

---

### **GitHub OAuth**

1. Acesse: https://github.com/settings/developers
2. OAuth Apps → New OAuth App
3. Configure:
   - Application name: Quezi App
   - Homepage URL: `http://localhost:3333` (dev) ou `https://quezi.app` (prod)
   - Authorization callback URL:
     - `http://localhost:3333/api/v1/auth/callback/github` (dev)
     - `https://api.quezi.app/api/v1/auth/callback/github` (prod)
4. Copiar Client ID e gerar Client Secret

```env
GITHUB_CLIENT_ID="Iv1.abc123def456"
GITHUB_CLIENT_SECRET="abc123def456ghi789jkl012mno345pqr678"
```

---

## 📋 Arquivo .env Completo

Crie o arquivo `apps/api/.env` com:

```env
# ========================================
# BANCO DE DADOS
# ========================================
DATABASE_URL="postgresql://postgres:password@localhost:5432/quezi_db"

# ========================================
# BETTER AUTH (Gere suas próprias chaves!)
# ========================================
BETTER_AUTH_SECRET="GERE_UMA_CHAVE_AQUI_32_CARACTERES_MINIMO"
JWT_SECRET="GERE_OUTRA_CHAVE_AQUI_32_CARACTERES_MINIMO"
BETTER_AUTH_URL="http://localhost:3333"

# ========================================
# OAUTH (Opcional - deixe vazio por enquanto)
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

---

## 🚀 Script para Gerar Todas as Chaves

Criei um script helper para você:

```javascript
// apps/api/generate-secrets.js
const crypto = require('crypto');

console.log('🔐 Gerando credenciais do Better Auth...\n');

console.log('BETTER_AUTH_SECRET:');
console.log(crypto.randomBytes(32).toString('base64'));
console.log('');

console.log('JWT_SECRET:');
console.log(crypto.randomBytes(32).toString('base64'));
console.log('');

console.log('✅ Copie estas chaves para seu arquivo .env!');
console.log('⚠️  NUNCA commite essas chaves no Git!');
```

**Usar:**
```bash
cd apps/api
node generate-secrets.js
```

---

## ✅ Checklist de Configuração

### **Desenvolvimento:**
- [ ] Gerar BETTER_AUTH_SECRET (node crypto)
- [ ] Gerar JWT_SECRET (node crypto)
- [ ] Definir BETTER_AUTH_URL="http://localhost:3333"
- [ ] Definir DATABASE_URL (PostgreSQL local ou Supabase)
- [ ] Criar arquivo .env OU configurar start-dev.bat
- [ ] Testar: iniciar API e verificar logs

### **Produção:**
- [ ] Gerar novas chaves (DIFERENTES do dev!)
- [ ] Configurar BETTER_AUTH_URL com domínio real
- [ ] Adicionar OAuth credentials (Google/GitHub)
- [ ] Configurar variáveis no host (Vercel/Railway)
- [ ] NUNCA commitar .env no Git

---

## 🔒 Segurança

### **REGRAS IMPORTANTES:**

1. ✅ **Gere chaves diferentes** para dev e prod
2. ✅ **Use .gitignore** para .env
3. ❌ **NUNCA commite** chaves no código
4. ✅ **Rotacione chaves** periodicamente (a cada 6 meses)
5. ✅ **Use env vars** do host em produção

### **Verificar se .env está no .gitignore:**

```bash
# Ver .gitignore
cat .gitignore | grep .env
```

Deve aparecer:
```
.env
.env.local
.env*.local
```

---

## 🎯 TL;DR (Resumo Rápido)

### **Para começar AGORA:**

```bash
# 1. Gerar chaves
cd apps/api
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Copiar output 1 → BETTER_AUTH_SECRET

node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Copiar output 2 → JWT_SECRET

# 2. Criar .env
echo DATABASE_URL="postgresql://postgres:password@localhost:5432/quezi_db" > .env
echo BETTER_AUTH_SECRET="[CHAVE_1_AQUI]" >> .env
echo JWT_SECRET="[CHAVE_2_AQUI]" >> .env
echo BETTER_AUTH_URL="http://localhost:3333" >> .env

# 3. Iniciar API
.\start-dev.bat
```

---

## ❓ FAQ

### **1. Onde consigo as credenciais do Better Auth?**
Você **gera**! Não há cadastro/dashboard do Better Auth.

### **2. As chaves expiram?**
Não! Mas recomenda-se rotacionar periodicamente.

### **3. Posso usar qualquer string?**
Tecnicamente sim, mas **deve ser aleatória e segura** (32+ caracteres).

### **4. Dev e Prod devem ter chaves diferentes?**
**SIM!** Sempre use chaves diferentes em cada ambiente.

### **5. E se eu perder as chaves?**
- Desenvolvimento: Gere novas
- Produção: Todos os usuários precisarão fazer login novamente

### **6. Preciso de chaves OAuth agora?**
Não! OAuth (Google/GitHub) é **opcional**. Deixe vazio por enquanto.

---

## ✨ Resumo

> **Better Auth não tem "painel de controle" ou "console".**  
> **Você gera suas próprias chaves secretas usando Node.js/OpenSSL.**  
> **São apenas strings aleatórias de 32+ caracteres.**

**Nada de complicado!** 🎯

