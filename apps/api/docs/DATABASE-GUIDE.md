# 🗄️ Guia de Banco de Dados - Quezi App

## 📍 Configuração Atual

**Banco de Dados:** PostgreSQL Local  
**URL de Conexão:** `postgresql://postgres:password@localhost:5432/quezi_db`  
**Localização:** Servidor PostgreSQL instalado na sua máquina local

### Onde os dados são salvos?

Os dados estão sendo salvos **localmente** no seu computador, no diretório de dados do PostgreSQL (geralmente `C:\Program Files\PostgreSQL\{versão}\data` no Windows).

---

## ⚠️ Limitações da Configuração Atual

### 1. **Armazenamento Local**

- ❌ Limitado ao espaço em disco da sua máquina
- ❌ Não acessível de outros computadores
- ❌ Risco de perda de dados se o computador falhar
- ❌ Sem backup automático
- ❌ Não escalável para produção

### 2. **Desenvolvimento vs Produção**

- ✅ **Perfeito para desenvolvimento local**
- ❌ **Inadequado para produção**

---

## 🚀 Opções Recomendadas para Produção

### 1. **Supabase** (Recomendado para MVP) ⭐

**Vantagens:**

- ✅ PostgreSQL gerenciado (baseado em cloud)
- ✅ Plano gratuito generoso
- ✅ Backup automático
- ✅ Autenticação integrada (pode substituir Better Auth)
- ✅ Storage para arquivos
- ✅ APIs REST/GraphQL automáticas
- ✅ Real-time subscriptions

**Plano Gratuito:**

- 500 MB de espaço em banco
- 1 GB de storage para arquivos
- 2 GB de transferência de dados/mês
- Sem limite de requisições
- Backup por 7 dias

**Plano Pro ($25/mês):**

- 8 GB de espaço em banco
- 100 GB de storage
- 250 GB de transferência
- Backup por 30 dias
- Suporte prioritário

**Como Migrar:**

```bash
# 1. Criar conta no Supabase (https://supabase.com)
# 2. Criar novo projeto
# 3. Copiar a Database URL
# 4. Atualizar .env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# 5. Rodar migrations
npx prisma migrate deploy
```

**Estimativa de Crescimento:**

- 1.000 usuários = ~50-100 MB
- 10.000 usuários = ~500 MB - 1 GB
- 100.000 usuários = ~5-10 GB

---

### 2. **Railway** (Desenvolvimento/Produção) 🚂

**Vantagens:**

- ✅ Deploy simplificado
- ✅ PostgreSQL gerenciado
- ✅ Integração com GitHub
- ✅ Monitoramento incluído
- ✅ Escalabilidade automática

**Plano Gratuito:**

- $5 de crédito grátis/mês
- PostgreSQL incluído
- 500 horas de execução/mês

**Plano Hobby ($5/mês):**

- PostgreSQL otimizado
- Backup automático
- Sem limites de execução

**Como Usar:**

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Criar projeto
railway init

# 4. Adicionar PostgreSQL
railway add postgresql

# 5. Copiar DATABASE_URL do dashboard
```

---

### 3. **Neon** (Serverless PostgreSQL) ⚡

**Vantagens:**

- ✅ PostgreSQL serverless
- ✅ Scale-to-zero (paga apenas pelo uso)
- ✅ Branching de banco de dados (como Git)
- ✅ Excelente para preview/staging

**Plano Gratuito:**

- 10 branches de banco
- 3 GB de armazenamento
- Compute hours compartilhados

**Plano Pro ($19/mês):**

- Unlimited branches
- 200 GiB de armazenamento
- Compute hours dedicados

---

### 4. **AWS RDS PostgreSQL** (Enterprise) ☁️

**Vantagens:**

- ✅ Máxima confiabilidade
- ✅ Backup automático multi-região
- ✅ Escalabilidade ilimitada
- ✅ Alta disponibilidade (99.99%)

**Desvantagens:**

- ❌ Mais caro ($15-50+/mês)
- ❌ Configuração complexa
- ❌ Requer conhecimento de AWS

---

### 5. **DigitalOcean Managed PostgreSQL** 🌊

**Vantagens:**

- ✅ Preço justo
- ✅ Interface simples
- ✅ Backup automático
- ✅ Alta performance

**Preços:**

- Basic: $15/mês (1 GB RAM, 10 GB storage)
- Professional: $60/mês (4 GB RAM, 115 GB storage)

---

## 📊 Comparação Rápida

| Opção            | Custo Inicial | Escalabilidade | Complexidade          | Para Quem                  |
| ---------------- | ------------- | -------------- | --------------------- | -------------------------- |
| **Supabase**     | Gratuito      | ⭐⭐⭐⭐       | ⭐ (Fácil)            | MVPs, Startups             |
| **Railway**      | $5/mês        | ⭐⭐⭐⭐       | ⭐⭐ (Médio)          | Aplicações pequenas/médias |
| **Neon**         | Gratuito      | ⭐⭐⭐⭐⭐     | ⭐⭐ (Médio)          | Desenvolvimento moderno    |
| **AWS RDS**      | ~$20/mês      | ⭐⭐⭐⭐⭐     | ⭐⭐⭐⭐⭐ (Complexo) | Enterprise                 |
| **DigitalOcean** | $15/mês       | ⭐⭐⭐⭐       | ⭐⭐⭐ (Médio)        | Produção estável           |

---

## 🎯 Recomendação para o Quezi App

### **Fase 1: MVP/Testes (0-1.000 usuários)**

**Recomendado: Supabase Free Tier**

```env
# .env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

**Por quê?**

- ✅ Gratuito até 500 MB
- ✅ Backup automático
- ✅ Fácil de configurar
- ✅ Escalável quando necessário

---

### **Fase 2: Crescimento (1.000-10.000 usuários)**

**Recomendado: Supabase Pro ($25/mês)**

**Upgrade quando:**

- Banco > 500 MB
- Mais de 1.000 usuários ativos
- Necessidade de backup > 7 dias

---

### **Fase 3: Escala (10.000+ usuários)**

**Recomendado: AWS RDS ou Railway Scale**

**Considere quando:**

- 10.000+ usuários ativos
- Alto tráfego (1M+ requisições/mês)
- Necessidade de múltiplas regiões
- Conformidade com LGPD/GDPR

---

## 🔐 Boas Práticas

### 1. **Backup**

```bash
# Backup manual (desenvolvimento)
pg_dump -h localhost -U postgres -d quezi_db > backup.sql

# Backup automático (produção)
# Use serviços gerenciados que fazem isso automaticamente
```

### 2. **Segurança**

```env
# Nunca commitar credenciais
# Usar variáveis de ambiente
DATABASE_URL="postgresql://..."

# Habilitar SSL em produção
DATABASE_URL="postgresql://...?sslmode=require"
```

### 3. **Monitoramento**

- Use ferramentas como:
  - Supabase Dashboard
  - Railway Dashboard
  - Prisma Studio (desenvolvimento)
  - DataDog/New Relic (produção)

### 4. **Migrations**

```bash
# Sempre versionar migrations
npx prisma migrate dev --name descricao_mudanca

# Em produção, usar:
npx prisma migrate deploy
```

---

## 📈 Estimativa de Custos (1 ano)

### **Cenário 1: Startup (5.000 usuários)**

- **Supabase Pro:** $25/mês = $300/ano
- **Armazenamento:** ~2 GB
- **Total anual:** $300

### **Cenário 2: Crescimento (50.000 usuários)**

- **Supabase Pro + Add-ons:** $50/mês = $600/ano
- **ou Railway Scale:** $100/mês = $1.200/ano
- **Armazenamento:** ~20 GB
- **Total anual:** $600-1.200

### **Cenário 3: Escala (500.000 usuários)**

- **AWS RDS (db.t3.large):** $150/mês = $1.800/ano
- **Armazenamento:** ~200 GB
- **Backup:** $50/mês = $600/ano
- **Total anual:** $2.400

---

## 🚀 Próximos Passos

### **Para Começar (Agora):**

1. **Manter PostgreSQL local para desenvolvimento** ✅
2. **Criar conta no Supabase (gratuito)**
3. **Configurar backup local manual**

### **Antes de Lançar (Beta/MVP):**

1. **Migrar para Supabase Free Tier**
2. **Configurar backup automático**
3. **Testar conexão e performance**
4. **Documentar processo de deploy**

### **Após Validação (Produção):**

1. **Upgrade para Supabase Pro ou Railway**
2. **Implementar monitoramento**
3. **Configurar alertas de uso**
4. **Planejar escalabilidade**

---

## 📚 Recursos Úteis

- [Supabase Docs](https://supabase.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Neon Docs](https://neon.tech/docs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [PostgreSQL Performance](https://wiki.postgresql.org/wiki/Performance_Optimization)

---

## 💡 Dica Final

> **Comece simples, escale quando necessário.**  
> Use PostgreSQL local para desenvolvimento, migre para Supabase Free para o MVP,  
> e só invista em infraestrutura mais robusta quando tiver validação do mercado.

**A melhor estratégia é começar com custos baixos e escalar conforme a demanda real dos usuários!** 🚀
