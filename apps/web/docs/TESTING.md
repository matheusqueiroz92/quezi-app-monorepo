# Testes do Frontend - Quezi

## Introdução

Este documento descreve a estratégia e práticas de testes implementadas no frontend da aplicação **Quezi**, seguindo os princípios de **TDD (Test-Driven Development)**.

## Framework de Testes

Utilizamos o **Jest** com **React Testing Library**, que são as ferramentas oficiais recomendadas pelo Next.js 15 para testes de componentes React.

### Ferramentas

- **Jest**: Framework de testes JavaScript
- **React Testing Library**: Biblioteca para testar componentes React
- **@testing-library/user-event**: Simulação avançada de interações do usuário
- **@testing-library/jest-dom**: Matchers customizados para o Jest

## Estrutura de Testes

```
apps/web/
├── hooks/
│   ├── __tests__/
│   │   └── use-auth.test.tsx
│   └── use-auth.tsx
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   ├── __tests__/
│   │   │   │   └── page.test.tsx
│   │   │   └── page.tsx
│   │   └── register/
│   │       ├── __tests__/
│   │       │   └── page.test.tsx
│   │       └── page.tsx
├── jest.config.js
└── jest.setup.ts
```

## Executando os Testes

### Comandos Disponíveis

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage
```

## Cobertura de Testes

### Hook `useAuth`

- ✅ Login com credenciais válidas
- ✅ Tratamento de erro de credenciais inválidas
- ✅ Tratamento de erro de rede
- ✅ Registro de novo usuário
- ✅ Tratamento de erro de email duplicado
- ✅ Validação de dados do formulário
- ✅ Logout e limpeza de token
- ✅ Busca de perfil do usuário autenticado
- ✅ Redirecionamento quando não autenticado
- ✅ Estado inicial correto

### Página de Login

#### Renderização

- ✅ Renderizar título "Bem-vinda de volta!"
- ✅ Renderizar logo "Quezi"
- ✅ Renderizar campo de email
- ✅ Renderizar campo de senha
- ✅ Renderizar botão de login
- ✅ Renderizar link "Esqueceu senha"
- ✅ Renderizar link para cadastro
- ✅ Renderizar botões de login social (Google, GitHub)

#### Validação

- ✅ Mostrar erro para email inválido
- ✅ Mostrar erro para senha muito curta
- ✅ Não chamar login com dados inválidos

#### Submissão

- ✅ Fazer login com credenciais válidas
- ✅ Exibir estado de loading
- ✅ Exibir mensagem de erro da API

#### Interações

- ✅ Alternar visibilidade da senha
- ✅ Redirecionar para Google OAuth
- ✅ Redirecionar para GitHub OAuth

#### Acessibilidade

- ✅ Labels associados aos inputs
- ✅ Desabilitar botão durante loading

### Página de Registro

#### Etapa 1 - Seleção de Tipo

- ✅ Renderizar opção "Sou Cliente"
- ✅ Renderizar opção "Sou Profissional"
- ✅ Indicador de progresso
- ✅ Botão Continuar desabilitado inicialmente
- ✅ Permitir selecionar tipo e habilitar botão
- ✅ Exibir marcação visual ao selecionar
- ✅ Avançar para etapa 2

#### Etapa 2 - Dados Pessoais

- ✅ Renderizar campo de nome completo
- ✅ Renderizar campo de email
- ✅ Renderizar campo de senha
- ✅ Renderizar requisitos de senha
- ✅ Renderizar botões Voltar e Criar Conta

#### Validação

- ✅ Mostrar erro para nome muito curto
- ✅ Mostrar erro para email inválido
- ✅ Mostrar erro para senha sem letra maiúscula
- ✅ Mostrar erro para senha sem número

#### Submissão

- ✅ Criar conta com dados válidos
- ✅ Exibir estado de loading
- ✅ Exibir mensagem de erro da API

#### Navegação

- ✅ Voltar para etapa 1
- ✅ Link para página de login

## Princípios de TDD

### Red → Green → Refactor

1. **Red**: Escrever teste que falha
2. **Green**: Escrever código mínimo para passar
3. **Refactor**: Melhorar código mantendo testes passando

### Exemplo Prático

```typescript
// 1. RED - Teste que falha
it("deve fazer login com credenciais válidas", async () => {
  const { result } = renderHook(() => useAuth());
  await result.current.login("teste@example.com", "Senha123");

  expect(result.current.user).not.toBeNull();
});

// 2. GREEN - Implementar funcionalidade mínima
const login = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  setUser(response.data.user);
};

// 3. REFACTOR - Melhorar implementação
const login = useCallback(
  async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post("/auth/login", { email, password });
      setUser(response.data.user);

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  },
  [router]
);
```

## Melhores Práticas

### 1. Testar Comportamento, Não Implementação

```typescript
// ❌ BAD: Testar implementação
expect(mockLogin).toHaveBeenCalledTimes(1);

// ✅ GOOD: Testar comportamento
expect(screen.getByText(/bem-vinda/i)).toBeInTheDocument();
expect(result.current.user).toEqual(expectedUser);
```

### 2. Usar Queries Semânticas

```typescript
// ❌ BAD
screen.getByTestId("login-button");

// ✅ GOOD
screen.getByRole("button", { name: /entrar/i });
screen.getByLabelText(/email/i);
```

### 3. Simular Interações do Usuário

```typescript
import userEvent from "@testing-library/user-event";

const user = userEvent.setup();
await user.type(emailInput, "teste@example.com");
await user.click(submitButton);
```

### 4. Esperar por Mudanças Assíncronas

```typescript
await waitFor(() => {
  expect(screen.getByText(/sucesso/i)).toBeInTheDocument();
});
```

## Mocks

### Mock do Next.js Router

```typescript
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
}));
```

### Mock da API

```typescript
jest.mock("@/lib/api");

const mockApi = api as jest.Mocked<typeof api>;
mockApi.post.mockResolvedValueOnce({ data: mockUser });
```

### Mock do localStorage

```typescript
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
});
```

## Snapshot vs Testes Funcionais

**Preferimos testes funcionais** (comportamento) em vez de snapshots, pois:

- Snapshots quebram facilmente com mudanças de estilo
- Testes funcionais validam comportamento real
- Testes funcionais são mais legíveis

## Cobertura de Código

Meta: **80%+ de cobertura**

```bash
npm run test:coverage
```

Relatório gerado em: `coverage/index.html`

## Integração Contínua (CI)

Os testes rodam automaticamente no GitHub Actions:

```yaml
- name: Run Tests
  run: npm test --workspace=@quezi/web
```

## Debugging de Testes

### Ver renderização do componente

```typescript
import { screen } from "@testing-library/react";

screen.debug(); // Mostra todo o DOM
screen.debug(element); // Mostra elemento específico
```

### Executar teste específico

```bash
npm test -- --testNamePattern="deve fazer login"
npm test -- hooks/__tests__/use-auth.test.tsx
```

## Recursos

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing/jest)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**TDD não é sobre testes. É sobre design e confiança no código.** 🎯
