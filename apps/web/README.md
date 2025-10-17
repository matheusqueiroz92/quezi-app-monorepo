# 🎨 Quezi Web - Frontend

Frontend da aplicação Quezi desenvolvido com Next.js 15, React 19, TypeScript e Tailwind CSS.

## 🛠️ Tecnologias

- **Next.js 15** - Framework React com App Router
- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **ShadCN/UI** - Componentes
- **React Hook Form** - Formulários
- **Zod** - Validação
- **Axios** - HTTP Client
- **Better Auth** - Autenticação
- **Vitest** - Testes

## 🎨 Identidade Visual

### Paleta de Cores

- **Marsala** (#8B4660) - Primária (elegância e sofisticação)
- **Dourado** (#D4AF37) - Secundária (luxo e refinamento)
- **Neutras** - Branco pristino, cinza pérola, grafite suave
- **Acentos** - Rosa blush, bege champagne

### Tipografia

- **Títulos**: Playfair Display (serif elegante)
- **Corpo**: Inter (sans-serif clean)

## 🚀 Como Executar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie `.env.local.example` para `.env.local`:

```bash
cp .env.local.example .env.local
```

### 3. Iniciar Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## 📁 Estrutura

```
apps/web/
├── app/                    # App Router Next.js
│   ├── (auth)/            # Grupo de rotas de autenticação
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/       # Grupo de rotas autenticadas
│   │   ├── organizations/
│   │   └── profile/
│   └── layout.tsx
├── components/             # Componentes React
│   ├── ui/                # ShadCN components
│   ├── auth/              # Componentes de auth
│   ├── organizations/     # Componentes de orgs
│   └── layout/            # Layout components
├── lib/                   # Utilitários
│   ├── api.ts            # Cliente Axios
│   ├── auth.ts           # Auth helpers
│   └── utils.ts          # Funções auxiliares
├── hooks/                 # Custom Hooks
│   ├── use-auth.ts
│   └── use-organizations.ts
├── types/                 # TypeScript types
└── __tests__/            # Testes com Vitest
```

## 🧪 Testes

```bash
# Executar testes
npm test

# Modo watch
npm run test:ui
```

## 📝 Scripts

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Inicia servidor de produção |
| `npm run lint` | Executa ESLint |
| `npm test` | Executa testes |

## 🔗 Integração com API

O frontend se conecta com a API Quezi em `http://localhost:3333/api/v1`

Certifique-se que a API está rodando:

```bash
cd ../api
npm run dev
```

## 🎯 Funcionalidades

### ✅ Implementadas

- 🔜 Autenticação (Login/Registro)
- 🔜 Dashboard Home
- 🔜 Gerenciamento de Organizations
- 🔜 Perfil de Usuário

### 🔜 Próximas

- Busca de Profissionais
- Sistema de Agendamentos
- Avaliações
- Chat/Mensagens

## 📖 Guias

Ver `NEXT-STEPS.md` na raiz do projeto para instruções completas de setup.

---

**Frontend Quezi - Elegância e Sofisticação** 🎨✨

