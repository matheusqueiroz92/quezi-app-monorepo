# 🏗️ Diagrama da Nova Arquitetura - Quezi API

## 📊 **Estrutura de Dados Proposta**

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER (Base)                             │
├─────────────────────────────────────────────────────────────────┤
│ • id, email, passwordHash, name, phone                        │
│ • userType: CLIENT | PROFESSIONAL | COMPANY                    │
│ • isEmailVerified, createdAt, updatedAt                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌──────────────────┐    ┌───────────────┐
│ CLIENT        │    │ PROFESSIONAL     │    │ COMPANY       │
│ PROFILE       │    │ PROFILE          │    │ PROFILE       │
├───────────────┤    ├──────────────────┤    ├───────────────┤
│ • cpf         │    │ • cpf/cnpj       │    │ • cnpj        │
│ • addresses   │    │ • address        │    │ • address     │
│ • paymentMeth │    │ • serviceMode    │    │ • businessHrs │
│ • favorites   │    │ • workingHours   │    │ • description │
│ • preferences │    │ • specialties    │    │ • photos      │
└───────────────┘    │ • certifications │    └───────────────┘
        │            │ • portfolio       │            │
        │            │ • averageRating   │            ▼
        │            └──────────────────┘    ┌─────────────────┐
        │                     │              │ COMPANY         │
        │                     ▼              │ EMPLOYEES       │
        │            ┌─────────────────┐    ├─────────────────┤
        │            │ SERVICES        │    │ • name, email   │
        │            │ (Professional)  │    │ • position      │
        │            ├─────────────────┤    │ • specialties   │
        │            │ • name, desc    │    │ • workingHours │
        │            │ • price, duration│   │ • isActive      │
        │            │ • category      │    └─────────────────┘
        │            └─────────────────┘            │
        │                     │                      ▼
        │                     │              ┌─────────────────┐
        │                     │              │ COMPANY         │
        │                     │              │ SERVICES        │
        │                     │              ├─────────────────┤
        │                     │              │ • name, desc    │
        │                     │              │ • price, duration│
        │                     │              │ • category      │
        │                     │              └─────────────────┘
        │                     │                      │
        │                     │                      │
        ▼                     ▼                      ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ APPOINTMENTS    │  │ APPOINTMENTS    │  │ COMPANY         │
│ (Client ↔       │  │ (Client ↔       │  │ EMPLOYEE        │
│  Professional)  │  │  Professional)  │  │ APPOINTMENTS    │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ • clientId      │  │ • clientId      │  │ • clientId      │
│ • professionalId│  │ • professionalId│  │ • employeeId    │
│ • serviceId     │  │ • serviceId     │  │ • serviceId     │
│ • scheduledDate │  │ • scheduledDate │  │ • scheduledDate │
│ • status        │  │ • status        │  │ • status        │
│ • totalPrice    │  │ • totalPrice    │  │ • totalPrice    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
        │                     │                      │
        │                     │                      │
        ▼                     ▼                      ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ REVIEWS         │  │ REVIEWS         │  │ COMPANY         │
│ (Client →       │  │ (Client →       │  │ EMPLOYEE        │
│  Professional)  │  │  Professional)  │  │ REVIEWS         │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ • rating        │  │ • rating        │  │ • rating        │
│ • comment       │  │ • comment       │  │ • comment       │
│ • appointmentId │  │ • appointmentId │  │ • appointmentId │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## 🔄 **Fluxo de Funcionamento**

### **1. Cliente (CLIENT)**

```
Cliente → Busca Serviços → Escolhe Profissional/Empresa → Agenda → Avalia
```

### **2. Profissional (PROFESSIONAL)**

```
Profissional → Cria Perfil → Oferece Serviços → Recebe Agendamentos → Presta Serviço
```

### **3. Empresa (COMPANY)**

```
Empresa → Cadastra Funcionários → Oferece Serviços → Gerencia Agendamentos → Presta Serviços
```

## 🎯 **Vantagens da Nova Estrutura**

### **✅ Separação Clara de Responsabilidades**

- Cada tipo de usuário tem seu próprio perfil
- Campos específicos para cada necessidade
- Lógica de negócio isolada

### **✅ Flexibilidade**

- Fácil adicionar novos campos
- Suporte a diferentes tipos de serviços
- Escalabilidade para novos recursos

### **✅ Performance**

- Consultas mais eficientes
- Índices otimizados
- Menos joins desnecessários

### **✅ Manutenibilidade**

- Código mais organizado
- Testes mais focados
- Debugging mais fácil

## 📋 **Implementação por Fases**

### **Fase 1: Preparação**

- [ ] Criar novos modelos no Prisma
- [ ] Criar migrações
- [ ] Manter compatibilidade

### **Fase 2: Backend**

- [ ] Implementar novos serviços
- [ ] Atualizar controllers
- [ ] Criar testes

### **Fase 3: Migração**

- [ ] Migrar dados existentes
- [ ] Validar funcionalidades
- [ ] Testes de integração

### **Fase 4: Frontend**

- [ ] Atualizar interfaces
- [ ] Implementar fluxos específicos
- [ ] Testes E2E

---

**Esta arquitetura resolve os problemas identificados e cria uma base sólida para o crescimento da aplicação.**
