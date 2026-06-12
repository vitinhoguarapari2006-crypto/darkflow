# DarkFlow — Central de Canais

Centro de controle para gerir **vários canais ao mesmo tempo** (Instagram, Facebook, TikTok, YouTube) usando **conteúdo próprio**. Reúne biblioteca de mídia, edição em lote, legendas, agendamento e um dashboard de desempenho e ganhos estimados — tudo numa única página, com seus dados salvos no seu dispositivo.

> ⚠️ **Escopo legal — leia.** O DarkFlow foi feito para distribuir **conteúdo que você produz ou licencia** (gravado, gerado por IA, ou com autorização). Ele **não baixa nem reposta vídeos de terceiros** — isso é violação de direitos autorais e derruba contas. A publicação automática acontece pelas **APIs oficiais** de cada plataforma, que é o caminho permitido e que não gera banimento.

---

## 1. Como abrir

É um app de arquivo único. Duas formas:

- **Simples:** dê duplo-clique em `index.html` (abre no navegador).
- **Recomendado (PWA, funciona offline):** sirva a pasta localmente:
  ```powershell
  cd C:\Users\Vitin\Downloads\Documents\claude-projeto\darkflow
  python -m http.server 4610
  ```
  Depois acesse `http://localhost:4610`. No Chrome/Edge dá pra **instalar como app** (ícone na barra de endereços).

No primeiro acesso, clique em **"Ver demonstração"** para carregar dados de exemplo e explorar.

---

## 2. Fluxo de trabalho

```
Canais → Biblioteca → Edição em lote → Legendas → Agendamento → Dashboard
```

| Módulo | O que faz |
|--------|-----------|
| **Canais** | Cadastre cada perfil que você gerencia (plataforma, @, nicho, RPM). |
| **Biblioteca** | Registre seus vídeos. Ciclo: `bruto → editado → com legenda → agendado → publicado`. Importação em massa por lista. |
| **Edição em lote** | Selecione vídeos + template de fundo + formato → **gera um script FFmpeg** que edita tudo de uma vez no seu PC. |
| **Legendas** | Modelos reutilizáveis com **spintax** `{opção1\|opção2}` para variações automáticas (evita conteúdo duplicado). |
| **Agendamento** | Calendário + **fila automática**: escolha quantos posts/dia, em quais horários e por quantos dias. |
| **Dashboard** | Views, ganhos estimados (modelo RPM), status das postagens e desempenho somando todos os canais. |

---

## 3. Edição em lote — rodando o script FFmpeg

A edição real dos vídeos roda no seu computador via **FFmpeg** (grátis, padrão da indústria).

### 3.1. Instalar FFmpeg (uma vez)
```powershell
winget install Gyan.FFmpeg
```
Feche e reabra o PowerShell. Teste com `ffmpeg -version`.

### 3.2. Organizar pastas (sugestão)
```
C:\DarkFlow\
├── Originais\     ← seus vídeos brutos
├── Editados\      ← saída (criada automaticamente)
└── template.png   ← imagem/vídeo de fundo (1080x1920 p/ Reels)
```

### 3.3. Gerar e executar
1. Em **Edição em lote**, selecione os vídeos, defina o formato (9:16, 1:1, 16:9), o template e a pasta de saída.
2. Clique em **Gerar script** → baixa `darkflow_editar.ps1`.
3. Clique com o botão direito no arquivo → **Executar com PowerShell**.
4. Os vídeos editados aparecem em `C:\DarkFlow\Editados`.

Se o Windows bloquear o script, rode antes (uma vez):
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

**O que o script faz:** coloca o template no fundo (tela cheia), sobrepõe seu vídeo (centro/topo/rodapé), padroniza o formato e, opcionalmente, **queima a legenda padrão** no vídeo (resolvendo o spintax e usando a fonte Arial do Windows).

---

## 4. Publicação automática (APIs oficiais)

Para o DarkFlow **publicar de verdade**, conecte as APIs oficiais. Cada uma exige um app de desenvolvedor aprovado — é o único caminho que não viola os termos e não derruba a conta.

| Plataforma | API | O que precisa |
|-----------|-----|----------------|
| Instagram | Instagram Graph API (`/media` + `/media_publish`) | Conta **Business/Creator** vinculada a uma Página + app Meta verificado |
| Facebook | Facebook Graph API (`/videos`) | Página + app Meta com permissão `pages_manage_posts` |
| TikTok | Content Posting API | App aprovado no **TikTok for Developers** |
| YouTube | YouTube Data API v3 (`videos.insert`) | Projeto no **Google Cloud** + OAuth 2.0 |

Enquanto as credenciais não estão ativas, a agenda funciona como **painel de controle**: você publica manualmente e marca o post como “publicado” (registrando as views para alimentar o dashboard).

Quando tiver as credenciais, preencha o `darkflow-config.example.json` (renomeie para `darkflow-config.json`). Esse arquivo guarda os tokens para o módulo de publicação — **nunca** suba ele para repositórios públicos.

---

## 5. Acessar de qualquer lugar (nuvem) ☁️

Já vem com **sincronização na nuvem configurada** (Supabase) — você **não precisa criar nada**.

1. Clique no selo **"Salvo neste dispositivo"** (canto inferior da barra lateral) ou vá em **Configurações → Sincronização na nuvem**.
2. Crie um **código secreto** (ex.: `vitin-darkflow-2026`). Ele funciona como a senha do seu workspace.
3. Use **o mesmo código** no PC e no celular → seus canais, agenda e credenciais aparecem em todos.

> 🔒 **Guarde o código.** Quem tiver o código acessa seus dados. As credenciais ficam protegidas por ele.

### Credenciais (aba própria)
A aba **Credenciais** guarda, com segurança:
- **Apps de plataforma** (App ID/Secret, Client ID/Secret de cada portal de desenvolvedor);
- **Tokens por canal** (access token, refresh token, ID da conta/página, login de referência).

Esses dados sincronizam junto na nuvem (protegidos pelo seu código).

## 6. Backup dos dados

Além da nuvem, em **Configurações → Dados**:
- **Exportar backup** → salva um `.json` com tudo.
- **Importar backup** → restaura em outro PC/navegador.
- **Apagar tudo** → zera o sistema.

---

## 7. Estrutura de arquivos

```
darkflow/
├── index.html                   ← o app inteiro (com nuvem + credenciais)
├── manifest.json                ← PWA (instalável)
├── darkflow-config.example.json ← modelo de referência das credenciais de API
├── .gitignore                   ← protege credenciais reais
└── README.md
```

---

*DarkFlow v1.0 — feito para operar canais de conteúdo próprio com escala e organização.*
