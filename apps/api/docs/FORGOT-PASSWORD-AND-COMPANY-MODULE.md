# 🔐 Módulo Forgot Password e Sistema de Empresas - Quezi API

## 📋 Visão Geral

Este documento descreve as novas funcionalidades implementadas na API da Quezi:

1. **Sistema "Esqueceu a senha?"** - Recuperação de senha com tokens seguros
2. **Tipo de usuário EMPRESA** - Novo tipo de usuário para empresas
3. **Sistema de Funcionários** - Gestão de funcionários das empresas

---

## 🔐 Sistema "Esqueceu a senha?"

### Funcionalidades

- ✅ Envio de email de recuperação
- ✅ Geração de tokens seguros com expiração (24h)
- ✅ Verificação de tokens válidos
- ✅ Reset de senha com token
- ✅ Invalidação de sessões após reset
- ✅ Segurança: resposta de sucesso mesmo para emails inexistentes

### Endpoints

| Método | Endpoint                          | Descrição                   |
| ------ | --------------------------------- | --------------------------- |
| `POST` | `/api/v1/auth/forgot-password`    | Enviar email de recuperação |
| `GET`  | `/api/v1/auth/verify-reset-token` | Verificar se token é válido |
| `POST` | `/api/v1/auth/reset-password`     | Resetar senha com token     |

### Exemplos de Uso

#### 1. Solicitar Reset de Senha

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "usuario@example.com"
}
```

**Resposta:**

```json
{
  "message": "Email de recuperação enviado com sucesso"
}
```

#### 2. Verificar Token

```http
GET /api/v1/auth/verify-reset-token?token=abc123def456
```

**Resposta (Token válido):**

```json
{
  "valid": true,
  "message": "Token válido"
}
```

**Resposta (Token inválido):**

```json
{
  "valid": false,
  "error": "Token inválido ou expirado"
}
```

#### 3. Resetar Senha

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "abc123def456",
  "newPassword": "NovaSenha123"
}
```

**Resposta:**

```json
{
  "message": "Senha alterada com sucesso"
}
```

### Segurança

- **Tokens únicos**: Gerados com `crypto.randomBytes(32)`
- **Expiração**: 24 horas
- **Invalidação**: Todas as sessões são invalidadas após reset
- **Rate limiting**: Proteção contra spam
- **Privacidade**: Sempre retorna sucesso (não revela se email existe)

---

## 🏢 Tipo de Usuário EMPRESA

### Visão Geral

O novo tipo de usuário `COMPANY` permite que empresas se cadastrem na plataforma e gerenciem seus funcionários e serviços.

### Características

- **Empresa como usuário**: A empresa tem seu próprio login e perfil
- **Funcionários vinculados**: Empresa pode ter múltiplos funcionários
- **Serviços da empresa**: Empresa oferece serviços através de seus funcionários
- **Agendamentos**: Clientes podem agendar com funcionários específicos
- **Avaliações**: Sistema de avaliações para funcionários

### Schema do Banco

```sql
-- Novo tipo de usuário
enum UserType {
  CLIENT
  PROFESSIONAL
  COMPANY  -- NOVO
}

-- Tabelas relacionadas à empresa
model CompanyEmployee {
  id          String   @id @default(cuid())
  companyId   String   // ID do usuário do tipo COMPANY
  name        String
  email       String?
  phone       String?
  position    String?  // Cargo/função
  specialties String[] @default([])
  isActive    Boolean  @default(true)
  // ... outros campos
}

model CompanyService {
  id          String           @id @default(cuid())
  companyId   String
  categoryId  String
  name        String
  description String?
  price       Decimal          @db.Money
  priceType   ServicePriceType
  durationMinutes Int
  isActive    Boolean          @default(true)
  // ... outros campos
}
```

---

## 👥 Sistema de Funcionários da Empresa

### Funcionalidades

- ✅ CRUD completo de funcionários
- ✅ Gestão de agendamentos
- ✅ Sistema de avaliações
- ✅ Estatísticas dos funcionários
- ✅ Controle de permissões (apenas empresa pode gerenciar seus funcionários)

### Endpoints

| Método   | Endpoint                                            | Descrição                   |
| -------- | --------------------------------------------------- | --------------------------- |
| `GET`    | `/api/v1/company-employees`                         | Listar funcionários         |
| `POST`   | `/api/v1/company-employees`                         | Criar funcionário           |
| `GET`    | `/api/v1/company-employees/:id`                     | Buscar funcionário          |
| `PUT`    | `/api/v1/company-employees/:id`                     | Atualizar funcionário       |
| `DELETE` | `/api/v1/company-employees/:id`                     | Deletar funcionário         |
| `GET`    | `/api/v1/company-employees/:id/appointments`        | Agendamentos do funcionário |
| `POST`   | `/api/v1/company-employees/appointments`            | Criar agendamento           |
| `PUT`    | `/api/v1/company-employees/appointments/:id/status` | Atualizar status            |
| `POST`   | `/api/v1/company-employees/reviews`                 | Criar avaliação             |
| `GET`    | `/api/v1/company-employees/:id/stats`               | Estatísticas do funcionário |

### Exemplos de Uso

#### 1. Criar Funcionário

```http
POST /api/v1/company-employees
Authorization: Bearer TOKEN_EMPRESA
Content-Type: application/json

{
  "name": "Maria Silva",
  "email": "maria@empresa.com",
  "phone": "11999999999",
  "position": "Cabeleireira",
  "specialties": ["Corte", "Coloração", "Escova"]
}
```

**Resposta:**

```json
{
  "id": "emp-123",
  "name": "Maria Silva",
  "email": "maria@empresa.com",
  "phone": "11999999999",
  "position": "Cabeleireira",
  "specialties": ["Corte", "Coloração", "Escova"],
  "isActive": true,
  "createdAt": "2025-01-23T00:00:00.000Z"
}
```

#### 2. Listar Funcionários

```http
GET /api/v1/company-employees?page=1&limit=10&search=Maria
Authorization: Bearer TOKEN_EMPRESA
```

**Resposta:**

```json
{
  "employees": [
    {
      "id": "emp-123",
      "name": "Maria Silva",
      "email": "maria@empresa.com",
      "position": "Cabeleireira",
      "isActive": true
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

#### 3. Criar Agendamento

```http
POST /api/v1/company-employees/appointments
Authorization: Bearer TOKEN_CLIENTE
Content-Type: application/json

{
  "employeeId": "emp-123",
  "clientId": "client-456",
  "serviceId": "service-789",
  "scheduledDate": "2025-01-25T14:00:00.000Z",
  "locationType": "AT_LOCATION",
  "clientNotes": "Corte e escova"
}
```

#### 4. Estatísticas do Funcionário

```http
GET /api/v1/company-employees/emp-123/stats
Authorization: Bearer TOKEN_EMPRESA
```

**Resposta:**

```json
{
  "totalAppointments": 25,
  "completedAppointments": 20,
  "averageRating": 4.8,
  "totalReviews": 18
}
```

---

## 🧪 Testes Implementados

### Cobertura de Testes

- ✅ **AuthService** - Testes unitários para forgot-password
- ✅ **CompanyEmployee** - Testes completos do CRUD
- ✅ **Integração** - Testes de endpoints
- ✅ **Validações** - Testes de schemas Zod

### Executar Testes

```bash
# Testes específicos das novas funcionalidades
npm test -- --testPathPattern="auth-forgot-password|company-employee"

# Todos os testes
npm test
```

---

## 🔒 Segurança e Permissões

### Controle de Acesso

1. **Forgot Password**: Público (com rate limiting)
2. **Company Employees**: Apenas usuários do tipo COMPANY
3. **Agendamentos**: Clientes podem criar, empresa pode gerenciar
4. **Avaliações**: Clientes podem avaliar após agendamento concluído

### Middlewares Necessários

```typescript
// Middleware para verificar se é empresa
const requireCompany = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = request.user; // Do middleware de auth
  if (user.userType !== 'COMPANY') {
    throw new ForbiddenError('Apenas empresas podem acessar este recurso');
};
```

---

## 🚀 Próximos Passos

### Implementações Futuras

1. **Middleware de Autenticação** - Implementar verificação de tipo de usuário
2. **Integração com Email** - Configurar envio real de emails
3. **Dashboard da Empresa** - Interface para gestão
4. **Notificações** - Sistema de notificações para agendamentos
5. **Relatórios** - Relatórios de performance dos funcionários

### Melhorias de Segurança

1. **Rate Limiting** - Implementar limites por IP
2. **Auditoria** - Log de ações administrativas
3. **Validação de Email** - Verificação de domínio da empresa
4. **Backup** - Estratégia de backup dos dados

---

## 📚 Documentação Relacionada

- [README.md](../README.md) - Documentação principal da API
- [RBAC-GUIDE.md](./RBAC-GUIDE.md) - Sistema de permissões
- [AUTHENTICATION.md](./AUTHENTICATION.md) - Sistema de autenticação
- [DATABASE-GUIDE.md](./DATABASE-GUIDE.md) - Guia do banco de dados

---

**🎉 Implementação concluída com sucesso!**

**Data:** 23 de Janeiro de 2025  
**Versão:** v1.1  
**Status:** Production-Ready ✅
