// ====================================================================
//  DarkFlow Worker — Supabase Edge Function (Deno)
//  Publica automaticamente os posts agendados que chegaram no horário,
//  lendo os workspaces sincronizados (linhas "df_%" de gestao_workspaces).
//  Roda a cada 5 min via pg_cron (ver ../setup.sql). Funciona com o PC desligado.
// ====================================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GRAPH = "https://graph.facebook.com/v21.0";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

Deno.serve(async (_req) => {
  const url = Deno.env.get("SB_URL")!;
  const serviceKey = Deno.env.get("SB_SERVICE_KEY")!;
  const sb = createClient(url, serviceKey);

  // pega todos os workspaces do DarkFlow
  const { data: rows, error } = await sb
    .from("gestao_workspaces")
    .select("code,data")
    .like("code", "df_%");
  if (error) return json({ error: error.message }, 500);

  let published = 0, failed = 0, checked = 0;
  const now = Date.now();

  for (const row of rows ?? []) {
    const d = row.data || {};
    const sched = d.schedule || [];
    let changed = false;

    for (const p of sched) {
      if (p.status !== "scheduled" || (p.when || 0) > now) continue;
      checked++;
      try {
        const id = await publish(d, p);
        p.status = "published";
        p.publishedAt = now;
        p.publishedId = id;
        const m = (d.media || []).find((x: any) => x.id === p.mediaId);
        if (m) m.status = "published";
        published++;
      } catch (e) {
        p.status = "failed";
        p.error = String((e as Error).message || e);
        failed++;
      }
      changed = true;
    }

    if (changed) {
      await sb.from("gestao_workspaces")
        .update({ data: d, updated_at: now })
        .eq("code", row.code);
    }
  }

  return json({ ok: true, checked, published, failed });
});

function capText(d: any, p: any): string {
  const c = (d.captions || []).find((x: any) => x.id === p.captionId);
  if (!c) return "";
  return spin(c.text || "");
}
function spin(t: string): string {
  return (t || "").replace(/\{([^{}]*)\}/g, (_m, g) => {
    const o = g.split("|");
    return o[Math.floor(Math.random() * o.length)];
  });
}
async function api(u: string, body: Record<string, string>) {
  const r = await fetch(u, { method: "POST", body: new URLSearchParams(body) });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  return j;
}
async function getJson(u: string) {
  return await (await fetch(u)).json();
}

async function publish(d: any, p: any): Promise<string> {
  const ch = (d.channels || []).find((c: any) => c.id === p.channelId);
  if (!ch) throw new Error("canal nao encontrado");
  const cr = (d.credentials || {})[p.channelId] || {};
  const media = (d.media || []).find((m: any) => m.id === p.mediaId);
  const caption = capText(d, p);
  const vurl = media && media.publicUrl;
  if (!cr.access_token) throw new Error("sem access_token");
  if (!vurl) throw new Error("sem URL publica do video");

  if (ch.platform === "instagram") {
    if (!cr.account_id) throw new Error("sem ID da conta IG");
    const c1 = await api(`${GRAPH}/${cr.account_id}/media`, {
      media_type: "REELS", video_url: vurl, caption, access_token: cr.access_token,
    });
    for (let i = 0; i < 40; i++) {
      await sleep(3000);
      const st = await getJson(`${GRAPH}/${c1.id}?fields=status_code&access_token=${encodeURIComponent(cr.access_token)}`);
      if (st.status_code === "FINISHED") break;
      if (st.status_code === "ERROR") throw new Error("Instagram nao processou o video");
    }
    const c2 = await api(`${GRAPH}/${cr.account_id}/media_publish`, {
      creation_id: c1.id, access_token: cr.access_token,
    });
    return c2.id;
  }
  if (ch.platform === "facebook") {
    if (!cr.account_id) throw new Error("sem ID da pagina FB");
    const r = await api(`${GRAPH}/${cr.account_id}/videos`, {
      file_url: vurl, description: caption, access_token: cr.access_token,
    });
    return r.id || r.video_id || "ok";
  }
  throw new Error("plataforma nao suportada no worker (use IG/FB)");
}

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status, headers: { "Content-Type": "application/json" },
  });
}
