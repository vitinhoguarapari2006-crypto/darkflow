# 📖 Manual de Postagem Automática — DarkFlow

Como configurar as credenciais para postar em **várias contas** de cada plataforma.

> **Conceito-chave:** você cria **1 app de desenvolvedor por plataforma** (uma vez só) e gera **1 token por conta**. O app é a fechadura mestra; o token é a chave de cada porta. Para 20 páginas no Instagram = 1 app + 20 tokens.

**No DarkFlow:**
1. Aba **Credenciais → Apps de plataforma** → preencha 1 vez.
2. Aba **Canais** → cadastre cada uma das contas.
3. Aba **Credenciais → Tokens por canal** → cole o token de cada conta.

---

## 🟣 Instagram (postar em várias páginas)

**Como funciona:** 1 app Meta serve para todas as contas. Se as páginas estiverem no mesmo **Gerenciador de Negócios**, você gera todos os tokens com **um login só**.

### Pré-requisitos (para cada página)
- A conta do Instagram precisa ser **Profissional** (Comercial ou Criador de Conteúdo).
- Cada Instagram precisa estar **vinculado a uma Página do Facebook**.
- Todas as Páginas devem estar no **mesmo Gerenciador de Negócios** (business.facebook.com) — assim você administra as 20 de um lugar só.

### Passo a passo (1 vez — o app)
1. Acesse **developers.facebook.com** → *Meus Apps* → **Criar App** → tipo **Empresa (Business)**.
2. No painel do app, adicione os produtos: **Instagram** (API com Instagram Login) e **Login do Facebook**.
3. Em *Configurações → Básico*, copie o **App ID** e o **Chave Secreta do App (App Secret)**.
4. No DarkFlow: **Credenciais → Apps de plataforma → Instagram** → cole App ID e App Secret → **Salvar apps**.

### Passo a passo (gerar os tokens das contas)
5. Abra o **Explorador da Graph API** (developers.facebook.com/tools/explorer).
6. Selecione seu app, clique em **Gerar token de acesso** e faça login com a conta admin do Gerenciador.
7. Conceda as permissões: `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`, `business_management`, `pages_manage_posts`.
8. Para listar suas páginas e tokens, rode a consulta: `me/accounts` → cada item traz o **token da página** (`access_token`).
9. Para descobrir o **ID do Instagram** de cada página, rode: `{ID_DA_PAGINA}?fields=instagram_business_account`.
10. No DarkFlow: cadastre cada página em **Canais**, depois em **Credenciais → Tokens por canal** cole:
    - **Access token** = token da página (do passo 8)
    - **ID da conta** = o `instagram_business_account` (do passo 9)

> 💡 **Token que não expira:** troque seu token por um **de longa duração** (long-lived). Tokens de Página derivados de um token de usuário de longa duração **não expiram**.

### ⚠️ Avisos importantes
- A Meta exige **Revisão do App (App Review)** com **Acesso Avançado** para `instagram_content_publish`. Sem isso, só funciona em contas com função no app (teste). Para as suas 20 contas próprias dentro do Business, isso é viável — mas a revisão leva alguns dias.
- **Limite de publicação:** ~**50 posts por conta a cada 24h** via API (confira o valor atual na doc).

---

## 🔵 Facebook (postar em várias Páginas)

**Mesmo app da Meta** do Instagram. Reaproveita tudo.

1. Use o **mesmo app** criado acima (não precisa criar outro).
2. Permissões necessárias: `pages_manage_posts`, `pages_read_engagement`, `pages_show_list`.
3. No Explorador da Graph API → `me/accounts` → copie o **token** e o **ID** de cada Página.
4. No DarkFlow: cadastre cada Página em **Canais** e cole em **Tokens por canal**:
   - **Access token** = token da Página
   - **ID da conta / página** = ID da Página
5. A postagem de vídeo usa o endpoint `/{ID_DA_PAGINA}/videos`.

---

## ⚫ TikTok (postar em várias contas)

**Como funciona:** 1 app TikTok, mas **cada conta faz 1 login** autorizando seu app (OAuth). Você guarda o token + refresh token de cada uma.

### Passo a passo (1 vez — o app)
1. Acesse **developers.tiktok.com** → *Manage apps* → **Connect an app**.
2. Adicione o produto **Content Posting API**.
3. Em *Manage apps → seu app*, copie **Client Key** e **Client Secret**.
4. Configure os escopos (scopes): `video.publish` e `video.upload`.
5. No DarkFlow: **Credenciais → Apps de plataforma → TikTok** → cole Client Key e Client Secret → **Salvar apps**.

### Passo a passo (autorizar cada conta)
6. Para **cada** uma das contas, faça o fluxo de **Login do TikTok** (OAuth) — a conta entra e clica em *Autorizar*.
7. Ao final, você recebe um **access_token** (dura ~24h) e um **refresh_token** (dura ~1 ano). Use o refresh para renovar automaticamente.
8. No DarkFlow: cadastre cada conta em **Canais** e cole em **Tokens por canal** o **access_token** e o **refresh_token**.

### ⚠️ Avisos importantes
- Seu app precisa passar pela **auditoria (audit)** do TikTok para publicar **publicamente** em contas gerais. Antes disso, só publica como **privado/rascunho** e em contas de teste do sandbox.
- Use **Direct Post** para publicar direto, ou **Upload** para deixar como rascunho na conta.

---

## 🔴 YouTube (postar em vários canais)

**Como funciona:** 1 projeto no Google Cloud, mas **cada canal autoriza** via login Google (OAuth). Guarde o refresh_token de cada canal.

### Passo a passo (1 vez — o projeto)
1. Acesse **console.cloud.google.com** → **Criar projeto**.
2. *APIs e serviços → Biblioteca* → ative a **YouTube Data API v3**.
3. *Tela de permissão OAuth* → configure (tipo Externo) e adicione o escopo `.../auth/youtube.upload`.
4. *Credenciais → Criar credenciais → ID do cliente OAuth* → copie **Client ID** e **Client Secret**.
5. No DarkFlow: **Credenciais → Apps de plataforma → YouTube** → cole Client ID e Client Secret → **Salvar apps**.

### Passo a passo (autorizar cada canal)
6. Para **cada** canal, faça o login OAuth com a conta Google daquele canal → autorize → você recebe um **refresh_token**.
7. No DarkFlow: cadastre cada canal em **Canais** e cole o **refresh_token** em **Tokens por canal**.

### ⚠️ Avisos importantes (cota!)
- A API tem **cota diária**: o padrão é **10.000 unidades/dia** e cada upload (`videos.insert`) custa **~1.600 unidades** → dá só **~6 uploads/dia no projeto inteiro**.
- Para 20 canais postando várias vezes, você precisa **solicitar aumento de cota** (formulário de auditoria do YouTube) ou usar **vários projetos** do Google Cloud.

---

## 🧭 Resumo rápido

| Plataforma | Portal do app | Token por conta vem de | Maior atenção |
|-----------|---------------|------------------------|----------------|
| Instagram | developers.facebook.com | `me/accounts` (1 login p/ todas) | App Review + ~50 posts/dia |
| Facebook | (mesmo app Meta) | `me/accounts` | `pages_manage_posts` |
| TikTok | developers.tiktok.com | OAuth por conta | Auditoria do app |
| YouTube | console.cloud.google.com | OAuth por canal | Cota (~6 uploads/dia padrão) |

> **Ordem recomendada:** comece pelo **YouTube** (mais direto de configurar) ou pelo **Instagram** (1 login pega as 20 contas). TikTok e o App Review da Meta exigem aprovação que leva alguns dias — comece a solicitar cedo.
