# 👀 Guia de Visualização - FASE 2 (Autenticação)

**Como visualizar e testar todas as telas criadas**

---

## 🚀 Como Iniciar

### **1. Iniciar o servidor de desenvolvimento:**

```bash
cd apps/web
npm run dev
```

O frontend estará disponível em: **http://localhost:3000**

---

## 📱 Telas para Conferir

### **🏠 Página Inicial**

- **URL:** http://localhost:3000
- **O que ver:**
  - Landing page com gradiente de fundo
  - Logo Quezi
  - Botões "Entrar" e "Cadastrar"
  - Cards de features

---

### **👥 Autenticação de Clientes e Profissionais**

#### **1. Login**

- **URL:** http://localhost:3000/login
- **O que conferir:**
  - ✨ Logo Quezi no topo
  - 🎨 Card branco com sombra elegante
  - 🔵 4 botões de OAuth (Google, Facebook, Apple, Instagram)
    - Cada um com logo oficial e cores de marca
  - ➗ Linha divisória com texto "Ou entre com email"
  - 📧 Campo de email com ícone
  - 🔒 Campo de senha com ícone e toggle de mostrar/ocultar
  - 🔗 Link "Esqueceu?" ao lado da senha
  - 🔴 Botão principal "Entrar" (marsala)
  - 📝 Link para cadastro embaixo
  - 🔑 Link discreto para login admin no rodapé

**Teste:**

- Hover nos botões (observe as transições suaves)
- Clique no toggle de senha (olhinho)
- Animação de entrada da página (fade-in + slide-in)

---

#### **2. Cadastro (Multi-step)**

- **URL:** http://localhost:3000/register
- **O que conferir:**

**Etapa 1 - Seleção de Perfil:**

- 🎯 Título "Como você quer usar o Quezi?"
- 📊 Barra de progresso (25%)
- 🛍️ Card "Cliente" com ícone ShoppingBag
- 💼 Card "Profissional" com ícone Briefcase
- ✨ Hover nos cards (borda marsala + fundo rosa blush)
- 🎬 Animação de escala ao selecionar

**Etapa 2 - Dados Básicos:**

- 📊 Barra de progresso (50%)
- 👤 Nome completo (ícone User)
- 📧 Email (ícone Mail)
- 📞 Telefone - opcional (ícone Phone)
- 🔒 Senha (ícone Lock + toggle)
- ✅ Validações visuais da senha:
  - Bolinhas verdes quando OK
  - Bolinhas cinzas quando falta
  - Lista com 4 critérios
- 🔒 Confirmar senha
- ⬅️ Botão "Voltar"
- ➡️ Botão "Próximo" (só ativa se tudo válido)

**Etapa 3 - Informações Adicionais:**

- 📊 Barra de progresso (75%)
- 📍 Cidade (todos os usuários)
- **Se Profissional:**
  - 📝 Bio (textarea, máx 500 chars)
  - ⭐ Especialidades (separadas por vírgula)

**Etapa 4 - Confirmação:**

- 📊 Barra de progresso (100%)
- ✅ Ícone de CheckCircle verde
- 📋 Card de resumo com todos os dados
- 📜 Links para Termos de Uso e Privacidade
- 🎉 Botão "Criar Conta"

**Teste:**

- Preencha até step 2 e feche a aba
- Abra novamente - deve recuperar o progresso do localStorage
- Navegue entre as etapas (Voltar/Próximo)
- Observe a barra de progresso animada

---

#### **3. Recuperação de Senha**

- **URL:** http://localhost:3000/forgot-password
- **O que conferir:**
  - ⬅️ Link "Voltar para login" com seta
  - 📧 Campo de email
  - 📤 Botão "Enviar Link de Recuperação"
  - 💡 Card de dica sobre spam
  - **Após enviar:**
    - ✅ Tela de confirmação
    - 📧 Ícone de Mail verde
    - ⏱️ Informação "válido por 1 hora"

---

#### **4. Redefinir Senha**

- **URL:** http://localhost:3000/reset-password/abc123 _(token fake para teste visual)_
- **O que conferir:**
  - 🔒 Campo "Nova Senha" com toggle
  - ✅ **Validações visuais em destaque:**
    - Card cinza com 4 critérios
    - Bolinhas que ficam verdes
    - Barra de força (Média/Forte)
    - Cores dinâmicas
  - 🔒 Campo "Confirmar Nova Senha"
  - 🚫 Botão desabilitado se senha fraca
  - ✅ Botão habilitado se senha forte
  - **Após redefinir:**
    - 🎉 CheckCircle com animação bounce
    - 📊 Barra de loading animada
    - 🔄 Auto-redirect em 2s

**Teste:**

- Digite uma senha fraca (sem maiúscula) - veja os indicadores
- Digite uma senha forte - veja tudo ficar verde
- Barra de força muda de amarelo para verde

---

#### **5. Verificar Email**

- **URL:** http://localhost:3000/verify-email?token=abc123
- **O que conferir:**
  - **Estado Loading:**
    - 🔄 Spinner marsala girando
    - "Verificando seu email..."
  - **Estado Sucesso:**
    - ✅ CheckCircle verde com bounce
    - 📊 Barra de progresso
    - 🔄 Auto-redirect em 3s
  - **Estado Erro:**
    - ❌ XCircle vermelho
    - Mensagem de erro
    - Botões de ação

---

#### **6. Email Verificado**

- **URL:** http://localhost:3000/email-verified
- **O que conferir:**
  - 🎉 CheckCircle grande com bounce
  - 💜 Título "Email Verificado!"
  - ✨ Card de boas-vindas com gradiente
  - ⏱️ Contador "Redirecionando em 5 segundos..."
  - 📊 Barra de progresso animada
  - 🔄 Auto-redirect para login

---

### **👨‍💼 Autenticação de Administradores**

#### **7. Login Admin**

- **URL:** http://localhost:3000/admin/login
- **O que conferir:**
  - 🎨 Título "Painel Administrativo"
  - 📝 Subtítulo "Acesso exclusivo para administradores"
  - 📧 Campo de email
  - 🔒 Campo de senha
  - 🔗 Link "Esqueci minha senha"
  - 🚨 **Card de aviso de segurança:**
    - 🔒 "Acesso restrito. Atividades monitoradas."
  - 🔗 Link "Fazer login como usuário"

**Diferenças do login regular:**

- Sem OAuth (mais profissional)
- Aviso de monitoramento
- Visual mais sério

---

#### **8. Recuperação Admin**

- **URL:** http://localhost:3000/admin/forgot-password
- **Similiar ao usuário, mas:**
  - Volta para /admin/login
  - Texto adaptado para admin

---

#### **9. Reset Senha Admin**

- **URL:** http://localhost:3000/admin/reset-password/abc123
- **Similiar ao usuário:**
  - Mesmas validações visuais
  - Mesmo design premium
  - Volta para /admin/login

---

## 🎨 Elementos de Design para Conferir

### **Cores:**

- ✅ Marsala (#8B4660) - Botões principais, títulos
- ✅ Dourado - Logos do OAuth (Google em destaque)
- ✅ Rosa Blush (#F4E4E6) - Backgrounds de destaque
- ✅ Bege Champagne (#F9F4EF) - Gradiente de fundo
- ✅ Cinza Pérola (#F5F5F5) - Cards de informação

### **Tipografia:**

- ✅ Playfair Display - Títulos (fonte serifada elegante)
- ✅ Inter - Corpo do texto (clean e legível)
- ✅ Hierarquia clara (h1, h2, body, small)

### **Espaçamentos:**

- ✅ Respiração entre elementos
- ✅ Padding generoso nos cards (p-8)
- ✅ Gaps consistentes (gap-4, gap-6)

### **Bordas:**

- ✅ rounded-quezi-lg (20px) - Cards principais
- ✅ rounded-quezi (12px) - Botões e campos

### **Sombras:**

- ✅ shadow-xl - Cards principais
- ✅ shadow-md - Botões
- ✅ shadow-lg no hover

### **Animações:**

- ✅ animate-in fade-in-50 - Entrada das páginas
- ✅ slide-in-from-bottom-4 - Deslize de baixo
- ✅ zoom-in-95 - Zoom in (sucesso)
- ✅ animate-bounce - Ícones de sucesso
- ✅ animate-spin - Loaders
- ✅ Transições suaves (200ms) em hovers

---

## 📝 Checklist de Conferência

### **Design Geral:**

- [ ] Paleta de cores Quezi aplicada corretamente?
- [ ] Fontes Playfair Display e Inter carregando?
- [ ] Bordas arredondadas (12-20px)?
- [ ] Sombras suaves e elegantes?
- [ ] Gradiente de fundo em todas as telas?
- [ ] Logo Quezi aparecendo corretamente?

### **Formulários:**

- [ ] Ícones nos campos (Mail, Lock, User, Phone)?
- [ ] Toggle de senha funcionando?
- [ ] Validações em tempo real aparecendo?
- [ ] Mensagens de erro claras?
- [ ] Botões com estados hover/disabled?

### **OAuth:**

- [ ] 4 botões aparecendo?
- [ ] Logos renderizando corretamente?
- [ ] Cores oficiais aplicadas?
- [ ] Hover funcionando?

### **Multi-step (Cadastro):**

- [ ] Barra de progresso animada?
- [ ] Navegação Voltar/Próximo funcionando?
- [ ] Cards de seleção de perfil responsivos?
- [ ] Validações por etapa funcionando?
- [ ] Resumo final exibindo dados corretos?

### **Animações:**

- [ ] Entrada suave (fade-in + slide)?
- [ ] Bounce no CheckCircle de sucesso?
- [ ] Spinner girando?
- [ ] Barras de loading animadas?
- [ ] Transições entre etapas suaves?

### **Responsividade:**

- [ ] Mobile (< 640px) - Layout vertical OK?
- [ ] Tablet (640-1024px) - Transição OK?
- [ ] Desktop (> 1024px) - Layout otimizado?
- [ ] Cards adaptando ao tamanho da tela?

### **Estados:**

- [ ] Loading states funcionando?
- [ ] Success states com celebração?
- [ ] Error states com mensagens claras?
- [ ] Disabled states visíveis?

---

## 🎬 Fluxo Recomendado de Teste

### **Ordem sugerida para conferência:**

1. **Landing Page** (/)

   - Primeira impressão geral
   - Gradiente de fundo
   - Logo e tipografia

2. **Login** (/login)

   - Design principal de autenticação
   - OAuth buttons
   - Formulário com ícones

3. **Cadastro** (/register)

   - **MAIS IMPORTANTE** - Sistema multi-step completo
   - Teste todas as 4 etapas
   - Observe barra de progresso
   - Selecione Cliente e depois Profissional
   - Veja campos condicionais

4. **Forgot Password** (/forgot-password)

   - Design simples e limpo
   - Estado de confirmação

5. **Reset Password** (/reset-password/teste)

   - **IMPORTANTE** - Validações visuais premium
   - Digite senha fraca e forte
   - Observe bolinhas e barra mudando

6. **Verify Email** (/verify-email?token=teste)

   - Estados: loading → erro (porque token é fake)
   - Observe spinner e mensagens

7. **Email Verified** (/email-verified)

   - Estado celebrativo
   - Contador de redirecionamento
   - Animação bounce

8. **Admin Login** (/admin/login)
   - Design profissional
   - Aviso de monitoramento
   - Sem OAuth

---

## 💡 Pontos de Atenção para Conferir

### **Design Visual:**

1. **Cores estão harmoniosas?**

   - Marsala não está muito escuro/claro?
   - Dourado está destacando bem?
   - Rosa blush está suave?

2. **Espaçamentos estão bons?**

   - Elementos não estão "apertados"?
   - Respiração suficiente entre seções?
   - Padding dos cards confortável?

3. **Tipografia está elegante?**

   - Títulos com Playfair Display?
   - Corpo com Inter?
   - Tamanhos proporcionais?

4. **Ícones estão sutis?**
   - Não muito grandes/pequenos?
   - Alinhados corretamente?
   - Cores adequadas?

### **UX/Interações:**

1. **Animações estão suaves?**

   - Não muito rápidas/lentas?
   - Efeito agradável?

2. **Feedback visual está claro?**

   - Validações ficam verde quando OK?
   - Erros em vermelho?
   - Loading states visíveis?

3. **Navegação intuitiva?**
   - Botões Voltar/Próximo claros?
   - Links de "Esqueceu senha" fáceis de achar?

### **Mobile (Teste no DevTools):**

1. **Abra DevTools (F12)**
2. **Toggle Device Toolbar (Ctrl+Shift+M)**
3. **Teste nos tamanhos:**
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1024px+)

**O que conferir:**

- Cards não quebram?
- Textos não cortam?
- Botões com tamanho adequado?
- OAuth buttons em mobile ficam empilhados ou lado a lado?

---

## 📸 Screenshots Recomendados

Se quiser documentar, tire prints de:

- [x] Login (desktop)
- [x] Login (mobile)
- [x] Cadastro - Step 1
- [x] Cadastro - Step 2 com validações de senha
- [x] Cadastro - Step 4 (confirmação)
- [x] Reset Password com validações visuais
- [x] Email Verified (celebração)

---

## ✏️ Feedback - O que ajustar?

Após conferir, me diga se precisa ajustar:

### **Cores:**

- [ ] Marsala muito escuro/claro?
- [ ] Dourado muito chamativo/discreto?
- [ ] Rosa blush agradável?
- [ ] Gradiente de fundo OK?

### **Tamanhos:**

- [ ] Cards muito largos/estreitos?
- [ ] Botões com altura boa (h-12)?
- [ ] Ícones com tamanho adequado?
- [ ] Fontes legíveis?

### **Espaçamentos:**

- [ ] Muito apertado?
- [ ] Muito espaçado?
- [ ] Padding dos cards OK?

### **Animações:**

- [ ] Muito rápidas/lentas?
- [ ] Bounce muito exagerado?
- [ ] Fade-in suave?

### **Funcionalidades:**

- [ ] Falta algum elemento?
- [ ] Alguma coisa confusa?
- [ ] Melhorias de UX?

---

## 🎯 Mudanças Rápidas Possíveis

Se quiser ajustar algo, posso rapidamente modificar:

### **Cores:**

```typescript
// Alterar em: tailwind.config.js
marsala: {
  DEFAULT: '#8B4660', // Pode ajustar
  dark: '#69042A',    // Pode ajustar
}
```

### **Bordas:**

```typescript
// Alterar em: tailwind.config.js
quezi: '12px',    // Pode aumentar/diminuir
queziLg: '20px',  // Pode aumentar/diminuir
```

### **Animações:**

```typescript
// Ajustar duração: duration-300 → duration-500
// Ajustar easing: ease-out → ease-in-out
```

### **Tamanhos:**

```typescript
// Botões: h-12 → h-14 (mais alto)
// Cards: max-w-md → max-w-lg (mais largo)
// Ícones: w-5 h-5 → w-6 h-6 (maiores)
```

---

## 💬 Como Me Passar Feedback

Pode me dizer de forma livre, exemplos:

✅ **Bom:**

- "O login ficou lindo, mas os botões de OAuth estão muito grandes"
- "Adoro o cadastro multi-step, mas queria a barra de progresso mais fina"
- "As cores estão perfeitas!"
- "A senha forte poderia ter uma animação ao completar todos os critérios"

❌ **Evitar:**

- "Não gostei" (sem especificar o que)
- "Muda tudo" (seja específico)

---

## 🚀 Checklist Final

Antes de aprovar e continuar para FASE 3:

- [ ] Abri e testei todas as 9 telas
- [ ] Testei em mobile (DevTools)
- [ ] Animações estão agradáveis
- [ ] Cores harmonizando bem
- [ ] Tipografia elegante
- [ ] UX intuitiva
- [ ] Pronto para aprovar e continuar

---

## 📞 Próximos Passos

Após sua conferência:

1. **Se estiver tudo OK:**

   - Me avise: "Aprovado, pode continuar com FASE 3"
   - Continuarei com layouts e navegação

2. **Se precisar ajustes:**
   - Seja específico sobre o que mudar
   - Farei os ajustes imediatamente
   - Depois continuamos

---

**Aproveite a visualização! As telas estão prontas para impressionar! ✨**
