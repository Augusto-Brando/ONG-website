# Referência da API

## Autenticação

Todas as rotas do painel (exceto `/api/auth` e `/api/public/*`) exigem **sessão ativa** via cookie HTTP-only assinado (HMAC-SHA256).

### Cookie de sessão

- **Nome:** `admin_session`
- **Assinatura:** HMAC-SHA256 com `SESSION_SECRET` (mín. 16 chars, definido no `.env`)
- **Expiração:** 12 horas
- **Flags:** `HttpOnly`, `Secure` (produção), `SameSite=Strict`, `Path=/`

### Login

```bash
# Obter cookie de sessão
curl -s -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ong.local","password":"ong12345"}' \
  http://localhost:3000/api/auth
```

Resposta 200:
```json
{ "success": true, "name": "Administrador", "role": "admin" }
```

O cookie fica salvo em `cookies.txt`. Use `-b cookies.txt` nas requisições seguintes.

### Verificar sessão atual

```bash
curl -s -b cookies.txt http://localhost:3000/api/auth
```

Resposta 200:
```json
{ "uid": 1, "name": "Administrador", "role": "admin" }
```

### Logout

```bash
curl -s -b cookies.txt -X DELETE http://localhost:3000/api/auth
```

---

## Perfis e Permissões (Áreas)

Cada rota valida a permissão via `requireArea('<area>')`. A tabela `PERMISSIONS` em `lib/auth.ts`:

| Perfil | Áreas permitidas |
|--------|------------------|
| `admin` | **todas** (`*`) |
| `voluntario` | `dashboard`, `animais`, `tratamentos`, `estoque`, `adocoes`, `noticias`, `voluntarios` |
| `financeiro` | `dashboard`, `doacoes`, `financeiro`, `relatorios`, `estoque` |

**Áreas existentes:** `dashboard`, `animais`, `tratamentos`, `estoque`, `adocoes`, `doacoes`, `financeiro`, `relatorios`, `noticias`, `voluntarios`, `usuarios`.

### Códigos de erro de autorização

| Código | Significado |
|--------|-------------|
| 401 | Não autenticado (cookie ausente/inválido/expirado) |
| 403 | Autenticado mas sem permissão para a área |

---

## Validação de Entrada

Todas as rotas que gravam dados usam **Zod** (`lib/validators.ts`). Erros de validação retornam **400** com:

```json
{
  "error": "Dados inválidos",
  "issues": {
    "campo": ["mensagem de erro"]
  }
}
```

**Formatos esperados:**
- Datas: `AAAA-MM-DD` (ex.: `2025-12-25`)
- Valores monetários/quantidades: número (ex.: `150.50`) — o Drizzle guarda como `string` no banco
- Enums: string exata (minúsculas, sem acento)

---

## Rotas da API

> **Legenda:**  
> 🔒 = requer autenticação + área indicada  
> 🌐 = pública (sem login)  
> 📄 = usa `parseBody` + validador Zod  
> 📝 = registra auditoria via `audit()`

---

### `GET /api/auth` 🔒
Verifica sessão atual.

**Resposta 200:**
```json
{ "uid": 1, "name": "Administrador", "role": "admin" }
```

---

### `POST /api/auth` 🌐
Login. Body: `loginInput` (email opcional, password obrigatório).  
Rate limit: 10 tentativas / 15 min por IP.

**Resposta 200:** cookie `admin_session` + `{ success: true, name, role }`  
**Erros:** 401 (credenciais), 429 (rate limit)

---

### `DELETE /api/auth` 🔒
Logout. Limpa o cookie.

**Resposta 200:** `{ success: true }`

---

### `GET /api/health` 🌐
Health check público (para monitoramento).

**Resposta 200:**
```json
{ "status": "ok", "db": "ok", "time": "2025-12-25T10:30:00.000Z" }
```
**Resposta 503 (banco indisponível):**
```json
{ "status": "ok", "db": "erro", "time": "..." }
```

---

### `GET /api/dashboard` 🔒 `dashboard`
Painel gerencial — agregados de todas as áreas permitidas ao usuário.

**Resposta 200:**
```json
{
  "animais": { "total": 50, "disponiveis": 30, "emTratamento": 5, "emProcesso": 10, "adotados": 5, "porEspecie": { "cao": 40, "gato": 10 } },
  "adocoes": { "abertas": 12, "porEtapa": { "novo": 5, "triagem": 3, "entrevista": 2, "aprovado": 2 }, "concluidasNoMes": 4 },
  "doacoes": { "totalMes": 2500.00, "quantidadeMes": 15, "porMes": [ { "mes": "2025-07", "total": 1800 }, ... ] },
  "financeiro": { "receitasMes": 3000, "despesasMes": 1200, "saldoMes": 1800, "porMes": [ { "mes": "2025-07", "receitas": 2500, "despesas": 1000 }, ... ] },
  "estoque": { "itens": 25, "abaixoDoMinimo": [ { "id": 3, "name": "Ração filhote", "quantity": 2, "minQuantity": 5, "unit": "kg" } ] },
  "tratamentos": { "proximos": [ { "id": 7, "animal": "Rex", "type": "vacina", "date": "2025-08-01" } ] }
}
```
*Cada bloco só vem se o usuário tem permissão na área correspondente; caso contrário `null`.*

---

## Animais (`/api/dogs`) — Área: `animais`

### `GET /api/dogs` 🔒
Lista todos os animais (ordem de cadastro).

**Resposta 200:** array de objetos `Dog` (ver schema).

---

### `POST /api/dogs` 🔒 📄 📝
Cria animal. **Multipart/form-data** (não JSON).  
Campos: `name`, `breed`, `age`, `weight`, `description`, `observations`, `color`, `available`, `species`, `sex`, `rescuedAt`, `castrated`, `vaccinated`, `photos[]` (arquivos), `existingImages[]` (JSON array de URLs).

**Validador:** campos obrigatórios `name`, `age`.  
**Resposta 201:** animal criado.  
**Erros:** 400 (nome/idade ausentes), 403, 401.

---

### `PUT /api/dogs/[id]` 🔒 📄 📝
Atualiza animal. **Multipart/form-data**. Mesmos campos do POST.  
Remove imagens antigas do Vercel Blob que não estão mais no conjunto.

**Resposta 200:** animal atualizado.  
**Erros:** 400, 404, 403, 401.

---

### `DELETE /api/dogs/[id]` 🔒 📝
Remove animal. Apaga imagens do Vercel Blob.

**Resposta 200:** `{ success: true }`  
**Erros:** 404, 403, 401.

---

## Tratamentos (`/api/treatments`) — Área: `tratamentos`

### `GET /api/treatments` 🔒
Lista tratamentos. Query params: `animalId`, `status` (`agendado|realizado|cancelado`).

**Resposta 200:** array com `animal` (id, name, species) incluso.

---

### `POST /api/treatments` 🔒 📄 📝
Cria tratamento. Body: `treatmentInput`.

**Campos obrigatórios:** `animalId`, `type`, `date`.  
**Regras:** se `status=realizado` e `cost>0` → cria/atualiza lançamento em `transactions` (despesa, categoria `veterinario`).

**Resposta 201:** tratamento criado.  
**Erros:** 400 (validação), 404 (animal não existe), 403, 401.

---

### `PUT /api/treatments/[id]` 🔒 📄 📝
Atualiza tratamento. Body: `treatmentInput`.  
Mantém lançamento financeiro coerente (cria/atualiza/remove conforme `status` e `cost`).

**Resposta 200:** tratamento atualizado.  
**Erros:** 400, 404, 403, 401.

---

### `DELETE /api/treatments/[id]` 🔒 📝
Remove tratamento. Apaga lançamento financeiro vinculado antes.

**Resposta 200:** `{ success: true }`  
**Erros:** 404, 403, 401.

---

## Estoque — Área: `estoque`

### Itens: `GET/POST /api/inventory` 🔒 📄 📝
- **GET:** lista itens + flag `low` (quantity < minQuantity).
- **POST:** cria item. Body: `inventoryItemInput`. `quantity` inicia em `0` (só muda via movimentações).

### Item unitário: `PUT/DELETE /api/inventory/[id]` 🔒 📄 📝
- **PUT:** edita (exceto `quantity`). Body: `inventoryItemInput`.
- **DELETE:** remove item (cascata remove movimentações).

---

### Movimentações: `GET/POST /api/inventory/movements` 🔒 📄 📝
- **GET:** lista últimas 100. Query: `itemId`.
- **POST:** registra entrada/saída. Body: `inventoryMovementInput`.
  - **Regra:** `saida` com `quantity > saldo_atual` → **409** `Saldo insuficiente`.
  - Atualiza `inventoryItems.quantity` atomicamente via SQL (`quantity + delta`).

**Resposta 201:** movimentação criada.  
**Erros:** 400, 404 (item), 409 (saldo), 403, 401.

---

## Campanhas (`/api/campaigns`) — Área: `doacoes`

### `GET /api/campaigns` 🔒
Lista campanhas com `raised` (total arrecadado) e `donationsCount`.

---

### `POST /api/campaigns` 🔒 📄 📝
Cria campanha. Body: `campaignInput`.

**Resposta 201:** campanha criada.  
**Erros:** 400, 403, 401.

---

### `PUT/DELETE /api/campaigns/[id]` 🔒 📄 📝
Edita ou remove campanha.

**Resposta 200/201:** campanha / `{ success: true }`  
**Erros:** 400, 404, 403, 401.

---

## Doações (`/api/donations`) — Área: `doacoes`

### `GET /api/donations` 🔒
Lista com filtros: `from` (AAAA-MM-DD), `to`, `type` (enum `donation_type`).  
Inclui `campaign` (id, title) se houver.

---

### `POST /api/donations` 🔒 📄 📝
Cria doação. Body: `donationInput`.

**Regras:**
- `campaignId` deve existir (se enviado).
- `type=dinheiro` + `amount>0` → cria lançamento `receita` categoria `doacao` em `transactions` (rollback se falhar).

**Resposta 201:** doação criada + `campaign` se houver.  
**Erros:** 400, 404 (campanha), 500 (falha no lançamento), 403, 401.

---

### `PUT /api/donations/[id]` 🔒 📄 📝
Atualiza doação. Mantém lançamento financeiro sincronizado (cria/atualiza/remove conforme tipo/valor).

**Resposta 200:** doação atualizada.  
**Erros:** 400, 404, 403, 401.

---

### `DELETE /api/donations/[id]` 🔒 📝
Remove doação. Apaga lançamento vinculado antes.

**Resposta 200:** `{ success: true }`  
**Erros:** 404, 403, 401.

---

## Financeiro (`/api/transactions`) — Área: `financeiro`

### `GET /api/transactions` 🔒
Lista com filtros: `from`, `to`, `kind` (`receita|despesa`).  
Inclui `summary` (receitas, despesas, saldo) do período filtrado.

---

### `POST /api/transactions` 🔒 📄 📝
Cria lançamento manual. Body: `transactionInput`.

**Regra:** `donationId` **não permitido** (lançamentos de doação nascem no POST `/api/donations`).  
**Resposta 201:** lançamento criado.  
**Erros:** 400 (validação, donationId), 403, 401.

---

### `PUT/DELETE /api/transactions/[id]` 🔒 📄 📝
Edita/exclui lançamento **manual apenas**.  
Se `donationId` ou `treatmentId` preenchido → **409** `Altere pela doação/tratamento`.

**Resposta 200/201:** lançamento / `{ success: true }`  
**Erros:** 400, 404, 409 (protegido), 403, 401.

---

## CRM de Adoções — Área: `adocoes`

### Interessados: `GET/POST /api/adopters` 🔒 📄 📝
- **GET:** lista ordenada por nome.
- **POST:** cria. Body: `adopterInput`. `consentLgpd=true` seta `consentAt=now`.

### Interessado: `PUT/DELETE /api/adopters/[id]` 🔒 📝
- **PUT:** atualiza. Body: `adopterInput`. 400 (dados ou id inválidos), 404 (não encontrado).
- **DELETE:** remove o interessado e, em cascata, as solicitações e interações dele. 404 se não existir.

---

### Solicitações: `GET/POST /api/adoption-requests` 🔒 📄 📝
- **GET:** lista com `adopter` (name, phone, email, city) e `animal` (id, name, imageUrl).
- **POST:** cria. Body: `adoptionRequestInput`. Valida `adopterId` e `animalId` (se enviado).

---

### Detalhe: `GET/DELETE /api/adoption-requests/[id]` 🔒 📝
- **GET:** solicitação completa + `adopter` + `animal` + `interactions[]` (histórico).
- **DELETE:** remove solicitação.

---

### Mudança de etapa: `PATCH /api/adoption-requests/[id]/stage` 🔒 📄 📝
Body: `stageChangeInput` (`stage`, `note?`).

**Efeitos automáticos:**
| Nova etapa | Animal (se vinculado) |
|------------|----------------------|
| `adotado`, `pos_adocao` | `status=adotado`, `available=false`, `adoptedAt=hoje` |
| Voltar de etapa final (`adotado`/`pos_adocao`) | `status=disponivel`/`em_processo`, `available=true`, `adoptedAt=null` |
| `triagem`..`aprovado` | `status=em_processo` |
| `recusado`, `desistiu` (se animal `em_processo`) | `status=disponivel` |

Grava `interaction` tipo `mudanca_etapa`. Envia e-mail ao interessado (se tiver e-mail). Seta `closedAt` nas etapas finais (`adotado`, `recusado`, `desistiu`).

**Resposta 200:** solicitação atualizada.  
**Erros:** 400, 404, 403, 401.

---

### Interações: `POST /api/adoption-requests/[id]/interactions` 🔒 📄 📝
Registra nota/ligação/whatsapp... Body: `interactionInput` (`type`, `content`).

**Resposta 201:** interação criada.  
**Erros:** 400, 404, 403, 401.

---

### Formulário público: `POST /api/public/adoption` 🌐 📄
**Sem login.** Cria `adopter` (com `consentLgpd=true`) + `adoption_request` (`stage=novo`, `source=site`).  
Validador: `publicAdoptionInput`. Honeypot `website` (deve vir vazio).  
Rate limit: 5 req/10min por IP + 30 req/10min global.

**Resposta 201:** `{ success: true }` (nunca expõe dados pessoais).  
**Erros:** 400 (validação), 400 (animal indisponível), 429 (rate limit), 500.

---

## Usuários (`/api/users`) — Área: `usuarios`

### `GET /api/users` 🔒
Lista usuários (sem `password_hash`). Usa `publicUser`.

---

### `POST /api/users` 🔒 📄 📝
Cria usuário. Body: `userInput` + `password` obrigatória (mín. 8 chars).  
Hash scrypt gravado em `password_hash`.

**Resposta 201:** usuário criado (sem hash).  
**Erros:** 400 (senha), 409 (e-mail duplicado), 403, 401.

---

### `PUT/DELETE /api/users/[id]` 🔒 📄 📝
- **PUT:** edita. `password` opcional (se enviada, re-hash). Protege: não permite remover o último admin ativo nem desativar a si mesmo.
- **DELETE:** remove. Mesmas proteções.

**Resposta 200/201:** usuário / `{ success: true }`  
**Erros:** 400, 404, 409 (último admin / auto-exclusão), 403, 401.

---

## Voluntários (`/api/volunteers`) — Área: `voluntarios`

### `GET/POST /api/volunteers` 🔒 📄 📝
- **GET:** lista (mais recentes primeiro).
- **POST:** cria. Body: `volunteerInput`.

---

### `PUT/DELETE /api/volunteers/[id]` 🔒 📄 📝
Edita/remove voluntário.

---

## Notícias (`/api/news`) — Área: `noticias`

### `GET /api/news` 🌐
**Pública** — lista todas (ordem `publishedAt` desc).

---

### `POST /api/news` 🔒 📄
Cria notícia. **Multipart/form-data**: `title`, `summary`, `content`, `published`, `publishedAt`, `cover` (arquivo), `coverImageUrl`.

**Resposta 201:** notícia criada.  
**Erros:** 400, 403, 401.

---

### `PUT/DELETE /api/news/[id]` 🔒 📄
Edita/remove. Remove imagem antiga do Vercel Blob se substituída/excluída.

---

## Exportação (`/api/export/[entity]`) — Área: `relatorios`

### `GET /api/export/:entity` 🔒
Gera CSV. Entidades válidas: `animais`, `adocoes`, `doacoes`, `financeiro`, `estoque`, `tratamentos`.  
Query params: `from` (AAAA-MM-DD), `to` (AAAA-MM-DD) — opcionais.

**LGPD:**
- `adocoes`: sai `nome` e `cidade` do interessado, **sem** telefone/e-mail.
- `doacoes`: sai `nome` do doador, **sem** e-mail/telefone.

**Resposta:** `text/csv` com `Content-Disposition: attachment; filename="entidade-AAAA-MM-DD.csv"`

**Erros:** 400 (datas inválidas), 404 (entidade), 403, 401.

---

## Códigos de Erro Comuns

| Código | Quando ocorre |
|--------|---------------|
| 400 | JSON inválido, validação Zod falhou, parâmetro inválido (ex.: data errada) |
| 401 | Não autenticado (cookie ausente/expirado/inválido) |
| 403 | Autenticado mas sem permissão para a área |
| 404 | Recurso não encontrado (ID inexistente) |
| 409 | Conflito de negócio: saldo insuficiente (estoque), último admin ativo, lançamento protegido, e-mail duplicado |
| 429 | Rate limit (login, formulário público) |
| 500 | Erro interno (ex.: falha ao gravar lançamento vinculado) |
| 503 | `/api/health` — banco indisponível |

---

## Exemplo Completo com curl

```bash
# 1. Login (guarda cookie em cookies.txt)
curl -s -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ong.local","password":"ong12345"}' \
  http://localhost:3000/api/auth

# 2. Listar animais (área: animais)
curl -s -b cookies.txt http://localhost:3000/api/dogs

# 3. Criar animal (multipart)
curl -s -b cookies.txt -F "name=Rex" -F "age=2 anos" -F "breed=Vira-lata" \
  -F "species=cao" -F "sex=macho" -F "available=true" \
  http://localhost:3000/api/dogs

# 4. Criar tratamento (JSON)
curl -s -b cookies.txt -H "Content-Type: application/json" \
  -d '{"animalId":1,"type":"vacina","date":"2025-08-01","cost":120,"status":"realizado"}' \
  http://localhost:3000/api/treatments

# 5. Registrar doação em dinheiro (gera receita no financeiro)
curl -s -b cookies.txt -H "Content-Type: application/json" \
  -d '{"donorName":"João Silva","type":"dinheiro","amount":200,"receivedAt":"2025-07-15","method":"pix"}' \
  http://localhost:3000/api/donations

# 6. Ver dashboard (resumo geral)
curl -s -b cookies.txt http://localhost:3000/api/dashboard

# 7. Exportar financeiro do mês (CSV)
curl -s -b cookies.txt "http://localhost:3000/api/export/financeiro?from=2025-07-01&to=2025-07-31" \
  -o financeiro-julho.csv

# 8. Logout
curl -s -b cookies.txt -X DELETE http://localhost:3000/api/auth
rm cookies.txt
```

---

## Notas de Implementação

- **Todas as rotas GET** têm `export const dynamic = 'force-dynamic'` (sem cache).
- **Validação:** `parseBody(req, validator)` → devolve `Response 400` ou dados tipados.
- **IDs de rota:** `parseId(params.id)` → devolve `number` ou `Response 400`.
- **Auditoria:** `audit(session, action, entity, entityId, details)` — **nunca** passe dados pessoais em `details` (LGPD).
- **Transações:** o driver de produção **não suporta** `db.transaction()`. Gravações em sequência com compensação (try/catch + delete de rollback) — vide `POST /api/public/adoption` e `POST /api/donations`.
- **Datas no banco:** `date` → string `AAAA-MM-DD`. `timestamp` → ISO string.
- **Numéricos no banco:** `numeric` → **string** (ex.: `'150.50'`). Ler com `Number(x)`, gravar com `String(n)` ou `n.toFixed(2)`.
> Vitrine: `GET /api/dogs` sem login devolve só animais com `available = true`; com qualquer sessão, devolve todos.
