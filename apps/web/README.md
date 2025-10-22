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

  - Primária: Marsala (#8B4660, #69042A) - Elegância e sofisticação
  - Secundária: Dourado (#D4AF37, #E8C68A) - Luxo e refinamento
  - Neutras: Cinza pérola, grafite suave
  - Acentos: Rosa blush, bege champagne

- **Tipografia:**

  - Display: Playfair Display (elegante)
  - Corpo: Inter (clean e legível)

- **Estilo:**
  - Design minimalista e clean
  - Bordas suaves e arredondadas (12-20px)
  - Sombras sutis para profundidade
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
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (protected)/              # Rotas protegidas (futuro)
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
│   ├── ui/                       # Componentes ShadCN
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   │
│   ├── auth/                     # Componentes de autenticação
│   ├── layout/                   # Componentes de layout
│   └── organizations/            # Componentes de organizações
│
├── hooks/                        # Hooks customizados
│   ├── use-auth.tsx
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── usePagination.ts
│   └── useInfiniteScroll.ts
│
├── lib/                          # Utilitários e configurações
│   ├── api-client.ts             # Cliente HTTP (Axios)
│   ├── validators.ts             # Schemas Zod
│   ├── formatters.ts             # Funções de formatação
│   ├── auth-utils.ts             # Utilitários de autenticação
│   ├── animations.ts             # Animações GSAP
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
├── __tests__/                    # Testes
│
├── components.json               # Config ShadCN
├── tailwind.config.js            # Config Tailwind
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
- ✅ Paleta de cores Quezi
- ✅ Tipografia padronizada
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

// Logo
<Logo size="lg" withText href="/" />

// Loader
<Loader size="md" text="Carregando..." variant="spinner" />

// Rating
<Rating value={4.5} showValue showCount reviewCount={120} />
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
- **Fase 3:** 🔄 Layouts Base (PRÓXIMA)
- **Fase 4:** ⏳ Dashboard Admin
- **Fase 5:** ⏳ Dashboard Cliente
- **Fase 6:** ⏳ Dashboard Profissional
- **Fase 7:** ⏳ Páginas Comuns
- **Fase 8:** ⏳ Funcionalidades Avançadas
- **Fase 9:** ⏳ Testes e Otimização
- **Fase 10:** ⏳ Deploy

**Progresso Geral:** 20% (2 de 10 fases concluídas)

---

## 📖 Documentação Adicional

- [Plano de Desenvolvimento Completo](./PLANO-DESENVOLVIMENTO-FRONTEND.md)
- [Progresso Detalhado](./PROGRESSO-DESENVOLVIMENTO.md)
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
