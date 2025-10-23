# 🚀 Exemplo de Implementação - Nova Arquitetura

## 📋 **Schema Prisma Atualizado**

```prisma
// ========================================
// ENUMS
// ========================================

enum UserType {
  CLIENT
  PROFESSIONAL
  COMPANY
}

enum ServicePriceType {
  FIXED
  HOURLY
}

enum ServiceMode {
  AT_LOCATION
  AT_DOMICILE
  BOTH
}

enum AppointmentStatus {
  PENDING
  ACCEPTED
  REJECTED
  COMPLETED
}

// ========================================
// MODELS
// ========================================

model User {
  id               String   @id @default(cuid())
  email            String   @unique
  passwordHash     String?
  name             String
  phone            String?
  userType         UserType
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

  @@map("users")
}

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

  @@map("client_profiles")
}

model ProfessionalProfile {
  userId            String      @id
  cpf              String?     // CPF se pessoa física
  cnpj             String?     // CNPJ se MEI
  address          String
  city             String
  serviceMode      ServiceMode
  workingHours     Json        // Horários de atendimento
  specialties      String[]    // Especialidades
  certifications   Json[]      // Certificações com comprovação
  portfolio        String[]    // Portfolio de trabalhos
  averageRating    Float       @default(0.0)
  totalRatings     Int         @default(0)
  isActive         Boolean     @default(true)
  isVerified       Boolean     @default(false)

  // Relações
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  services     Service[]
  appointments Appointment[] @relation("ProfessionalAppointments")
  reviews      Review[]

  @@map("professional_profiles")
}

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

  @@map("company_profiles")
}

model CompanyEmployee {
  id              String   @id @default(cuid())
  companyId       String
  name            String
  email           String?
  phone           String?
  position        String
  specialties     String[]
  isActive        Boolean  @default(true)
  workingHours    Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relações
  company     CompanyProfile              @relation(fields: [companyId], references: [userId], onDelete: Cascade)
  appointments CompanyEmployeeAppointment[]
  reviews     CompanyEmployeeReview[]

  @@map("company_employees")
}

model Service {
  id              String           @id @default(cuid())
  professionalId  String
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
  professional User      @relation(fields: [professionalId], references: [id])
  category     Category
  appointments Appointment[]

  @@map("services")
}

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

  @@map("company_services")
}

model Appointment {
  id              String            @id @default(cuid())
  clientId        String
  professionalId   String
  serviceId        String
  scheduledDate   DateTime
  duration        Int
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

  @@map("appointments")
}

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

  @@map("company_employee_appointments")
}

model Review {
  id              String   @id @default(cuid())
  clientId        String
  professionalId   String
  appointmentId   String   @unique
  rating          Int      // 1-5
  comment         String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relações
  client      User      @relation(fields: [clientId], references: [id])
  professional User     @relation(fields: [professionalId], references: [id])
  appointment Appointment @relation(fields: [appointmentId], references: [id])

  @@map("reviews")
}

model CompanyEmployeeReview {
  id              String   @id @default(cuid())
  clientId        String
  employeeId      String
  appointmentId   String   @unique
  rating          Int
  comment         String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relações
  client      User      @relation(fields: [clientId], references: [id])
  employee    CompanyEmployee @relation(fields: [employeeId], references: [id])
  appointment CompanyEmployeeAppointment @relation(fields: [appointmentId], references: [id])

  @@map("company_employee_reviews")
}

// ========================================
// BETTER AUTH MODELS
// ========================================

model Session {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  expiresAt DateTime @map("expires_at")
  token     String   @unique
  ipAddress String?  @map("ip_address")
  userAgent String?  @map("user_agent")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("sessions")
}

model Account {
  id           String    @id @default(cuid())
  userId       String    @map("user_id")
  accountId    String    @map("account_id")
  providerId   String    @map("provider_id")
  accessToken  String?   @map("access_token")
  refreshToken String?   @map("refresh_token")
  idToken      String?   @map("id_token")
  expiresAt    DateTime? @map("expires_at")
  password     String?
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([providerId, accountId])
  @@index([userId])
  @@map("accounts")
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime @map("expires_at")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@unique([identifier, value])
  @@map("verifications")
}
```

## 🎯 **Exemplo de Uso**

### **1. Cadastro de Cliente**

```typescript
// POST /api/v1/users
{
  "email": "cliente@email.com",
  "password": "senha123",
  "name": "João Silva",
  "phone": "11999999999",
  "userType": "CLIENT",
  "clientProfile": {
    "cpf": "12345678901",
    "addresses": [
      {
        "street": "Rua A, 123",
        "city": "São Paulo",
        "zipCode": "01234567"
      }
    ],
    "preferences": {
      "notifications": true,
      "marketing": false
    }
  }
}
```

### **2. Cadastro de Profissional**

```typescript
// POST /api/v1/users
{
  "email": "profissional@email.com",
  "password": "senha123",
  "name": "Maria Santos",
  "phone": "11988888888",
  "userType": "PROFESSIONAL",
  "professionalProfile": {
    "cpf": "98765432100",
    "address": "Rua B, 456",
    "city": "São Paulo",
    "serviceMode": "BOTH",
    "workingHours": {
      "monday": {"start": "09:00", "end": "18:00"},
      "tuesday": {"start": "09:00", "end": "18:00"}
    },
    "specialties": ["Corte", "Coloração", "Escova"],
    "certifications": [
      {
        "name": "Curso de Corte",
        "institution": "Escola de Beleza",
        "date": "2023-01-01",
        "document": "certificado.pdf"
      }
    ]
  }
}
```

### **3. Cadastro de Empresa**

```typescript
// POST /api/v1/users
{
  "email": "salao@email.com",
  "password": "senha123",
  "name": "Salão da Maria",
  "phone": "11977777777",
  "userType": "COMPANY",
  "companyProfile": {
    "cnpj": "12345678000199",
    "address": "Rua C, 789",
    "city": "São Paulo",
    "businessHours": {
      "monday": {"start": "08:00", "end": "20:00"},
      "tuesday": {"start": "08:00", "end": "20:00"}
    },
    "description": "Salão de beleza completo",
    "photos": ["foto1.jpg", "foto2.jpg"]
  }
}
```

### **4. Cadastro de Funcionário da Empresa**

```typescript
// POST /api/v1/company-employees
{
  "name": "Ana Funcionária",
  "email": "ana@salao.com",
  "phone": "11966666666",
  "position": "Cabeleireira",
  "specialties": ["Corte", "Coloração"],
  "workingHours": {
    "monday": {"start": "09:00", "end": "18:00"},
    "tuesday": {"start": "09:00", "end": "18:00"}
  }
}
```

## 🔄 **Fluxo de Agendamento**

### **Cliente → Profissional**

```typescript
// POST /api/v1/appointments
{
  "professionalId": "prof_id_123",
  "serviceId": "service_id_456",
  "scheduledDate": "2024-02-15T14:00:00Z",
  "notes": "Corte e escova"
}
```

### **Cliente → Funcionário da Empresa**

```typescript
// POST /api/v1/company-employees/appointments
{
  "employeeId": "employee_id_789",
  "serviceId": "company_service_id_101",
  "scheduledDate": "2024-02-15T16:00:00Z",
  "notes": "Manicure e pedicure"
}
```

## 📊 **Consultas Úteis**

### **Buscar Profissionais por Especialidade**

```typescript
// GET /api/v1/professionals?specialty=corte&city=sao-paulo
```

### **Buscar Empresas por Serviço**

```typescript
// GET /api/v1/companies?service=manicure&city=sao-paulo
```

### **Agendamentos do Cliente**

```typescript
// GET /api/v1/users/me/appointments
```

### **Agendamentos do Profissional**

```typescript
// GET /api/v1/professionals/me/appointments
```

### **Agendamentos da Empresa**

```typescript
// GET /api/v1/companies/me/appointments
```

---

**Esta implementação resolve todos os problemas identificados e cria uma base sólida para o crescimento da aplicação.**
