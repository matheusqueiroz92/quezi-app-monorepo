# 🌸 Quezi App - Frontend

> Plataforma elegante e sofisticada para agendamento de serviços de beleza e estética

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)

---

## 📋 Sobre o Projeto

O **Quezi App** é uma plataforma web que conecta clientes a profissionais de beleza e estética de forma prática e elegante. Funciona como um marketplace de serviços, onde clientes podem buscar, agendar e avaliar serviços, enquanto profissionais gerenciam seus negócios.

### 🎨 Identidade Visual

- **Paleta de Cores:**

  - Primária: Marsala (#69042A) - Elegância e sofisticação
  - Hover primário: (#8B4660)
  - Secundária: Dourado (#D4AF37) - Luxo e refinamento
  - Hover secundário: (#E8C68A)
  - Neutras: Cinza pérola, grafite suave
  - Acentos: Rosa blush, bege champagne

- **Tipografia:**

  - Display: Playfair Display (elegante)
  - Corpo: Inter (clean e legível)

- **Estilo:**
  - Design minimalista e clean
  - Bordas suaves e arredondadas (12-20px)
  - Sombras sutis para profundidade'
  - Micro-interações elegantes
  - Animações suaves

---

## 🚀 Tecnologias

- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 19
- **Linguagem:** TypeScript 5.9
- **Estilização:** Tailwind CSS 3.4
- **Componentes:** ShadCN/UI
- **Validação:** Zod
- **Formulários:** React Hook Form
- **HTTP Client:** Axios
- **Animações:** GSAP
- **Datas:** date-fns
- **Gráficos:** Recharts
- **Ícones:** Lucide React
- **Utilitários:** Lodash, JS Cookie

---

## 📁 Estrutura do Projeto

```
apps/web/
├── app/                          # Páginas (App Router)
│   ├── (auth)/                   # Grupo de autenticação
│   │   ├── login/                # Login para clientes e profissionais
│   │   ├── register/             # Cadastro multi-step
│   │   ├── admin/                # Login administrativo
│   │   │   └── login/
│   │   ├── forgot-password/      # Recuperação de senha
│   │   ├── verify-email/         # Verificação de email
│   │   ├── email-verified/       # Confirmação de verificação
│   │   └── layout.tsx
│   │
│   ├── dashboard/                # Dashboards protegidos
│   │   ├── admin/                # Dashboard administrativo
│   │   │   ├── users/            # Gerenciamento de usuários
│   │   │   ├── services/         # Gerenciamento de serviços
│   │   │   ├── financial/        # Financeiro da plataforma
│   │   │   ├── layout.tsx        # Layout admin
│   │   │   └── page.tsx          # Dashboard principal
│   │   │
│   │   ├── client/               # Dashboard cliente
│   │   │   ├── layout.tsx        # Layout cliente
│   │   │   └── page.tsx          # Dashboard cliente
│   │   │
│   │   ├── professional/         # Dashboard profissional
│   │   │   ├── layout.tsx        # Layout profissional
│   │   │   └── page.tsx          # Dashboard profissional
│   │   │
│   │   └── page.tsx              # Dashboard geral
│   │
│   ├── globals.css               # Estilos globais
│   ├── layout.tsx                # Layout raiz
│   └── page.tsx                  # Landing page
│
├── components/                   # Componentes React
│   ├── common/                   # Componentes reutilizáveis
│   │   ├── Logo.tsx
│   │   ├── Loader.tsx
│   │   ├── EmptyState.tsx
│   │   ├── PageHeader.tsx
│   │   ├── UserAvatar.tsx
│   │   ├── Rating.tsx
│   │   ├── SearchBar.tsx
│   │   └── ErrorBoundary.tsx
│   │
│   ├── ui/                       # Componentes ShadCN (18 componentes)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── toast.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── select.tsx
│   │   ├── checkbox.tsx
│   │   ├── switch.tsx
│   │   ├── progress.tsx
│   │   ├── separator.tsx
│   │   ├── radio-group.tsx
│   │   ├── textarea.tsx
│   │   ├── label.tsx
│   │   └── ... (mais 3 componentes)
│   │
│   ├── layout/                   # Componentes de layout
│   │   ├── AdminSidebar.tsx      # Sidebar administrativa
│   │   ├── Sidebar.tsx           # Sidebar dinâmica
│   │   └── Header.tsx            # Cabeçalho
│   │
│   ├── dashboard/                # Componentes de dashboard
│   │   ├── MetricCard.tsx        # Card de métricas
│   │   ├── ChartCard.tsx         # Card de gráficos
│   │   └── StatsGrid.tsx         # Grid de estatísticas
│   │
│   ├── auth/                     # Componentes de autenticação
│   └── organizations/            # Componentes de organizações
│
├── hooks/                        # Hooks customizados
│   ├── use-auth.tsx              # Hook de autenticação
│   ├── useDebounce.ts            # Hook de debounce
│   ├── useLocalStorage.ts        # Hook de localStorage
│   ├── usePagination.ts          # Hook de paginação
│   └── useInfiniteScroll.ts      # Hook de scroll infinito
│
├── lib/                          # Utilitários e configurações
│   ├── api-client.ts             # Cliente HTTP (Axios)
│   ├── validators.ts             # Schemas Zod (20+ schemas)
│   ├── formatters.ts             # Funções de formatação (30+ funções)
│   ├── auth-utils.ts             # Utilitários de autenticação
│   ├── animations.ts             # Animações GSAP (30+ animações)
│   ├── design-tokens.ts          # Tokens de design
│   ├── api.ts
│   └── utils.ts
│
├── types/                        # Types TypeScript
│   ├── index.ts
│   └── css.d.ts
│
├── public/                       # Assets estáticos
│
├── __tests__/                    # Testes (462 testes passando)
│   ├── components/               # Testes de componentes
│   ├── hooks/                    # Testes de hooks
│   ├── lib/                      # Testes de utilitários
│   └── app/                      # Testes de páginas
│
├── docs/                         # Documentação
│   ├── PLANO-DESENVOLVIMENTO-FRONTEND.md
│   ├── PROGRESSO-DESENVOLVIMENTO.md
│   └── TDD-WORKFLOW.md
│
├── components.json               # Config ShadCN
├── tailwind.config.js            # Config Tailwind (paleta Quezi)
├── tsconfig.json                 # Config TypeScript
├── next.config.ts                # Config Next.js
├── package.json
│
└── README.md                     # Este arquivo
```

---

## 🎯 Funcionalidades Implementadas

### ✅ FASE 1 - Configuração Inicial e Design System (COMPLETA)

#### **Design System**

- ✅ Sistema de design tokens completo
- ✅ Paleta de cores Quezi configurada no Tailwind CSS
- ✅ Tipografia padronizada (Playfair Display + Inter)
- ✅ Espaçamentos, bordas, sombras
- ✅ Breakpoints responsivos
- ✅ Transições e animações
- ✅ Gradientes premium

#### **Componentes Base (8)**

- ✅ Logo - Elegante e responsivo
- ✅ Loader - Spinner, dots, pulse, skeleton
- ✅ EmptyState - Para listas vazias
- ✅ PageHeader - Cabeçalho padronizado
- ✅ UserAvatar - Com foto ou iniciais
- ✅ Rating - Estrelas douradas interativas
- ✅ SearchBar - Busca elegante
- ✅ ErrorBoundary - Tratamento de erros

#### **Utilitários (5 arquivos)**

- ✅ API Client - HTTP client configurado com interceptors
- ✅ Validators - 20+ schemas Zod reutilizáveis
- ✅ Formatters - 30+ funções de formatação (dinheiro, data, telefone, etc)
- ✅ Auth Utils - Gerenciamento completo de autenticação
- ✅ Animations - 30+ animações GSAP pré-configuradas

#### **Hooks Customizados (4)**

- ✅ useDebounce - Debounce de valores
- ✅ useLocalStorage - Estado sincronizado com localStorage
- ✅ usePagination - Paginação completa
- ✅ useInfiniteScroll - Scroll infinito

#### **Componentes ShadCN (18)**

- Dialog, Dropdown Menu, Select, Tabs
- Toast, Avatar, Badge, Calendar
- Checkbox, Progress, Radio Group
- Separator, Sheet, Slider, Switch
- Table, Textarea, Tooltip

### ✅ FASE 2 - Autenticação e Páginas Públicas (COMPLETA)

#### **Sistema de Autenticação**

- ✅ Login Admin - Formulário exclusivo para administradores
- ✅ Login User - Formulário para clientes e profissionais
- ✅ Cadastro Multi-step - Processo em 5 etapas
- ✅ Recuperação de Senha - Fluxo completo
- ✅ Verificação de Email - Páginas de confirmação
- ✅ Validação com Zod - Schemas robustos
- ✅ Integração com API - Better Auth configurado

#### **Páginas de Autenticação**

- ✅ `/login` - Login para clientes e profissionais
- ✅ `/admin/login` - Login exclusivo para admins
- ✅ `/register` - Cadastro multi-step
- ✅ `/forgot-password` - Recuperação de senha
- ✅ `/verify-email` - Verificação de email
- ✅ `/email-verified` - Confirmação de verificação

### ✅ FASE 3 - Layout e Navegação (COMPLETA)

#### **Layouts Protegidos**

- ✅ Layout Admin - Sidebar e header administrativos
- ✅ Layout Cliente - Sidebar e header para clientes
- ✅ Layout Profissional - Sidebar e header para profissionais
- ✅ Navegação Dinâmica - Menu baseado no tipo de usuário
- ✅ Responsividade - Layouts adaptáveis

#### **Componentes de Layout**

- ✅ AdminSidebar - Menu administrativo completo
- ✅ Sidebar - Menu dinâmico para cliente/profissional
- ✅ Header - Cabeçalho com notificações e configurações
- ✅ Navegação - Sistema de roteamento protegido

### ✅ FASE 4 - Dashboard Admin (COMPLETA)

#### **Dashboard Principal**

- ✅ KPIs em Cards - Métricas principais da plataforma
- ✅ Gráficos - Evolução de usuários e receita
- ✅ Atividades Recentes - Timeline de ações
- ✅ Denúncias Pendentes - Moderação
- ✅ Aprovações Pendentes - Workflow de aprovação

#### **Páginas Administrativas**

- ✅ Gerenciamento de Usuários - Listagem, filtros, ações
- ✅ Gerenciamento de Serviços - CRUD completo
- ✅ Financeiro - Métricas e transações
- ✅ Componentes Reutilizáveis - MetricCard, ChartCard, StatsGrid

### 🧪 **Testes e Qualidade (COMPLETA)**

- ✅ **462 testes passando** (100% de sucesso)
- ✅ Cobertura completa de componentes
- ✅ Testes de páginas administrativas
- ✅ Testes de hooks e utilitários
- ✅ Metodologia TDD aplicada
- ✅ Testes de autenticação
- ✅ Testes de layouts e navegação

---

## 🛠️ Como Usar

### **Pré-requisitos**

- Node.js 18+
- NPM ou Yarn

### **Instalação**

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar produção
npm start
```

### **Variáveis de Ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333/api/v1
```

---

## 📚 Exemplos de Uso

### **Componentes**

```tsx
import { Logo } from '@/components/common/Logo';
import { Loader } from '@/components/common/Loader';
import { Rating } from '@/components/common/Rating';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ChartCard } from '@/components/dashboard/ChartCard';

// Logo
<Logo size="lg" withText href="/" />

// Loader
<Loader size="md" text="Carregando..." variant="spinner" />

// Rating
<Rating value={4.5} showValue showCount reviewCount={120} />

// Metric Card (Dashboard Admin)
<MetricCard
  title="Total de Usuários"
  value="2,847"
  icon="Users"
  trend={{ value: 12, direction: "up" }}
  description="Usuários cadastrados na plataforma"
  color="marsala"
/>

// Chart Card (Dashboard Admin)
<ChartCard
  title="Evolução de Usuários"
  data={chartData}
  dataKey="value"
  color="#69042A"
  totalValue="2,847"
  trend={{ value: 12, direction: "up", description: "vs mês anterior" }}
/>
```

### **Hooks**

```tsx
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";

// Debounce para busca
const [search, setSearch] = useState("");
const debouncedSearch = useDebounce(search, 500);

// Paginação
const pagination = usePagination(1, 20);
```

### **Utilitários**

```tsx
import { get, post } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { isAuthenticated, getUserType } from "@/lib/auth-utils";

// Requisições HTTP
const users = await get("/users");
const newUser = await post("/users", { name: "John" });

// Formatação
formatCurrency(1500); // R$ 1.500,00
formatDate(new Date()); // 21/10/2025

// Autenticação
if (isAuthenticated()) {
  const userType = getUserType(); // CLIENT | PROFESSIONAL | ADMIN
}
```

### **Validação com Zod**

```tsx
import { loginSchema, registerSchema } from "@/lib/validators";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm({
  resolver: zodResolver(loginSchema),
  defaultValues: {
    email: "",
    password: "",
  },
});
```

---

## 🎨 Design Tokens

```tsx
import { colors, typography, spacing } from '@/lib/design-tokens';

// Cores
<div className="bg-marsala text-white" />
<div style={{ backgroundColor: colors.marsala.DEFAULT }} />

// Tipografia
<h1 className="font-display text-4xl" />

// Espaçamentos
<div className="p-4 m-8" />
```

---

## 📈 Progresso do Projeto

- **Fase 1:** ✅ Configuração e Design System (COMPLETA)
- **Fase 2:** ✅ Autenticação e Páginas Públicas (COMPLETA)
- **Fase 3:** ✅ Layouts Base (COMPLETA)
- **Fase 4:** ✅ Dashboard Admin (COMPLETA)
- **Fase 5:** 🔄 Dashboard Cliente (EM DESENVOLVIMENTO)
- **Fase 6:** ⏳ Dashboard Profissional
- **Fase 7:** ⏳ Páginas Comuns
- **Fase 8:** ⏳ Funcionalidades Avançadas
- **Fase 9:** ⏳ Testes e Otimização
- **Fase 10:** ⏳ Deploy

**Progresso Geral:** 40% (4 de 10 fases concluídas)

### 📊 **Estatísticas do Projeto**

- ✅ **462 testes passando** (100% de sucesso)
- ✅ **4 fases concluídas** de 10 planejadas
- ✅ **18 componentes ShadCN** implementados e testados
- ✅ **8 componentes comuns** reutilizáveis
- ✅ **4 hooks customizados** funcionais
- ✅ **5 utilitários** completos
- ✅ **6 páginas de autenticação** implementadas
- ✅ **3 layouts protegidos** (Admin, Cliente, Profissional)
- ✅ **4 páginas administrativas** funcionais
- ✅ **Sistema de design** completo e consistente

---

## 📖 Documentação Adicional

- [Plano de Desenvolvimento Completo](./docs/PLANO-DESENVOLVIMENTO-FRONTEND.md)
- [Progresso Detalhado](./docs/PROGRESSO-DESENVOLVIMENTO.md)
- [Workflow TDD](./docs/TDD-WORKFLOW.md)
- [Design System](./lib/design-tokens.ts)

---

## 🤝 Contribuindo

Este é um projeto em desenvolvimento ativo. Contribuições são bem-vindas!

### **Padrões de Código**

- Use TypeScript com tipagem forte
- Siga o padrão de nomenclatura (camelCase, PascalCase)
- Comente funções complexas com JSDoc
- Use componentes ShadCN quando possível
- Mantenha a consistência visual (design tokens)
- Escreva testes para novas funcionalidades

---

## 📝 Licença

ISC

---

## 👥 Autores

**Matheus Queiroz**

- [Website](https://matheusqueiroz.dev.br)

---

## 🔗 Links Úteis

- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação React](https://react.dev/)
- [Documentação Tailwind CSS](https://tailwindcss.com/docs)
- [ShadCN/UI](https://ui.shadcn.com/)
- [Zod](https://zod.dev/)
- [GSAP](https://greensock.com/gsap/)

---

**Desenvolvido com 💜 para profissionais de beleza e estética**
