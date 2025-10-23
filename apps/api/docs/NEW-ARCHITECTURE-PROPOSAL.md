# 🏗️ Proposta de Nova Arquitetura - Quezi API

## 📋 Análise da Situação Atual

### 🚨 **Problemas Identificados:**

1. **Confusão entre Organizations e Company Users**: O Better Auth Organizations está sendo usado para um propósito diferente do que você precisa
2. **Falta de campos específicos por tipo de usuário**: Não há campos específicos para COMPANY (CNPJ, endereço, horários) e PROFESSIONAL (CPF, certificações)
3. **CompanyEmployee não está bem integrado**: Os funcionários das empresas não estão conectados adequadamente ao sistema de agendamentos
4. **Falta de separação clara de responsabilidades**: Os tipos de usuário têm necessidades muito diferentes

## 🎯 **Nova Estrutura Proposta**

### **1. Separação Clara por Tipo de Usuário**

#### **CLIENT (Cliente)**

- **Perfil Básico**: email, nome, telefone, endereços
- **Dados Pessoais**: CPF, preferências
- **Funcionalidades**: Buscar serviços, agendar, avaliar, favoritos

#### **PROFESSIONAL (Profissional Autônomo)**

- **Perfil Básico**: email, nome, telefone, endereço
- **Dados Profissionais**: CPF/CNPJ (MEI), certificações, especialidades
- **Funcionalidades**: Oferecer serviços, gerenciar agenda, receber pagamentos

#### **COMPANY (Empresa/Salão)**

- **Perfil Empresarial**: email, nome, CNPJ, endereço, telefone
- **Dados da Empresa**: Horários de funcionamento, descrição, localização
- **Funcionalidades**: Gerenciar funcionários, oferecer serviços, gerenciar agenda

### **2. Estrutura de Dados Proposta**

#### **User (Base)**

```typescript
model User {
  id               String   @id @default(cuid())
  email            String   @unique
  passwordHash     String?
  name             String
  phone            String?
  userType         UserType // CLIENT, PROFESSIONAL, COMPANY
  isEmailVerified  Boolean  @default(false)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  // Relações específicas por tipo
  clientProfile     ClientProfile?
  professionalProfile ProfessionalProfile?
  companyProfile    CompanyProfile?

  // Better Auth
  accounts Account[]
  sessions Session[]
}
```

#### **ClientProfile (Perfil do Cliente)**

```typescript
model ClientProfile {
  userId            String   @id
  cpf              String   @unique
  addresses        Json     // Array de endereços
  paymentMethods   Json?    // Métodos de pagamento
  favoriteServices Json?    // Serviços favoritos
  preferences      Json?    // Preferências do cliente

  // Relações
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  appointments Appointment[] @relation("ClientAppointments")
  reviews      Review[]
}
```

#### **ProfessionalProfile (Perfil do Profissional)**

```typescript
model ProfessionalProfile {
  userId            String   @id
  cpf              String?  // CPF se pessoa física
  cnpj             String?  // CNPJ se MEI
  address          String
  city             String
  serviceMode      ServiceMode // AT_LOCATION, AT_DOMICILE, BOTH
  workingHours     Json     // Horários de atendimento
  specialties      String[] // Especialidades
  certifications   Json[]   // Certificações com comprovação
  portfolio        String[] // Portfolio de trabalhos
  averageRating    Float    @default(0.0)
  totalRatings     Int      @default(0)
  isActive         Boolean  @default(true)
  isVerified       Boolean  @default(false)

  // Relações
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  services     Service[]
  appointments Appointment[] @relation("ProfessionalAppointments")
  reviews      Review[]
}
```

#### **CompanyProfile (Perfil da Empresa)**

```typescript
model CompanyProfile {
  userId            String   @id
  cnpj              String   @unique
  address           String
  city              String
  businessHours     Json     // Horários de funcionamento
  description       String?  // Descrição da empresa
  photos            String[] // Fotos da empresa
  averageRating     Float    @default(0.0)
  totalRatings      Int      @default(0)
  isActive          Boolean  @default(true)
  isVerified        Boolean  @default(false)

  // Relações
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  employees    CompanyEmployee[]
  services     CompanyService[]
  appointments CompanyEmployeeAppointment[]
  reviews      CompanyEmployeeReview[]
}
```

#### **CompanyEmployee (Funcionário da Empresa)**

```typescript
model CompanyEmployee {
  id              String   @id @default(cuid())
  companyId       String   // ID da empresa
  name            String
  email           String?  // Email opcional
  phone           String?
  position        String   // Cargo/função
  specialties     String[] // Especialidades do funcionário
  isActive        Boolean  @default(true)
  workingHours    Json?    // Horários específicos do funcionário
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relações
  company     CompanyProfile              @relation(fields: [companyId], references: [userId], onDelete: Cascade)
  appointments CompanyEmployeeAppointment[]
  reviews     CompanyEmployeeReview[]
}
```

### **3. Sistema de Agendamentos Unificado**

#### **Appointment (Agendamento com Profissional)**

```typescript
model Appointment {
  id              String            @id @default(cuid())
  clientId        String
  professionalId   String
  serviceId        String
  scheduledDate   DateTime
  duration        Int               // Duração em minutos
  status          AppointmentStatus
  notes           String?
  totalPrice      Decimal
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  // Relações
  client      User      @relation("ClientAppointments", fields: [clientId], references: [id])
  professional User     @relation("ProfessionalAppointments", fields: [professionalId], references: [id])
  service     Service
  review      Review?
}
```

#### **CompanyEmployeeAppointment (Agendamento com Funcionário)**

```typescript
model CompanyEmployeeAppointment {
  id              String            @id @default(cuid())
  clientId        String
  employeeId      String
  serviceId       String
  scheduledDate   DateTime
  duration        Int
  status          AppointmentStatus
  notes           String?
  totalPrice      Decimal
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  // Relações
  client      User      @relation("ClientCompanyAppointments", fields: [clientId], references: [id])
  employee    CompanyEmployee @relation(fields: [employeeId], references: [id])
  service     CompanyService
  review      CompanyEmployeeReview?
}
```

### **4. Sistema de Serviços**

#### **Service (Serviço de Profissional)**

```typescript
model Service {
  id              String           @id @default(cuid())
  professionalId  String
  categoryId      String
  name            String
  description     String?
  price           Decimal
  priceType       ServicePriceType
  duration        Int              // Duração em minutos
  isActive        Boolean          @default(true)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  // Relações
  professional User      @relation(fields: [professionalId], references: [id])
  category     Category
  appointments Appointment[]
}
```

#### **CompanyService (Serviço da Empresa)**

```typescript
model CompanyService {
  id              String           @id @default(cuid())
  companyId       String
  categoryId      String
  name            String
  description     String?
  price           Decimal
  priceType       ServicePriceType
  duration        Int
  isActive        Boolean          @default(true)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  // Relações
  company     CompanyProfile              @relation(fields: [companyId], references: [userId])
  category    Category
  appointments CompanyEmployeeAppointment[]
}
```

## 🔄 **Plano de Migração**

### **Fase 1: Preparação**

1. Criar novos modelos no schema
2. Criar migrações para adicionar novos campos
3. Manter compatibilidade com estrutura atual

### **Fase 2: Implementação**

1. Atualizar UserService para trabalhar com perfis específicos
2. Criar CompanyProfileService
3. Atualizar sistema de agendamentos

### **Fase 3: Testes**

1. Migrar dados existentes
2. Testar funcionalidades
3. Validar regras de negócio

### **Fase 4: Frontend**

1. Atualizar endpoints da API
2. Criar interfaces específicas por tipo de usuário
3. Implementar fluxos de cadastro diferenciados

## 🎯 **Benefícios da Nova Estrutura**

1. **Separação Clara**: Cada tipo de usuário tem seu próprio perfil
2. **Flexibilidade**: Fácil adicionar campos específicos por tipo
3. **Escalabilidade**: Estrutura preparada para crescimento
4. **Manutenibilidade**: Código mais organizado e fácil de manter
5. **Performance**: Consultas mais eficientes
6. **Segurança**: Controle de acesso mais granular

## 📝 **Próximos Passos**

1. **Aprovar a proposta** de nova estrutura
2. **Criar o novo schema** no Prisma
3. **Implementar migrações** graduais
4. **Atualizar serviços** e controllers
5. **Testar funcionalidades** com dados reais
6. **Integrar com frontend** de forma progressiva

---

**Esta proposta resolve os problemas identificados e cria uma base sólida para o crescimento da aplicação.**
