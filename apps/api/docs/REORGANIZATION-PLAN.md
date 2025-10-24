# 🔧 Plano de Reorganização - Estrutura Nova (Clean Architecture)

## 📋 Objetivo

Reorganizar a API para usar **exclusivamente** a estrutura nova (Clean Architecture) e eliminar arquivos duplicados.

## 🏗️ Estrutura Nova (Clean Architecture)

```
src/
├── domain/                    # 🎯 CAMADA DE DOMÍNIO
│   ├── entities/              # Entidades de negócio
│   └── interfaces/            # Contratos e interfaces
├── application/               # 🔧 CAMADA DE APLICAÇÃO
│   ├── services/              # Serviços de aplicação
│   └── use-cases/             # Casos de uso
├── infrastructure/            # 🗄️ CAMADA DE INFRAESTRUTURA
│   └── repositories/          # Implementações de repositórios
├── presentation/              # 🎮 CAMADA DE APRESENTAÇÃO
│   ├── controllers/           # Controllers
│   ├── routes/                # Rotas
│   └── schemas/                # Schemas de validação
├── middlewares/               # 🛡️ Middlewares de segurança
├── lib/                       # 📚 Bibliotecas e configurações
└── utils/                     # 🛠️ Utilitários
```

## 🎯 Plano de Reorganização

### **Fase 1: Criar Nova Estrutura**
1. **Criar** `src/presentation/` com controllers, routes e schemas
2. **Mover** controllers de `modules/` para `presentation/controllers/`
3. **Mover** routes de `modules/` para `presentation/routes/`
4. **Mover** schemas de `modules/` para `presentation/schemas/`

### **Fase 2: Eliminar Duplicações**
1. **Deletar** `src/modules/` (estrutura antiga)
2. **Manter** apenas `src/application/services/` (estrutura nova)
3. **Manter** apenas `src/infrastructure/repositories/` (estrutura nova)
4. **Manter** apenas `src/domain/` (estrutura nova)

### **Fase 3: Corrigir Imports**
1. **Atualizar** imports nos controllers
2. **Atualizar** imports nas rotas
3. **Atualizar** imports nos schemas
4. **Atualizar** `src/routes.ts`

## 📁 Estrutura Final

```
src/
├── domain/                    # 🎯 DOMÍNIO
│   ├── entities/              # User, ClientProfile, etc.
│   └── interfaces/            # IUser, IUserRepository, etc.
├── application/               # 🔧 APLICAÇÃO
│   ├── services/              # UserService, AppointmentService, etc.
│   └── use-cases/             # UserRegistration, AppointmentBooking, etc.
├── infrastructure/            # 🗄️ INFRAESTRUTURA
│   └── repositories/          # UserRepository, AppointmentRepository, etc.
├── presentation/              # 🎮 APRESENTAÇÃO
│   ├── controllers/           # UserController, AppointmentController, etc.
│   ├── routes/                # userRoutes, appointmentRoutes, etc.
│   └── schemas/                # userSchema, appointmentSchema, etc.
├── middlewares/               # 🛡️ Middlewares
├── lib/                       # 📚 Bibliotecas
└── utils/                     # 🛠️ Utilitários
```

## 🚀 Benefícios

### **Imediatos**
- ✅ Estrutura clara e organizada
- ✅ Separação de responsabilidades
- ✅ Fácil localização de arquivos
- ✅ Eliminação de duplicações

### **Longo Prazo**
- ✅ Manutenção mais simples
- ✅ Testes mais organizados
- ✅ Escalabilidade
- ✅ Seguimento de Clean Architecture

## 📋 Checklist de Execução

### **Fase 1: Criar Nova Estrutura**
- [ ] Criar `src/presentation/`
- [ ] Criar `src/presentation/controllers/`
- [ ] Criar `src/presentation/routes/`
- [ ] Criar `src/presentation/schemas/`

### **Fase 2: Mover Arquivos**
- [ ] Mover controllers de `modules/` para `presentation/controllers/`
- [ ] Mover routes de `modules/` para `presentation/routes/`
- [ ] Mover schemas de `modules/` para `presentation/schemas/`

### **Fase 3: Eliminar Duplicações**
- [ ] Deletar `src/modules/`
- [ ] Manter apenas estrutura nova

### **Fase 4: Corrigir Imports**
- [ ] Atualizar imports nos controllers
- [ ] Atualizar imports nas rotas
- [ ] Atualizar `src/routes.ts`

### **Fase 5: Testes**
- [ ] Executar `npm run build`
- [ ] Executar `npm run test`
- [ ] Testar se a API funciona

## 🎉 Conclusão

A reorganização criará uma estrutura limpa, organizada e sem duplicações, seguindo os princípios de Clean Architecture.
