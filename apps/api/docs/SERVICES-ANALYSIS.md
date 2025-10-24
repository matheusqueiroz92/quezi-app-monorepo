# Análise dos Serviços Oferecidos - Quezi App

## Problema Identificado

Existem **duas entidades diferentes** para serviços oferecidos:

1. **`OfferedService`** - Para profissionais individuais
2. **`CompanyService`** - Para empresas

## Análise das Diferenças

### OfferedService (Profissionais)

- **Proprietário**: `professionalId` (string)
- **Modo de Serviço**: `serviceMode` (AT_LOCATION, AT_DOMICILE, BOTH)
- **Características**: Serviços oferecidos por profissionais autônomos
- **Flexibilidade**: Maior flexibilidade de horários e locais

### CompanyService (Empresas)

- **Proprietário**: `companyId` (string)
- **Modo de Serviço**: Não possui (assume que é da empresa)
- **Características**: Serviços padronizados da empresa
- **Estrutura**: Mais rígida, seguindo padrões da empresa

## Questões de Design

### 1. **Duplicação de Lógica**

- Ambas as entidades têm validações similares
- Métodos similares (create, update, activate, deactivate)
- Schemas de validação duplicados

### 2. **Inconsistência de Interface**

- `OfferedService` tem `serviceMode`
- `CompanyService` não tem `serviceMode`
- Diferentes tipos de proprietário (`professionalId` vs `companyId`)

### 3. **Complexidade de Consultas**

- Buscar todos os serviços de um profissional
- Buscar todos os serviços de uma empresa
- Buscar serviços por categoria (ambos os tipos)

## Propostas de Solução

### Opção 1: Entidade Unificada (Recomendada)

```typescript
interface Service {
  id: string;
  ownerId: string; // Pode ser professionalId ou companyId
  ownerType: "PROFESSIONAL" | "COMPANY";
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  priceType: ServicePriceType;
  duration: number;
  serviceMode?: ServiceMode; // Opcional, apenas para profissionais
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Vantagens:**

- ✅ Elimina duplicação
- ✅ Interface consistente
- ✅ Consultas unificadas
- ✅ Fácil manutenção

**Desvantagens:**

- ❌ Requer refatoração significativa
- ❌ Migração de dados complexa

### Opção 2: Manter Separação com Abstração

```typescript
interface IService {
  id: string;
  ownerId: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  priceType: ServicePriceType;
  duration: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class OfferedService implements IService {
  ownerType: "PROFESSIONAL" = "PROFESSIONAL";
  serviceMode: ServiceMode;
}

class CompanyService implements IService {
  ownerType: "COMPANY" = "COMPANY";
  // serviceMode não aplicável
}
```

**Vantagens:**

- ✅ Mantém separação conceitual
- ✅ Interface comum
- ✅ Menos refatoração

**Desvantagens:**

- ❌ Ainda há duplicação
- ❌ Complexidade de consultas

### Opção 3: Serviços Específicos por Contexto

Manter as entidades separadas mas criar serviços unificados:

```typescript
class ServiceService {
  async getServicesByCategory(categoryId: string): Promise<Service[]> {
    const [professionalServices, companyServices] = await Promise.all([
      this.offeredServiceRepository.findByCategory(categoryId),
      this.companyServiceRepository.findByCategory(categoryId),
    ]);

    return [...professionalServices, ...companyServices];
  }
}
```

## Recomendação

**Opção 1 (Entidade Unificada)** é a mais adequada porque:

1. **Elimina duplicação** de código e lógica
2. **Simplifica consultas** - uma única tabela
3. **Facilita manutenção** - uma única entidade para gerenciar
4. **Melhora performance** - menos JOINs necessários
5. **Interface consistente** para o frontend

## Plano de Migração

1. **Criar nova entidade unificada** `Service`
2. **Migrar dados** existentes
3. **Atualizar repositórios** e serviços
4. **Atualizar controllers** e rotas
5. **Testes** abrangentes
6. **Remover entidades antigas**

## Impacto no Módulo Admin

O módulo admin precisa ser atualizado para:

- Gerenciar serviços unificados
- Filtrar por tipo de proprietário
- Estatísticas consolidadas
- Logs de ações unificados
