---
target: app/dashboard/page.tsx
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:/home/nelson/Downloads/FAA/app/dashboard/page.tsx"
target_fingerprint: "sha256:8a4cc85a32e7d51b9b667a5c54dd96100af9f65d455cbd2cdeb60bedd86ad535"
target_path: /home/nelson/Downloads/FAA/app/dashboard/page.tsx
timestamp: 2026-09-10T23-11-03Z
slug: app-dashboard-page-tsx
---
# Impeccable Design Critique Report: Sistema Regimental de Avaliação Individual das FAA

**Method**: dual-agent (A: bfe0351d-1a25-4d46-a8bc-66b4cf404f8c · B: 784048ca-28c1-4114-8d59-834724fb1cc5)  
**Target Evaluated**: `app/dashboard/page.tsx` & Application Shell  
**Date**: 2026-09-10  

---

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 2 | Ausência de skeleton loader em `app/dashboard/page.tsx`: durante os 1–2s de carregamento inicial, há flash de contadores zerados ("0 / 0") antes da hidratação dos dados. |
| 2 | Match Between System and Real World | 4 | Vocabulário militar autêntico e exemplar: NIP, Posto, Unidade, ASC, DPQ, Blocos FAI, Promoção por Escolha (critérios F1, F5, F9, F11 ≥ 15) e relógio oficial WAT (Luanda). |
| 3 | User Control and Freedom | 2 | Cartões do pipeline (01 a 06) funcionam como indicadores passivos sem capacidade de clique para filtrar diretamente a tabela de FAIs. |
| 4 | Consistency and Standards | 3 | Coesão sólida de tokens, bordas e superfícies. Inconsistência pontual: termo "IA Analysis" em inglês na barra lateral ao lado de termos 100% em português militar. |
| 5 | Error Prevention | 3 | Formatação automática em caixa alta para códigos DPQ (`FAA-AV1-XXXX`) e guardrails de clipboard. Falta segregação de visão do Dashboard para militares avaliados. |
| 6 | Recognition Rather Than Recall | 3 | Postos e unidades visíveis ao lado de NIPs regimentais. Contudo, os números brutos do pipeline não identificam visualmente quais dossiês exigem ação imediata sem rolagem. |
| 7 | Flexibility and Efficiency | 2 | Ausência de atalhos de teclado (`/` para busca, `Esc` para limpar filtros/modais) e falta de operações em lote para notificação de atrasos de avaliadores. |
| 8 | Aesthetic and Minimalist Design | 3 | Estética sóbria e institucional após passagens de `quieter` e `distill`. Eliminação de halos e gradientes agressivos. |
| 9 | Error Recovery | 2 | Falhas de conexão em `loadData()` são capturadas no console sem banner de recuperação amigável ("Tentar Novamente"). |
| 10 | Help and Documentation | 3 | Modal "Manual FAI" acessível na barra lateral e fórmulas regimentais documentadas. Faltam tooltips inline para acrônimos densos (`MP`, `ASC`, `U/E/O`). |
| **Total** | | **27/40** | **Acceptable (67.5%)** |

---

## Design Specificity Verdict

**Verdict**: **Autêntica Especificidade de Domínio com Estrutura Macrourbana Intermutável**

- **LLM Assessment (Agente A)**:
  O sistema é profundamente enraizado na doutrina e legislação militar angolana (Regulamento de Avaliação Individual do Exército, Manual VII). Os termos técnicos, divisores regimentais (52 para Oficiais/Sargentos, 31 para Praças) e paleta cromática verde-floresta (`#0F3323`) e ouro institucional (`#B89047`) criam autoridade e sobriedade. No entanto, a composição geral segue a fórmula genérica de dashboard B2B SaaS (4 cartões KPI no topo $\rightarrow$ pipeline horizontal $\rightarrow$ gráfico de barras e lista de prazos $\rightarrow$ tabela). O sistema carece de um modo "Radar de Prontidão Operacional" que priorize urgências militares em vez de gráficos puramente analíticos.
- **Deterministic Scan (Agente B)**:
  A varredura com o detector determinístico (`impeccable detect --json app components`) resultou em **0 violações** em 58 ficheiros. Sem gradientes de texto artificiais, sem halos de brilho saturados, sem abas laterais (`border-l-4`), e com alinhamento rigoroso de tipografia tabular.
- **Visual Overlays & Browser Inspection**:
  Inspeção ao vivo via Chrome DevTools MCP em 6 rotas centrais (`/login/`, `/dashboard/`, `/militares/`, `/workflow/`, `/ia-analytics/`, `/minha-fai/`). Todas as telas renderizaram com CLS = 0.00, sem quebras de layout ou erros de console, confirmando estabilidade visual após as intervenções de `quieter` e `distill`.

---

## Overall Impression
O software transparece seriedade institucional e rigor matemático. A recente aplicação dos princípios `quieter` e `distill` removeu ruídos decorativos (como halos de brilho e gradientes intrusivos no formulário de código de acesso), trazendo calma e foco. A oportunidade central de evolução reside em transformar o Dashboard de um mero visualizador passivo em um console de comando operacional com segregação de papéis.

---

## What's Working
1. **Dignidade Institucional & Tipografia Tabular**: O uso de `font-data-mono` para NIPs, notas e prazos operacionais com a paleta militar confere seriedade de nível oficial superior.
2. **Eficiência do Acesso por Código DPQ**: O widget refinado no topo do dashboard e na tela de login permite a oficiais com credenciais temporárias de despacho ingressar diretamente na avaliação designada sem atrito.
3. **Mapeamento de Regras do Manual VII FAA**: Os motores de cálculo (divisor 52/31, promoção por escolha nos fatores F1, F5, F9, F11) estão integrados à interface de maneira transparente e auditável.

---

## Priority Issues (P0–P3)

### [P0] Vazamento de Visão & Falta de Segregação de Papéis no Dashboard (`/dashboard`)
- **Impacto**: Enquanto `/fai/nova` e `/admin` barram militares avaliados, o `/dashboard` consulta todas as FAIs e militares da unidade indiscriminadamente. Um militar avaliado comum (`MILITAR_AVALIADO`) que visite o dashboard pode ver as notas ponderadas e atrasos regimentais de colegas e superiores hierárquicos, violando o princípio militar da compartimentação de informações.
- **Solução**: Restringir a visão completa do Dashboard a Oficiais Avaliadores/Comando (`ADMIN`, `DPQ`, `CMDTE`, `AVALIADOR_1`, `AVALIADOR_2`) e redirecionar automaticamente militares avaliados para um painel individual focado no seu processo e prazos de impugnação.
- **Comando Recomendado**: `$impeccable harden`

### [P1] Responsividade do Shell em Dispositivos Móveis e Tablets
- **Impacto**: `app-layout-shell.tsx` fixa `ml-sidebar-width` (260px) sem media queries responsivas ou botão de alternância móvel (hamburguer), comprimindo a interface em telas menores que 1024px.
- **Solução**: Implementar drawer móvel deslizante com menu recolhível no `TopNavbar` em viewports `< 768px`.
- **Comando Recomendado**: `$impeccable layout`

### [P1] Ausência de Estado de Carregamento (Skeleton UI) e Feedback de Erro de Conexão
- **Impacto**: Durante a chamada ao Firestore (1–2s), o dashboard pisca contadores "0 / 0" e exibe "Nenhuma FAI encontrada" antes de renderizar os processos reais. Se a rede falhar, a tela fica vazia sem opção de repetição.
- **Solução**: Exibir skeletons pulsantes discretos nos 4 cartões KPI, no pipeline e nas linhas da tabela enquanto `loading === true`, com banner de repetição sob erro.
- **Comando Recomendado**: `$impeccable polish`

### [P2] Falta de Interatividade no Pipeline Regimental (01 a 06)
- **Impacto**: As 6 etapas do pipeline exibem contagens e percentuais com visual de abas acionáveis, mas não filtram a tabela abaixo ao serem clicadas.
- **Solução**: Ligar o clique de cada cartão de etapa do pipeline ao estado de filtro da `RecentFaisTable`.
- **Comando Recomendado**: `$impeccable clarify`

### [P2] Contraste do Ouro Regimental (`#B89047`) em Textos Pequenos sobre Fundo Claro
- **Impacto**: O tom `#B89047` atinge contraste de ~2.9:1 em fundos brancos, abaixo do limiar WCAG AA (4.5:1) para textos de leitura.
- **Solução**: Escurecer o token para `#8C6B26` quando aplicado em texto sobre superfícies brancas/claras, reservando `#B89047` para ícones ou sobre fundos escuros.
- **Comando Recomendado**: `$impeccable colorize`

---

## Persona Red Flags

- **Alex (Oficial Avaliador / Usuário Experiente)**:
  - Ausência de atalhos rápidos de teclado: não consegue pressionar `/` para pesquisar NIP nem `Esc` para fechar modais de tramitação.
  - Não há triagem em lote para notificar múltiplos avaliadores atrasados simultaneamente.
- **Jordan (Oficial Subalterno / Primeiro Acesso)**:
  - Siglas regimentais densas (`MP`, `ASC`, `U/E/O`) sem tooltips explicativos imediatos.
  - Concorrência visual no cabeçalho entre o título da tela e a caixa de desbloqueio por código DPQ.
- **Sam (Usuário com Baixa Visão / Acessibilidade)**:
  - Textos secundários em ouro claro sobre fundo branco sofrem perda de contraste em ambientes de alta luminosidade.
  - Elementos de filtro na tabela não possuem atributos `aria-pressed` informando o estado ativo aos leitores de tela.

---

## Minor Observations
1. **Linguagem**: O menu lateral contém o item "IA Analysis" (inglês), que destoa da redação institucional em português ("Análise IA" ou "Inteligência Preditiva").
2. **Relógio Superior**: O relógio militar `WAT (Luanda)` atualiza segundos a cada 1000ms, provocando repaints constantes do nó DOM. Recomenda-se atualizar apenas no minuto.

---

## Questions to Consider
1. O Dashboard deve adaptar automaticamente sua visão dependendo da patente/função logada, ocultando notas de terceiros para o militar comum?
2. O Pipeline de 6 etapas deve se tornar um filtro interativo primário da tela?
3. O desbloqueio por código individual DPQ deve ser movido para a barra superior global para desobstruir o título do painel?
