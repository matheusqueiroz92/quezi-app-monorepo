# 🧪 Guia de Testes - Quezi API

## 📋 Visão Geral

Este projeto segue a metodologia **TDD (Test-Driven Development)** com testes unitários, de integração e E2E.

---

## 🎯 Metodologia TDD

### O Ciclo Red-Green-Refactor

1. **🔴 Red**: Escrever um teste que falha
2. **🟢 Green**: Escrever o código mínimo para passar no teste
3. **🔵 Refactor**: Melhorar o código mantendo os testes passando

### Princípios Aplicados

- ✅ **Testes antes do código** - Escrever testes primeiro
- ✅ **Cobertura alta** - Mínimo 80% de cobertura
- ✅ **Testes legíveis** - Seguir padrão AAA (Arrange, Act, Assert)
- ✅ **Testes isolados** - Cada teste é independente
- ✅ **Mocks quando necessário** - Isolar dependências externas

---

## 🛠️ Tecnologias de Teste

- **Jest** - Framework de testes
- **ts-jest** - Suporte TypeScript
- **@jest/globals** - APIs do Jest
- **Supertest** - Testes HTTP/E2E

---

## 📊 Relatório de Cobertura

### Cobertura Atual (Módulo Users)

```
File                 | % Stmts | % Branch | % Funcs | % Lines
---------------------|---------|----------|---------|----------
user.repository.ts   |   100%  |   100%   |   100%  |   100%
user.schema.ts       |   100%  |   100%   |   100%  |   100%
user.service.ts      |   97.5% |   87.5%  |   100%  |   97.43%
app-error.ts         |   100%  |   100%   |   100%  |   100%
```

### Estatísticas

- **Total de Testes**: 56
- **Suítes de Teste**: 4
- **Todos Passando**: ✅ 100%

---

## 📁 Estrutura de Testes

```
src/
├── modules/
│   └── users/
│       ├── __tests__/
│       │   ├── user.service.test.ts      # Testes unitários do service
│       │   ├── user.repository.test.ts   # Testes unitários do repository
│       │   └── user.schema.test.ts       # Testes de validação Zod
│       ├── user.controller.ts
│       ├── user.service.ts
│       ├── user.repository.ts
│       └── user.schema.ts
└── utils/
    ├── __tests__/
    │   └── app-error.test.ts            # Testes das classes de erro
    └── app-error.ts
```

---

## 🚀 Scripts de Teste

### Executar Todos os Testes
```bash
npm test
```

### Modo Watch (Desenvolvimento)
```bash
npm run test:watch
```

### Gerar Relatório de Cobertura
```bash
npm run test:coverage
```

### Apenas Testes Unitários
```bash
npm run test:unit
```

---

## 📝 Padrões de Teste

### 1. Testes Unitários - Service

**Exemplo**: `user.service.test.ts`

```typescript
describe("UserService", () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService();
    mockUserRepository = (userService as any).userRepository;
  });

  describe("createUser", () => {
    it("deve criar um novo usuário com sucesso", async () => {
      // Arrange (Preparar)
      mockUserRepository.emailExists = jest.fn().mockResolvedValue(false);
      mockUserRepository.create = jest.fn().mockResolvedValue(createdUser);

      // Act (Agir)
      const result = await userService.createUser(validUserData);

      // Assert (Verificar)
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(result).not.toHaveProperty("passwordHash");
    });
  });
});
```

### 2. Testes Unitários - Repository

**Exemplo**: `user.repository.test.ts`

```typescript
describe("UserRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve criar um usuário no banco de dados", async () => {
    // Arrange
    (prisma.user.create as jest.Mock).mockResolvedValue(createdUser);

    // Act
    const result = await userRepository.create(userData);

    // Assert
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: userData,
      include: { professionalProfile: true },
    });
  });
});
```

### 3. Testes de Validação - Zod Schemas

**Exemplo**: `user.schema.test.ts`

```typescript
describe("createUserSchema", () => {
  it("deve validar dados corretos", () => {
    const validData = { /* ... */ };
    const result = createUserSchema.parse(validData);
    expect(result).toEqual(validData);
  });

  it("deve rejeitar email inválido", () => {
    const invalidData = { email: "invalido" };
    expect(() => createUserSchema.parse(invalidData)).toThrow();
  });
});
```

---

## ✅ Checklist de Testes por Módulo

Ao criar um novo módulo, garantir que tenha:

- [ ] **Service Tests**
  - [ ] Testes de criação (create)
  - [ ] Testes de listagem (list)
  - [ ] Testes de busca (findById)
  - [ ] Testes de atualização (update)
  - [ ] Testes de deleção (delete)
  - [ ] Testes de validações de negócio
  - [ ] Testes de erros (NotFoundError, ConflictError, etc)

- [ ] **Repository Tests**
  - [ ] Testes de todas as queries
  - [ ] Testes com mocks do Prisma
  - [ ] Testes de retorno null quando não encontrar

- [ ] **Schema Tests**
  - [ ] Testes de validação bem-sucedida
  - [ ] Testes de rejeição (dados inválidos)
  - [ ] Testes de campos opcionais
  - [ ] Testes de valores padrão

- [ ] **Controller Tests** (E2E)
  - [ ] Testes de endpoints HTTP
  - [ ] Testes de status codes
  - [ ] Testes de headers
  - [ ] Testes de autenticação

---

## 🎯 Cobertura de Código

### Meta de Cobertura

- **Statements**: ≥ 80%
- **Branches**: ≥ 80%
- **Functions**: ≥ 80%
- **Lines**: ≥ 80%

### Como Visualizar

Após executar `npm run test:coverage`, abra:

```
apps/api/coverage/lcov-report/index.html
```

---

## 📚 Boas Práticas

### 1. Nomenclatura

- **Describe**: Nome da classe/função sendo testada
- **It/Test**: Deve descrever o comportamento esperado
- Use português claro e descritivo

```typescript
describe("UserService", () => {
  describe("createUser", () => {
    it("deve criar um novo usuário com sucesso", () => {});
    it("deve lançar ConflictError se o email já existir", () => {});
  });
});
```

### 2. Padrão AAA

```typescript
it("deve fazer algo", () => {
  // Arrange (Preparar)
  const input = "valor";
  const expected = "resultado";

  // Act (Agir)
  const result = funcao(input);

  // Assert (Verificar)
  expect(result).toBe(expected);
});
```

### 3. Isolamento

- Use `beforeEach` para limpar mocks
- Cada teste deve ser independente
- Não compartilhe estado entre testes

### 4. Mocks

- Mock apenas dependências externas (DB, APIs)
- Não mock a unidade sendo testada
- Use `jest.clearAllMocks()` no `beforeEach`

---

## 🔄 Workflow TDD para Novos Recursos

### Exemplo: Adicionar novo método ao UserService

1. **Escrever o teste (Red)**

```typescript
it("deve buscar usuários por cidade", async () => {
  // Arrange
  mockUserRepository.findByCity = jest.fn().mockResolvedValue([user1, user2]);

  // Act
  const result = await userService.findByCity("São Paulo");

  // Assert
  expect(result).toHaveLength(2);
});
```

2. **Executar o teste** - Deve falhar ❌

```bash
npm test
```

3. **Implementar o código (Green)**

```typescript
async findByCity(city: string) {
  return await this.userRepository.findByCity(city);
}
```

4. **Executar o teste** - Deve passar ✅

5. **Refatorar (Refactor)**

```typescript
async findByCity(city: string) {
  if (!city) throw new BadRequestError("Cidade é obrigatória");
  return await this.userRepository.findByCity(city);
}
```

6. **Executar todos os testes** - Devem passar ✅

---

## 🎓 Próximos Passos

### Testes Pendentes

- [ ] **Testes E2E** - Controller completo
- [ ] **Testes de Integração** - Com banco real
- [ ] **Testes de Performance** - Load testing
- [ ] **Testes de Segurança** - SQL Injection, XSS

### Módulos a Testar

- [ ] Appointments (após implementação)
- [ ] Services (após implementação)
- [ ] Reviews (após implementação)
- [ ] Authentication (após implementação)

---

## 📖 Recursos

- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [TDD by Example - Kent Beck](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)

---

**🎉 Testes são documentação viva do código!**

