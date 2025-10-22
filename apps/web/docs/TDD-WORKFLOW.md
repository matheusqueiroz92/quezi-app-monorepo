# 🧪 TDD Workflow - Quezi App Frontend

**Data:** 22 de Outubro de 2025  
**Status:** ✅ IMPLEMENTADO

---

## 🎯 **O que é TDD?**

**Test-Driven Development (TDD)** é uma metodologia de desenvolvimento onde:

1. **🔴 RED:** Escreva um teste que falha
2. **🟢 GREEN:** Escreva código mínimo para passar
3. **🔵 REFACTOR:** Melhore o código mantendo os testes passando

---

## 📋 **Workflow TDD Implementado**

### **1. Estrutura de Testes**

```
apps/web/
├── lib/__tests__/           # Testes de utilitários
├── hooks/__tests__/         # Testes de hooks
├── components/__tests__/    # Testes de componentes
├── app/__tests__/          # Testes de páginas
└── __tests__/              # Testes de integração
```

### **2. Configuração Jest**

**Arquivo:** `jest.config.js`

- ✅ Next.js 15 integrado
- ✅ TypeScript suportado
- ✅ Cobertura de código
- ✅ Mocks automáticos

**Arquivo:** `jest.setup.ts`

- ✅ @testing-library/jest-dom
- ✅ Mocks do Next.js navigation
- ✅ Mocks do localStorage
- ✅ Mocks do fetch

### **3. Dependências de Teste**

```json
{
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.0.0",
  "@testing-library/user-event": "^14.0.0",
  "jest": "^29.0.0",
  "jest-environment-jsdom": "^29.0.0"
}
```

---

## 🚀 **Como Usar TDD nas Próximas Implementações**

### **Passo 1: Escrever Teste (RED) 🔴**

```typescript
// components/__tests__/NewComponent.test.tsx
import { render, screen } from "@testing-library/react";
import { NewComponent } from "../NewComponent";

describe("NewComponent", () => {
  it("deve renderizar título corretamente", () => {
    render(<NewComponent title="Teste" />);
    expect(screen.getByText("Teste")).toBeInTheDocument();
  });
});
```

### **Passo 2: Implementar Código (GREEN) 🟢**

```typescript
// components/NewComponent.tsx
interface Props {
  title: string;
}

export function NewComponent({ title }: Props) {
  return <h1>{title}</h1>;
}
```

### **Passo 3: Refatorar (BLUE) 🔵**

```typescript
// Melhorar sem quebrar testes
export function NewComponent({ title }: Props) {
  return (
    <div className="component">
      <h1 className="title">{title}</h1>
    </div>
  );
}
```

---

## 📊 **Testes Implementados**

### **✅ Validators (28 testes)**

```typescript
// lib/__tests__/validators.test.ts
describe("passwordSchema", () => {
  it("deve aceitar senha válida com todos os critérios", () => {
    expect(() => passwordSchema.parse("Senha@123")).not.toThrow();
  });

  it("deve rejeitar senha sem caractere especial", () => {
    expect(() => passwordSchema.parse("Senha123")).toThrow(
      "Senha deve conter pelo menos um caractere especial"
    );
  });
});
```

**Cobertura:**

- ✅ Validação de senha (9 testes)
- ✅ Schema de registro (7 testes)
- ✅ Schema de reset (2 testes)
- ✅ Validações básicas (10 testes)

### **✅ Hooks (Testes Simples)**

```typescript
// hooks/__tests__/useDebounce.simple.test.ts
describe("useDebounce", () => {
  it("deve chamar useState com valor inicial", () => {
    useDebounce("test", 500);
    expect(mockUseState).toHaveBeenCalledWith("test");
  });
});
```

### **✅ Formulário de Registro**

```typescript
// app/(auth)/register/__tests__/register.simple.test.tsx
describe("Register Form Validations", () => {
  it("deve validar senha com caractere especial", () => {
    const validPasswords = ["Senha@123", "Test#456", "Pass$789"];
    validPasswords.forEach((password) => {
      expect(() => passwordSchema.parse(password)).not.toThrow();
    });
  });
});
```

---

## 🎯 **Próximas Implementações com TDD**

### **FASE 3: Layouts e Navegação**

#### **1. Sidebar Component**

```typescript
// components/layout/__tests__/Sidebar.test.tsx
describe("Sidebar", () => {
  it("deve renderizar menu de navegação", () => {
    render(<Sidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("deve mostrar itens baseados no userType", () => {
    render(<Sidebar userType="PROFESSIONAL" />);
    expect(screen.getByText("Meus Serviços")).toBeInTheDocument();
  });
});
```

#### **2. Header Component**

```typescript
// components/layout/__tests__/Header.test.tsx
describe("Header", () => {
  it("deve mostrar avatar do usuário", () => {
    render(<Header user={mockUser} />);
    expect(screen.getByAltText("Avatar")).toBeInTheDocument();
  });

  it("deve permitir logout", async () => {
    const user = userEvent.setup();
    render(<Header user={mockUser} />);

    await user.click(screen.getByText("Sair"));
    expect(mockLogout).toHaveBeenCalled();
  });
});
```

### **FASE 4: Dashboard**

#### **1. Dashboard Cards**

```typescript
// components/dashboard/__tests__/StatsCard.test.tsx
describe("StatsCard", () => {
  it("deve mostrar estatísticas corretas", () => {
    render(<StatsCard title="Agendamentos" value={15} />);
    expect(screen.getByText("Agendamentos")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
  });
});
```

---

## 🛠️ **Comandos Úteis**

### **Executar Testes**

```bash
# Todos os testes
npm test

# Testes específicos
npm test -- --testPathPattern="validators"

# Com cobertura
npm test -- --coverage

# Modo watch
npm test -- --watch
```

### **Debug de Testes**

```bash
# Com logs detalhados
npm test -- --verbose

# Detectar handles abertos
npm test -- --detectOpenHandles

# Executar apenas testes que falharam
npm test -- --onlyFailures
```

---

## 📈 **Métricas de Qualidade**

### **Cobertura Atual**

```
✅ Validators: 100% (28/28 testes)
✅ Password Schema: 100% (9/9 testes)
✅ Register Schema: 100% (7/7 testes)
✅ Basic Validations: 100% (10/10 testes)
```

### **Meta de Cobertura**

- **Mínimo:** 80% por arquivo
- **Ideal:** 90% por arquivo
- **Crítico:** 100% para validators e auth

---

## 🔧 **Configuração de Mocks**

### **API Client Mock**

```typescript
// __mocks__/api-client.ts
export const post = jest.fn();
export const get = jest.fn();
export const put = jest.fn();
export const del = jest.fn();
```

### **Auth Utils Mock**

```typescript
// __mocks__/auth-utils.ts
export const setAuthToken = jest.fn();
export const getAuthToken = jest.fn();
export const removeAuthToken = jest.fn();
export const redirectByRole = jest.fn();
```

---

## 🎉 **Benefícios do TDD**

### **✅ Qualidade**

- Código mais confiável
- Menos bugs em produção
- Refatoração segura

### **✅ Documentação**

- Testes servem como documentação
- Exemplos de uso claros
- Comportamento esperado definido

### **✅ Velocidade**

- Desenvolvimento mais rápido a longo prazo
- Debug mais fácil
- Deploy com confiança

---

## 🚀 **Próximos Passos**

1. **Implementar FASE 3** com TDD
2. **Criar testes para cada componente** antes da implementação
3. **Manter cobertura acima de 80%**
4. **Refatorar código** baseado nos testes

---

## 📚 **Recursos Adicionais**

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [TDD Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**TDD implementado com sucesso! 🎯**
