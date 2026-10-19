const TECH_CONTENT = `<details>
<summary><strong>Stack</strong></summary>

- **Electron** — shell de bureau multiplateforme
- **React 19** + **TypeScript** — UI
- **Tailwind CSS v4** — styles
- **Zustand** — gestion d'état
- **yt-dlp** + **ffmpeg** — moteur de téléchargement et de muxage (les deux sont récupérés à l’exécution : yt-dlp est tenu à jour, ffmpeg/ffprobe sont installés une seule fois et conservés d’une mise à jour à l’autre)
- **Vite** + **electron-vite** — outillage de build
- **Vitest** + **Playwright** — tests unitaires et end-to-end

</details>

<details>
<summary><strong>Compiler depuis les sources</strong></summary>

### Prérequis — toutes plateformes

| Outil   | Version | Installation |
| ------- | ------- | ------------ |
| Git     | quelconque | [git-scm.com](https://git-scm.com) |
| Node.js | 24.21.0 | \`mise install\` ou \`.node-version\` |
| Bun     | 1.4.2  | \`mise install\` ou \`package.json\` \`packageManager\` |

Recommandé : installe \`mise\`, puis lance \`mise install\` dans le checkout. Sans mise, active manuellement Node.js depuis \`.node-version\` et Bun depuis \`package.json\` avant \`bun run bootstrap\`.

### Windows

\`\`\`powershell
powershell -c "irm bun.sh/install.ps1 | iex"
\`\`\`

Visual Studio Build Tools et Python peuvent être nécessaires pour les recompilations natives.

### macOS

\`\`\`bash
brew install mise
xcode-select --install
\`\`\`

Après le clonage, lance \`mise trust && mise install\` depuis le checkout. Si ton shell utilise déjà \`fnm\`, \`nvm\` ou un Bun installé via Homebrew, active mise dans \`~/.zshrc\` pour qu'Arroxy utilise Node.js 24.21.0 et Bun 1.4.2 :

\`\`\`bash
printf '\n# mise\nif command -v mise >/dev/null 2>&1; then\n  eval "$(mise activate zsh)"\nfi\n' >> ~/.zshrc
exec zsh
\`\`\`

### Linux (Ubuntu / Debian)

\`\`\`bash
curl -fsSL https://bun.sh/install | bash

# Dépendances de build et runtime Electron
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# Tests E2E uniquement (Electron a besoin d'un affichage)
sudo apt install -y xvfb
\`\`\`

### Cloner & lancer

\`\`\`bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommandé ; saute cette étape si tu as activé les outils épinglés manuellement
bun run bootstrap
bun run doctor
bun run dev            # app Electron contre le renderer Vite
\`\`\`

### Créer un paquet distribuable

\`\`\`bash
bun run build        # vérification des types + compilation
bun run dist         # paquet pour l'OS actuel
bun run dist:win     # paquet Windows sur un hôte compatible
\`\`\`

> \`bun run bootstrap\` installe les dépendances, reconstruit les dépendances Electron, vérifie Electron, prépare les ffmpeg/ffprobe intégrés pour le développement et installe Playwright Chromium. Les builds de release gèrent yt-dlp, ffmpeg et ffprobe à l'exécution dans le dossier de données de l’app ; aucun n’est inclus dans l’installateur.

</details>`;

export const fr = {
  icon_alt: "Mascotte Arroxy",
  title:
    "Arroxy — Téléchargeur YouTube (+ 2000 sites) gratuit et open source avec navigateur intégré pour Windows, macOS & Linux",
  read_in_label: "Lire en :",
  badge_release_alt: "Version",
  badge_build_alt: "Build",
  badge_license_alt: "Licence",
  badge_platforms_alt: "Plateformes",
  badge_i18n_alt: "Langues",
  badge_website_alt: "Site web",
  discord_badge_text: "Rejoindre la communauté Discord",
  discord_badge_encoded: "Rejoindre%20la%20communaut%C3%A9%20Discord",
  hero_desc:
    "Télécharge des vidéos, Shorts, musiques, chaînes, podcasts ou pistes audio depuis **YouTube et plus de 2000 sites supportés** — jusqu'à 8K HDR à 60 fps, en MP3 / AAC / Opus, ou seulement le passage dont tu as besoin. **Parcours YouTube ou n'importe quel autre site dans Arroxy** depuis l'onglet Explore et télécharge la vidéo, la playlist ou la chaîne que tu regardes ; connecte-toi là pour télécharger les vidéos privées, réservées aux membres et soumises à une limite d'âge que ton compte peut voir. Fonctionne en local sur Windows, macOS et Linux. **Pas de pub, pas de superflu, pas d'upsell.**",
  cta_latest: "↓ Télécharger la dernière version",
  cta_website: "Site web",
  star_cta:
    "Si Arroxy te fait gagner du temps, une ⭐ aide les autres à le trouver.",
  ai_notice:
    "> 🌐 Traduction assistée par IA. Le [README en anglais](README.md) fait foi. Tu vois une erreur ? [Les PRs sont les bienvenues](../../pulls).",
  toc_heading: "Sommaire",
  why_h2: "Pourquoi Arroxy",
  features_h2: "Fonctionnalités",
  dl_h2: "Installation et premier lancement",
  privacy_h2: "Confidentialité",
  faq_h2: "Questions fréquentes",
  roadmap_h2: "Feuille de route",
  tech_h2: "Construit avec",
  why_intro:
    "Une comparaison côte à côte avec les alternatives les plus courantes :",
  why_r1: "Gratuit, pas de niveau premium",
  why_r2: "Open source",
  why_r3: "Traitement 100 % local",
  why_r5: "Pas de limites d'utilisation",
  why_r6: "Application de bureau multiplateforme",
  why_r7: "Sous-titres + SponsorBlock",
  why_r8: "Navigateur intégré (parcourir, se connecter, télécharger)",
  why_r9:
    "Vidéos privées, réservées aux membres et soumises à une limite d'âge sans exporter de cookies",
  why_table_note:
    "⚠️ = en partie, ou seulement dans une offre payante. Dans 4K Video Downloader, la connexion intégrée pour les vidéos privées est une fonction payante ; la plupart des GUI yt-dlp gratuites n'acceptent qu'un fichier de cookies ou lisent les cookies de ton navigateur web.",
  why_summary:
    "Arroxy est conçu pour une seule chose : un fichier local propre, que tu colles une URL ou que tu trouves la vidéo dans Explore. Pas d'upsell, pas de collecte de données.",
  why_explore_h3:
    "Ce qu'un simple wrapper yt-dlp ne sait pas faire : l'onglet Explore",
  why_explore_intro:
    "La plupart des téléchargeurs YouTube gratuits ne sont qu'un champ d'URL posé sur yt-dlp. Arroxy utilise aussi yt-dlp, mais il a en plus **Explore**, un navigateur intégré à l'application qui ouvre YouTube ou n'importe quel autre site. Explore franchit des limites qu'un simple champ d'URL ne peut pas franchir :",
  why_explore_1:
    "**Les vidéos qui demandent un compte, sans exporter de cookies** — vidéos privées, réservées aux membres et soumises à une limite d'âge (avec un compte dont l'âge est vérifié), ainsi que tes listes À regarder plus tard et J'aime, et les vidéos protégées par une connexion sur d'autres sites. Un simple wrapper a besoin d'un export cookies.txt ou doit lire les cookies de ton navigateur web, ce que Chrome sous Windows bloque désormais. Dans Arroxy, tu te connectes une fois dans Explore et il s'occupe du reste",
  why_explore_2:
    "**« Connectez-vous pour confirmer que vous n'êtes pas un robot »** — quand YouTube affiche ce message, Arroxy relance le téléchargement avec ta connexion Explore au lieu d'échouer",
  why_explore_3:
    "**Le jeton de téléchargement de YouTube** — le navigateur intégré d'Arroxy obtient le jeton que YouTube attend avant un téléchargement. Sans lui, YouTube peut proposer moins de formats et une qualité inférieure à celle demandée",
  why_explore_4:
    "**Pas de liens à copier** — trouve une vidéo, une playlist ou une chaîne dans Explore et télécharge-la en un clic, ou fais un clic droit sur n'importe quel lien de la page",
  why_explore_5:
    "**Bloqueur de publicités quand tu veux** — un clic sur le bouclier et Explore bloque les publicités et les traqueurs sur ses pages",
  feat_explore_h3: "Explore : parcours le web dans Arroxy",
  feat_explore_1: "**Onglet Explore** — parcours YouTube ou n'importe quel autre site dans Arroxy et télécharge ce que tu trouves sans copier de liens. **Télécharger · *ton profil*** met en file la vidéo, la playlist ou la chaîne que tu regardes ; la flèche à côté change de profil, et la baguette ouvre le téléchargement pas à pas pour choisir les formats, les sous-titres, etc.",
  feat_explore_6: "**Clic droit pour télécharger** — fais un clic droit sur n'importe quel lien de vidéo, de playlist ou de chaîne dans Explore pour le télécharger avec ton profil, choisir un autre profil dans **Télécharger avec**, ouvrir le téléchargement pas à pas ou copier le lien. Inutile d'ouvrir chaque vidéo d'abord",
  feat_explore_7: "**Disposition compacte** — un clic dans la barre d'outils d'Explore y déplace les onglets d'Arroxy et donne plus de place à la page",
  feat_explore_2: "**Barre d'adresse** — tape pour chercher sur YouTube, ou saisis n'importe quelle adresse web pour ouvrir ce site",
  feat_explore_3: "**Téléchargements qui demandent un compte** — connecte-toi une fois dans Explore et Arroxy pourra télécharger les vidéos privées et réservées aux membres que ton compte peut voir, les vidéos soumises à une limite d'âge si l'âge du compte est vérifié, ainsi que tes listes À regarder plus tard et J'aime. Connecte-toi aussi aux autres sites là-bas : leurs téléchargements utilisent cette connexion quand ils en ont besoin. Arroxy télécharge toujours d'abord sans connexion et n'utilise ta connexion Explore que lorsqu'un téléchargement échoue d'une manière qu'un compte peut corriger. Quand YouTube demande de confirmer que tu n'es pas un robot, Arroxy essaie aussi ta connexion Explore",
  feat_explore_4: "**Utilise un compte secondaire** — le premier écran d'Explore explique pourquoi : télécharger avec un compte comporte un certain risque que ce compte soit restreint. Déconnecte-toi d'Explore depuis les Paramètres quand tu veux oublier tes connexions",
  feat_explore_5: "**Bloqueur de publicités** — désactivé par défaut. Un clic sur le bouclier dans la barre d'outils d'Explore bloque les publicités et les traqueurs sur ses pages, sans toucher aux téléchargements. YouTube peut résister aux bloqueurs de publicités pour les comptes connectés",
  feat_quality_h3: "Qualité & formats",
  feat_quality_1: "Jusqu'à **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p",
  feat_quality_2: "**Haut framerate et HDR** préservés tels quels — 60 fps, HDR10",
  feat_quality_3:
    "**Audio** — exporte l'audio seul en MP3, M4A/AAC, Opus ou WAV. Dans les téléchargements interactifs, choisis les pistes natives surround/Dolby de la source (AC-3, E-AC-3, 5.1, DRC) quand elles sont disponibles, ou définis une valeur par défaut globale **Préférer le surround / Dolby**",
  feat_quality_4:
    "**Des profils avec un objectif** — *Meilleure image* (AV1 · VP9) ou *TV connectée* (MP4 · H.264), enregistrés en Auto, MP4, MKV ou WebM sans réencodage. Le HDR est *Auto* (seulement si ton écran peut l'afficher), *SDR* ou *HDR*",
  feat_quality_5:
    "**Chaque codec à chaque résolution** — le téléchargement pas à pas affiche AV1, VP9 et H.264 côte à côte pour chaque résolution, pour que tu choisisses celui que ta TV ou ton logiciel de montage sait lire",
  feat_quality_6:
    "**Sache ce qu'est vraiment un flux** — les tailles que YouTube a agrandies par IA, les langues audio doublées par IA, les flux à débit amélioré, les vidéos 360° et les copies endommagées ou filigranées sont signalés. Les profils ignorent les flux agrandis par IA, sauf si tu les autorises",
  feat_privacy_h3: "Confidentialité & contrôle",
  feat_privacy_1:
    "Traitement 100 % local — les téléchargements vont directement de YouTube à ton disque",
  feat_privacy_2: "Pas de connexion, pas de cookies, pas de compte Google lié",
  feat_privacy_3:
    "Fichiers enregistrés directement dans le dossier que tu choisis",
  feat_workflow_h3: "Flux de travail",
  feat_workflow_12: "**Raccourci de téléchargement global** — copie un lien dans n'importe quelle app et appuie sur `Ctrl+Shift+D` (`Cmd+Shift+D` sur macOS) ; Arroxy le met en file d'attente avec ton profil actif sans ouvrir la fenêtre, et une notification le confirme. Actif par défaut, réassignable",
  feat_workflow_1: "**Modes de démarrage flexibles** — choisis un téléchargement unique guidé, un sélecteur de playlist/chaîne, un collage d’URL en lot, Quick Download avec tes valeurs par défaut enregistrées, ou parcours et télécharge depuis Explore",
  feat_workflow_2:
    "**File de téléchargement centrale** — chaque tâche unique, playlist, lot ou rapide arrive au même endroit pour suivre, mettre en pause, reprendre, annuler, réessayer et gérer la priorité",
  feat_workflow_3:
    "**Surveillance du presse-papiers** — copie un lien vidéo et il remplit le champ URL quand tu reviens sur Arroxy, avec **Annuler** si ce n'était pas voulu. Si Arroxy est occupé, le lien attend que tu sois de retour sur l'onglet URL (désactivable dans les Réglages)",
  feat_workflow_4:
    "**Nettoyage auto des URLs** — supprime les paramètres de tracking (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) et dénoue les liens `youtube.com/redirect`",
  feat_workflow_5:
    "**Mode tray** — fermer la fenêtre garde les téléchargements en cours en arrière-plan",
  feat_workflow_6:
    "**{{LANG_COUNT}} langues** — détecte automatiquement les paramètres régionaux du système, modifiable à tout moment",
  feat_workflow_7:
    "**Synchronisation de playlist** — rescane une playlist par rapport à un dossier local pour ignorer les vidéos déjà téléchargées ; génère un fichier de playlist `.m3u` mis à jour à chaque vidéo téléchargée",
  feat_workflow_8:
    "**Contrôles de vitesse et de rythme** — limite la bande passante, définis combien de parties d'une vidéo se téléchargent à la fois et ajoute des pauses entre les requêtes avec des préréglages (*Désactivé · Équilibré · Prudent · Personnalisé*)",
  feat_workflow_9:
    "**Modèles de nom de fichier** — nommez vos téléchargements comme vous voulez avec `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` et `{playlist_index}`, globalement ou par profil de téléchargement",
  feat_workflow_10:
    "**Téléchargements simultanés et réessai automatique** — choisis combien de téléchargements de la file s'exécutent en même temps et laisse Arroxy réessayer un téléchargement ayant rencontré un problème réseau ou serveur, en attendant plus longtemps avant chaque tentative",
  feat_workflow_11:
    "**Profils par élément de playlist** — attribuez à chaque vidéo d'une playlist son propre profil de téléchargement au lieu d'un seul réglage pour toute la liste, pour archiver certaines en pleine qualité et récupérer le reste en MP3 en une seule passe",
  feat_workflow_13: "**Quick Download fonctionne en arrière-plan** — le lien apparaît tout de suite dans Téléchargements et s'y prépare, une note avec **Voir** le confirme, et le champ d'URL se vide pour le lien suivant. Lances-en autant que tu veux pendant que les précédents se préparent",
  feat_workflow_14: "**Téléchargements te dit ce qui a besoin de toi** — si Arroxy ne peut pas lire un lien, sa ligne explique pourquoi et propose la solution : Réessayer, activer les cookies ou se connecter dans Explore. Quand les cookies sont désactivés, **Se connecter avec Explore** le relance pour toi une fois connecté. Une playlist plus longue que ta limite de chargement attend sur sa ligne que tu choisisses tout, les premières vidéos ou une revue. L'onglet Téléchargements compte les lignes qui t'attendent",
  feat_workflow_15:
    "**Téléchargez seulement une partie d'une vidéo** : choisissez un début et une fin, ou un chapitre, sur l'écran Format et Arroxy n'enregistre que cet intervalle, indiqué dans le nom après l'identifiant de la vidéo. Les coupes tombent sur l'image clé la plus proche ; activez la coupe exacte pour réencoder à la place",
  feat_workflow_16:
    "**Retirer les téléchargements terminés** — facultatif : un téléchargement terminé quitte la liste 5 secondes plus tard. Ses fichiers restent sur le disque, et les téléchargements en échec restent listés",
  feat_workflow_17:
    "**Taille et Manquant dans Téléchargements** — une colonne **Taille** triable indique l'espace pris par chaque téléchargement, et **Manquant** signale les fichiers déplacés ou supprimés en dehors d'Arroxy",
  feat_workflow_18:
    "**Aurora ou Minimaliste, sombre ou clair** — des panneaux de verre sur un ciel en mouvement, ou des surfaces pleines et discrètes ; bascule depuis le pied de page. Les ordinateurs sans accélération graphique passent automatiquement en Minimaliste",
  feat_workflow_19:
    "**Barre des menus du Mac** — sous macOS, ouvre les Réglages (`Cmd+,`), règle la limite de vitesse de téléchargement, change le style et le thème, et ouvre les journaux ou enregistre un fichier de diagnostic depuis la barre des menus",
  feat_workflow_20:
    "**Modifier un profil depuis n'importe quel téléchargement** — ajuste un téléchargement, puis mets à jour le profil dont il est parti (avec un aperçu de ce qui change) ou enregistre les réglages comme nouveau profil. Changer de profil te demande si tu veux garder tes modifications",
  feat_post_h3: "Sous-titres & post-traitement",
  feat_post_1:
    "**Sous-titres** en SRT, VTT ou ASS — manuels ou auto-générés, dans toute langue disponible",
  feat_post_2:
    "Enregistre à côté de la vidéo, intègre dans un `.mkv`, ou organise dans un sous-dossier `Subtitles/`",
  feat_post_3:
    "**SponsorBlock** — passe ou marque les sponsors, intros, outros, autopromos en chapitres",
  feat_post_4:
    "**Métadonnées intégrées** — titre, date de mise en ligne, chaîne, description, miniature et marqueurs de chapitres écrits dans le fichier",
  feat_post_5:
    "**Lots sous-titres uniquement** — collez une liste d'URL ou ouvrez une playlist, choisissez Sous-titres et ne récupérez que les fichiers de sous-titres de chaque vidéo",
  feat_sites_h3: "YouTube + 2000 sites",
  feat_sites_1:
    "**YouTube, en entier** — Vidéos, Shorts, Chaînes, Playlists, YouTube Music et Podcasts traités comme des sources de premier rang",
  feat_sites_2:
    "**2000+ autres sites** via yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable et bien plus encore",
  feat_sites_3:
    "**L'audio seul et les sous-titres** fonctionnent sur chaque site supporté, pas seulement YouTube",
  feat_sites_4:
    "Si un site change, yt-dlp publie des correctifs chaque semaine et Arroxy met à jour le binaire automatiquement au lancement",
  shot1_cap:
    "<b>Accueil Téléchargement rapide</b><br/>Collez une URL et lancez-la aussitôt avec votre profil actif",
  shot2_cap:
    "<b>Profils de téléchargement réutilisables</b><br/>Enregistrez format, qualité et sortie en préréglages — réutilisés à chaque téléchargement",
  shot3_cap:
    "<b>Pistes audio multilingues</b><br/>Choisissez la langue audio exacte fournie par la vidéo",
  shot4_cap:
    "<b>Audio Surround / Dolby</b><br/>Pistes 5.1 et Dolby détectées et conservées",
  shot5_cap:
    "<b>Mode URL en masse</b><br/>Collez une liste, dédoublonnage auto, tout mettre en file d'un coup",
  shot6_cap:
    "<b>File de téléchargement parallèle</b><br/>Plusieurs téléchargements à la fois avec progression en direct",
  hotkey_fig_alt: "Raccourci de téléchargement global d'Arroxy — Ctrl+Shift+D sur Windows et Linux, Cmd+Shift+D sur macOS, qui envoie le lien copié directement dans la file de téléchargement",
  hotkey_fig_cap: "<b>Raccourci de téléchargement global</b><br/>Copie un lien n'importe où, appuie une fois — il rejoint la file et le téléchargement démarre",
  shot7_cap: "<b>Profils par élément de playlist</b><br/>Donnez à chaque vidéo son propre profil — certaines en 4K, le reste en MP3",
  shot8_cap: "<b>Explore</b><br/>Parcours YouTube ou n'importe quel autre site dans Arroxy et télécharge la page où tu es avec ton profil actif",
  shot9_cap: "<b>Le premier écran d'Explore</b><br/>Un coup d'œil rapide à Explore, et pourquoi un compte secondaire est la connexion la plus sûre",
  shot10_cap: "<b>Téléchargements te dit ce qui a besoin de toi</b><br/>Les liens se préparent en arrière-plan ; un lien en échec propose sa solution, une longue playlist attend ton choix",
  shot11_cap:
    "<b>Téléchargez seulement une partie de la vidéo</b><br/>Choisissez un début et une fin, ou un chapitre — Arroxy n’enregistre que cette plage",
  shot12_cap:
    "<b>Éditeur de profils</b><br/>Réglez un profil : type de fichier, résolution, sous-titres, destination, modèle de nom de fichier et plus encore",
  shot13_cap:
    "<b>Sombre ou clair, verre ou uni</b><br/>Quatre styles au choix : des panneaux de verre sur un ciel animé ou des surfaces unies et calmes, chacun en sombre et en clair",
  dl_platform_col: "Plateforme",
  dl_format_col: "Format",
  dl_oneline_note:
    "Les versions sont uniquement x86_64. Pas de `curl` ? Remplacez `curl -fsSL` par `wget -qO-`.",
  dl_win_scoop:
    "Vous préférez Scoop ? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`",
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
    'Au premier lancement, tu peux voir **"Windows protected your PC"** ou **"Unknown publisher."** Cela s\'applique à la fois à `Arroxy-win-x64-Setup.exe` et à `Arroxy-win-x64-Portable.exe`. Arroxy est gratuit et open source, et les builds Windows ne sont pas signés avec un certificat payant, c\'est pourquoi SmartScreen les signale. Cela ne signifie **pas** automatiquement qu\'Arroxy est dangereux. Pour continuer :',
  dl_win_smartscreen_step1: "Clique sur **More info**.",
  dl_win_smartscreen_step2: "Clique sur **Run anyway**.",
  dl_win_smartscreen_official:
    "Ne télécharge Arroxy que depuis la page officielle GitHub Releases. Si tu as obtenu le fichier depuis un autre site ou que quelqu'un te l'a envoyé, supprime-le et télécharge une copie fraîche depuis la source officielle. Le code source est public, tu peux donc l'inspecter ou compiler Arroxy toi-même si tu préfères.",
  dl_macos_h3: "Premier lancement sur macOS",
  dl_macos_warning:
    "Arroxy n'est pas encore signé, donc Gatekeeper de macOS peut afficher l'avertissement d'app endommagée au premier lancement. C'est normal — cela ne veut pas dire que les fichiers sont réellement endommagés.",
  dl_macos_m1_h4: "Méthode Terminal :",
  dl_macos_step1:
    "Fais glisser `Arroxy.app` depuis le DMG monté vers `/Applications`.",
  dl_macos_step2:
    "Ouvre Terminal et exécute `sudo xattr -dr com.apple.quarantine /Applications/Arroxy.app`.",
  dl_macos_step3: "Exécute `open /Applications/Arroxy.app`.",
  dl_macos_step4:
    "Si le chemin de l'app est différent, remplace `/Applications/Arroxy.app` par le chemin où tu l'as installée.",
  dl_macos_step5:
    "Saisis le mot de passe de ton Mac si `sudo` le demande.",
  dl_macos_after:
    "Une fois la quarantaine retirée, Arroxy s'ouvre normalement.",
  dl_macos_m2_h4: "Méthode Terminal :",
  dl_macos_note:
    "Les builds macOS sont produits via CI sur des runners Apple Silicon et Intel. Si tu rencontres des problèmes, merci d'[ouvrir un issue](../../issues) — les retours des utilisateurs macOS orientent activement le cycle de test macOS.",
  dl_linux_h3: "Premier lancement sur Linux",
  dl_linux_intro:
    "Les AppImages s'exécutent directement — pas d'installation. Tu dois juste marquer le fichier comme exécutable.",
  dl_linux_m1_text:
    "**Gestionnaire de fichiers :** clic droit sur le `.AppImage` → **Propriétés** → **Permissions** → active **Autoriser l'exécution du fichier comme programme**, puis double-clique.",
  dl_linux_m2_h4: "Terminal :",
  dl_linux_fuse_text: "Si le lancement échoue encore, lance-le sans montage — aucun paquet FUSE n'est nécessaire :",
  dl_linux_targz_h4: "Archive simple (sans FUSE, sans installation) :",
  dl_linux_targz_text: "La version `.tar.gz` est la même application sans l'enveloppe AppImage : décompresse-la où tu veux et lance-la. Ni installateur ni paquet FUSE.",
  dl_linux_arch_note: "**Les téléchargements Linux sur la page des versions sont uniquement en x86_64.** Sur les machines ARM64 (Raspberry Pi, Asahi Linux) le Flatpak s'installe mais échoue au lancement avec `bwrap: execvp ldconfig: Exec format error`.",
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
    "Arroxy n'est pas encore signé pour macOS, donc Gatekeeper peut afficher le message inquiétant *\"Arroxy.app is damaged and can't be opened\"* après l'installation depuis le DMG. Ce message signifie que macOS a mis en quarantaine une app non signée ; il ne veut pas dire que les fichiers de l'app sont réellement endommagés. Sur les versions actuelles de macOS, la méthode fiable est Terminal :",
  dl_macos_sequoia_h4: "Correction Terminal pour le macOS actuel",
  dl_macos_sequoia_intro:
    "Utilise Terminal après avoir copié Arroxy dans Applications :",
  dl_macos_sequoia_step1:
    "Fais glisser `Arroxy.app` depuis le DMG monté vers `/Applications`.",
  dl_macos_sequoia_step2:
    "Ouvre Terminal et exécute ces deux commandes :",
  dl_macos_sequoia_step3:
    "Exécute `open /Applications/Arroxy.app` pour lancer Arroxy.",
  dl_macos_sequoia_step4:
    "Si le chemin de l'app est différent, remplace `/Applications/Arroxy.app` par le chemin où tu l'as installée.",
  dl_macos_sonoma_h4: "Correction Terminal pour les anciens macOS",
  dl_macos_sonoma_step1:
    "Fais glisser `Arroxy.app` depuis le DMG monté vers `/Applications`.",
  dl_macos_sonoma_step2:
    "Ouvre Terminal et retire la quarantaine de `/Applications/Arroxy.app`.",
  dl_macos_sonoma_step3:
    "Lance Arroxy depuis Terminal ou Finder après le retrait de la quarantaine.",
  dl_macos_damaged_h4:
    "Correction de la quarantaine Gatekeeper",
  dl_macos_damaged_p:
    "La première commande retire l'attribut de quarantaine de ta copie installée d'Arroxy. La seconde lance l'app. `sudo` peut demander le mot de passe de ton Mac ; Terminal n'affiche aucun caractère pendant la saisie.",
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
    "Aucune télémétrie — juste un signal anonyme par jour : version de l’app, OS, langue, canal d’installation et pays, pour compter les utilisateurs actifs. Aucun identifiant, URL, titre de vidéo, chemin de fichier ni info de compte. Tu peux le désactiver dans les Paramètres.",
  privacy_p3: "Explore garde ses propres connexions, séparées de ton navigateur, et Arroxy ne lit ni ne remplit jamais un formulaire de connexion : tu saisis tes identifiants sur la page du site elle-même. Les téléchargements se font sans connexion ; seulement quand l'un échoue d'une manière qu'un compte peut corriger, Arroxy relit la connexion à ce moment-là, la garde dans un fichier temporaire pour ce téléchargement et supprime le fichier ensuite. Se déconnecter d'Explore dans les Paramètres les oublie.",
  faq_q1: "C'est vraiment gratuit ?",
  faq_a1:
    "Oui — licence MIT, pas de niveau premium, pas de fonctions verrouillées.",
  faq_q11: "En quoi Arroxy se distingue-t-il des autres GUI yt-dlp ?",
  faq_a11:
    "La plupart des GUI yt-dlp gratuites sont des wrappers qui n'acceptent qu'un lien. Arroxy ajoute **Explore**, un navigateur intégré à l'application qui ouvre YouTube ou n'importe quel autre site : tu parcours et télécharges sans copier de liens, et tu t'y connectes une fois pour télécharger les vidéos privées, réservées aux membres et soumises à une limite d'âge ainsi que tes listes À regarder plus tard et J'aime, sans exporter de cookies. Arroxy utilise cette connexion quand YouTube te demande de confirmer que tu n'es pas un robot, et son navigateur intégré obtient le jeton de téléchargement de YouTube pour que les téléchargements ne se rabattent pas sur moins de formats. Voir [Pourquoi Arroxy](#why).",
  faq_q2: "Quelles qualités de vidéo puis-je télécharger ?",
  faq_a2:
    "Tout ce que YouTube propose : 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, plus audio seul. Les flux 60 fps et HDR sont préservés tels quels, et le téléchargement pas à pas te laisse choisir AV1, VP9 ou H.264 à chaque résolution.",
  faq_q3: "Puis-je extraire uniquement l'audio en MP3 ?",
  faq_a3:
    "Oui. Choisis *audio seul* dans le menu des formats puis MP3, M4A/AAC, Opus ou WAV.",
  faq_q4: "Comment télécharger des vidéos qui demandent un compte YouTube ?",
  faq_a4: "Connecte-toi une fois dans l'onglet Explore. Arroxy pourra alors télécharger les vidéos privées et réservées aux membres que ton compte peut voir, les vidéos soumises à une limite d'âge si l'âge du compte est vérifié, ainsi que tes listes À regarder plus tard et J'aime. Il n'utilise la connexion que lorsqu'un téléchargement échoue d'une manière qu'un compte peut corriger ; tout le reste se télécharge comme avant. C'est le choix **Connexion Explore**, listé en premier et marqué Recommandé dans les paramètres des cookies, et Arroxy le sélectionne pour toi la première fois que tu ouvres Explore. Le wiki de yt-dlp note que [l'automatisation avec un compte connecté peut signaler un compte Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), donc un compte secondaire est le choix le plus sûr.",
  faq_q5: "Ça continuera de fonctionner si YouTube change quelque chose ?",
  faq_a5: "yt-dlp est mis à jour automatiquement au lancement, et Arroxy publie des correctifs rapidement quand YouTube change quelque chose. Quand YouTube demande de confirmer que tu n'es pas un robot, Arroxy essaie aussi ta connexion Explore si tu t'y es connecté, et les cookies d'un fichier ou de ton navigateur sont disponibles dans les paramètres des cookies.",
  faq_q6: "Dans quelles langues Arroxy est-il disponible ?",
  faq_a6:
    "{{LANG_COUNT}} langues prêtes à l’emploi : {{LANG_NAME_LIST}}. Arroxy détecte automatiquement la langue de ton système d’exploitation au premier lancement, et tu peux changer à tout moment depuis le sélecteur de langue dans la barre d’outils. Les JSON de locale Runtime se trouvent dans src/shared/i18n/locales/, et les catalogues PO destinés aux traducteurs se trouvent dans i18n/locales/ — ouvre une PR sur GitHub pour contribuer.",
  faq_q7: "Dois-je installer autre chose ?",
  faq_a7:
    "Non. yt-dlp, ffmpeg et ffprobe sont téléchargés automatiquement au premier lancement et mis en cache sur ta machine. Après ça, aucune configuration supplémentaire.",
  faq_q8: "Puis-je télécharger des playlists ou des chaînes entières ?",
  faq_a8:
    "Oui — les deux. Colle une URL de playlist ou de chaîne (p. ex. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`) ; choisis combien d’entrées analyser, puis mets toute la liste en file ou sélectionne des vidéos précises. Les filtres par date arrivent bientôt.",
  faq_q9: 'macOS dit "l\'application est endommagée" — que faire ?',
  faq_a9:
    "C'est Gatekeeper de macOS qui bloque une app non signée, pas un vrai endommagement. Voir [macOS first launch](#macos-first-launch) pour les commandes Terminal qui retirent la quarantaine et lancent Arroxy.",
  faq_q10: "Télécharger des vidéos YouTube est-il légal ?",
  faq_a10:
    "Pour un usage personnel et privé, c'est généralement accepté dans la plupart des juridictions. Tu es responsable de respecter les [Conditions d'Utilisation](https://www.youtube.com/t/terms) de YouTube et les lois sur le droit d'auteur de ton pays.",
  plan_intro: "Toujours prévu — approximativement par ordre de priorité :",
  plan_col1: "Fonctionnalité",
  plan_col2: "Description",
  plan_r1_name: "**Filtres de playlists et chaînes**",
  plan_r1_desc:
    "Filtres par plage de dates lors de l’énumération d’une playlist ou d’une chaîne",
  plan_r2_name: "**Préférences de pistes audio YouTube**",
  plan_r2_desc:
    "Définir une piste de langue parlée préférée pour toute l’app, avec des choix différents par profil quand YouTube propose plusieurs pistes audio",
  plan_r3_name: "**Reprise par nouvel essai renforcée**",
  plan_r3_desc:
    "Un nouveau chemin de relance pour les téléchargements interrompus par des connexions internet instables ou problématiques",
  plan_r4_name: "**Tiroir de gestionnaire de téléchargements complet**",
  plan_r4_desc:
    "Transformer le tiroir de file en gestionnaire plus complet, avec changement de dossier de destination pour les éléments en file",
  plan_r5_name: "**Téléchargements programmés**",
  plan_r5_desc: "Démarre une file à une heure définie (lancements nocturnes)",
  plan_r9_name: "**Paquet AUR**",
  plan_r9_desc: "Installation sur Arch Linux et Omarchy avec `yay -S arroxy-bin`",
  plan_cta:
    "Tu as une fonctionnalité en tête ? [Ouvre une demande](../../issues) — les retours de la communauté orientent les priorités.",
  tech_content: TECH_CONTENT,
  support_h2: "Soutenir Arroxy",
  support_note: "Arroxy est gratuit et sous licence MIT — pas de publicité, pas de télémétrie, pas de version payante. S'il te fait gagner du temps, tu peux soutenir le développement avec Bitcoin, Tron ou Ethereum : les adresses se trouvent dans [DONATE.md](DONATE.md), la seule source officielle. Arroxy ne t'enverra jamais d'adresse par e-mail ou par message privé. Mettre une étoile au dépôt, signaler des bugs et améliorer les traductions aident tout autant.",
  tos_h2: "Conditions d'utilisation",
  tos_note:
    "Arroxy est un outil destiné à un usage personnel et privé uniquement. Tu es seul responsable du fait que tes téléchargements respectent les [Conditions d'Utilisation](https://www.youtube.com/t/terms) de YouTube et les lois sur le droit d'auteur de ta juridiction. N'utilise pas Arroxy pour télécharger, reproduire ou distribuer du contenu sur lequel tu n'as pas de droits. Les développeurs ne sont pas responsables de tout usage abusif.",
  footer_credit:
    'Licence MIT · Fait avec soin par <a href="https://x.com/OrionusAI">@OrionusAI</a>',
};
