# ☁️ DarkFlow — Publicação automática 24/7 (worker na nuvem)

Faz o DarkFlow **postar sozinho, no horário, mesmo com seu PC/navegador desligado**. Roda no seu Supabase (de graça no plano free) a cada 5 minutos.

## Como funciona
1. O app já **sincroniza tudo** (canais, agenda, credenciais, vídeos com URL pública) para o seu Supabase quando a **nuvem está ligada** (selo "Sincronizado na nuvem").
2. O **worker** (uma Edge Function) acorda a cada 5 min, lê a sua agenda, e publica via API oficial do Instagram/Facebook os posts que chegaram no horário — usando o **fluxo de container** do Instagram.
3. O resultado (publicado/falhou) volta para o app — você vê nas **notificações** (🔔).

## Pré-requisitos (1 vez)
- Ligue a **nuvem** no app (selo no canto da barra lateral) e guarde seu código.
- Tenha as **credenciais** preenchidas (aba Credenciais) e os vídeos com **URL pública** (o botão "Subir p/ nuvem" no editor preenche isso automaticamente).

## Passo a passo

### 1. Storage + agendamento (SQL)
1. Abra o Supabase → **SQL Editor** → **New query**.
2. Cole o conteúdo de [`setup.sql`](setup.sql).
3. Troque `SEU_PROJETO` (o ref do seu projeto, ex.: `ilxwhkdrdsmhkzfdauhe`) e `SUA_SERVICE_ROLE_KEY` (em *Project Settings → API → service_role*).
4. **Run.** Isso cria o bucket público `darkflow` e agenda o worker a cada 5 min.

### 2. Publicar o worker (Edge Function)
No seu PC, uma vez:

```bash
# instalar a CLI do Supabase (uma vez)
npm install -g supabase

# logar e ligar ao seu projeto
supabase login
supabase link --project-ref SEU_PROJETO

# segredos que o worker usa
supabase secrets set SB_URL=https://SEU_PROJETO.supabase.co
supabase secrets set SB_SERVICE_KEY=SUA_SERVICE_ROLE_KEY

# publicar a função (a pasta supabase/functions/darkflow-worker já está pronta)
supabase functions deploy darkflow-worker --no-verify-jwt
```

Pronto! A partir daí, a cada 5 minutos o worker publica o que estiver no horário — **com o PC desligado**.

### Testar agora (sem esperar 5 min)
```bash
curl -X POST https://SEU_PROJETO.functions.supabase.co/darkflow-worker \
  -H "Authorization: Bearer SUA_SERVICE_ROLE_KEY"
```
Resposta: `{"ok":true,"checked":N,"published":N,"failed":N}`.

## Sem o worker (alternativa mais simples)
Se não quiser mexer em servidor agora: ligue **"Auto-publicar com o app aberto"** em *Configurações → Publicação automática*. Enquanto a aba do DarkFlow estiver aberta (num PC ligado), ele publica sozinho no horário. O worker é só para funcionar **com tudo fechado**.

## Limites importantes
- **Instagram:** ~50 publicações por conta a cada 24h (limite da Meta). O app distribui; respeite isso.
- **Tokens** de Página podem expirar — gere tokens de longa duração (guia na aba Credenciais).
- O vídeo precisa estar numa **URL pública** (o botão "Subir p/ nuvem" resolve isso usando o bucket `darkflow`).
