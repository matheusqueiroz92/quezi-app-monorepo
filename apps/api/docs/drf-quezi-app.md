# 📘 DOCUMENTO DE REQUISITOS FUNCIONAIS (DRF) - MVP V1.0

## Nome do Projeto: **Quezi App**

**Versão:** 1.0 (MVP - Mínimo Produto Viável)  
**Foco:** Lançamento regional inicial (Vitória da Conquista e cidades vizinhas)  
**Objetivo:** Validar a demanda por agendamento de serviços, a aceitação de profissionais e a experiência de busca e contratação.

---

## 1. REQUISITOS DE USUÁRIOS

A aplicação terá **três perfis principais**:

| Tipo de Usuário  | Objetivo Principal                                                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Cliente**      | Buscar, visualizar e solicitar agendamentos de serviços.                                                                            |
| **Profissional** | Criar um perfil, listar seus serviços e gerenciar suas solicitações de agendamento.                                                 |
| **Admin**        | Gerenciar usuários e categorias (acesso apenas via painel web interno, não faz parte do escopo de desenvolvimento do front-end V1). |

---

## 2. MÓDULOS E REQUISITOS FUNCIONAIS (ESCOPO DO MVP)

---

### 🧩 Módulo 1: Autenticação e Autorização (Sem Alteração)

| ID         | Requisito                                                              | Observações - Escopo V1     |
| ---------- | ---------------------------------------------------------------------- | --------------------------- |
| **RF-A.1** | O usuário deve conseguir se registrar e logar usando e-mail e senha.   | Login tradicional.          |
| **RF-A.2** | O usuário deve conseguir fazer login usando sua conta do Google.       | Implementação de OAuth 2.0. |
| **RF-A.3** | O sistema deve distinguir o tipo de usuário (Cliente ou Profissional). | —                           |
| **RF-A.4** | O sistema deve ter um fluxo de Recuperação de Senha por e-mail.        | —                           |

---

### 💅 Módulo 2: Cliente (Frontend Web & Mobile) - **COM ALTERAÇÕES**

| ID           | Requisito (O que o sistema deve fazer)                                                                                      | Observações - Escopo V1                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **RF-C.1**   | O Cliente deve conseguir buscar e filtrar Profissionais por Categoria de Serviço (focadas em Beleza/Estética).              | Ex: Manicure, Maquiagem, Cabeleireiro.                                                                        |
| **RF-C.2**   | O Cliente deve conseguir visualizar a Lista de Profissionais com Nome, Foto, Avaliação Média e uma breve descrição.         | —                                                                                                             |
| **RF-C.3**   | O Cliente deve conseguir visualizar o Perfil Detalhado do Profissional.                                                     | Inclui: Serviços, Duração Estimada, Preços e Modos de Atendimento disponíveis (Domicílio e/ou Local Próprio). |
| **RF-C.4**   | O Cliente deve conseguir solicitar um Agendamento através de um formulário.                                                 | Campos: Data, Hora, Serviço Escolhido (com duração implícita).                                                |
| **RF-C.4.1** | **NOVO REQUISITO:** Durante a solicitação, o Cliente deve selecionar o Local de Atendimento (Local Próprio ou A Domicílio). | Opções conforme o `serviceMode` do profissional.                                                              |
| **RF-C.4.2** | **NOVO REQUISITO:** Se o Cliente escolher “A Domicílio”, deve informar o endereço completo.                                 | Este endereço será armazenado no `Appointment`.                                                               |
| **RF-C.5**   | O Cliente deve ter uma tela para acompanhar o Status de seus Agendamentos.                                                  | Status: Pendente, Aceito, Recusado, Concluído.                                                                |
| **RF-C.6**   | Após a conclusão do serviço, o Cliente deve ser solicitado a deixar uma Avaliação (nota de 1 a 5).                          | —                                                                                                             |

---

### 💼 Módulo 3: Profissional (Frontend Web & Mobile) - **COM ALTERAÇÕES**

| ID           | Requisito (O que o sistema deve fazer)                                                                         | Observações - Escopo V1                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **RF-P.1**   | O Profissional deve conseguir completar e editar seu Perfil.                                                   | Inclui configuração do(s) modo(s) de Atendimento.                                                       |
| **RF-P.1.1** | **NOVO REQUISITO:** O Profissional deve definir seu Modo de Atendimento (Local Próprio, A Domicílio ou Ambos). | Se escolher Local Próprio ou Ambos, deve fornecer o endereço.                                           |
| **RF-P.2**   | O Profissional deve conseguir cadastrar seus Serviços (Nome, Categoria, Preço).                                | Agora inclui o campo obrigatório de Duração Estimada (em minutos).                                      |
| **RF-P.3**   | O Profissional deve conseguir visualizar suas Solicitações de Agendamento Pendentes.                           | A listagem deve mostrar o Local de Atendimento escolhido (e o endereço do cliente, se for a domicílio). |
| **RF-P.4**   | O Profissional deve conseguir Aceitar ou Recusar uma Solicitação de Agendamento.                               | —                                                                                                       |
| **RF-P.5**   | O Profissional deve conseguir marcar um serviço como Concluído.                                                | —                                                                                                       |
| **RF-P.6**   | O Profissional deve conseguir visualizar suas Avaliações e a Média de suas Notas.                              | —                                                                                                       |

---

### ⚙️ Módulo 4: Infraestrutura e Backend (API) - **COM ALTERAÇÕES**

| ID           | Requisito (O que o sistema deve fazer)                                                                                            | Observações - Escopo V1 |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| **RF-B.1**   | A API deve fornecer endpoints RESTful para todos os CRUDs.                                                                        | —                       |
| **RF-B.1.1** | **NOVO REQUISITO:** A API deve validar a Duração e o Modo de Serviço na criação/atualização de `Service` e `ProfessionalProfile`. | Garante dados íntegros. |
| **RF-B.2**   | O sistema deve ter a lógica para calcular a Avaliação Média.                                                                      | —                       |
| **RF-B.3**   | O sistema deve enviar Notificações por E-mail para as ações críticas.                                                             | —                       |
| **RF-B.4**   | A API deve ser documentada via Swagger/OpenAPI.                                                                                   | —                       |
| **RF-B.5**   | A aplicação deve ser containerizada (Docker).                                                                                     | —                       |

---

## 3. EXCLUSÕES DO ESCOPO

Mantêm-se as exclusões originais, pois o foco deve continuar sendo o lançamento rápido e a validação do **core loop**.

| Funcionalidade Excluída                     | Razão da Exclusão                                                                  |
| ------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Sistema de Pagamento Integrado (In-App)** | Complexidade regulatória. Pagamento acertado fora do app na V1.                    |
| **Chat em Tempo Real (WebSockets)**         | Adiciona complexidade de infraestrutura. Comunicação via e-mail/telefone na V1.    |
| **Geolocalização Avançada/Mapa**            | Busca inicial baseada em endereço/cidade. Geolocalização fica para a V2/V3.        |
| **Listagem de Portfólio (Imagens/Vídeos)**  | Profissionais usam link externo na V1. Upload de arquivos será implementado na V2. |
| **Notificações Push (Mobile)**              | Foco na comunicação via E-mail para transações críticas na V1.                     |

---

📄 **Fim do Documento**
