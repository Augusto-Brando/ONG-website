# Documentação do Banco de Dados

## Visão Geral

Banco: **PostgreSQL** (local via Docker / Neon em produção)  
ORM: **Drizzle ORM** (schema-first, TypeScript)  
Migrações: pasta `drizzle/` (arquivos `.sql` numerados)  

> **Importante:** a tabela legada `dogs` armazena **cães e gatos** (campo `species` diferencia).

---

## Diagrama Entidade-Relacionamento (Mermaid)

```mermaid
erDiagram
    USERS ||--o{ AUDIT_LOG : "user_id (set null)"
    USERS ||--o{ ADOPTION_REQUESTS : "assigned_to (set null)"
    USERS ||--o{ INTERACTIONS : "user_id (set null)"
    USERS ||--o{ INVENTORY_MOVEMENTS : "user_id (set null)"

    DOGS ||--o{ TREATMENTS : "animal_id (cascade)"
    DOGS ||--o{ ADOPTION_REQUESTS : "animal_id (set null)"

    ADOPTERS ||--o{ ADOPTION_REQUESTS : "adopter_id (cascade)"
    ADOPTION_REQUESTS ||--o{ INTERACTIONS : "request_id (cascade)"

    INVENTORY_ITEMS ||--o{ INVENTORY_MOVEMENTS : "item_id (cascade)"
    DONATIONS ||--o{ INVENTORY_MOVEMENTS : "donation_id (set null)"
    DONATIONS ||--o{ TRANSACTIONS : "donation_id (set null)"
    TREATMENTS ||--o{ TRANSACTIONS : "treatment_id (set null)"
    CAMPAIGNS ||--o{ DONATIONS : "campaign_id (set null)"

    USERS {
        serial id PK
        text name
        text email UK
        text password_hash
        user_role role
        boolean active
        timestamp last_login_at
        timestamp created_at
    }

    AUDIT_LOG {
        serial id PK
        integer user_id FK
        text action
        text entity
        integer entity_id
        jsonb details
        timestamp created_at
    }

    DOGS {
        serial id PK
        text name
        animal_species species
        animal_sex sex
        text breed
        text age
        text weight
        text description
        text observations
        text image_url
        text color
        text[] images
        boolean available
        animal_status status
        boolean castrated
        boolean vaccinated
        date rescued_at
        date adopted_at
        timestamp created_at
    }

    TREATMENTS {
        serial id PK
        integer animal_id FK
        treatment_type type
        text description
        text veterinarian
        date date
        date next_date
        numeric(10,2) cost
        treatment_status status
        text notes
        timestamp created_at
    }

    INVENTORY_ITEMS {
        serial id PK
        text name
        inventory_category category
        text unit
        numeric(12,2) quantity
        numeric(12,2) min_quantity
        text notes
        timestamp created_at
    }

    INVENTORY_MOVEMENTS {
        serial id PK
        integer item_id FK
        movement_type type
        numeric(12,2) quantity
        text reason
        date date
        integer donation_id FK
        integer user_id FK
        timestamp created_at
    }

    CAMPAIGNS {
        serial id PK
        text title
        text description
        numeric(12,2) goal_amount
        date start_date
        date end_date
        boolean active
        timestamp created_at
    }

    DONATIONS {
        serial id PK
        text donor_name
        text donor_email
        text donor_phone
        donation_type type
        numeric(12,2) amount
        text description
        payment_method method
        integer campaign_id FK
        date received_at
        timestamp created_at
    }

    TRANSACTIONS {
        serial id PK
        transaction_kind kind
        text category
        text description
        numeric(12,2) amount
        date date
        integer donation_id FK
        integer treatment_id FK
        timestamp created_at
    }

    ADOPTERS {
        serial id PK
        text name
        text email
        text phone
        text city
        text housing_type
        boolean has_other_pets
        text notes
        boolean consent_lgpd
        timestamp consent_at
        timestamp created_at
    }

    ADOPTION_REQUESTS {
        serial id PK
        integer adopter_id FK
        integer animal_id FK
        adoption_stage stage
        request_source source
        text message
        integer assigned_to FK
        timestamp created_at
        timestamp updated_at
        timestamp closed_at
    }

    INTERACTIONS {
        serial id PK
        integer request_id FK
        integer user_id FK
        interaction_type type
        text content
        timestamp created_at
    }

    VOLUNTEERS {
        serial id PK
        text name
        text email
        text phone
        text availability
        text skills
        boolean active
        boolean consent_lgpd
        timestamp created_at
    }

    NEWS {
        serial id PK
        text title
        text summary
        text content
        text cover_image_url
        boolean published
        timestamp published_at
        timestamp created_at
    }
```

---

## Tabelas e Colunas

### `users` — Usuários do painel administrativo

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | `serial` | ✓ | PK |
| `name` | `text` | ✓ | Nome completo |
| `email` | `text` | ✓ | E-mail único (login) |
| `password_hash` | `text` | ✓ | Hash scrypt (não exposto pela API) |
| `role` | `user_role` | ✓ | Perfil: `admin`, `voluntario`, `financeiro` |
| `active` | `boolean` | ✓ | Se o usuário pode logar |
| `last_login_at` | `timestamp` | | Último acesso |
| `created_at` | `timestamp` | ✓ | Criação do registro |

### `audit_log` — Trilha de auditoria

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | `serial` | ✓ | PK |
| `user_id` | `integer` | | FK → `users.id` (SET NULL) |
| `action` | `text` | ✓ | Ex.: `create`, `update`, `delete`, `login`, `stage_change` |
| `entity` | `text` | ✓ | Nome da entidade afetada (`dogs`, `donations`, etc.) |
| `entity_id` | `integer` | | ID do registro afetado |
| `details` | `jsonb` | | Detalhes extras (sem dados pessoais — LGPD) |
| `created_at` | `timestamp` | ✓ | Quando ocorreu |

> Índice: `audit_log_entity_idx` em `(entity, entity_id)`.

### `dogs` — Animais (cães e gatos)

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | `serial` | ✓ | PK |
| `name` | `text` | ✓ | Nome do animal |
| `species` | `animal_species` | ✓ | `cao` ou `gato` (default `cao`) |
| `sex` | `animal_sex` | ✓ | `macho`, `femea`, `indefinido` (default) |
| `breed` | `text` | ✓ | Raça (default `Vira-lata`) |
| `age` | `text` | ✓ | Idade em formato livre (ex.: `2 anos`, `6 meses`) |
| `weight` | `text` | | Peso (ex.: `12.5 kg`) |
| `description` | `text` | ✓ | Descrição pública (default vazio) |
| `observations` | `text` | | Observações internas |
| `image_url` | `text` | ✓ | Imagem principal (default vazio) |
| `color` | `text` | ✓ | Cor do card no painel (default `#F97316`) |
| `images` | `text[]` | ✓ | Array de URLs de imagens (default `[]`) |
| `available` | `boolean` | ✓ | Visível na vitrine pública (default `true`) |
| `status` | `animal_status` | ✓ | Status interno (default `disponivel`) |
| `castrated` | `boolean` | ✓ | Castrado (default `false`) |
| `vaccinated` | `boolean` | ✓ | Vacinado (default `false`) |
| `rescued_at` | `date` | | Data do resgate |
| `adopted_at` | `date` | | Data da adoção |
| `created_at` | `timestamp` | ✓ | Cadastro |

### `treatments` — Tratamentos veterinários

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | `serial` | ✓ | PK |
| `animal_id` | `integer` | ✓ | FK → `dogs.id` (CASCADE) |
| `type` | `treatment_type` | ✓ | Tipo (ver enum abaixo) |
| `description` | `text` | ✓ | Descrição (default vazio) |
| `veterinarian` | `text` | | Nome do veterinário/clínica |
| `date` | `date` | ✓ | Data do tratamento |
| `next_date` | `date` | | Próxima data prevista |
| `cost` | `numeric(10,2)` | | Custo em R$ |
| `status` | `treatment_status` | ✓ | `agendado`, `realizado`, `cancelado` (default `realizado`) |
| `notes` | `text` | | Observações |
| `created_at` | `timestamp` | ✓ | Cadastro |

> Índice: `treatments_animal_idx` em `animal_id`.  
> **Regra:** tratamento `realizado` com `cost > 0` gera/atualiza automaticamente um lançamento em `transactions` (kind=`despesa`, category=`veterinario`).

### `inventory_items` — Itens de estoque

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | `serial` | ✓ | PK |
| `name` | `text` | ✓ | Nome do item |
| `category` | `inventory_category` | ✓ | Categoria (default `outro`) |
| `unit` | `text` | ✓ | Unidade: `un`, `kg`, `cx`, `ml`... (default `un`) |
| `quantity` | `numeric(12,2)` | ✓ | Saldo atual (default `0`) |
| `min_quantity` | `numeric(12,2)` | ✓ | Estoque mínimo para alerta (default `0`) |
| `notes` | `text` | | Observações |
| `created_at` | `timestamp` | ✓ | Cadastro |

> **Regra:** o campo `quantity` **só muda** via `inventory_movements` (entradas/saídas).

### `inventory_movements` — Movimentações de estoque

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | `serial` | ✓ | PK |
| `item_id` | `integer` | ✓ | FK → `inventory_items.id` (CASCADE) |
| `type` | `movement_type` | ✓ | `entrada` ou `saida` |
| `quantity` | `numeric(12,2)` | ✓ | Quantidade movimentada |
| `reason` | `text` | ✓ | Motivo (default vazio) |
| `date` | `date` | ✓ | Data da movimentação |
| `donation_id` | `integer` | | FK → `donations.id` (SET NULL) — entrada via doação |
| `user_id` | `integer` | | FK → `users.id` (SET NULL) — quem registrou |
| `created_at` | `timestamp` | ✓ | Registro |

> Índice: `inventory_movements_item_idx` em `item_id`.  
> **Regra:** `saida` maior que o saldo atual → erro 409 (`Saldo insuficiente`).

### `campaigns` — Campanhas de arrecadação

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | `serial` | ✓ | PK |
| `title` | `text` | ✓ | Título |
| `description` | `text` | ✓ | Descrição (default vazio) |
| `goal_amount` | `numeric(12,2)` | | Meta em R$ |
| `start_date` | `date` | ✓ | Início |
| `end_date` | `date` | | Término |
| `active` | `boolean` | ✓ | Ativa (default `true`) |
| `created_at` | `timestamp` | ✓ | Cadastro |

### `donations` — Doações recebidas

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | `serial` | ✓ | PK |
| `donor_name` | `text` | | Nome do doador (null = anônimo) |
| `donor_email` | `text` | | E-mail do doador |
| `donor_phone` | `text` | | Telefone do doador |
| `type` | `donation_type` | ✓ | Tipo (default `dinheiro`) |
| `amount` | `numeric(12,2)` | | Valor em R$ (apenas para `dinheiro`) |
| `description` | `text` | ✓ | Descrição (default vazio) |
| `method` | `payment_method` | | Forma de pagamento |
| `campaign_id` | `integer` | | FK → `campaigns.id` (SET NULL) |
| `received_at` | `date` | ✓ | Data do recebimento |
| `created_at` | `timestamp` | ✓ | Cadastro |

> Índice: `donations_received_idx` em `received_at`.  
> **Regra:** doação `dinheiro` com `amount > 0` gera automaticamente um lançamento em `transactions` (kind=`receita`, category=`doacao`).

### `transactions` — Lançamentos financeiros

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | `serial` | ✓ | PK |
| `kind` | `transaction_kind` | ✓ | `receita` ou `despesa` |
| `category` | `text` | ✓ | Categoria livre (ex.: `doacao`, `veterinario`, `racao`, `aluguel`) |
| `description` | `text` | ✓ | Descrição (default vazio) |
| `amount` | `numeric(12,2)` | ✓ | Valor **sempre positivo** |
| `date` | `date` | ✓ | Data do lançamento |
| `donation_id` | `integer` | | FK → `donations.id` (SET NULL) — gerado por doação |
| `treatment_id` | `integer` | | FK → `treatments.id` (SET NULL) — gerado por tratamento |
| `created_at` | `timestamp` | ✓ | Cadastro |

> Índice: `transactions_date_idx` em `date`.  
> **Regra:** lançamentos com `donation_id` ou `treatment_id` **não podem ser editados/excluídos diretamente** — altere a doação/tratamento original.

### `adopters` — Interessados em adoção

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | `serial` | ✓ | PK |
| `name` | `text` | ✓ | Nome |
| `email` | `text` | | E-mail |
| `phone` | `text` | ✓ | Telefone |
| `city` | `text` | | Cidade |
| `housing_type` | `text` | | Tipo de moradia (casa, apartamento...) |
| `has_other_pets` | `boolean` | | Tem outros pets |
| `notes` | `text` | | Observações |
| `consent_lgpd` | `boolean` | ✓ | Consentimento LGPD (default `false`) |
| `consent_at` | `timestamp` | | Quando consentiu |
| `created_at` | `timestamp` | ✓ | Cadastro |

### `adoption_requests` — Solicitações de adoção

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | `serial` | ✓ | PK |
| `adopter_id` | `integer` | ✓ | FK → `adopters.id` (CASCADE) |
| `animal_id` | `integer` | | FK → `dogs.id` (SET NULL) |
| `stage` | `adoption_stage` | ✓ | Etapa atual (default `novo`) |
| `source` | `request_source` | ✓ | Origem (default `site`) |
| `message` | `text` | ✓ | Mensagem do interessado (default vazio) |
| `assigned_to` | `integer` | | FK → `users.id` (SET NULL) — responsável |
| `created_at` | `timestamp` | ✓ | Criação |
| `updated_at` | `timestamp` | ✓ | Última atualização |
| `closed_at` | `timestamp` | | Quando fechou (etapas finais) |

> Índice: `adoption_requests_stage_idx` em `stage`.  
> **Regra:** mudança de etapa para `adotado`/`pos_adocao` → animal fica `status=adotado`, `available=false`, `adopted_at=hoje`.  
> Voltar de etapa final → animal volta a `disponivel`/`em_processo` e `adopted_at=null`.

### `interactions` — Histórico de interações na adoção

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | `serial` | ✓ | PK |
| `request_id` | `integer` | ✓ | FK → `adoption_requests.id` (CASCADE) |
| `user_id` | `integer` | | FK → `users.id` (SET NULL) — quem registrou |
| `type` | `interaction_type` | ✓ | Tipo (default `nota`) |
| `content` | `text` | ✓ | Conteúdo da interação |
| `created_at` | `timestamp` | ✓ | Registro |

> Índice: `interactions_request_idx` em `request_id`.

### `volunteers` — Voluntários cadastrados

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | `serial` | ✓ | PK |
| `name` | `text` | ✓ | Nome |
| `email` | `text` | | E-mail |
| `phone` | `text` | | Telefone |
| `availability` | `text` | | Disponibilidade (ex.: `sábados de manhã`) |
| `skills` | `text` | | Habilidades |
| `active` | `boolean` | ✓ | Ativo (default `true`) |
| `consent_lgpd` | `boolean` | ✓ | Consentimento LGPD (default `false`) |
| `created_at` | `timestamp` | ✓ | Cadastro |

### `news` — Notícias do site

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | `serial` | ✓ | PK |
| `title` | `text` | ✓ | Título |
| `summary` | `text` | ✓ | Resumo (default vazio) |
| `content` | `text` | ✓ | Conteúdo completo (default vazio) |
| `cover_image_url` | `text` | ✓ | Imagem de capa (default vazio) |
| `published` | `boolean` | ✓ | Publicada (default `true`) |
| `published_at` | `timestamp` | ✓ | Data de publicação (default now) |
| `created_at` | `timestamp` | ✓ | Cadastro |

---

## Enums (valores permitidos)

| Enum | Valores |
|------|---------|
| `user_role` | `admin`, `voluntario`, `financeiro` |
| `animal_species` | `cao`, `gato` |
| `animal_sex` | `macho`, `femea`, `indefinido` |
| `animal_status` | `disponivel`, `em_tratamento`, `em_processo`, `adotado`, `indisponivel` |
| `treatment_type` | `vacina`, `vermifugo`, `castracao`, `consulta`, `medicacao`, `cirurgia`, `exame`, `outro` |
| `treatment_status` | `agendado`, `realizado`, `cancelado` |
| `inventory_category` | `racao`, `medicamento`, `higiene`, `limpeza`, `acessorio`, `outro` |
| `movement_type` | `entrada`, `saida` |
| `donation_type` | `dinheiro`, `racao`, `medicamento`, `material`, `outro` |
| `payment_method` | `pix`, `dinheiro`, `transferencia`, `cartao`, `outro` |
| `transaction_kind` | `receita`, `despesa` |
| `adoption_stage` | `novo`, `triagem`, `entrevista`, `visita`, `aprovado`, `adotado`, `pos_adocao`, `recusado`, `desistiu` |
| `request_source` | `site`, `whatsapp`, `instagram`, `evento`, `outro` |
| `interaction_type` | `nota`, `ligacao`, `whatsapp`, `email`, `visita`, `mudanca_etapa` |

---

## Migrações

Pasta: `drizzle/`

| Arquivo | Descrição |
|---------|-----------|
| `0000_inicial.sql` | Tabelas legadas: `dogs` (campos básicos) e `news` |
| `0001_erp_crm.sql` | Cria todos os enums, tabelas novas (users, audit_log, treatments, inventory, campaigns, donations, transactions, adopters, adoption_requests, interactions, volunteers), adiciona colunas em `dogs` (species, sex, status, castrated, vaccinated, rescued_at, adopted_at), cria todas as FKs, índices e constraints |

### Como gerar/aplicar migrações

```bash
# Gerar nova migração após alterar lib/schema.ts
npx drizzle-kit generate

# Aplicar migrações no banco local (container Docker)
docker compose exec -T db psql -U ong -d ong -f drizzle/000X_nome.sql

# Ou via Drizzle Kit (se configurado)
npx drizzle-kit migrate
```

> **Produção (Neon):** a migração `0000_inicial` já existe (tabelas `dogs` e `news`). Marque-a como aplicada e aplique apenas a `0001_erp_crm`.

---

## Regras de Integridade Referencial

| Tabela Filho | Coluna FK | Tabela Pai | On Delete | On Update |
|--------------|-----------|------------|-----------|-----------|
| `audit_log` | `user_id` | `users` | `SET NULL` | `NO ACTION` |
| `adoption_requests` | `adopter_id` | `adopters` | `CASCADE` | `NO ACTION` |
| `adoption_requests` | `animal_id` | `dogs` | `SET NULL` | `NO ACTION` |
| `adoption_requests` | `assigned_to` | `users` | `SET NULL` | `NO ACTION` |
| `interactions` | `request_id` | `adoption_requests` | `CASCADE` | `NO ACTION` |
| `interactions` | `user_id` | `users` | `SET NULL` | `NO ACTION` |
| `inventory_movements` | `item_id` | `inventory_items` | `CASCADE` | `NO ACTION` |
| `inventory_movements` | `donation_id` | `donations` | `SET NULL` | `NO ACTION` |
| `inventory_movements` | `user_id` | `users` | `SET NULL` | `NO ACTION` |
| `donations` | `campaign_id` | `campaigns` | `SET NULL` | `NO ACTION` |
| `transactions` | `donation_id` | `donations` | `SET NULL` | `NO ACTION` |
| `transactions` | `treatment_id` | `treatments` | `SET NULL` | `NO ACTION` |
| `treatments` | `animal_id` | `dogs` | `CASCADE` | `NO ACTION` |

### Resumo das regras de negócio ligadas à integridade

1. **Exclusão em cascata (`CASCADE`):**
   - Apagar um **animal** remove seus **tratamentos**.
   - Apagar um **interessado** remove suas **solicitações de adoção**.
   - Apagar uma **solicitação** remove suas **interações**.
   - Apagar um **item de estoque** remove suas **movimentações**.

2. **Set null (`SET NULL`):**
   - Apagar um **usuário** mantém o log de auditoria, interações, movimentações de estoque, apenas zerando `user_id`.
   - Apagar um **animal** mantém a solicitação de adoção, mas zera `animal_id`.
   - Apagar uma **doação** mantém o lançamento financeiro, mas zera `donation_id`.
   - Apagar um **tratamento** mantém o lançamento financeiro, mas zera `treatment_id`.
   - Apagar uma **campanha** mantém as doações, mas zera `campaign_id`.

3. **Proteções de negócio (não no banco, na API):**
   - Não se pode excluir o **último admin ativo** (ver `lib/users.ts` → `hasOtherActiveAdmin`).
   - Não se pode excluir a si mesmo.
   - Lançamentos financeiros gerados por doação/tratamento são **somente leitura** via `/api/transactions` — edite a origem.
   - Saída de estoque maior que o saldo → erro 409.