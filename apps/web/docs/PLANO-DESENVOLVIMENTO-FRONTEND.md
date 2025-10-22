# 📋 Plano de Desenvolvimento - Frontend Quezi App

**Última Atualização:** 21 de Outubro de 2025  
**Status:** Em Planejamento  
**Objetivo:** Desenvolver o frontend completo da aplicação Quezi App

---

## 📊 Análise do Estado Atual

### ✅ O que já existe:

#### **Estrutura Base:**

- ✅ Next.js 15 (App Router) + React 19 configurado
- ✅ TypeScript configurado
- ✅ Tailwind CSS com paleta de cores Quezi
- ✅ Fontes configuradas (Inter + Playfair Display)
- ✅ ShadCN/UI parcialmente instalado (Button, Card, Form, Input, Label)

#### **Páginas Existentes:**

- ✅ Landing page básica (`/`)
- ✅ Login (`/login`)
- ✅ Register (`/register`)
- ✅ Dashboard básico (`/dashboard`)

#### **Dependências Instaladas:**

- ✅ React Hook Form
- ✅ Zod
- ✅ Axios
- ✅ Lodash
- ✅ Date-fns
- ✅ Recharts
- ✅ Lucide React
- ✅ JS Cookie

#### **Hooks Criados:**

- ✅ `useAuth` - Hook de autenticação

---

## ⚠️ O que precisa ser feito:

### **1. Dependências Faltantes:**

- ❌ GSAP (animações avançadas)
- ❌ TW Animate CSS (animações com Tailwind)
- ❌ Componentes ShadCN adicionais

### **2. Design System:**

- ❌ Componentes UI completos
- ❌ Tokens de design sistematizados
- ❌ Biblioteca de ícones e assets

### **3. Páginas e Funcionalidades:**

- ❌ Sistema de autenticação completo
- ❌ Dashboard Admin
- ❌ Dashboard Cliente
- ❌ Dashboard Profissional
- ❌ Perfis profissionais
- ❌ Sistema de agendamentos
- ❌ Sistema de avaliações
- ❌ E mais...

---

## 🎯 Planejamento Estruturado em Etapas

---

## **FASE 1: Configuração Inicial e Design System** ⚙️

**Objetivo:** Preparar o ambiente e criar a base de componentes reutilizáveis

### **Etapa 1.1 - Instalação de Dependências Faltantes**

- [ ] Instalar GSAP
- [ ] Instalar/configurar TW Animate CSS
- [ ] Instalar componentes adicionais do ShadCN/UI:
  - [ ] Dialog
  - [ ] Dropdown Menu
  - [ ] Select
  - [ ] Tabs
  - [ ] Toast
  - [ ] Avatar
  - [ ] Badge
  - [ ] Calendar
  - [ ] Checkbox
  - [ ] Progress
  - [ ] Radio Group
  - [ ] Separator
  - [ ] Sheet
  - [ ] Slider
  - [ ] Switch
  - [ ] Table
  - [ ] Textarea
  - [ ] Tooltip

### **Etapa 1.2 - Design System e Tokens**

- [ ] Criar arquivo `lib/design-tokens.ts` com:
  - Cores sistematizadas
  - Espaçamentos
  - Tamanhos de fonte
  - Bordas e sombras
  - Breakpoints
- [ ] Documentar componentes base no Storybook (opcional)
- [ ] Criar biblioteca de ícones personalizados (se necessário)

### **Etapa 1.3 - Componentes Base Reutilizáveis**

- [ ] `components/common/Logo.tsx` - Logo da aplicação
- [ ] `components/common/Loader.tsx` - Loading spinner elegante
- [ ] `components/common/EmptyState.tsx` - Estado vazio
- [ ] `components/common/ErrorBoundary.tsx` - Tratamento de erros
- [ ] `components/common/PageHeader.tsx` - Cabeçalho de páginas
- [ ] `components/common/SearchBar.tsx` - Barra de busca
- [ ] `components/common/FilterChips.tsx` - Chips de filtros
- [ ] `components/common/Rating.tsx` - Componente de avaliação (estrelas)
- [ ] `components/common/UserAvatar.tsx` - Avatar com iniciais ou foto

### **Etapa 1.4 - Utilitários e Helpers**

- [ ] `lib/api-client.ts` - Cliente HTTP configurado com interceptors
- [ ] `lib/auth-utils.ts` - Utilitários de autenticação
- [ ] `lib/validators.ts` - Schemas Zod reutilizáveis
- [ ] `lib/formatters.ts` - Formatadores (dinheiro, data, telefone)
- [ ] `lib/animations.ts` - Configurações GSAP reutilizáveis
- [ ] `hooks/useDebounce.ts` - Hook de debounce
- [ ] `hooks/useLocalStorage.ts` - Hook de localStorage
- [ ] `hooks/usePagination.ts` - Hook de paginação
- [ ] `hooks/useInfiniteScroll.ts` - Hook de scroll infinito

---

## **FASE 2: Autenticação e Páginas Públicas** 🔐

**Objetivo:** Implementar o sistema de autenticação completo

### **Etapa 2.1 - Tela de Login Admin**

- [ ] `app/(auth)/admin/login/page.tsx` - Login exclusivo para admins
  - Formulário com email e senha
  - Validação com Zod
  - Integração com API `/api/v1/admin/auth/login`
  - Animações suaves
  - Tratamento de erros
  - Link "Esqueci minha senha"

### **Etapa 2.2 - Tela de Login (Clientes e Profissionais)**

- [ ] Refatorar `app/(auth)/login/page.tsx`
  - Formulário elegante com ícones
  - OAuth buttons (Google, Facebook, Apple, Instagram)
  - Integração com Better Auth
  - Link para cadastro
  - "Esqueci minha senha"
  - Animações de entrada

### **Etapa 2.3 - Tela de Cadastro (Multi-step)**

- [ ] Refatorar `app/(auth)/register/page.tsx`
  - **Step 1:** Seleção de perfil (Cliente ou Profissional)
  - **Step 2:** Dados básicos (nome, email, senha, telefone)
  - **Step 3:** Informações adicionais
    - Cliente: Endereço, cidade, preferências
    - Profissional: Bio, cidade, especialidades
  - **Step 4:** Documentos (apenas profissional)
  - **Step 5:** Confirmação
  - Barra de progresso visual
  - Validação por etapa
  - Salvamento de progresso no localStorage

### **Etapa 2.4 - Recuperação de Senha**

- [ ] `app/(auth)/forgot-password/page.tsx` - Solicitar recuperação
- [ ] `app/(auth)/reset-password/[token]/page.tsx` - Redefinir senha
- [ ] Validação visual dos campos
- [ ] Integração com API

### **Etapa 2.5 - Verificação de Email**

- [ ] `app/(auth)/verify-email/page.tsx` - Página de verificação
- [ ] `app/(auth)/email-verified/page.tsx` - Confirmação

---

## **FASE 3: Layout e Navegação** 🧭

**Objetivo:** Criar os layouts base para cada role

### **Etapa 3.1 - Layout Protegido (Authenticated)**

- [ ] `app/(protected)/layout.tsx` - Layout base autenticado
  - Verificação de autenticação
  - Redirecionamento se não autenticado
  - Provider de contexto de usuário

### **Etapa 3.2 - Layout Admin**

- [ ] `app/(protected)/admin/layout.tsx`
- [ ] `components/layout/AdminSidebar.tsx` - Sidebar para admin
- [ ] `components/layout/AdminHeader.tsx` - Header para admin
- [ ] Menu de navegação com itens:
  - Dashboard Geral
  - Usuários
  - Serviços cadastrados
  - Financeiro
  - Transações & Pagamentos
  - Configurações
  - Suporte/Ajuda
  - Sair

### **Etapa 3.3 - Layout Cliente**

- [ ] `app/(protected)/client/layout.tsx`
- [ ] `components/layout/ClientSidebar.tsx` - Sidebar para cliente
- [ ] `components/layout/ClientHeader.tsx` - Header para cliente
- [ ] Barra de busca proeminente
- [ ] Badge de notificações
- [ ] Menu de navegação

### **Etapa 3.4 - Layout Profissional**

- [ ] `app/(protected)/professional/layout.tsx`
- [ ] `components/layout/ProfessionalSidebar.tsx`
- [ ] `components/layout/ProfessionalHeader.tsx`
- [ ] Toggle de status (online/offline)
- [ ] Menu de navegação específico

---

## **FASE 4: Dashboard Admin** 👨‍💼

**Objetivo:** Implementar o painel administrativo completo

### **Etapa 4.1 - Dashboard Principal**

- [ ] `app/(protected)/admin/dashboard/page.tsx`
- [ ] KPIs em cards:
  - [ ] Total de usuários (clientes + profissionais)
  - [ ] Volume de transações/mês
  - [ ] Faturamento da plataforma
  - [ ] Serviços ativos/inativos
  - [ ] Novos cadastros
- [ ] Gráficos (Recharts):
  - [ ] Evolução de uso
  - [ ] Categorias mais populares
- [ ] Seção de moderação:
  - [ ] Denúncias pendentes
  - [ ] Aprovação de profissionais
  - [ ] Logs de auditoria
- [ ] Tabela de atividades recentes

### **Etapa 4.2 - Gestão de Usuários**

- [ ] `app/(protected)/admin/users/page.tsx` - Listagem
- [ ] Filtros (role, status, data de cadastro)
- [ ] Paginação
- [ ] Busca por nome/email
- [ ] Ações: ver detalhes, suspender, ativar, deletar
- [ ] `app/(protected)/admin/users/[id]/page.tsx` - Detalhes

### **Etapa 4.3 - Gestão de Serviços**

- [ ] `app/(protected)/admin/services/page.tsx` - Listagem de serviços
- [ ] Filtros por categoria, profissional, status
- [ ] Aprovar/Rejeitar serviços

### **Etapa 4.4 - Gestão de Admins**

- [ ] `app/(protected)/admin/admins/page.tsx` - Listagem de admins
- [ ] Criar novo admin (modal)
- [ ] Editar roles e permissões

### **Etapa 4.5 - Financeiro e Analytics**

- [ ] `app/(protected)/admin/financeiro/page.tsx`
- [ ] Dashboards com métricas financeiras
- [ ] Gráficos de faturamento
- [ ] Transações recentes

### **Etapa 4.6 - Log de Auditoria**

- [ ] `app/(protected)/admin/logs/page.tsx`
- [ ] Tabela de ações administrativas
- [ ] Filtros por admin, ação, data

---

## **FASE 5: Dashboard Cliente** 👤

**Objetivo:** Implementar a experiência do cliente

### **Etapa 5.1 - Dashboard Principal**

- [ ] `app/(protected)/client/dashboard/page.tsx`
- [ ] Carrossel de banners promocionais
- [ ] Cards de categorias principais
- [ ] Seção "Profissionais em destaque"
- [ ] Seção "Próximo de você"
- [ ] Seção "Ofertas especiais"

### **Etapa 5.2 - Busca e Filtros**

- [ ] `app/(protected)/client/search/page.tsx`
- [ ] Barra de busca com autocomplete
- [ ] Filtros avançados (modal):
  - Categoria
  - Faixa de preço (slider)
  - Distância/localização
  - Avaliação mínima
  - Disponibilidade
  - Ordenação
- [ ] Grid de resultados com cards de profissionais

### **Etapa 5.3 - Perfil do Profissional (Visualização Cliente)**

- [ ] `app/(protected)/client/professionals/[id]/page.tsx`
- [ ] Foto de capa + foto de perfil
- [ ] Badges (verificado, online/offline)
- [ ] Botões: Favoritar, Compartilhar
- [ ] Tabs:
  - [ ] Sobre (bio, formações, experiência)
  - [ ] Serviços (lista de serviços)
  - [ ] Portfólio (grid de fotos)
  - [ ] Avaliações (cards de reviews)
  - [ ] Disponibilidade (calendário)
- [ ] Botão CTA: "Agendar Serviço"

### **Etapa 5.4 - Novo Agendamento (Multi-step)**

- [ ] `app/(protected)/client/appointments/new/page.tsx`
- [ ] **Step 1:** Selecionar serviços
- [ ] **Step 2:** Escolher data e horário (calendário)
- [ ] **Step 3:** Confirmar detalhes
- [ ] **Step 4:** Pagamento
- [ ] Barra de progresso

### **Etapa 5.5 - Histórico de Agendamentos**

- [ ] `app/(protected)/client/appointments/page.tsx`
- [ ] Tabs: Próximos | Histórico
- [ ] Cards de agendamentos
- [ ] Ações: Ver detalhes, Remarcar, Cancelar, Avaliar
- [ ] `app/(protected)/client/appointments/[id]/page.tsx` - Detalhes

### **Etapa 5.6 - Serviços Favoritos**

- [ ] `app/(protected)/client/favorites/page.tsx`
- [ ] Grid de profissionais favoritados
- [ ] Filtros por categoria

### **Etapa 5.7 - Perfil do Cliente**

- [ ] `app/(protected)/client/profile/page.tsx`
- [ ] Editar informações pessoais
- [ ] Upload de foto
- [ ] Gerenciar endereços
- [ ] Métodos de pagamento
- [ ] Preferências de notificação

### **Etapa 5.8 - Avaliações Feitas**

- [ ] `app/(protected)/client/reviews/page.tsx`
- [ ] Lista de avaliações feitas
- [ ] Opção de editar/remover

---

## **FASE 6: Dashboard Profissional** 💼

**Objetivo:** Implementar a experiência do profissional

### **Etapa 6.1 - Dashboard Principal**

- [ ] `app/(protected)/professional/dashboard/page.tsx`
- [ ] KPIs em cards:
  - Agendamentos hoje
  - Agendamentos da semana
  - Faturamento do mês
  - Avaliação média
  - Taxa de ocupação
- [ ] Timeline de próximos agendamentos
- [ ] Solicitações pendentes
- [ ] Gráficos de desempenho

### **Etapa 6.2 - Perfil Profissional (Gestão)**

- [ ] `app/(protected)/professional/profile/page.tsx`
- [ ] Editar informações do perfil
- [ ] Gerenciar portfólio (upload de fotos)
- [ ] Configurar horários de trabalho
- [ ] Política de cancelamento
- [ ] Área de atendimento

### **Etapa 6.3 - Agendamentos**

- [ ] `app/(protected)/professional/appointments/page.tsx`
- [ ] Visualização em calendário (dia/semana/mês)
- [ ] Blocos visuais por status
- [ ] Opção de bloquear horários
- [ ] Adicionar compromisso manual
- [ ] `app/(protected)/professional/appointments/[id]/page.tsx` - Detalhes

### **Etapa 6.4 - Solicitações**

- [ ] `app/(protected)/professional/requests/page.tsx`
- [ ] Cards de solicitações de agendamento
- [ ] Botões: Aceitar (verde) | Recusar (vermelho)
- [ ] Propor novo horário

### **Etapa 6.5 - Serviços Oferecidos**

- [ ] `app/(protected)/professional/services/page.tsx`
- [ ] Lista/cards de serviços
- [ ] Botão "Adicionar Novo Serviço"
- [ ] Modal de criação/edição
- [ ] Toggle ativo/inativo

### **Etapa 6.6 - Clientes Atendidos**

- [ ] `app/(protected)/professional/clients/page.tsx`
- [ ] Lista de clientes atendidos
- [ ] Histórico de agendamentos por cliente
- [ ] Notas privadas sobre preferências

### **Etapa 6.7 - Financeiro**

- [ ] `app/(protected)/professional/financeiro/page.tsx`
- [ ] Resumo de faturamento (hoje/semana/mês/ano)
- [ ] Gráficos de performance
- [ ] Lista de transações
- [ ] Métodos de recebimento
- [ ] Solicitação de saque

### **Etapa 6.8 - Avaliações Recebidas**

- [ ] `app/(protected)/professional/reviews/page.tsx`
- [ ] Cards de reviews
- [ ] Estatísticas de avaliação
- [ ] Filtros

---

## **FASE 7: Páginas Comuns e Funcionalidades Compartilhadas** 🔄

**Objetivo:** Implementar páginas acessíveis por todos os roles

### **Etapa 7.1 - Notificações**

- [ ] `app/(protected)/notifications/page.tsx`
- [ ] Listagem de notificações
- [ ] Badge de não lidas
- [ ] Marcar como lida
- [ ] Filtrar por tipo
- [ ] Remover notificação

### **Etapa 7.2 - Ajuda e Suporte**

- [ ] `app/(protected)/support/page.tsx`
- [ ] FAQ (acordeão)
- [ ] Formulário de contato
- [ ] Chat de suporte (se aplicável)
- [ ] Envio de ticket
- [ ] Histórico de tickets

### **Etapa 7.3 - Configurações**

- [ ] `app/(protected)/settings/page.tsx`
- [ ] Tabs:
  - [ ] Conta (editar info pessoal, senha)
  - [ ] Notificações (preferências)
  - [ ] Privacidade
  - [ ] Segurança (2FA, métodos de login)
  - [ ] Aparência (tema claro/escuro - opcional)

### **Etapa 7.4 - Termos e Políticas**

- [ ] `app/terms/page.tsx` - Termos de uso
- [ ] `app/privacy/page.tsx` - Política de privacidade
- [ ] Visualização elegante com índice

### **Etapa 7.5 - Páginas de Erro**

- [ ] `app/not-found.tsx` - 404
- [ ] `app/error.tsx` - 500
- [ ] Mensagens amigáveis
- [ ] Links de navegação

---

## **FASE 8: Funcionalidades Avançadas** 🚀

**Objetivo:** Implementar recursos adicionais

### **Etapa 8.1 - Sistema de Avaliações**

- [ ] Modal de avaliação após serviço concluído
- [ ] Formulário com rating (estrelas) + comentário
- [ ] Integração com API `/api/v1/reviews`

### **Etapa 8.2 - Sistema de Favoritos**

- [ ] Adicionar/remover favoritos
- [ ] Integração com backend (criar endpoint se necessário)

### **Etapa 8.3 - Compartilhamento Social**

- [ ] Botões de compartilhar perfil profissional
- [ ] Integração com redes sociais

### **Etapa 8.4 - Upload de Imagens**

- [ ] Componente de upload (Cloudinary ou AWS S3)
- [ ] Preview de imagens
- [ ] Crop de imagens (avatar)

### **Etapa 8.5 - Notificações em Tempo Real**

- [ ] Integração com WebSocket (se API suportar)
- [ ] Toast de notificações
- [ ] Badge atualizado em tempo real

### **Etapa 8.6 - Geolocalização**

- [ ] Integração com Google Maps API
- [ ] Busca por profissionais próximos
- [ ] Visualização de distância

---

## **FASE 9: Otimização, Testes e Documentação** 🧪

**Objetivo:** Garantir qualidade e performance

### **Etapa 9.1 - Testes Unitários**

- [ ] Testes de componentes UI
- [ ] Testes de hooks
- [ ] Testes de utilitários
- [ ] Meta: 80%+ de cobertura

### **Etapa 9.2 - Testes de Integração**

- [ ] Testes de fluxos completos
- [ ] Autenticação
- [ ] Criação de agendamento
- [ ] Sistema de avaliações

### **Etapa 9.3 - Testes E2E (Cypress ou Playwright)**

- [ ] Fluxo completo de cadastro
- [ ] Fluxo de agendamento
- [ ] Fluxo de avaliação

### **Etapa 9.4 - Performance**

- [ ] Implementar lazy loading
- [ ] Code splitting
- [ ] Otimização de imagens (Next.js Image)
- [ ] Análise de bundle size
- [ ] Lighthouse audit (score 90+)

### **Etapa 9.5 - Acessibilidade (A11y)**

- [ ] Navegação por teclado
- [ ] ARIA labels
- [ ] Contraste de cores (WCAG AA)
- [ ] Screen reader friendly

### **Etapa 9.6 - Responsividade**

- [ ] Testar em todos os breakpoints:
  - Mobile (320px - 640px)
  - Tablet (640px - 1024px)
  - Desktop (1024px+)
- [ ] Testar em diferentes navegadores

### **Etapa 9.7 - SEO**

- [ ] Metadata completo em todas as páginas
- [ ] Open Graph tags
- [ ] Sitemap
- [ ] robots.txt

### **Etapa 9.8 - Documentação**

- [ ] Documentar componentes reutilizáveis
- [ ] Guia de estilo (style guide)
- [ ] README atualizado
- [ ] Guia de contribuição

---

## **FASE 10: Deploy e Monitoramento** 🌐

**Objetivo:** Colocar a aplicação em produção

### **Etapa 10.1 - Configuração de Deploy**

- [ ] Configurar Vercel/Netlify
- [ ] Variáveis de ambiente
- [ ] CI/CD pipeline

### **Etapa 10.2 - Monitoramento**

- [ ] Integração com Sentry (error tracking)
- [ ] Analytics (Google Analytics, Plausible)
- [ ] Monitoramento de performance (Web Vitals)

### **Etapa 10.3 - Backup e Segurança**

- [ ] HTTPS configurado
- [ ] CSP (Content Security Policy)
- [ ] Rate limiting no frontend

---

## 📊 Estimativa de Tempo

| Fase      | Descrição                    | Tempo Estimado    |
| --------- | ---------------------------- | ----------------- |
| Fase 1    | Configuração e Design System | 1-2 semanas       |
| Fase 2    | Autenticação                 | 1 semana          |
| Fase 3    | Layout e Navegação           | 1 semana          |
| Fase 4    | Dashboard Admin              | 2-3 semanas       |
| Fase 5    | Dashboard Cliente            | 3-4 semanas       |
| Fase 6    | Dashboard Profissional       | 3-4 semanas       |
| Fase 7    | Páginas Comuns               | 1-2 semanas       |
| Fase 8    | Funcionalidades Avançadas    | 2-3 semanas       |
| Fase 9    | Testes e Otimização          | 2-3 semanas       |
| Fase 10   | Deploy                       | 1 semana          |
| **TOTAL** |                              | **18-28 semanas** |

---

## 🎯 Priorização

### **Alta Prioridade (MVP):**

- ✅ Fase 1, 2, 3 (base)
- ✅ Fase 5 (Dashboard Cliente - funcional)
- ✅ Fase 6 (Dashboard Profissional - funcional)
- ✅ Sistema de agendamentos completo

### **Média Prioridade:**

- ⚠️ Fase 4 (Dashboard Admin)
- ⚠️ Fase 7 (Páginas comuns)
- ⚠️ Sistema de avaliações

### **Baixa Prioridade (Nice to Have):**

- 🔵 Fase 8 (Funcionalidades avançadas)
- 🔵 Geolocalização
- 🔵 Notificações em tempo real
- 🔵 Chat

---

## 📈 Métricas de Sucesso

- [ ] 100% das telas do design implementadas
- [ ] 80%+ cobertura de testes
- [ ] Score Lighthouse 90+
- [ ] Tempo de carregamento < 3s
- [ ] Zero erros críticos no Sentry
- [ ] Responsivo em todos os dispositivos
- [ ] Acessibilidade WCAG AA

---

## 🚀 Próximos Passos Imediatos

1. ✅ **Revisar e aprovar este plano**
2. 🔄 **Instalar dependências faltantes (Fase 1.1)**
3. 🔄 **Criar design tokens e componentes base (Fase 1.2 e 1.3)**
4. 🔄 **Implementar autenticação completa (Fase 2)**

---

**Desenvolvido por:** Matheus Queiroz  
**Data de Criação:** 21 de Outubro de 2025
