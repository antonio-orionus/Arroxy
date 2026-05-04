const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — shell de bureau multiplateforme
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — styles
- **Zustand** — gestion d'état
- **yt-dlp** + **ffmpeg** — moteur de téléchargement et de muxage (récupérés depuis GitHub au premier lancement, toujours à jour)
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

> yt-dlp et ffmpeg ne sont pas inclus dans le paquet — ils sont récupérés depuis GitHub au premier lancement et mis en cache dans ton dossier de données d'application.

</details>`;

export const fr = {
  icon_alt: "Mascotte Arroxy",
  title: "Arroxy — Téléchargeur YouTube gratuit et open source pour Windows, macOS & Linux",
  read_in_label: "Lire en :",
  badge_release_alt: "Version",
  badge_build_alt: "Build",
  badge_license_alt: "Licence",
  badge_platforms_alt: "Plateformes",
  badge_i18n_alt: "Langues",
  hero_desc:
    "Télécharge n'importe quelle vidéo YouTube, Short ou piste audio en qualité originale — jusqu'à 4K HDR à 60 fps, ou en MP3 / AAC / Opus. Fonctionne en local sur Windows, macOS et Linux. **Pas de pub, pas de connexion, pas de cookies de navigateur, pas de compte Google lié.**",
  cta_latest: "↓ Télécharger la dernière version",
  demo_alt: "Démo Arroxy",
  star_cta: "Si Arroxy te fait gagner du temps, une ⭐ aide les autres à le trouver.",
  ai_notice:
    "> 🌐 Traduction assistée par IA. Le [README en anglais](README.md) fait foi. Tu vois une erreur ? [Les PRs sont les bienvenues](../../pulls).",
  toc_heading: "Sommaire",
  why_h2: "Pourquoi Arroxy",
  nocookies_h2: "Pas de cookies, pas de connexion, pas de compte lié",
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
  nocookies_intro:
    "C'est la raison la plus fréquente pour laquelle les téléchargeurs YouTube de bureau tombent en panne — et la principale raison pour laquelle Arroxy existe.",
  nocookies_setup:
    "Lorsque YouTube met à jour sa détection de bots, la plupart des outils te demandent d'exporter les cookies YouTube de ton navigateur comme contournement. Deux problèmes avec ça :",
  nocookies_p1:
    "Les sessions exportées expirent généralement en ~30 minutes, donc tu dois les ré-exporter constamment.",
  nocookies_p2:
    "La documentation de yt-dlp elle-même [prévient que l'automatisation à base de cookies peut signaler ton compte Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies).",
  nocookies_outro:
    "**Arroxy ne demande jamais de cookies, de connexion, ni d'identifiant.** Il utilise uniquement les tokens publics que YouTube sert à n'importe quel navigateur. Rien de lié à ton identité Google, rien qui expire, rien à faire tourner.",
  feat_quality_h3: "Qualité & formats",
  feat_quality_1: "Jusqu'à **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Haut framerate** préservé tel quel — 60 fps, 120 fps, HDR",
  feat_quality_3: "Export **audio seul** en MP3, AAC ou Opus",
  feat_quality_4: "Préréglages rapides : *Meilleure qualité* · *Équilibré* · *Petit fichier*",
  feat_privacy_h3: "Confidentialité & contrôle",
  feat_privacy_1:
    "Traitement 100 % local — les téléchargements vont directement de YouTube à ton disque",
  feat_privacy_2: "Pas de connexion, pas de cookies, pas de compte Google lié",
  feat_privacy_3: "Fichiers enregistrés directement dans le dossier que tu choisis",
  feat_workflow_h3: "Flux de travail",
  feat_workflow_1:
    "**Colle n'importe quelle URL YouTube** — vidéos et Shorts tous deux supportés",
  feat_workflow_2:
    "**File de téléchargement multi** — suivi de plusieurs téléchargements en parallèle",
  feat_workflow_3:
    "**Surveillance du presse-papiers** — copie un lien YouTube et Arroxy remplit automatiquement l'URL quand tu reviens sur l'app (désactivable dans les Paramètres avancés)",
  feat_workflow_4:
    "**Nettoyage auto des URLs** — supprime les paramètres de tracking (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) et dénoue les liens `youtube.com/redirect`",
  feat_workflow_5:
    "**Mode tray** — fermer la fenêtre garde les téléchargements en cours en arrière-plan",
  feat_workflow_6:
    "**9 langues** — détecte automatiquement la langue du système, modifiable à tout moment",
  feat_post_h3: "Sous-titres & post-traitement",
  feat_post_1:
    "**Sous-titres** en SRT, VTT ou ASS — manuels ou auto-générés, dans toute langue disponible",
  feat_post_2:
    "Enregistre à côté de la vidéo, intègre dans un `.mkv`, ou organise dans un sous-dossier `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — passe ou marque les sponsors, intros, outros, autopromos en chapitres",
  feat_post_4:
    "**Métadonnées intégrées** — titre, date de mise en ligne, chaîne, description, miniature et marqueurs de chapitres écrits dans le fichier",
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
  privacy_p1:
    "Les téléchargements sont récupérés directement via [yt-dlp](https://github.com/yt-dlp/yt-dlp) depuis YouTube vers le dossier que tu choisis — rien ne passe par un serveur tiers. L'historique de visionnage, l'historique de téléchargement, les URLs et le contenu des fichiers restent sur ton appareil.",
  privacy_p2:
    "Arroxy envoie une télémétrie anonyme et agrégée via [Aptabase](https://aptabase.com) — juste assez pour qu'un projet indépendant sache si quelqu'un l'utilise vraiment (lancements, OS, version de l'app, crashs). Pas d'URLs, pas de titres de vidéos, pas de chemins de fichiers, pas d'IPs, pas d'informations de compte — Aptabase est open source et GDPR-friendly par conception. Tu peux te désabonner dans les Paramètres.",
  faq_q1: "C'est vraiment gratuit ?",
  faq_a1: "Oui — licence MIT, pas de niveau premium, pas de fonctions verrouillées.",
  faq_q2: "Quelles qualités de vidéo puis-je télécharger ?",
  faq_a2:
    "Tout ce que YouTube propose : 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, plus audio seul. Les flux 60 fps, 120 fps et HDR sont préservés tels quels.",
  faq_q3: "Puis-je extraire uniquement l'audio en MP3 ?",
  faq_a3: "Oui. Sélectionne *audio seul* dans le menu de format et choisis MP3, AAC ou Opus.",
  faq_q4: "Ai-je besoin d'un compte YouTube ou de cookies ?",
  faq_a4:
    "Non. Arroxy utilise uniquement les tokens publics que YouTube sert à n'importe quel navigateur. Pas de cookies, pas de connexion, pas d'identifiants stockés. Voir [Pas de cookies, pas de connexion, pas de compte lié](#no-cookies) pour comprendre pourquoi c'est important.",
  faq_q5: "Ça continuera de fonctionner si YouTube change quelque chose ?",
  faq_a5:
    "Deux couches de résilience : yt-dlp est mis à jour dans les heures qui suivent les changements YouTube, et Arroxy ne dépend pas de cookies qui expirent toutes les ~30 minutes. Cela le rend notablement plus stable que les outils qui dépendent de sessions de navigateur exportées.",
  faq_q6: "Dans quelles langues Arroxy est-il disponible ?",
  faq_a6:
    "Neuf : English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी. Détecte automatiquement la langue de ton système ; modifiable à tout moment depuis la barre d'outils. Les fichiers de langue sont de simples objets TypeScript dans `src/shared/i18n/locales/` — [les PRs sont les bienvenues](../../pulls).",
  faq_q7: "Dois-je installer autre chose ?",
  faq_a7:
    "Non. yt-dlp et ffmpeg sont téléchargés automatiquement au premier lancement depuis leurs releases officielles GitHub et mis en cache en local.",
  faq_q8: "Puis-je télécharger des playlists ou des chaînes entières ?",
  faq_a8:
    "Les vidéos individuelles et les Shorts uniquement pour l'instant. Le support des playlists et des chaînes est sur la [feuille de route](#roadmap).",
  faq_q9: 'macOS dit "l\'application est endommagée" — que faire ?',
  faq_a9:
    "C'est Gatekeeper de macOS qui bloque une app non signée, pas un vrai endommagement. Voir la section [premier lancement sur macOS](#download) pour la marche à suivre.",
  faq_q10: "Télécharger des vidéos YouTube est-il légal ?",
  faq_a10:
    "Pour un usage personnel et privé, c'est généralement accepté dans la plupart des juridictions. Tu es responsable de respecter les [Conditions d'Utilisation](https://www.youtube.com/t/terms) de YouTube et les lois sur le droit d'auteur de ton pays.",
  plan_intro: "À venir — approximativement par ordre de priorité :",
  plan_col1: "Fonctionnalité",
  plan_col2: "Description",
  plan_r1_name: "**Téléchargement de playlists et chaînes**",
  plan_r1_desc:
    "Colle l'URL d'une playlist ou d'une chaîne ; mets toutes les vidéos en file avec des filtres de date ou de nombre",
  plan_r2_name: "**Saisie d'URLs en lot**",
  plan_r2_desc: "Colle plusieurs URLs d'un coup et lance tout ensemble",
  plan_r3_name: "**Conversion de format**",
  plan_r3_desc: "Convertis les téléchargements en MP3, WAV, FLAC sans outil supplémentaire",
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
