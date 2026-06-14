-- ====================================================================
--  DarkFlow — setup do Storage + agendamento do worker (rode 1 vez)
--  Cole no Supabase: Dashboard -> SQL Editor -> New query -> Run.
-- ====================================================================

-- 1) Bucket público para os vídeos editados ---------------------------
insert into storage.buckets (id, name, public)
values ('darkflow', 'darkflow', true)
on conflict (id) do update set public = true;

-- permitir o app (chave anon) enviar e ler arquivos nesse bucket
drop policy if exists "darkflow anon upload" on storage.objects;
create policy "darkflow anon upload" on storage.objects
  for insert to anon with check (bucket_id = 'darkflow');

drop policy if exists "darkflow anon update" on storage.objects;
create policy "darkflow anon update" on storage.objects
  for update to anon using (bucket_id = 'darkflow') with check (bucket_id = 'darkflow');

drop policy if exists "darkflow public read" on storage.objects;
create policy "darkflow public read" on storage.objects
  for select using (bucket_id = 'darkflow');

-- 2) Agendar o worker a cada 5 minutos --------------------------------
-- (publica sozinho, mesmo com seu PC desligado)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- remove agendamento anterior se existir
select cron.unschedule('darkflow-worker')
where exists (select 1 from cron.job where jobname = 'darkflow-worker');

-- >>> TROQUE  SEU_PROJETO  e  SUA_SERVICE_ROLE_KEY  abaixo <<<
select cron.schedule(
  'darkflow-worker',
  '*/5 * * * *',
  $$
  select net.http_post(
    url     := 'https://SEU_PROJETO.functions.supabase.co/darkflow-worker',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer SUA_SERVICE_ROLE_KEY"}'::jsonb,
    body    := '{}'::jsonb
  );
  $$
);

-- Para conferir / remover depois:
--   select * from cron.job;
--   select cron.unschedule('darkflow-worker');
