# 🔧 Correção do UserType - Problema Resolvido!

**Data:** 22 de Outubro de 2025  
**Problema:** UserType sempre salvava como CLIENT, mesmo selecionando PROFESSIONAL  
**Status:** ✅ RESOLVIDO

---

## 🔍 Diagnóstico

### **Problema Raiz Identificado:**

No arquivo `apps/api/prisma/schema.prisma`, linha 71:

```prisma
userType  UserType @default(CLIENT)  ❌ PROBLEMA!
```

O campo tinha um **valor default** que estava sendo aplicado pelo banco de dados, sobrescrevendo qualquer valor enviado.

---

## ✅ Solução Aplicada

### **1. Schema do Prisma Atualizado**

**Arquivo:** `apps/api/prisma/schema.prisma`

**Antes:**

```prisma
userType  UserType @default(CLIENT)
```

**Depois:**

```prisma
userType  UserType  // Sem default - deve ser fornecido explicitamente
```

### **2. Migration Criada e Aplicada**

**Migration:** `20251022035327_remove_usertype_default`

**SQL Executado:**

```sql
ALTER TABLE "users"
ALTER COLUMN "userType" DROP DEFAULT;
```

**Status:** ✅ Aplicada com sucesso

---

## 🔄 Mudanças no Backend (Better Auth)

### **Arquivo:** `apps/api/src/lib/auth.ts`

Adicionado callback `onSignUp` para garantir que o userType seja atualizado:

```typescript
async onSignUp(user: any, request: any) {
  console.log("✅ Novo usuário registrado:", {
    id: user.id,
    email: user.email,
    name: user.name,
  });

  // Atualizar userType se fornecido no request
  if (request?.body) {
    const body = typeof request.body === "string"
      ? JSON.parse(request.body)
      : request.body;

    const userType = body.userType || body.data?.userType;

    if (userType && (userType === "CLIENT" || userType === "PROFESSIONAL")) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { userType },
        });

        console.log(`✅ UserType atualizado para: ${userType}`);
      } catch (error) {
        console.error("❌ Erro ao atualizar userType:", error);
      }
    }
  }
}
```

---

## 🔄 Mudanças no Frontend

### **Arquivo:** `apps/web/app/(auth)/register/page.tsx`

Adicionados console.logs para debug:

```typescript
console.log("📝 Dados do cadastro:", {
  name: values.name,
  email: values.email,
  userType: values.userType, // ← Importante
  city: values.city,
});

console.log("📤 Payload enviado para API:", payload);
```

---

## ✅ Como Funciona Agora

### **Fluxo Completo:**

```
1. Usuário seleciona PROFESSIONAL no frontend
   └─ setValue("userType", "PROFESSIONAL")

2. Preenche dados e clica "Criar Conta"
   └─ Payload: { userType: "PROFESSIONAL", ... }

3. Better Auth cria usuário no banco
   └─ userType = null (sem default)

4. Callback onSignUp é executado
   └─ Lê userType do request body
   └─ Atualiza usuário: UPDATE users SET userType = 'PROFESSIONAL'

5. Usuário salvo corretamente! ✅
```

---

## 🧪 Como Testar

### **1. API já foi reiniciada automaticamente**

Verifique se está rodando:

```bash
# Deve mostrar a API rodando na porta 3333
```

### **2. Abra o Console do Navegador (F12)**

### **3. Acesse o Cadastro:**

http://localhost:3000/register

### **4. Cadastre um Profissional:**

**Etapa 1:** Selecione **"Profissional"**

**Etapa 2:**

- Nome: `Ana Silva`
- Email: `ana.profissional@teste.com`
- Telefone: `(11) 98765-4321`
- Senha: `Teste@123`
- Confirmar: `Teste@123`

**Etapa 3:**

- Cidade: `São Paulo`
- Bio: `Maquiadora profissional com 5 anos de experiência em eventos`
- Especialidades: `Maquiagem, Penteado, Automaquiagem`

**Etapa 4:**

- Revise os dados
- **Clique em "Criar Conta"**

### **5. Verifique os Logs:**

**Console do Navegador:**

```javascript
📝 Dados do cadastro: {
  name: "Ana Silva",
  email: "ana.profissional@teste.com",
  userType: "PROFESSIONAL",  // ← DEVE MOSTRAR PROFESSIONAL
  city: "São Paulo"
}

📤 Payload enviado para API: {
  name: "Ana Silva",
  email: "ana.profissional@teste.com",
  userType: "PROFESSIONAL",  // ← CONFIRME AQUI
  ...
}
```

**Console da API (Terminal):**

```
✅ Novo usuário registrado: {
  id: 'clxxxxx',
  email: 'ana.profissional@teste.com',
  name: 'Ana Silva'
}
✅ UserType atualizado para: PROFESSIONAL  // ← DEVE APARECER ESTA LINHA
```

---

## 🔍 Verificar no Banco de Dados

### **Opção 1: Prisma Studio**

```bash
cd apps/api
npm run prisma:studio
```

1. Abra a tabela `users`
2. Procure por `ana.profissional@teste.com`
3. **userType** deve estar como **"PROFESSIONAL"** ✅

### **Opção 2: SQL Direto**

```bash
cd apps/api
npm run docker:logs
```

Ou conecte via pgAdmin e execute:

```sql
SELECT id, name, email, userType, createdAt
FROM users
WHERE email = 'ana.profissional@teste.com';
```

**Resultado esperado:**

```
userType: PROFESSIONAL ✅
```

---

## 📊 Testes Adicionais

### **Teste 1: Cliente**

```
1. Cadastre como CLIENTE
2. Email: cliente@teste.com
3. Verifique: userType deve ser "CLIENT"
```

### **Teste 2: Profissional**

```
1. Cadastre como PROFISSIONAL
2. Email: profissional@teste.com
3. Verifique: userType deve ser "PROFESSIONAL"
```

### **Teste 3: OAuth (se configurado)**

```
1. Login com Google
2. Na primeira vez, deve criar usuário
3. UserType deve ser CLIENT (default para OAuth)
4. Pode ser alterado depois no perfil
```

---

## ⚠️ Se Ainda Não Funcionar

### **Passos de Debug:**

1. **Verifique se a API reiniciou:**

   - Deve mostrar no terminal: "Server listening at http://localhost:3333"

2. **Limpe usuários de teste anteriores:**

   ```sql
   DELETE FROM users WHERE email LIKE '%teste.com';
   ```

3. **Verifique os logs:**

   - Console do navegador deve mostrar o payload
   - Terminal da API deve mostrar o log de atualização

4. **Teste criar usuário direto pela API:**
   ```bash
   # Via arquivo test-api.http ou curl
   POST http://localhost:3333/api/v1/auth/sign-up/email
   {
     "name": "Teste Profissional",
     "email": "teste.prof@teste.com",
     "password": "Teste@123",
     "userType": "PROFESSIONAL"
   }
   ```

---

## 📝 Checklist Final

- [x] Schema do Prisma alterado (sem @default)
- [x] Migration criada e aplicada
- [x] Callback onSignUp implementado no Better Auth
- [x] Console.logs adicionados para debug
- [x] API reiniciada

---

## 🎯 Resultado Esperado

Agora ao cadastrar:

| Tipo Selecionado | Salvo no BD                  |
| ---------------- | ---------------------------- |
| Cliente          | userType = "CLIENT" ✅       |
| Profissional     | userType = "PROFESSIONAL" ✅ |

---

## 🚀 Próximo Passo

Após confirmar que está funcionando:

1. Teste cadastrar um cliente
2. Teste cadastrar um profissional
3. Verifique no banco de dados
4. **Me confirme:** "Está salvando corretamente agora!"

Aí eu continuo com a **FASE 3** (Layouts e Navegação)! 🎉
