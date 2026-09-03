const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — shell de desktop multiplataforma
- **React 19** + **TypeScript** — interface
- **Tailwind CSS v4** — estilos
- **Zustand** — gerenciamento de estado
- **yt-dlp** + **ffmpeg** — motor de download e mux (o yt-dlp é baixado em runtime; ffmpeg/ffprobe vêm embutidos na compilação)
- **Vite** + **electron-vite** — ferramentas de build
- **Vitest** + **Playwright** — testes unitários e de ponta a ponta

</details>

<details>
<summary><strong>Compilar a partir do código-fonte</strong></summary>

### Pré-requisitos — todas as plataformas

| Ferramenta | Versão   | Instalação |
| ---------- | -------- | ---------- |
| Git        | qualquer | [git-scm.com](https://git-scm.com) |
| Node.js    | 24.16.0  | \`mise install\` ou \`.node-version\` |
| Bun        | 1.2.23   | \`mise install\` ou \`packageManager\` do \`package.json\` |

Recomendado: instale o \`mise\` e rode \`mise install\` no checkout. Sem o mise, ative manualmente o Node.js a partir do \`.node-version\` e o Bun a partir do \`package.json\` antes de rodar \`bun run bootstrap\`.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

O Visual Studio Build Tools e o Python podem ser necessários para recompilar módulos nativos.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Depois de clonar, rode \`mise trust && mise install\` no checkout. Se o seu shell já usa \`fnm\`, \`nvm\` ou um Bun do Homebrew, ative o mise no \`~/.zshrc\` para que o Arroxy use o Node.js 24.16.0 e o Bun 1.2.23:

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Dependências de build + runtime do Electron
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# Somente para testes E2E (o Electron precisa de um display)
sudo apt install -y xvfb
\`\`\`

### Clonar e executar

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recomendado; pule se você já ativou manualmente as versões fixadas
bun run bootstrap
bun run doctor
bun run dev            # app Electron rodando contra o renderer do Vite
\`\`\`

### Gerar um pacote distribuível

\`\`\`bash
bun run build        # typecheck + compilação
bun run dist         # empacota para o sistema atual
bun run dist:win     # empacota os alvos Windows quando executado em um host compatível
\`\`\`

> O \`bun run bootstrap\` instala as dependências, recompila as dependências nativas do Electron, verifica o Electron, prepara o ffmpeg/ffprobe embutidos para desenvolvimento e instala o Chromium do Playwright. O yt-dlp é gerenciado em runtime na sua pasta de dados do app; o ffmpeg e o ffprobe acompanham todas as versões do Arroxy.

</details>`;

export const pt = {
  icon_alt: "Mascote do Arroxy",
  title:
    "Arroxy — Baixador gratuito e de código aberto do YouTube (+ 2000 sites) para Windows, macOS e Linux",
  read_in_label: "Leia em:",
  badge_release_alt: "Versão",
  badge_build_alt: "Build",
  badge_license_alt: "Licença",
  badge_platforms_alt: "Plataformas",
  badge_i18n_alt: "Idiomas",
  badge_website_alt: "Site",
  discord_badge_text: "Entre na comunidade do Discord",
  discord_badge_encoded: "Entre%20na%20comunidade%20do%20Discord",
  hero_desc:
    "Baixe vídeos, Shorts, músicas, canais, podcasts ou faixas de áudio do **YouTube e de mais de 2000 sites compatíveis** — até 4K HDR a 60 fps, ou como MP3 / AAC / Opus. Roda localmente no Windows, no macOS e no Linux. **Sem anúncios, sem bloatware, sem vendas empurradas.**",
  cta_latest: "↓ Instalar a versão mais recente",
  cta_website: "Site",
  demo_alt: "Demonstração do Arroxy",
  star_cta:
    "Se o Arroxy economiza seu tempo, uma ⭐ ajuda outras pessoas a encontrá-lo.",
  ai_notice:
    "> 🌐 Esta é uma tradução assistida por IA. O [README em inglês](README.md) é a fonte da verdade. Encontrou algum erro? [PRs são bem-vindos](../../pulls).",
  toc_heading: "Conteúdo",
  why_h2: "Por que o Arroxy",
  features_h2: "Recursos",
  dl_h2: "Instalação e primeira execução",
  privacy_h2: "Privacidade",
  faq_h2: "Perguntas frequentes",
  roadmap_h2: "Planejamento",
  tech_h2: "Feito com",
  why_intro: "Uma comparação lado a lado com as alternativas mais comuns:",
  why_r1: "Gratuito, sem plano premium",
  why_r2: "Código aberto",
  why_r3: "Processamento apenas local",
  why_r4: "Sem login nem exportação de cookies",
  why_r5: "Sem limites de uso",
  why_r6: "App de desktop multiplataforma",
  why_r7: "Legendas + SponsorBlock",
  why_summary:
    "O Arroxy foi feito para uma coisa só: você cola uma URL e recebe um arquivo local limpo. Sem contas, sem vendas empurradas, sem coleta de dados.",
  feat_quality_h3: "Qualidade e formatos",
  feat_quality_1: "Até **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2:
    "**Alta taxa de quadros** preservada como está — 60 fps, 120 fps, HDR",
  feat_quality_3:
    "**Áudio** — exporte apenas o áudio como MP3, M4A/AAC, Opus ou WAV. Nos downloads interativos, escolha as faixas surround/Dolby nativas da fonte (AC-3, E-AC-3, 5.1, DRC) quando existirem, ou defina um padrão global de **Preferir surround / Dolby**",
  feat_quality_4:
    "Predefinições rápidas: *Melhor qualidade* · *Equilibrado* · *Arquivo pequeno*",
  feat_privacy_h3: "Privacidade e controle",
  feat_privacy_1:
    "Processamento 100% local — os downloads vão direto do YouTube para o seu disco",
  feat_privacy_2:
    "**Código aberto** — cada linha pode ser auditada, sob licença MIT",
  feat_privacy_3: "Arquivos salvos direto na pasta que você escolher",
  feat_workflow_h3: "Fluxo de trabalho",
  feat_workflow_12: "**Atalho global de download** — copie um link em qualquer app e pressione `Ctrl+Shift+D` (`Cmd+Shift+D` no macOS); o Arroxy o coloca na fila com o seu perfil ativo sem abrir a janela, e uma notificação confirma. Ativo por padrão e reconfigurável",
  feat_workflow_1:
    "**Modos de início flexíveis** — escolha um download individual guiado, o seletor de playlist/canal, a colagem de URLs em massa ou o Quick Download com os seus padrões salvos",
  feat_workflow_2:
    "**Fila central de downloads** — todo trabalho individual, de playlist, em massa ou rápido chega a um só lugar, com progresso, pausa, retomada, cancelamento, nova tentativa e controle de prioridade",
  feat_workflow_3:
    "**Monitoramento da área de transferência** — copie um link do YouTube e o Arroxy preenche a URL automaticamente quando você volta para o app (ative nas configurações avançadas)",
  feat_workflow_4:
    "**Limpeza automática de URLs** — remove parâmetros de rastreamento (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) e desempacota links `youtube.com/redirect`",
  feat_workflow_5:
    "**Modo bandeja** — fechar a janela mantém os downloads rodando em segundo plano",
  feat_workflow_6:
    "**{{LANG_COUNT}} idiomas** — detecta automaticamente o idioma do sistema e pode ser trocado a qualquer momento",
  feat_workflow_7:
    "**Sincronização de playlists** — reanalise uma playlist comparando com uma pasta local para pular vídeos já baixados; gera um arquivo de playlist `.m3u` que é atualizado a cada vídeo baixado",
  feat_workflow_8:
    "**Controles de velocidade e ritmo** — limite a banda de download, defina quantas partes de um vídeo são baixadas ao mesmo tempo e adicione atrasos entre requisições com predefinições (*Desligado · Equilibrado · Cuidadoso · Personalizado*)",
  feat_workflow_9:
    "**Modelos de nome de arquivo** — nomeie os downloads do seu jeito com `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` e `{playlist_index}`, de forma global ou por perfil de download",
  feat_workflow_10:
    "**Downloads simultâneos e nova tentativa automática** — escolha quantos downloads da fila rodam ao mesmo tempo e deixe o Arroxy tentar de novo um download que esbarrou em um problema de rede ou de servidor, esperando mais tempo a cada tentativa",
  feat_workflow_11:
    "**Perfis por item da playlist** — atribua a cada vídeo de uma playlist o seu próprio perfil de download, em vez de uma única configuração para a lista inteira, para arquivar alguns em qualidade máxima e pegar o restante como MP3 em uma só passada",
  feat_post_h3: "Legendas e pós-processamento",
  feat_post_1:
    "**Legendas** em SRT, VTT ou ASS — manuais ou geradas automaticamente, em qualquer idioma disponível",
  feat_post_2:
    "Salve ao lado do vídeo, incorpore no `.mkv` ou organize em uma subpasta `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — pule ou marque como capítulos os trechos de patrocínio, introduções, encerramentos e autopromoções",
  feat_post_4:
    "**Metadados incorporados** — título, data de publicação, canal, descrição, miniatura e marcadores de capítulo gravados no arquivo",
  feat_sites_h3: "YouTube + 2000 sites",
  feat_sites_1:
    "**YouTube completo** — vídeos, Shorts, canais, playlists, YouTube Music e podcasts tratados como fontes de primeira classe",
  feat_sites_2:
    "**Mais de 2000 outros sites** via yt-dlp — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org e muitos outros",
  feat_sites_3:
    "**Apenas áudio e legendas** funcionam em todos os sites compatíveis, não só no YouTube",
  feat_sites_4:
    "Se um site mudar, o yt-dlp lança correções toda semana e o Arroxy atualiza o binário automaticamente na inicialização",
  shot1_cap:
    "<b>Tela inicial do Quick Download</b><br/>Cole uma URL e baixe na hora com o seu perfil ativo",
  shot2_cap:
    "<b>Perfis de download reutilizáveis</b><br/>Salve predefinições de formato, qualidade e saída — reutilize a cada download",
  shot3_cap:
    "<b>Faixas de áudio em vários idiomas</b><br/>Escolha exatamente o idioma do áudio que o vídeo oferece",
  shot4_cap:
    "<b>Áudio surround / Dolby</b><br/>Faixas 5.1 e Dolby detectadas e preservadas",
  shot5_cap:
    "<b>Modo de URLs em massa</b><br/>Cole uma lista, remova duplicatas automaticamente e enfileire tudo de uma vez",
  shot6_cap:
    "<b>Fila de downloads paralelos</b><br/>Vários downloads ao mesmo tempo com progresso ao vivo",
  hotkey_fig_alt: "Atalho global de download do Arroxy — Ctrl+Shift+D no Windows e Linux, Cmd+Shift+D no macOS, enviando o link copiado direto para a fila de downloads",
  hotkey_fig_cap: "<b>Atalho global de download</b><br/>Copie um link em qualquer lugar, pressione uma vez — ele entra na fila e começa a baixar",
  shot7_cap:
    "<b>Perfis por item da playlist</b><br/>Dê a cada vídeo o seu próprio perfil — arquive alguns em 4K e pegue o restante como MP3",
  dl_platform_col: "Plataforma",
  dl_format_col: "Download direto",
  dl_win_format: "Instalador (NSIS) ou `.exe` portátil",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` ou `.flatpak` (em sandbox)",
  dl_grab: "Todos os arquivos da versão →",
  dl_pkg_h3: "Instalar por gerenciador de pacotes",
  dl_channel_col: "Canal",
  dl_command_col: "Comando",
  dl_win_h3: "Windows: instalador ou portátil",
  dl_win_col_installer: "Instalador NSIS",
  dl_win_col_portable: "`.exe` portátil",
  dl_win_r1: "Precisa instalar",
  dl_win_r1_installer: "Sim",
  dl_win_r1_portable: "Não — rode de qualquer lugar",
  dl_win_r2: "Atualizações automáticas",
  dl_win_r2_installer: "✅ dentro do app",
  dl_win_r2_portable: "❌ download manual",
  dl_win_r3: "Velocidade de inicialização",
  dl_win_r3_installer: "✅ mais rápida",
  dl_win_r3_portable: "⚠️ início a frio mais lento",
  dl_win_r4: "Adiciona ao menu Iniciar",
  dl_win_r5: "Desinstalação fácil",
  dl_win_r5_portable: "❌ apague o arquivo",
  dl_win_rec:
    "**Recomendação:** use o instalador NSIS para ter atualizações automáticas e inicialização mais rápida. Use o `.exe` portátil se quiser uma opção sem instalação e sem registro.",
  dl_win_smartscreen_h4: "Aviso do Windows SmartScreen",
  dl_win_smartscreen_intro:
    'Na primeira execução você pode ver **"O Windows protegeu o seu PC"** ou **"Editor desconhecido"**. Isso vale tanto para o `Arroxy-win-x64-Setup.exe` quanto para o `Arroxy-win-x64-Portable.exe`. O Arroxy é gratuito e de código aberto, e as builds para Windows não são assinadas com um certificado pago — é por isso que o SmartScreen as sinaliza. Isso **não** significa automaticamente que o Arroxy seja inseguro. Para continuar:',
  dl_win_smartscreen_step1: "Clique em **Mais informações**.",
  dl_win_smartscreen_step2: "Clique em **Executar assim mesmo**.",
  dl_win_smartscreen_official:
    "Baixe o Arroxy apenas pela página oficial de releases do GitHub. Se você recebeu o arquivo de outro site ou de alguém, apague-o e baixe uma cópia nova na fonte oficial. O código-fonte é público, então você pode inspecioná-lo ou compilar o Arroxy por conta própria se preferir.",
  dl_macos_h3: "Primeira execução no macOS",
  dl_macos_warning:
    "O Arroxy ainda não é assinado digitalmente, então o Gatekeeper do macOS pode mostrar o aviso de app danificado na primeira execução. Isso é esperado — não é sinal de que o arquivo esteja realmente corrompido.",
  dl_macos_m1_h4: "Pelo Terminal:",
  dl_macos_step1:
    "Arraste o `Arroxy.app` do DMG montado para a pasta `/Applications`.",
  dl_macos_step2:
    "Abra o Terminal e rode `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`.",
  dl_macos_step3: "Rode `open /Applications/Arroxy.app`.",
  dl_macos_step4:
    "Se o caminho do app for outro, substitua `/Applications/Arroxy.app` pelo caminho onde você instalou.",
  dl_macos_step5: "Digite a senha do seu Mac se o `sudo` pedir.",
  dl_macos_after:
    "Depois que a quarentena for removida, o Arroxy abre normalmente.",
  dl_macos_m2_h4: "Pelo Terminal:",
  dl_macos_note:
    "As builds para macOS são geradas por CI em runners Apple Silicon e Intel. Se você encontrar problemas, [abra uma issue](../../issues) — o retorno de quem usa macOS orienta ativamente o ciclo de testes nessa plataforma.",
  dl_linux_h3: "Primeira execução no Linux",
  dl_linux_intro:
    "AppImages rodam direto — sem instalação. Você só precisa marcar o arquivo como executável.",
  dl_linux_m1_text:
    "**Gerenciador de arquivos:** clique com o botão direito no `.AppImage` → **Propriedades** → **Permissões** → ative **Permitir execução do arquivo como programa** e depois dê dois cliques.",
  dl_linux_m2_h4: "Terminal:",
  dl_linux_fuse_text: "Se mesmo assim não abrir, execute sem montagem — não precisa do pacote FUSE:",
  dl_linux_targz_h4: "Tarball simples (sem FUSE, sem instalação):",
  dl_linux_targz_text: "A versão `.tar.gz` é o mesmo app sem o invólucro AppImage — extraia em qualquer lugar e execute. Sem instalador e sem pacote FUSE.",
  dl_linux_flatpak_prereq: "O Ubuntu vem com Snap em vez de Flatpak, então instale o Flatpak e adicione o Flathub primeiro — o pacote baixa o runtime de lá:",
  dl_linux_arch_note: "**Os downloads de Linux na página de versões são apenas x86_64.** Em máquinas ARM64 (Raspberry Pi, Asahi Linux) o Flatpak instala, mas falha ao iniciar com `bwrap: execvp ldconfig: Exec format error`.",
  dl_linux_flatpak_intro:
    "**Flatpak (alternativa em sandbox):** baixe o `Arroxy-linux-x64.flatpak` na mesma página de release.",

  // ---- Ajuda de instalação reorganizada (foco em quem não é técnico, download manual em primeiro lugar) ----
  dl_warning_h3: "Por que você pode ver um aviso",
  dl_warning_p1:
    "O Arroxy é de código aberto e licenciado sob MIT. As builds para Windows e macOS **não são assinadas digitalmente** — os certificados Apple Developer ID e de assinatura EV do Windows custam centenas de dólares por ano cada um, e um projeto independente paga isso do próprio bolso. Sem essas assinaturas, o SmartScreen do Windows e o Gatekeeper do macOS avisam na primeira execução. Os avisos dizem que *o seu sistema não reconhece o publicador* — não que o Arroxy seja malware.",
  dl_warning_p2:
    "Três formas de verificar o Arroxy por conta própria, em ordem crescente de rigor:\n\n- **Leia o código-fonte.** Cada linha está no [GitHub](https://github.com/antonio-orionus/Arroxy) e você pode [compilar a partir do código](#tech).\n- **Confira o SHA256.** Compare o seu arquivo com o [`SHA256SUMS`](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) publicado — veja [Verifique o seu download](#verify) abaixo.\n- **Rode uma varredura de terceiros.** Envie o arquivo para o [VirusTotal](https://www.virustotal.com).",

  dl_win_first_h3: "Primeira execução no Windows",
  shot_smartscreen_more_alt:
    'Caixa de diálogo do SmartScreen "O Windows protegeu o seu PC" com o link "Mais informações" destacado',
  shot_smartscreen_run_alt:
    'Caixa de diálogo do SmartScreen depois de expandir "Mais informações", mostrando o botão "Executar assim mesmo"',
  dl_win_defender_h4: "Se o Windows Defender sinalizar ou remover o arquivo",
  dl_win_defender_p:
    "As heurísticas do Defender às vezes sinalizam como suspeitos instaladores NSIS e executáveis portáteis do Electron sem assinatura. Se o Defender colocar o `Arroxy-win-x64-Setup.exe` ou o `Arroxy-win-x64-Portable.exe` em quarentena, restaure-o em **Segurança do Windows → Proteção contra vírus e ameaças → Histórico de proteção** e depois adicione o executável do Arroxy como item permitido em **Gerenciar configurações → Adicionar ou remover exclusões**. Assim como no SmartScreen, o gatilho é a falta da assinatura do publicador, não a detecção de malware.",

  dl_macos_first_h3: "Primeira execução no macOS",
  dl_macos_intro:
    'O Arroxy ainda não é assinado digitalmente para macOS, então o Gatekeeper pode mostrar a assustadora mensagem *"O Arroxy.app está danificado e não pode ser aberto"* depois que você o instala pelo DMG. Essa mensagem quer dizer que o macOS colocou em quarentena um app sem assinatura; não quer dizer que os arquivos do app estejam realmente danificados. Nas versões atuais do macOS, a solução confiável é pelo Terminal:',
  dl_macos_sequoia_h4: "Correção pelo Terminal para o macOS atual",
  dl_macos_sequoia_intro:
    "Use o Terminal depois de copiar o Arroxy para a pasta Aplicativos:",
  dl_macos_sequoia_step1:
    "Arraste o `Arroxy.app` do DMG montado para a pasta `/Applications`.",
  dl_macos_sequoia_step2: "Abra o Terminal e rode estes dois comandos:",
  dl_macos_sequoia_step3:
    "Rode `open /Applications/Arroxy.app` para abrir o Arroxy.",
  dl_macos_sequoia_step4:
    "Se o caminho do app for outro, substitua `/Applications/Arroxy.app` pelo caminho onde você instalou.",
  dl_macos_sonoma_h4: "Correção pelo Terminal para versões antigas do macOS",
  dl_macos_sonoma_step1:
    "Arraste o `Arroxy.app` do DMG montado para a pasta `/Applications`.",
  dl_macos_sonoma_step2:
    "Abra o Terminal e remova a quarentena de `/Applications/Arroxy.app`.",
  dl_macos_sonoma_step3:
    "Abra o Arroxy pelo Terminal ou pelo Finder depois que a quarentena for removida.",
  dl_macos_damaged_h4: "Correção da quarentena do Gatekeeper",
  dl_macos_damaged_p:
    "O primeiro comando remove o atributo de quarentena da sua cópia instalada do Arroxy. O segundo abre o app. O `sudo` pode pedir a senha do seu Mac; o Terminal não mostra os caracteres enquanto você digita.",
  dl_macos_arch_note:
    "**Apple Silicon x Intel:** em um Mac com chip M (M1 / M2 / M3 / M4), baixe o DMG `arm64`. Em Macs Intel, baixe o DMG `x64`. A build errada ainda funciona via Rosetta, mas fica visivelmente mais lenta.",

  dl_linux_first_h3: "Primeira execução no Linux",
  dl_linux_appimagelauncher:
    "**Integração opcional com o desktop:** instale o [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) uma vez e qualquer AppImage em que você der dois cliques é registrado automaticamente no menu de aplicativos — sem precisar criar um arquivo `.desktop` na mão.",

  dl_verify_h3: "Verifique o seu download (SHA256)",
  dl_verify_intro:
    "Toda release publica um arquivo `SHA256SUMS` junto com os binários. Para conferir se o seu download não foi corrompido ou adulterado no caminho, calcule o hash do arquivo localmente e compare com a linha correspondente no `SHA256SUMS`. Abra a página da última release → **Assets** → baixe o `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell ou Prompt de Comando):",
  dl_verify_mac_label: "macOS (Terminal):",
  dl_verify_linux_label: "Linux (Terminal):",
  dl_verify_vt_text:
    "Quer uma varredura antimalware de terceiros? Envie o arquivo para o [VirusTotal](https://www.virustotal.com). Alguns poucos alertas de heurística genérica vindos de motores menores são normais em apps Electron sem assinatura; detecções generalizadas nos principais motores seriam motivo real de preocupação.",

  dl_pm_intro:
    "Já usa um gerenciador de pacotes? Então você pode pular o caminho do download manual.",

  privacy_p1:
    "Os downloads são feitos direto pelo [yt-dlp](https://github.com/yt-dlp/yt-dlp), do YouTube para a pasta que você escolher — nada passa por um servidor de terceiros. Histórico de vídeos, histórico de downloads, URLs e o conteúdo dos arquivos ficam no seu dispositivo.",
  privacy_p2:
    "O Arroxy envia telemetria anônima e agregada pelo [OpenPanel](https://openpanel.dev) — apenas o suficiente para um projeto independente entender falhas, quedas, feedback, sistema operacional e versões do app. Sem URLs, títulos de vídeo, caminhos de arquivo, dados de conta, fingerprinting ou dados pessoais. O identificador por instalação é aleatório e não está ligado à sua identidade. Você pode desativar nas configurações.",
  faq_q1: "É realmente gratuito?",
  faq_a1:
    "Sim — licença MIT, sem plano premium, sem recursos bloqueados.",
  faq_q2: "Que qualidades de vídeo eu posso baixar?",
  faq_a2:
    "Tudo o que o YouTube oferecer: 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, além de apenas áudio. Streams em 60 fps, 120 fps e HDR são preservados como estão.",
  faq_q3: "Dá para extrair só o áudio em MP3?",
  faq_a3:
    "Sim. Escolha *apenas áudio* no menu de formatos e selecione MP3, M4A/AAC, Opus ou WAV.",
  faq_q4: "Preciso de uma conta do YouTube ou de cookies?",
  faq_a4:
    "Por padrão, não — o Arroxy funciona sem conta do YouTube, sem login e sem exportar cookies. O suporte opcional a cookies está nas configurações avançadas (origem dos cookies: arquivo ou navegador) para conteúdos que exigem autenticação, como vídeos com restrição de idade ou exclusivos para membros. Ele vem desligado. Se você ativá-lo, a wiki do yt-dlp alerta que [a automação baseada em cookies pode marcar uma conta Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies); nesse caso, uma conta descartável é a opção mais segura.",
  faq_q5: "Vai continuar funcionando quando o YouTube mudar alguma coisa?",
  faq_a5:
    "O yt-dlp é atualizado automaticamente na inicialização, e o Arroxy lança correções rapidamente quando o YouTube muda algo. Se ainda assim você esbarrar em um problema, o suporte opcional a cookies está disponível nas configurações avançadas como alternativa.",
  faq_q6: "Em quais idiomas o Arroxy está disponível?",
  faq_a6:
    "{{LANG_COUNT}} idiomas, prontos para uso: {{LANG_NAME_LIST}}. O Arroxy detecta automaticamente o idioma do seu sistema operacional na primeira execução, e você pode trocar quando quiser pelo seletor de idiomas na barra de ferramentas. Os JSON de idioma usados em runtime ficam em src/shared/i18n/locales/, e os catálogos PO para tradutores ficam em i18n/locales/ — abra um PR no GitHub para contribuir.",
  faq_q7: "Preciso instalar mais alguma coisa?",
  faq_a7:
    "Não. O yt-dlp é baixado automaticamente na primeira execução e fica em cache na sua máquina; o ffmpeg e o ffprobe já vêm com o app. Depois disso, nenhuma configuração extra é necessária.",
  faq_q8: "Dá para baixar playlists ou canais inteiros?",
  faq_a8:
    "Sim — os dois. Cole a URL de uma playlist ou de um canal (por exemplo `youtube.com/@handle`, `/channel/UC…`, `/c/Nome`, `/user/Antigo`); escolha quantos itens analisar e depois enfileire a lista inteira ou selecione vídeos específicos. Filtros por intervalo de datas estão a caminho.",
  faq_q9: 'O macOS diz que "o app está danificado" — o que eu faço?',
  faq_a9:
    "É o Gatekeeper do macOS bloqueando um app sem assinatura, não um dano real. Veja [Primeira execução no macOS](#macos-first-launch) para os comandos de Terminal que removem a quarentena e abrem o Arroxy.",
  faq_q10: "Baixar vídeos do YouTube é legal?",
  faq_a10:
    "Para uso pessoal e privado, costuma ser aceito na maioria das jurisdições. Você é responsável por cumprir os [Termos de Serviço](https://www.youtube.com/t/terms) do YouTube e as leis de direito autoral do seu país.",
  plan_intro: "Ainda planejado — mais ou menos em ordem de prioridade:",
  plan_col1: "Recurso",
  plan_col2: "Descrição",
  plan_r1_name: "**Filtros de playlist e canal**",
  plan_r1_desc:
    "Filtros por intervalo de datas ao enumerar uma playlist ou um canal",
  plan_r2_name: "**Preferências de faixa de áudio do YouTube**",
  plan_r2_desc:
    "Defina uma preferência global de idioma falado, com substituições por perfil quando o YouTube oferecer várias faixas de áudio",
  plan_r6_name: "**Login pelo navegador dentro do app**",
  plan_r6_desc:
    "Abrir janelas de navegador dentro do Arroxy para você fazer login e usar os cookies do site sem exportá-los manualmente",
  plan_r8_name: "**Download de vídeo em um clique**",
  plan_r8_desc:
    "Iniciar o download de um vídeo com um clique a partir de uma URL detectada ou colada, usando o seu perfil ativo",
  plan_r3_name: "**Recuperação de tentativas mais robusta**",
  plan_r3_desc:
    "Um novo caminho de nova tentativa para downloads interrompidos por conexões instáveis ou problemáticas",
  plan_r4_name: "**Gaveta completa de gerenciamento de downloads**",
  plan_r4_desc:
    "Transformar a gaveta da fila em um gerenciador mais completo, incluindo a troca da pasta de destino dos itens enfileirados",
  plan_r5_name: "**Downloads agendados**",
  plan_r5_desc:
    "Iniciar uma fila em um horário definido (execuções durante a madrugada)",
  plan_r7_name: "**Corte de trechos**",
  plan_r7_desc: "Baixar apenas um trecho, por horário de início e fim",
  plan_cta:
    "Tem um recurso em mente? [Abra um pedido](../../issues) — a participação da comunidade define as prioridades.",
  tech_content: TECH_CONTENT,
  support_h2: "Apoie o Arroxy",
  support_note:
    "O Arroxy é gratuito e licenciado sob MIT — sem anúncios, sem plano pago. Se ele economiza o seu tempo, você pode apoiar o desenvolvimento com Bitcoin ou Tron: os endereços estão no [DONATE.md](DONATE.md), que é a única fonte oficial deles. O Arroxy nunca vai te enviar um endereço por e-mail ou mensagem direta. Dar uma estrela ao repositório, relatar bugs e melhorar as traduções ajuda tanto quanto.",
  tos_h2: "Termos de uso",
  tos_note:
    "O Arroxy é uma ferramenta para uso pessoal e privado apenas. Você é o único responsável por garantir que os seus downloads cumpram os [Termos de Serviço](https://www.youtube.com/t/terms) do YouTube e as leis de direito autoral da sua jurisdição. Não use o Arroxy para baixar, reproduzir ou distribuir conteúdo que você não tem o direito de usar. Os desenvolvedores não se responsabilizam por qualquer uso indevido.",
  footer_credit:
    'Licença MIT · Feito com cuidado por <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
