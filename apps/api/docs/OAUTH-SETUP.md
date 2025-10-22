# 🔗 Guia de Configuração OAuth Social

## 📋 Visão Geral

Este guia mostra como configurar login social com **Google** e **GitHub** na API Quezi usando [Better Auth](https://www.better-auth.com/docs/introduction).

---

## 🔵 Google OAuth 2.0

### Passo 1: Acessar Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Faça login com sua conta Google

### Passo 2: Criar Projeto (se não tiver)

1. Clique no seletor de projeto (topo)
2. Clique em **"New Project"**
3. Nome: **Quezi App**
4. Clique em **"Create"**

### Passo 3: Configurar OAuth Consent Screen

1. Vá em **APIs & Services > OAuth consent screen**
2. Escolha **External** (para testes)
3. Clique em **Create**
4. Preencha:
   - **App name**: Quezi App
   - **User support email**: seu-email@gmail.com
   - **Developer contact**: seu-email@gmail.com
5. Clique em **Save and Continue**
6. Em **Scopes**, clique em **Add or Remove Scopes**
7. Adicione:
   - `userinfo.email`
   - `userinfo.profile`
8. Clique em **Save and Continue**
9. Em **Test users**, adicione seu email para testes
10. Clique em **Save and Continue**

### Passo 4: Criar Credenciais OAuth

1. Vá em **APIs & Services > Credentials**
2. Clique em **Create Credentials > OAuth 2.0 Client ID**
3. Configure:
   - **Application type**: Web application
   - **Name**: Quezi Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3333`
     - `http://localhost:3000` (frontend futuro)
   - **Authorized redirect URIs**:
     - `http://localhost:3333/api/v1/auth/callback/google`
4. Clique em **Create**
5. **Copie** o Client ID e Client Secret

### Passo 5: Adicionar ao .env

```env
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456
```

### Passo 6: Testar

```bash
# Reiniciar API
npm run dev

# Acessar no navegador:
http://localhost:3333/api/v1/auth/signin/google
```

**✅ Sucesso!** Você será redirecionado para login do Google.

---

## ⚫ GitHub OAuth

### Passo 1: Acessar Developer Settings

1. Acesse: https://github.com/settings/developers
2. Clique em **OAuth Apps**
3. Clique em **New OAuth App**

### Passo 2: Configurar OAuth App

1. Preencha:
   - **Application name**: Quezi App
   - **Homepage URL**: `http://localhost:3333`
   - **Application description**: Plataforma de agendamento de serviços
   - **Authorization callback URL**: `http://localhost:3333/api/v1/auth/callback/github`
2. Clique em **Register application**

### Passo 3: Obter Credenciais

1. Na página da app criada, você verá o **Client ID**
2. Clique em **Generate a new client secret**
3. **Copie imediatamente** o client secret (só aparece uma vez!)

### Passo 4: Adicionar ao .env

```env
GITHUB_CLIENT_ID=Iv1.abc123def456
GITHUB_CLIENT_SECRET=ghp_abc123def456xyz789
```

### Passo 5: Testar

```bash
# Reiniciar API
npm run dev

# Acessar no navegador:
http://localhost:3333/api/v1/auth/signin/github
```

**✅ Sucesso!** Você será redirecionado para login do GitHub.

---

## 🧪 Testando OAuth

### Teste Passo a Passo

1. **Iniciar API:**
   ```bash
   npm run dev
   ```

2. **Abrir navegador:**
   ```
   http://localhost:3333/api/v1/auth/signin/google
   # ou
   http://localhost:3333/api/v1/auth/signin/github
   ```

3. **Fazer login** na conta social

4. **Callback automático** para:
   ```
   http://localhost:3333/api/v1/auth/callback/google
   ```

5. **Resposta** com token e dados do usuário

6. **Usar token** nas próximas requisições

---

## 🔒 Segurança

### URLs de Produção

Quando for para produção, atualize as URLs:

**Google:**
- Authorized redirect URI: `https://api.quezi.com/api/v1/auth/callback/google`

**GitHub:**
- Authorization callback URL: `https://api.quezi.com/api/v1/auth/callback/github`

**No .env de produção:**
```env
BETTER_AUTH_URL=https://api.quezi.com
NODE_ENV=production
```

---

## 🎯 Escopos OAuth

### Google Scopes (Automático)

Better Auth solicita automaticamente:
- `openid` - ID do usuário
- `email` - Email do usuário
- `profile` - Nome e foto

### GitHub Scopes (Automático)

Better Auth solicita:
- `user:email` - Email do usuário
- `read:user` - Dados básicos do perfil

---

## 📝 Checklist de Configuração

### Google OAuth
- [ ] Criar projeto no Google Cloud
- [ ] Configurar OAuth consent screen
- [ ] Adicionar test users
- [ ] Criar OAuth 2.0 Client ID
- [ ] Adicionar redirect URIs
- [ ] Copiar Client ID e Secret
- [ ] Adicionar ao .env
- [ ] Reiniciar API
- [ ] Testar login

### GitHub OAuth
- [ ] Criar OAuth App no GitHub
- [ ] Configurar callback URL
- [ ] Gerar Client Secret
- [ ] Copiar Client ID e Secret
- [ ] Adicionar ao .env
- [ ] Reiniciar API
- [ ] Testar login

---

## 🐛 Problemas Comuns

### "redirect_uri_mismatch" (Google)

**Causa:** URL de callback não está autorizada

**Solução:**
1. Verifique se adicionou `http://localhost:3333/api/v1/auth/callback/google` nas Authorized redirect URIs
2. URLs devem ser exatas (sem barra no final)

### "The redirect_uri MUST match..." (GitHub)

**Causa:** URL de callback incorreta

**Solução:**
Verifique se usou: `http://localhost:3333/api/v1/auth/callback/github`

### OAuth retorna erro 500

**Causa:** Client ID ou Secret incorretos

**Solução:**
1. Verifique se copiou corretamente para o `.env`
2. Verifique se não tem espaços extras
3. Reinicie a API após alterar `.env`

---

## 📚 Recursos

- **Better Auth OAuth Docs:** https://www.better-auth.com/docs/authentication/social
- **Google Cloud Console:** https://console.cloud.google.com/
- **GitHub OAuth Apps:** https://github.com/settings/developers

---

**✨ Com OAuth configurado, seus usuários podem fazer login com um clique!**

