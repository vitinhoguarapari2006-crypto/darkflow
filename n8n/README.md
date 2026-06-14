# 🔗 DarkFlow + n8n — publicação automática

O DarkFlow dispara as publicações para o **seu n8n**, que faz o post na plataforma certa via API oficial. Dois gatilhos:

- **Webhook** → "Publicar agora" / auto-publicar (com o app aberto).
- **Schedule** (a cada 5 min) → lê sua agenda no Supabase e posta o que chegou no horário — **com o PC desligado**.

## 1. Importar o fluxo
1. No seu n8n: **Workflows → Import from File** → escolha [`darkflow-workflow.json`](darkflow-workflow.json).
2. Abra o nó **Webhook**, copie a **Production URL** (algo como `https://seudominio/webhook/darkflow`).
3. No DarkFlow → **Configurações → Integração n8n**: cole a URL e um **segredo** (qualquer senha sua).
4. No fluxo n8n, abra o nó **"Checar segredo"** e ponha o **mesmo segredo**. **Active** o workflow (canto superior).

Pronto — "Publicar agora" no app já dispara o post pelo n8n.

## 2. O que o app envia (payload do webhook)
```json
{
  "secret": "seu-segredo",
  "action": "publish",
  "postId": "abc123",
  "platform": "instagram",            // ou "facebook"
  "channel": { "id": "...", "name": "...", "handle": "..." },
  "account_id": "17841400000000000",  // IG business id OU page id
  "access_token": "EAAB...",
  "refresh_token": "",
  "caption": "legenda já com a variação do spintax",
  "video_url": "https://link-publico/video.mp4",
  "title": "video01.mp4"
}
```

## 3. Como o fluxo posta (lógica dos nós)
**Instagram (fluxo de container):**
1. `POST https://graph.facebook.com/v21.0/{{account_id}}/media` com `media_type=REELS`, `video_url`, `caption`, `access_token` → devolve `id` (container).
2. **Wait ~45s** (o Instagram processa o vídeo). Para 100% à prova de erro, troque por um loop: consultar `GET /{{id}}?fields=status_code` até `FINISHED`.
3. `POST https://graph.facebook.com/v21.0/{{account_id}}/media_publish` com `creation_id={{id}}`, `access_token` → publicado ✅.

**Facebook (Página):**
1. `POST https://graph.facebook.com/v21.0/{{account_id}}/videos` com `file_url={{video_url}}`, `description={{caption}}`, `access_token`.

O nó **"Respond to Webhook"** devolve `{ "ok": true, "id": "..." }` (ou `{ "error": "..." }`).

## 4. Gatilho Schedule (24/7, PC desligado)
O JSON traz um segundo gatilho **Schedule (5 min)** + um nó **HTTP "Ler agenda"** que busca no seu Supabase:
```
GET https://SEU_PROJETO.supabase.co/rest/v1/gestao_workspaces?code=like.df_*&select=code,data
Headers: apikey: SUA_ANON_KEY  |  Authorization: Bearer SUA_ANON_KEY
```
Um nó **Code** separa os posts com `status="scheduled"` e `when <= agora`, e manda cada um pra mesma lógica de publicação. Depois um **HTTP PATCH** grava o status de volta (publicado/falhou) na mesma linha — o app vê isso ao sincronizar.

> Edite o nó "Ler agenda" com a URL do seu projeto e a sua anon key (a mesma do app). Ative o Schedule só quando quiser o 24/7.

## 5. CORS (importante)
O app está em `github.io` (origem diferente do seu n8n). Para o app **ler a resposta** do webhook, no nó **Webhook** abra *Options → Allowed Origins (CORS)* e ponha `*`. Se não puder, tudo bem: o app reenvia em modo "no-cors" (o post acontece) e o status final vem pelo Schedule/Supabase.

## 6. Segurança
- O **segredo** no header/payload impede que estranhos usem seu webhook. O nó "Checar segredo" rejeita se não bater.
- Mantenha o workflow **só seu**; o token vai no payload (protegido pelo segredo + HTTPS).
