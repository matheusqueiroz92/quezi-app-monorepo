# 🔧 Solução para Erro "Invalid URL" no Login

## 🚨 Problema Identificado

O erro **"Invalid URL"** está ocorrendo porque o **Better Auth** não consegue construir a URL base corretamente. Isso acontece quando as variáveis de ambiente não estão sendo carregadas adequadamente.

## ✅ Soluções Aplicadas

### 1. **Configuração do Better Auth Corrigida**

```typescript
// apps/api/src/lib/auth.ts
baseURL: env.BETTER_AUTH_URL || "http://localhost:3333",
```

### 2. **Arquivo .env Criado**

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/quezi_db"
JWT_SECRET="your-super-secret-jwt-key-with-at-least-32-characters"
BETTER_AUTH_URL="http://localhost:3333"
# ... outras variáveis
```

### 3. **Script de Inicialização**

Criado `apps/api/start-dev.bat` para definir variáveis de ambiente.

## 🚀 Como Corrigir e Testar

### **Opção 1: Usar o Script (Recomendado)**

```bash
cd apps/api
.\start-dev.bat
```

### **Opção 2: Definir Variáveis Manualmente**

```bash
cd apps/api
set DATABASE_URL=postgresql://postgres:password@localhost:5432/quezi_db
set JWT_SECRET=your-super-secret-jwt-key-with-at-least-32-characters
set BETTER_AUTH_URL=http://localhost:3333
npm run dev
```

### **Opção 3: PowerShell**

```powershell
cd apps/api
$env:DATABASE_URL="postgresql://postgres:password@localhost:5432/quezi_db"
$env:JWT_SECRET="your-super-secret-jwt-key-with-at-least-32-characters"
$env:BETTER_AUTH_URL="http://localhost:3333"
npm run dev
```

## 🔍 Verificação

### **1. Verificar se a API está rodando:**

```bash
curl http://localhost:3333/health
# Deve retornar: {"status":"ok","timestamp":"..."}
```

### **2. Verificar logs da API:**

- ✅ **Sucesso**: `🚀 Servidor Quezi API iniciado com sucesso!`
- ❌ **Erro**: `❌ Erro ao validar variáveis de ambiente`

### **3. Testar login:**

- **URL**: http://localhost:3000/login
- **Email**: `teste@teste.com`
- **Senha**: `12345678`

## 🐛 Se Ainda Houver Problemas

### **Problema: Variáveis de ambiente não carregam**

**Solução**: Use o script `start-dev.bat` ou defina manualmente.

### **Problema: Banco de dados não conecta**

**Solução**: Verifique se o PostgreSQL está rodando na porta 5432.

### **Problema: Better Auth ainda dá erro**

**Solução**: Verifique se `BETTER_AUTH_URL` está definido corretamente.

## 📊 Status Esperado

| Componente       | Status         | URL                   |
| ---------------- | -------------- | --------------------- |
| **API**          | ✅ Rodando     | http://localhost:3333 |
| **Frontend**     | ✅ Rodando     | http://localhost:3000 |
| **Login**        | ✅ Funcionando | /login                |
| **Health Check** | ✅ OK          | /health               |

## 🎯 Próximo Passo

1. **Execute o script**: `cd apps/api && .\start-dev.bat`
2. **Aguarde**: Mensagem "🚀 Servidor Quezi API iniciado com sucesso!"
3. **Teste**: http://localhost:3000/login com `teste@teste.com` / `12345678`

---

**💡 Dica**: Se o problema persistir, verifique se o PostgreSQL está rodando e se as variáveis de ambiente estão definidas corretamente.
