const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — shell de bureau multiplateforme
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — styles
- **Zustand** — gestion d'état
- **yt-dlp** + **ffmpeg** — moteur de téléchargement et de muxage (yt-dlp est récupéré à l’exécution ; ffmpeg/ffprobe sont inclus au build)
- **Vite** + **electron-vite** — outillage de build
- **Vitest** + **Playwright** — tests unitaires et end-to-end

</details>

<details>
<summary><strong>Compiler depuis les sources</strong></summary>

### Prérequis — toutes plateformes

| Outil | Version | Installation |
| ----- | ------- | ------------ |
| Git   | quelconque | [git-scm.com](https://git-scm.com) |
| Bun   | dernière   | voir ci-dessous par OS |

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Aucun outil de compilation natif requis — le projet n'a pas d'addons Node natifs.

### macOS

\`\`\`bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Dépendances runtime Electron
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# Tests E2E uniquement (Electron a besoin d'un affichage)
sudo apt install -y xvfb
\`\`\`

### Cloner & lancer

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # build de développement avec rechargement à chaud
\`\`\`

### Créer un paquet distribuable

\`\`\`bash
bun run build        # vérification des types + compilation
bun run dist         # paquet pour l'OS actuel
bun run dist:win     # compilation croisée exe portable Windows
\`\`\`

> yt-dlp est récupéré depuis GitHub au premier lancement et mis en cache dans le dossier de données de l’app. ffmpeg et ffprobe sont inclus dans chaque release d’Arroxy.

</details>`;

export const fr = {
  icon_alt: "Mascotte Arroxy",
  title: "Arroxy — Téléchargeur YouTube (+ 2000 sites) gratuit et open source pour Windows, macOS & Linux",
  read_in_label: "Lire en :",
  badge_release_alt: "Version",
  badge_build_alt: "Build",
  badge_license_alt: "Licence",
  badge_platforms_alt: "Plateformes",
  badge_i18n_alt: "Langues",
  badge_website_alt: "Site web",
  hero_desc:
    "Télécharge des vidéos, Shorts, musiques, chaînes, podcasts ou pistes audio depuis **YouTube et plus de 2000 sites supportés** — jusqu'à 4K HDR à 60 fps, ou en MP3 / AAC / Opus. Fonctionne en local sur Windows, macOS et Linux. **Pas de pub, pas de superflu, pas d'upsell.**",
  cta_latest: "↓ Télécharger la dernière version",
  cta_website: "Site web",
  demo_alt: "Démo Arroxy",
  star_cta: "Si Arroxy te fait gagner du temps, une ⭐ aide les autres à le trouver.",
  ai_notice:
    "> 🌐 Traduction assistée par IA. Le [README en anglais](README.md) fait foi. Tu vois une erreur ? [Les PRs sont les bienvenues](../../pulls).",
  toc_heading: "Sommaire",
  why_h2: "Pourquoi Arroxy",
  features_h2: "Fonctionnalités",
  dl_h2: "Téléchargement",
  privacy_h2: "Confidentialité",
  faq_h2: "Questions fréquentes",
  roadmap_h2: "Feuille de route",
  tech_h2: "Construit avec",
  why_intro: "Une comparaison côte à côte avec les alternatives les plus courantes :",
  why_r1: "Gratuit, pas de niveau premium",
  why_r2: "Open source",
  why_r3: "Traitement 100 % local",
  why_r4: "Pas de connexion ni d'export de cookies",
  why_r5: "Pas de limites d'utilisation",
  why_r6: "Application de bureau multiplateforme",
  why_r7: "Sous-titres + SponsorBlock",
  why_summary:
    "Arroxy est conçu pour une seule chose : coller une URL et obtenir un fichier local propre. Pas de comptes, pas d'upsell, pas de collecte de données.",
  feat_quality_h3: "Qualité & formats",
  feat_quality_1: "Jusqu'à **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Haut framerate** préservé tel quel — 60 fps, 120 fps, HDR",
  feat_quality_3: "**Audio seul** en MP3, M4A/AAC, Opus ou WAV",
  feat_quality_4: "Préréglages rapides : *Meilleure qualité* · *Équilibré* · *Petit fichier*",
  feat_privacy_h3: "Confidentialité & contrôle",
  feat_privacy_1:
    "Traitement 100 % local — les téléchargements vont directement de YouTube à ton disque",
  feat_privacy_2: "Pas de connexion, pas de cookies, pas de compte Google lié",
  feat_privacy_3: "Fichiers enregistrés directement dans le dossier que tu choisis",
  feat_workflow_h3: "Flux de travail",
  feat_workflow_1:
    "**Modes de démarrage flexibles** — choisis un téléchargement unique guidé, un sélecteur de playlist/chaîne, un collage d’URL en lot ou Quick Download avec tes valeurs par défaut enregistrées",
  feat_workflow_2:
    "**File de téléchargement centrale** — chaque tâche unique, playlist, lot ou rapide arrive au même endroit pour suivre, mettre en pause, reprendre, annuler, réessayer et gérer la priorité",
  feat_workflow_3:
    "**Surveillance du presse-papiers** — copie un lien YouTube et Arroxy remplit automatiquement l'URL quand tu reviens sur l'app (désactivable dans les Paramètres avancés)",
  feat_workflow_4:
    "**Nettoyage auto des URLs** — supprime les paramètres de tracking (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) et dénoue les liens `youtube.com/redirect`",
  feat_workflow_5:
    "**Mode tray** — fermer la fenêtre garde les téléchargements en cours en arrière-plan",
  feat_workflow_6:
    "**21 langues** — détecte automatiquement la langue du système, modifiable à tout moment",
  feat_workflow_7:
    "**Synchronisation de playlist** — rescane une playlist par rapport à un dossier local pour ignorer les vidéos déjà téléchargées ; génère un fichier de playlist `.m3u` mis à jour à chaque vidéo téléchargée",
  feat_workflow_8:
    "**Contrôles de vitesse et de rythme** — limite la bande passante, ajoute des pauses entre les requêtes et règle les threads de fragments avec des préréglages (*Désactivé · Équilibré · Prudent · Personnalisé*)",
  feat_post_h3: "Sous-titres & post-traitement",
  feat_post_1:
    "**Sous-titres** en SRT, VTT ou ASS — manuels ou auto-générés, dans toute langue disponible",
  feat_post_2:
    "Enregistre à côté de la vidéo, intègre dans un `.mkv`, ou organise dans un sous-dossier `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — passe ou marque les sponsors, intros, outros, autopromos en chapitres",
  feat_post_4:
    "**Métadonnées intégrées** — titre, date de mise en ligne, chaîne, description, miniature et marqueurs de chapitres écrits dans le fichier",
  feat_sites_h3: "YouTube + 2000 sites",
  feat_sites_1:
    "**YouTube, en entier** — Vidéos, Shorts, Chaînes, Playlists, YouTube Music et Podcasts traités comme des sources de premier rang",
  feat_sites_2:
    "**2000+ autres sites** via yt-dlp — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org et bien plus encore",
  feat_sites_3:
    "**L'audio seul et les sous-titres** fonctionnent sur chaque site supporté, pas seulement YouTube",
  feat_sites_4:
    "Si un site change, yt-dlp publie des correctifs chaque semaine et Arroxy met à jour le binaire automatiquement au lancement",
  shot1_alt: "Coller une URL",
  shot2_alt: "Choisir la qualité",
  shot3_alt: "Choisir où enregistrer",
  shot4_alt: "File de téléchargement en action",
  shot5_alt: "Sélecteur de langue et de format pour les sous-titres",
  dl_platform_col: "Plateforme",
  dl_format_col: "Format",
  dl_win_format: "Installeur (NSIS) ou `.exe` portable",
  dl_mac_format: "`.dmg` (Intel + Apple Silicon)",
  dl_linux_format: "`.AppImage` ou `.flatpak` (sandboxed)",
  dl_grab: "Récupère la dernière version →",
  dl_pkg_h3: "Installation via gestionnaire de paquets",
  dl_channel_col: "Canal",
  dl_command_col: "Commande",
  dl_win_h3: "Windows : Installeur vs Portable",
  dl_win_col_installer: "Installeur NSIS",
  dl_win_col_portable: "`.exe` portable",
  dl_win_r1: "Installation requise",
  dl_win_r1_installer: "Oui",
  dl_win_r1_portable: "Non — exécutable de partout",
  dl_win_r2: "Mises à jour automatiques",
  dl_win_r2_installer: "✅ dans l'app",
  dl_win_r2_portable: "❌ téléchargement manuel",
  dl_win_r3: "Vitesse de démarrage",
  dl_win_r3_installer: "✅ plus rapide",
  dl_win_r3_portable: "⚠️ démarrage à froid plus lent",
  dl_win_r4: "Ajouté au menu Démarrer",
  dl_win_r5: "Désinstallation simple",
  dl_win_r5_portable: "❌ supprime juste le fichier",
  dl_win_rec:
    "**Recommandation :** utilise l'installeur NSIS pour les mises à jour automatiques et un démarrage plus rapide. Utilise le `.exe` portable pour une option sans installation ni registre.",
  dl_win_smartscreen_h4: "Avertissement Windows SmartScreen",
  dl_win_smartscreen_intro:
    "Au premier lancement, tu peux voir **\"Windows protected your PC\"** ou **\"Unknown publisher.\"** Cela s'applique à la fois à `Arroxy-win-x64-Setup.exe` et à `Arroxy-win-x64-Portable.exe`. Arroxy est gratuit et open source, et les builds Windows ne sont pas signés avec un certificat payant, c'est pourquoi SmartScreen les signale. Cela ne signifie **pas** automatiquement qu'Arroxy est dangereux. Pour continuer :",
  dl_win_smartscreen_step1: "Clique sur **More info**.",
  dl_win_smartscreen_step2: "Clique sur **Run anyway**.",
  dl_win_smartscreen_official:
    "Ne télécharge Arroxy que depuis la page officielle GitHub Releases. Si tu as obtenu le fichier depuis un autre site ou que quelqu'un te l'a envoyé, supprime-le et télécharge une copie fraîche depuis la source officielle. Le code source est public, tu peux donc l'inspecter ou compiler Arroxy toi-même si tu préfères.",
  dl_macos_h3: "Premier lancement sur macOS",
  dl_macos_warning:
    "Arroxy n'est pas encore signé, donc macOS Gatekeeper affichera un avertissement au premier lancement. C'est normal — ce n'est pas un signe d'endommagement.",
  dl_macos_m1_h4: "Méthode via Réglages Système (recommandé) :",
  dl_macos_step1: "Clic droit sur l'icône de l'app Arroxy et sélectionne **Ouvrir**.",
  dl_macos_step2:
    "La boîte de dialogue d'avertissement apparaît — clique sur **Annuler** (ne clique pas sur *Mettre à la corbeille*).",
  dl_macos_step3: "Ouvre **Réglages Système → Confidentialité et sécurité**.",
  dl_macos_step4:
    'Descends jusqu\'à la section **Sécurité**. Tu verras *"Arroxy a été bloqué car il ne provient pas d\'un développeur identifié."*',
  dl_macos_step5:
    "Clique sur **Ouvrir quand même** et confirme avec ton mot de passe ou Touch ID.",
  dl_macos_after:
    "Après l'étape 5, Arroxy s'ouvre normalement et l'avertissement ne réapparaît plus jamais.",
  dl_macos_m2_h4: "Méthode Terminal (avancé) :",
  dl_macos_note:
    "Les builds macOS sont produits via CI sur des runners Apple Silicon et Intel. Si tu rencontres des problèmes, merci d'[ouvrir un issue](../../issues) — les retours des utilisateurs macOS orientent activement le cycle de test macOS.",
  dl_linux_h3: "Premier lancement sur Linux",
  dl_linux_intro:
    "Les AppImages s'exécutent directement — pas d'installation. Tu dois juste marquer le fichier comme exécutable.",
  dl_linux_m1_text:
    "**Gestionnaire de fichiers :** clic droit sur le `.AppImage` → **Propriétés** → **Permissions** → active **Autoriser l'exécution du fichier comme programme**, puis double-clique.",
  dl_linux_m2_h4: "Terminal :",
  dl_linux_fuse_text: "Si le lancement échoue encore, il te manque peut-être FUSE :",
  dl_linux_flatpak_intro:
    "**Flatpak (alternative en sandbox) :** télécharge `Arroxy-*.flatpak` depuis la même page de release.",

  // ---- Reorganized install help (normie-first, manual-download primary) ----
  dl_warning_h3: "Pourquoi tu peux voir un avertissement",
  dl_warning_p1:
    "Arroxy est open source et sous licence MIT. Les builds Windows et macOS **ne sont pas signés numériquement** — les certificats Apple Developer ID et Windows EV coûtent chacun plusieurs centaines de dollars par an, que paye un projet indépendant de sa poche. Sans ces signatures, Windows SmartScreen et macOS Gatekeeper t'avertiront au premier lancement. Ces avertissements signifient *ton OS ne reconnaît pas l'éditeur* — ils ne signifient pas qu'Arroxy est un malware.",
  dl_warning_p2:
    "Trois façons de vérifier Arroxy toi-même, par ordre de rigueur croissante :\n\n- **Lis le code source.** Chaque ligne est sur [GitHub](https://github.com/antonio-orionus/Arroxy) et tu peux [le compiler depuis les sources](#tech).\n- **Vérifie le SHA256.** Compare ton fichier avec le [`SHA256SUMS`](../../releases/latest) publié — voir [Vérifier ton téléchargement](#verify) ci-dessous.\n- **Lance un scan tiers.** Envoie le fichier sur [VirusTotal](https://www.virustotal.com).",

  dl_win_first_h3: "Premier lancement sur Windows",
  shot_smartscreen_more_alt:
    'SmartScreen "Windows protected your PC" dialog with the "More info" link highlighted',
  shot_smartscreen_run_alt:
    'SmartScreen dialog after expanding More info, showing the "Run anyway" button',
  dl_win_defender_h4: "Si Windows Defender signale ou supprime le fichier",
  dl_win_defender_p:
    "L'heuristique de Defender signale parfois les installeurs NSIS non signés et les portables Electron comme suspects. Si Defender met en quarantaine `Arroxy-win-x64-Setup.exe` ou `Arroxy-win-x64-Portable.exe`, restaure-le depuis **Windows Security → Virus & threat protection → Protection history**, puis ajoute l'exécutable Arroxy comme élément autorisé sous **Manage settings → Add or remove exclusions**. Comme pour SmartScreen, le déclencheur est la signature d'éditeur manquante, pas un malware détecté.",

  dl_macos_first_h3: "Premier lancement sur macOS",
  dl_macos_intro:
    "Arroxy n'est pas encore signé pour macOS, donc Gatekeeper bloquera le premier lancement. Le chemin exact pour l'autoriser dépend de ta version de macOS — Sequoia 15 a durci l'ancienne méthode de contournement via clic droit → Ouvrir.",
  dl_macos_sequoia_h4: "macOS Sequoia 15 et ultérieur (actuel)",
  dl_macos_sequoia_intro:
    "Sur Sequoia 15 et versions plus récentes, clic droit → Ouvrir ne contourne plus Gatekeeper pour de nombreuses apps en quarantaine. Utilise le panneau Réglages Système à la place :",
  dl_macos_sequoia_step1:
    "Fais glisser `Arroxy.app` depuis le DMG monté vers `/Applications`.",
  dl_macos_sequoia_step2:
    "Double-clique sur Arroxy. La boîte de dialogue de blocage apparaît — clique sur **Done** (ne clique pas sur *Move to Trash*).",
  dl_macos_sequoia_step3:
    'Ouvre **System Settings → Privacy & Security** et descends jusqu\'à la section **Security**. Tu verras *"Arroxy was blocked to protect your Mac"* (ou un message quasi identique).',
  dl_macos_sequoia_step4:
    "Clique sur **Open Anyway**, confirme avec ton mot de passe ou Touch ID, puis relance Arroxy depuis `/Applications`.",
  dl_macos_sonoma_h4: "macOS Sonoma 14 et antérieur",
  dl_macos_sonoma_step1:
    "Fais glisser `Arroxy.app` depuis le DMG monté vers `/Applications`.",
  dl_macos_sonoma_step2:
    "Clic droit (ou Control-clic) sur `Arroxy.app` dans `/Applications` et choisis **Open**.",
  dl_macos_sonoma_step3:
    "La boîte de dialogue d'avertissement dispose maintenant d'un bouton **Open** — clique dessus et confirme. Arroxy s'ouvre normalement et l'avertissement ne réapparaît plus jamais.",
  dl_macos_damaged_h4:
    '"App is damaged" ou blocage Gatekeeper persistant — correction via Terminal',
  dl_macos_damaged_p:
    'Si macOS dit *"Arroxy is damaged and can\'t be opened"*, ou qu\'aucune des étapes ci-dessus ne lève le blocage, l\'attribut de quarantaine sur le DMG en est la cause (certains navigateurs et le comportement de translocation propre à macOS le définissent). Supprime-le de l\'app installée :',
  dl_macos_arch_note:
    "**Apple Silicon vs Intel :** sur un Mac de la série M (M1 / M2 / M3 / M4), télécharge le DMG `arm64`. Sur les Macs Intel, télécharge le DMG `x64`. Le mauvais build fonctionne quand même via Rosetta, mais est notablement plus lent.",

  dl_linux_first_h3: "Premier lancement sur Linux",
  dl_linux_appimagelauncher:
    "**Intégration bureau optionnelle :** installe [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) une fois, et toute AppImage sur laquelle tu double-cliques est automatiquement enregistrée dans ton menu de lancement — aucun fichier `.desktop` manuel nécessaire.",

  dl_verify_h3: "Vérifier ton téléchargement (SHA256)",
  dl_verify_intro:
    "Chaque release publie un fichier `SHA256SUMS` accompagnant les binaires. Pour vérifier que ton téléchargement n'a pas été corrompu ou altéré en transit, hache ton fichier en local et compare la ligne dans `SHA256SUMS`. Ouvre la page de la dernière release → **Assets** → télécharge `SHA256SUMS`.",
  dl_verify_win_label: "Windows (PowerShell or Command Prompt) :",
  dl_verify_mac_label: "macOS (Terminal) :",
  dl_verify_linux_label: "Linux (Terminal) :",
  dl_verify_vt_text:
    "Tu veux un scan antimalware tiers ? Envoie le fichier sur [VirusTotal](https://www.virustotal.com). Une poignée de flags heuristiques génériques de moteurs mineurs est normale pour des apps Electron non signées ; des détections généralisées par les grands moteurs seraient une vraie préoccupation.",

  dl_pm_intro:
    "Tu utilises déjà un gestionnaire de paquets ? Tu peux passer la voie de téléchargement manuel.",

  privacy_p1:
    "Les téléchargements sont récupérés directement via [yt-dlp](https://github.com/yt-dlp/yt-dlp) depuis YouTube vers le dossier que tu choisis — rien ne passe par un serveur tiers. L'historique de visionnage, l'historique de téléchargement, les URLs et le contenu des fichiers restent sur ton appareil.",
  privacy_p2:
    "Arroxy envoie une télémétrie anonyme et agrégée via [OpenPanel](https://openpanel.dev) — juste assez pour comprendre les lancements, OS, versions de l’app et crashs. Pas d’URLs, de titres de vidéos, de chemins de fichiers, d’infos de compte, de fingerprinting ni de données personnelles. L’identifiant par installation est aléatoire et non lié à ton identité. Tu peux te désabonner dans les Paramètres.",
  faq_q1: "C'est vraiment gratuit ?",
  faq_a1: "Oui — licence MIT, pas de niveau premium, pas de fonctions verrouillées.",
  faq_q2: "Quelles qualités de vidéo puis-je télécharger ?",
  faq_a2:
    "Tout ce que YouTube propose : 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, plus audio seul. Les flux 60 fps, 120 fps et HDR sont préservés tels quels.",
  faq_q3: "Puis-je extraire uniquement l'audio en MP3 ?",
  faq_a3: "Oui. Choisis *audio seul* dans le menu des formats puis MP3, M4A/AAC, Opus ou WAV.",
  faq_q4: "Ai-je besoin d'un compte YouTube ou de cookies ?",
  faq_a4:
    "Par défaut, non — Arroxy fonctionne sans compte YouTube, sans connexion et sans export de cookies. Un support de cookies optionnel est disponible dans les paramètres avancés (Source des cookies : fichier ou navigateur) pour le contenu nécessitant une authentification, comme les vidéos à restriction d'âge ou réservées aux membres. C'est désactivé par défaut. Si tu l'actives, le wiki de yt-dlp note que [l'automatisation à base de cookies peut signaler un compte Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies) ; un compte jetable est alors le choix le plus sûr.",
  faq_q5: "Ça continuera de fonctionner si YouTube change quelque chose ?",
  faq_a5:
    "yt-dlp est mis à jour automatiquement au lancement, et Arroxy publie des correctifs rapidement quand YouTube change quelque chose. Si jamais tu rencontres un problème, un support de cookies optionnel est disponible dans les paramètres avancés en solution de repli.",
  faq_q6: "Dans quelles langues Arroxy est-il disponible ?",
  faq_a6:
    "Vingt-et-une, prêtes à l'emploi : English, Español (espagnol), Deutsch (allemand), Français, 日本語 (japonais), 中文 (chinois), Русский (russe), Українська (ukrainien), हिन्दी (hindi), Afaan Oromoo, Kiswahili, O'zbekcha (ouzbek), Tiếng Việt (vietnamien), አማርኛ (amharique), العربية (arabe), اردو (ourdou), پښتو (pachto), বাংলা (bengali), မြန်မာဘာသာ (birman), Ελληνικά (grec) et Српски (serbe). Arroxy détecte la langue de ton système d'exploitation au premier lancement et tu peux changer à tout moment depuis le sélecteur de langue dans la barre d'outils. Les traductions sont de simples objets TypeScript dans src/shared/i18n/locales/ — ouvre une PR sur GitHub pour contribuer.",
  faq_q7: "Dois-je installer autre chose ?",
  faq_a7:
    "Non. yt-dlp est téléchargé automatiquement au premier lancement et mis en cache sur ta machine ; ffmpeg et ffprobe sont inclus dans l’app. Après ça, aucune configuration supplémentaire.",
  faq_q8: "Puis-je télécharger des playlists ou des chaînes entières ?",
  faq_a8:
    "Oui — les deux. Colle une URL de playlist ou de chaîne (p. ex. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`) ; choisis combien d’entrées analyser, puis mets toute la liste en file ou sélectionne des vidéos précises. Les filtres par date arrivent bientôt.",
  faq_q9: 'macOS dit "l\'application est endommagée" — que faire ?',
  faq_a9:
    'C\'est Gatekeeper de macOS qui bloque une app non signée, pas un vrai endommagement. Voir ["App is damaged" — correction via Terminal](#macos-first-launch) pour la commande `xattr` en une ligne qui règle le problème.',
  faq_q10: "Télécharger des vidéos YouTube est-il légal ?",
  faq_a10:
    "Pour un usage personnel et privé, c'est généralement accepté dans la plupart des juridictions. Tu es responsable de respecter les [Conditions d'Utilisation](https://www.youtube.com/t/terms) de YouTube et les lois sur le droit d'auteur de ton pays.",
  plan_intro: "Toujours prévu — approximativement par ordre de priorité :",
  plan_col1: "Fonctionnalité",
  plan_col2: "Description",
  plan_r1_name: "**Filtres de playlists et chaînes**",
  plan_r1_desc: "Filtres par plage de dates lors de l’énumération d’une playlist ou d’une chaîne",
  plan_r2_name: "**Saisie d'URLs en lot**",
  plan_r2_desc: "Colle plusieurs URLs d'un coup et lance tout ensemble",
  plan_r4_name: "**Modèles de noms de fichier personnalisés**",
  plan_r4_desc:
    "Nomme les fichiers par titre, auteur, date, résolution — avec aperçu en direct",
  plan_r5_name: "**Téléchargements programmés**",
  plan_r5_desc: "Démarre une file à une heure définie (lancements nocturnes)",
  plan_r6_name: "**Limites de vitesse**",
  plan_r6_desc: "Plafonne la bande passante pour ne pas saturer ta connexion",
  plan_r7_name: "**Découpe de clips**",
  plan_r7_desc: "Télécharge uniquement un segment par heure de début/fin",
  plan_cta:
    "Tu as une fonctionnalité en tête ? [Ouvre une demande](../../issues) — les retours de la communauté orientent les priorités.",
  tech_content: TECH_CONTENT,
  tos_h2: "Conditions d'utilisation",
  tos_note:
    "Arroxy est un outil destiné à un usage personnel et privé uniquement. Tu es seul responsable du fait que tes téléchargements respectent les [Conditions d'Utilisation](https://www.youtube.com/t/terms) de YouTube et les lois sur le droit d'auteur de ta juridiction. N'utilise pas Arroxy pour télécharger, reproduire ou distribuer du contenu sur lequel tu n'as pas de droits. Les développeurs ne sont pas responsables de tout usage abusif.",
  footer_credit:
    'Licence MIT · Fait avec soin par <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
