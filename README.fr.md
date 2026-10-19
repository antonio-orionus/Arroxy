<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Mascotte Arroxy" width="180" />

# Arroxy — Téléchargeur YouTube (+ 2000 sites) gratuit et open source avec navigateur intégré pour Windows, macOS & Linux

**Built-in browser · Members-only & age-restricted · 4K · 60fps · HDR · Dolby audio · Part of a video · Playlists · Shorts · MP3 · Subtitles · SponsorBlock · +2000 sites**

**Lire en :** [Afaan Oromoo](README.om.md) · [Bahasa Indonesia](README.id.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · **Français** · [Italiano](README.it.md) · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Polski](README.pl.md) · [Português](README.pt.md) · [Tiếng Việt](README.vi.md) · [Türkçe](README.tr.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [فارسی](README.fa.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [မြန်မာဘာသာ](README.my.md) · [ខ្មែរ](README.km.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-Hant.md)

[![Version](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Build](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Site web](https://img.shields.io/badge/website-orionus.dev%2Farroxy-blueviolet)](https://orionus.dev/arroxy/) ![Licence](https://img.shields.io/badge/license-MIT-green) ![Plateformes](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Langues](https://img.shields.io/badge/i18n-31_languages-blue)

Télécharge des vidéos, Shorts, musiques, chaînes, podcasts ou pistes audio depuis **YouTube et plus de 2000 sites supportés** — jusqu'à 8K HDR à 60 fps, en MP3 / AAC / Opus, ou seulement le passage dont tu as besoin. **Parcours YouTube ou n'importe quel autre site dans Arroxy** depuis l'onglet Explore et télécharge la vidéo, la playlist ou la chaîne que tu regardes ; connecte-toi là pour télécharger les vidéos privées, réservées aux membres et soumises à une limite d'âge que ton compte peut voir. Fonctionne en local sur Windows, macOS et Linux. **Pas de pub, pas de superflu, pas d'upsell.**

[**↓ Télécharger la dernière version**](#install) &nbsp;·&nbsp; [**Site web**](https://orionus.dev/arroxy/) &nbsp;·&nbsp; [Premier lancement sur Windows](#windows-first-launch) · [Premier lancement sur macOS](#macos-first-launch) · [Premier lancement sur Linux](#linux-first-launch)

[![Rejoindre la communauté Discord](https://img.shields.io/badge/Rejoindre%20la%20communaut%C3%A9%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/ueGvXwQH8y)

<img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing YouTube, with the Download button for the active profile" width="720" />

Si Arroxy te fait gagner du temps, une ⭐ aide les autres à le trouver.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 13+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> **Key difference: a built-in browser.** Most free YouTube downloaders are thin yt-dlp wrappers: a URL box and a format menu, with no browser of their own. Arroxy has one, the **Explore tab**. You browse YouTube or any other site inside the app and download the video, playlist, or channel you're on, or right-click any link. You sign in once in Explore, and Arroxy downloads private, members-only, and age-restricted videos your account can watch, plus your Watch Later and Liked lists, with no cookie export. Sign in to other sites there too, and their downloads use that sign-in when they need it. It retries with that sign-in when YouTube asks you to confirm you're not a bot. Its built-in browser also gets the token YouTube expects before a download, so YouTube doesn't cut a download down to fewer formats. A URL-box wrapper hits all of these limits. Details: [Why Arroxy](#why-explore).
>
> _Last updated: 2026-10-19._

> 🌐 Traduction assistée par IA. Le [README en anglais](README.md) fait foi. Tu vois une erreur ? [Les PRs sont les bienvenues](../../pulls).

---

## Sommaire

- [✨ Fonctionnalités](#features)
- [📥 Installation et premier lancement](#install)
  - [Premier lancement sur Windows](#windows-first-launch)
  - [Premier lancement sur macOS](#macos-first-launch)
  - [Pourquoi tu peux voir un avertissement](#why-warning)
  - [Premier lancement sur Linux](#linux-first-launch)
  - [Vérifier ton téléchargement (SHA256)](#verify)
- [⚖️ Pourquoi Arroxy](#why)
- [🔒 Confidentialité](#privacy)
- [❓ Questions fréquentes](#faq)
- [🗺️ Feuille de route](#roadmap)
- [💖 Soutenir Arroxy](#support)
- [🛠️ Construit avec](#tech)

---

## <a id="features"></a>✨ Fonctionnalités

<table align="center" width="100%">
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Explore-browsing-screenshot.png" alt="Arroxy — Explore tab browsing a video page, with the Download button for the active profile" width="760" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Explore</b><br/>Parcours YouTube ou n'importe quel autre site dans Arroxy et télécharge la page où tu es avec ton profil actif</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Explore-screenshot.png" alt="Arroxy — Explore first-run screen recommending a secondary account" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Le premier écran d'Explore</b><br/>Un coup d'œil rapide à Explore, et pourquoi un compte secondaire est la connexion la plus sûre</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloads-attention-screenshot.png" alt="Arroxy — Downloads with a link preparing, a failed link offering Sign in in Explore, and a playlist waiting for a choice" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Téléchargements te dit ce qui a besoin de toi</b><br/>Les liens se préparent en arrière-plan ; un lien en échec propose sa solution, une longue playlist attend ton choix</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Part-of-video-screenshot.png" alt="Arroxy — Part of a video: a range bar with start and end times, chapter chips and an exact-cut option" width="560" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Téléchargez seulement une partie de la vidéo</b><br/>Choisissez un début et une fin, ou un chapitre — Arroxy n’enregistre que cette plage</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Profile-editor-screenshot.png" alt="Arroxy — Profile editor with file type, resolution, subtitles, destination, filename template and output options" width="680" /><br/><img src="https://img.shields.io/badge/NEW-blueviolet?style=flat-square" alt="New" /> <sub><b>Éditeur de profils</b><br/>Réglez un profil : type de fichier, résolution, sous-titres, destination, modèle de nom de fichier et plus encore</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Themes-and-styles-screenshot.png" alt="Arroxy — the main screen in dark and light, with the Aurora glass style on top and the Minimal solid style below" width="760" /><br/><sub><b>Sombre ou clair, verre ou uni</b><br/>Quatre styles au choix : des panneaux de verre sur un ciel animé ou des surfaces unies et calmes, chacun en sombre et en clair</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="build/Global-hotkey-dark.png" /><img src="build/Global-hotkey.png" alt="Raccourci de téléchargement global d'Arroxy — Ctrl+Shift+D sur Windows et Linux, Cmd+Shift+D sur macOS, qui envoie le lien copié directement dans la file de téléchargement" width="760" /></picture><br/><sub><b>Raccourci de téléchargement global</b><br/>Copie un lien n'importe où, appuie une fois — il rejoint la file et le téléchargement démarre</sub></td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center"><img src="build/Per-item-playlist-profiles-screenshot.png" alt="Arroxy — Per-item playlist profiles" width="760" /><br/><sub><b>Profils par élément de playlist</b><br/>Donnez à chaque vidéo son propre profil — certaines en 4K, le reste en MP3</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Main-screenshot.png" alt="Arroxy — Quick Download home" /><br/><sub><b>Accueil Téléchargement rapide</b><br/>Collez une URL et lancez-la aussitôt avec votre profil actif</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Download-profiles-screenshot.png" alt="Arroxy — Download profiles" /><br/><sub><b>Profils de téléchargement réutilisables</b><br/>Enregistrez format, qualité et sortie en préréglages — réutilisés à chaque téléchargement</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Multi-lang-audio-support-screenshot.png" alt="Arroxy — Multi-language audio" /><br/><sub><b>Pistes audio multilingues</b><br/>Choisissez la langue audio exacte fournie par la vidéo</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Dolby-audio-support-screenshot.png" alt="Arroxy — Surround / Dolby audio" /><br/><sub><b>Audio Surround / Dolby</b><br/>Pistes 5.1 et Dolby détectées et conservées</sub></td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center"><img src="build/Bulk-urls-mode-screenshot.png" alt="Arroxy — Bulk URL mode" /><br/><sub><b>Mode URL en masse</b><br/>Collez une liste, dédoublonnage auto, tout mettre en file d'un coup</sub></td>
    <td width="50%" valign="top" align="center"><img src="build/Downloading-in-parallel-screenshot.png" alt="Arroxy — Parallel download queue" /><br/><sub><b>File de téléchargement parallèle</b><br/>Plusieurs téléchargements à la fois avec progression en direct</sub></td>
  </tr>
</table>

<details open>
<summary><strong>🧭 Explore : parcours le web dans Arroxy</strong></summary>

- **Onglet Explore** — parcours YouTube ou n'importe quel autre site dans Arroxy et télécharge ce que tu trouves sans copier de liens. **Télécharger · *ton profil*** met en file la vidéo, la playlist ou la chaîne que tu regardes ; la flèche à côté change de profil, et la baguette ouvre le téléchargement pas à pas pour choisir les formats, les sous-titres, etc.
- **Clic droit pour télécharger** — fais un clic droit sur n'importe quel lien de vidéo, de playlist ou de chaîne dans Explore pour le télécharger avec ton profil, choisir un autre profil dans **Télécharger avec**, ouvrir le téléchargement pas à pas ou copier le lien. Inutile d'ouvrir chaque vidéo d'abord
- **Disposition compacte** — un clic dans la barre d'outils d'Explore y déplace les onglets d'Arroxy et donne plus de place à la page
- **Barre d'adresse** — tape pour chercher sur YouTube, ou saisis n'importe quelle adresse web pour ouvrir ce site
- **Téléchargements qui demandent un compte** — connecte-toi une fois dans Explore et Arroxy pourra télécharger les vidéos privées et réservées aux membres que ton compte peut voir, les vidéos soumises à une limite d'âge si l'âge du compte est vérifié, ainsi que tes listes À regarder plus tard et J'aime. Connecte-toi aussi aux autres sites là-bas : leurs téléchargements utilisent cette connexion quand ils en ont besoin. Arroxy télécharge toujours d'abord sans connexion et n'utilise ta connexion Explore que lorsqu'un téléchargement échoue d'une manière qu'un compte peut corriger. Quand YouTube demande de confirmer que tu n'es pas un robot, Arroxy essaie aussi ta connexion Explore
- **Utilise un compte secondaire** — le premier écran d'Explore explique pourquoi : télécharger avec un compte comporte un certain risque que ce compte soit restreint. Déconnecte-toi d'Explore depuis les Paramètres quand tu veux oublier tes connexions
- **Bloqueur de publicités** — désactivé par défaut. Un clic sur le bouclier dans la barre d'outils d'Explore bloque les publicités et les traqueurs sur ses pages, sans toucher aux téléchargements. YouTube peut résister aux bloqueurs de publicités pour les comptes connectés

</details>

<details>
<summary><strong>🎞️ Qualité & formats</strong></summary>

- Jusqu'à **8K (4320p)**, 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p
- **Haut framerate et HDR** préservés tels quels — 60 fps, HDR10
- **Audio** — exporte l'audio seul en MP3, M4A/AAC, Opus ou WAV. Dans les téléchargements interactifs, choisis les pistes natives surround/Dolby de la source (AC-3, E-AC-3, 5.1, DRC) quand elles sont disponibles, ou définis une valeur par défaut globale **Préférer le surround / Dolby**
- **Des profils avec un objectif** — *Meilleure image* (AV1 · VP9) ou *TV connectée* (MP4 · H.264), enregistrés en Auto, MP4, MKV ou WebM sans réencodage. Le HDR est *Auto* (seulement si ton écran peut l'afficher), *SDR* ou *HDR*
- **Chaque codec à chaque résolution** — le téléchargement pas à pas affiche AV1, VP9 et H.264 côte à côte pour chaque résolution, pour que tu choisisses celui que ta TV ou ton logiciel de montage sait lire
- **Sache ce qu'est vraiment un flux** — les tailles que YouTube a agrandies par IA, les langues audio doublées par IA, les flux à débit amélioré, les vidéos 360° et les copies endommagées ou filigranées sont signalés. Les profils ignorent les flux agrandis par IA, sauf si tu les autorises

</details>

<details>
<summary><strong>🛡️ Confidentialité & contrôle</strong></summary>

- Traitement 100 % local — les téléchargements vont directement de YouTube à ton disque
- Pas de connexion, pas de cookies, pas de compte Google lié
- Fichiers enregistrés directement dans le dossier que tu choisis

</details>

<details>
<summary><strong>⚡ Flux de travail</strong></summary>

- **Raccourci de téléchargement global** — copie un lien dans n'importe quelle app et appuie sur `Ctrl+Shift+D` (`Cmd+Shift+D` sur macOS) ; Arroxy le met en file d'attente avec ton profil actif sans ouvrir la fenêtre, et une notification le confirme. Actif par défaut, réassignable
- **Modes de démarrage flexibles** — choisis un téléchargement unique guidé, un sélecteur de playlist/chaîne, un collage d’URL en lot, Quick Download avec tes valeurs par défaut enregistrées, ou parcours et télécharge depuis Explore
- **File de téléchargement centrale** — chaque tâche unique, playlist, lot ou rapide arrive au même endroit pour suivre, mettre en pause, reprendre, annuler, réessayer et gérer la priorité
- **Surveillance du presse-papiers** — copie un lien vidéo et il remplit le champ URL quand tu reviens sur Arroxy, avec **Annuler** si ce n'était pas voulu. Si Arroxy est occupé, le lien attend que tu sois de retour sur l'onglet URL (désactivable dans les Réglages)
- **Nettoyage auto des URLs** — supprime les paramètres de tracking (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) et dénoue les liens `youtube.com/redirect`
- **Mode tray** — fermer la fenêtre garde les téléchargements en cours en arrière-plan
- **31 langues** — détecte automatiquement les paramètres régionaux du système, modifiable à tout moment
- **Synchronisation de playlist** — rescane une playlist par rapport à un dossier local pour ignorer les vidéos déjà téléchargées ; génère un fichier de playlist `.m3u` mis à jour à chaque vidéo téléchargée
- **Contrôles de vitesse et de rythme** — limite la bande passante, définis combien de parties d'une vidéo se téléchargent à la fois et ajoute des pauses entre les requêtes avec des préréglages (*Désactivé · Équilibré · Prudent · Personnalisé*)
- **Modèles de nom de fichier** — nommez vos téléchargements comme vous voulez avec `{title}`, `{uploader}`, `{id}`, `{date}`, `{resolution}` et `{playlist_index}`, globalement ou par profil de téléchargement
- **Téléchargements simultanés et réessai automatique** — choisis combien de téléchargements de la file s'exécutent en même temps et laisse Arroxy réessayer un téléchargement ayant rencontré un problème réseau ou serveur, en attendant plus longtemps avant chaque tentative
- **Profils par élément de playlist** — attribuez à chaque vidéo d'une playlist son propre profil de téléchargement au lieu d'un seul réglage pour toute la liste, pour archiver certaines en pleine qualité et récupérer le reste en MP3 en une seule passe
- **Quick Download fonctionne en arrière-plan** — le lien apparaît tout de suite dans Téléchargements et s'y prépare, une note avec **Voir** le confirme, et le champ d'URL se vide pour le lien suivant. Lances-en autant que tu veux pendant que les précédents se préparent
- **Téléchargements te dit ce qui a besoin de toi** — si Arroxy ne peut pas lire un lien, sa ligne explique pourquoi et propose la solution : Réessayer, activer les cookies ou se connecter dans Explore. Quand les cookies sont désactivés, **Se connecter avec Explore** le relance pour toi une fois connecté. Une playlist plus longue que ta limite de chargement attend sur sa ligne que tu choisisses tout, les premières vidéos ou une revue. L'onglet Téléchargements compte les lignes qui t'attendent
- **Téléchargez seulement une partie d'une vidéo** : choisissez un début et une fin, ou un chapitre, sur l'écran Format et Arroxy n'enregistre que cet intervalle, indiqué dans le nom après l'identifiant de la vidéo. Les coupes tombent sur l'image clé la plus proche ; activez la coupe exacte pour réencoder à la place
- **Retirer les téléchargements terminés** — facultatif : un téléchargement terminé quitte la liste 5 secondes plus tard. Ses fichiers restent sur le disque, et les téléchargements en échec restent listés
- **Taille et Manquant dans Téléchargements** — une colonne **Taille** triable indique l'espace pris par chaque téléchargement, et **Manquant** signale les fichiers déplacés ou supprimés en dehors d'Arroxy
- **Aurora ou Minimaliste, sombre ou clair** — des panneaux de verre sur un ciel en mouvement, ou des surfaces pleines et discrètes ; bascule depuis le pied de page. Les ordinateurs sans accélération graphique passent automatiquement en Minimaliste
- **Barre des menus du Mac** — sous macOS, ouvre les Réglages (`Cmd+,`), règle la limite de vitesse de téléchargement, change le style et le thème, et ouvre les journaux ou enregistre un fichier de diagnostic depuis la barre des menus
- **Modifier un profil depuis n'importe quel téléchargement** — ajuste un téléchargement, puis mets à jour le profil dont il est parti (avec un aperçu de ce qui change) ou enregistre les réglages comme nouveau profil. Changer de profil te demande si tu veux garder tes modifications

</details>

<details>
<summary><strong>📝 Sous-titres & post-traitement</strong></summary>

- **Sous-titres** en SRT, VTT ou ASS — manuels ou auto-générés, dans toute langue disponible
- Enregistre à côté de la vidéo, intègre dans un `.mkv`, ou organise dans un sous-dossier `Subtitles/`
- **Lots sous-titres uniquement** — collez une liste d'URL ou ouvrez une playlist, choisissez Sous-titres et ne récupérez que les fichiers de sous-titres de chaque vidéo
- **SponsorBlock** — passe ou marque les sponsors, intros, outros, autopromos en chapitres
- **Métadonnées intégrées** — titre, date de mise en ligne, chaîne, description, miniature et marqueurs de chapitres écrits dans le fichier

</details>

<details>
<summary><strong>🌐 YouTube + 2000 sites</strong></summary>

- **YouTube, en entier** — Vidéos, Shorts, Chaînes, Playlists, YouTube Music et Podcasts traités comme des sources de premier rang
- **2000+ autres sites** via yt-dlp — Twitch, TikTok, Dailymotion, VK, SoundCloud, Bandcamp, Bilibili, archive.org, Streamable et bien plus encore
- **L'audio seul et les sous-titres** fonctionnent sur chaque site supporté, pas seulement YouTube
- Si un site change, yt-dlp publie des correctifs chaque semaine et Arroxy met à jour le binaire automatiquement au lancement

</details>

---

## <a id="install"></a>📥 Installation et premier lancement

**Windows**

```bash
winget install AntonioOrionus.Arroxy
```

**macOS**

```bash
brew install --cask antonio-orionus/arroxy/arroxy
```

**Linux**

AppImage:

```bash
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh
```

Flatpak:

```bash
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh -s -- --flatpak
```

Les versions sont uniquement x86_64. Pas de `curl` ? Remplacez `curl -fsSL` par `wget -qO-`.

| Plateforme | Format |
| --- | --- |
| Windows | [![Windows Setup](https://img.shields.io/badge/Windows-Setup-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Setup.exe) [![Windows Portable](https://img.shields.io/badge/Windows-Portable-0078D4?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-win-x64-Portable.exe) |
| macOS | [![macOS Apple Silicon](https://img.shields.io/badge/macOS-Apple%20Silicon-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-arm64.dmg) [![macOS Intel](https://img.shields.io/badge/macOS-Intel-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-mac-x64.dmg) |
| Linux | [![Linux AppImage](https://img.shields.io/badge/Linux-AppImage-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.AppImage) [![Linux Flatpak](https://img.shields.io/badge/Linux-Flatpak-4A90D9?style=for-the-badge&logo=flathub&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.flatpak) [![Linux tar.gz](https://img.shields.io/badge/Linux-tar.gz-6B7280?style=for-the-badge&logo=linux&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/Arroxy-linux-x64.tar.gz) |
| Verify | [![SHA256 Checksums](https://img.shields.io/badge/SHA256-Checksums-4B5563?style=for-the-badge&logo=github&logoColor=white)](https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS) |

[**Récupère la dernière version →**](https://github.com/antonio-orionus/Arroxy/releases/latest)

<details>
<summary><strong><a id="windows-first-launch"></a>🪟 Premier lancement sur Windows</strong></summary>

Au premier lancement, tu peux voir **"Windows protected your PC"** ou **"Unknown publisher."** Cela s'applique à la fois à `Arroxy-win-x64-Setup.exe` et à `Arroxy-win-x64-Portable.exe`. Arroxy est gratuit et open source, et les builds Windows ne sont pas signés avec un certificat payant, c'est pourquoi SmartScreen les signale. Cela ne signifie **pas** automatiquement qu'Arroxy est dangereux. Pour continuer :

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen "Windows protected your PC" dialog with the "More info" link highlighted" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="SmartScreen dialog after expanding More info, showing the "Run anyway" button" />
</div>

1. Clique sur **More info**.
2. Clique sur **Run anyway**.

#### Si Windows Defender signale ou supprime le fichier

L'heuristique de Defender signale parfois les installeurs NSIS non signés et les portables Electron comme suspects. Si Defender met en quarantaine `Arroxy-win-x64-Setup.exe` ou `Arroxy-win-x64-Portable.exe`, restaure-le depuis **Windows Security → Virus & threat protection → Protection history**, puis ajoute l'exécutable Arroxy comme élément autorisé sous **Manage settings → Add or remove exclusions**. Comme pour SmartScreen, le déclencheur est la signature d'éditeur manquante, pas un malware détecté.

> Ne télécharge Arroxy que depuis la page officielle GitHub Releases. Si tu as obtenu le fichier depuis un autre site ou que quelqu'un te l'a envoyé, supprime-le et télécharge une copie fraîche depuis la source officielle. Le code source est public, tu peux donc l'inspecter ou compiler Arroxy toi-même si tu préfères.

Vous préférez Scoop ? `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`

</details>

<details>
<summary><strong><a id="macos-first-launch"></a>🍎 Premier lancement sur macOS</strong></summary>

Arroxy n'est pas encore signé pour macOS, donc Gatekeeper peut afficher le message inquiétant *"Arroxy.app is damaged and can't be opened"* après l'installation depuis le DMG. Ce message signifie que macOS a mis en quarantaine une app non signée ; il ne veut pas dire que les fichiers de l'app sont réellement endommagés. Sur les versions actuelles de macOS, la méthode fiable est Terminal :

<div align="center">
  <img src="build/macOS-warning-Arroxy-is-damaged.png" width="42%" alt="macOS dialog saying Arroxy.app is damaged and cannot be opened" />
</div>

1. Fais glisser `Arroxy.app` depuis le DMG monté vers `/Applications`.
2. Ouvre Terminal et exécute ces deux commandes :

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
open /Applications/Arroxy.app
```

La première commande retire l'attribut de quarantaine de ta copie installée d'Arroxy. La seconde lance l'app. `sudo` peut demander le mot de passe de ton Mac ; Terminal n'affiche aucun caractère pendant la saisie.

**Apple Silicon vs Intel :** sur un Mac de la série M (M1 / M2 / M3 / M4), télécharge le DMG `arm64`. Sur les Macs Intel, télécharge le DMG `x64`. Le mauvais build fonctionne quand même via Rosetta, mais est notablement plus lent.

> Les builds macOS sont produits via CI sur des runners Apple Silicon et Intel. Si tu rencontres des problèmes, merci d'[ouvrir un issue](../../issues) — les retours des utilisateurs macOS orientent activement le cycle de test macOS.

</details>

<details>
<summary><strong><a id="why-warning"></a>⚠️ Pourquoi tu peux voir un avertissement</strong></summary>

Arroxy est open source et sous licence MIT. Les builds Windows et macOS **ne sont pas signés numériquement** — les certificats Apple Developer ID et Windows EV coûtent chacun plusieurs centaines de dollars par an, que paye un projet indépendant de sa poche. Sans ces signatures, Windows SmartScreen et macOS Gatekeeper t'avertiront au premier lancement. Ces avertissements signifient *ton OS ne reconnaît pas l'éditeur* — ils ne signifient pas qu'Arroxy est un malware.

Trois façons de vérifier Arroxy toi-même, par ordre de rigueur croissante :

- **Lis le code source.** Chaque ligne est sur [GitHub](https://github.com/antonio-orionus/Arroxy) et tu peux [le compiler depuis les sources](#tech).
- **Vérifie le SHA256.** Compare ton fichier avec le [`SHA256SUMS`](../../releases/latest) publié — voir [Vérifier ton téléchargement](#verify) ci-dessous.
- **Lance un scan tiers.** Envoie le fichier sur [VirusTotal](https://www.virustotal.com).

</details>

<details>
<summary><strong><a id="linux-first-launch"></a>🐧 Premier lancement sur Linux</strong></summary>

Les AppImages s'exécutent directement — pas d'installation. Tu dois juste marquer le fichier comme exécutable.

**Gestionnaire de fichiers :** clic droit sur le `.AppImage` → **Propriétés** → **Permissions** → active **Autoriser l'exécution du fichier comme programme**, puis double-clique.

**Terminal :**

```bash
chmod +x Arroxy-linux-x64.AppImage
./Arroxy-linux-x64.AppImage
```

Si le lancement échoue encore, lance-le sans montage — aucun paquet FUSE n'est nécessaire :

```bash
./Arroxy-linux-x64.AppImage --appimage-extract-and-run
```

**Intégration bureau optionnelle :** installe [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) une fois, et toute AppImage sur laquelle tu double-cliques est automatiquement enregistrée dans ton menu de lancement — aucun fichier `.desktop` manuel nécessaire.

**Archive simple (sans FUSE, sans installation) :**

La version `.tar.gz` est la même application sans l'enveloppe AppImage : décompresse-la où tu veux et lance-la. Ni installateur ni paquet FUSE.

```bash
tar xzf Arroxy-linux-x64.tar.gz
./Arroxy-linux-x64/arroxy
```

**Les téléchargements Linux sur la page des versions sont uniquement en x86_64.** Sur les machines ARM64 (Raspberry Pi, Asahi Linux) le Flatpak s'installe mais échoue au lancement avec `bwrap: execvp ldconfig: Exec format error`.

</details>

<details>
<summary><strong><a id="verify"></a>🔐 Vérifier ton téléchargement (SHA256)</strong></summary>

Chaque release publie un fichier `SHA256SUMS` accompagnant les binaires. Pour vérifier que ton téléchargement n'a pas été corrompu ou altéré en transit, hache ton fichier en local et compare la ligne dans `SHA256SUMS`. Ouvre la page de la dernière release → **Assets** → télécharge `SHA256SUMS`.

**Windows (PowerShell or Command Prompt) :**

```powershell
certutil -hashfile Arroxy-win-x64-Setup.exe SHA256
```

**macOS (Terminal) :**

```bash
shasum -a 256 Arroxy-mac-arm64.dmg
```

**Linux (Terminal) :**

```bash
sha256sum Arroxy-linux-x64.AppImage
```

Tu veux un scan antimalware tiers ? Envoie le fichier sur [VirusTotal](https://www.virustotal.com). Une poignée de flags heuristiques génériques de moteurs mineurs est normale pour des apps Electron non signées ; des détections généralisées par les grands moteurs seraient une vraie préoccupation.

</details>

<details>
<summary><strong>📦 Windows : Installeur vs Portable</strong></summary>

|               | Installeur NSIS | `.exe` portable |
| ------------- | :----------------------: | :---------------------: |
| Installation requise | Oui  | Non — exécutable de partout  |
| Mises à jour automatiques | ✅ dans l'app  | ❌ téléchargement manuel  |
| Vitesse de démarrage | ✅ plus rapide  | ⚠️ démarrage à froid plus lent  |
| Ajouté au menu Démarrer |            ✅            |           ❌            |
| Désinstallation simple |            ✅            | ❌ supprime juste le fichier  |

**Recommandation :** utilise l'installeur NSIS pour les mises à jour automatiques et un démarrage plus rapide. Utilise le `.exe` portable pour une option sans installation ni registre.

</details>

---

## <a id="why"></a>⚖️ Pourquoi Arroxy

Une comparaison côte à côte avec les alternatives les plus courantes :

|            | Arroxy | Typical free yt-dlp GUI | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :---------------------: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Navigateur intégré (parcourir, se connecter, télécharger) |   ✅   |           ❌            |         ⚠️          |     ❌      |             ❌             |        N/A         |
| Vidéos privées, réservées aux membres et soumises à une limite d'âge sans exporter de cookies |   ✅   |           ⚠️            |         ⚠️          |     ⚠️      |             ❌             |         ⚠️         |
| Gratuit, pas de niveau premium |   ✅   |           ✅            |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Open source |   ✅   |           ✅            |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Traitement 100 % local |   ✅   |           ✅            |         ✅          |     ✅      |             ❌             |         ✅         |
| Pas de limites d'utilisation |   ✅   |           ✅            |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Application de bureau multiplateforme |   ✅   |           ⚠️            |         ✅          |     ✅      |            N/A             |         ❌         |
| Sous-titres + SponsorBlock |   ✅   |           ⚠️            |         ⚠️          |     ❌      |             ❌             |         ❌         |

⚠️ = en partie, ou seulement dans une offre payante. Dans 4K Video Downloader, la connexion intégrée pour les vidéos privées est une fonction payante ; la plupart des GUI yt-dlp gratuites n'acceptent qu'un fichier de cookies ou lisent les cookies de ton navigateur web.

Arroxy est conçu pour une seule chose : un fichier local propre, que tu colles une URL ou que tu trouves la vidéo dans Explore. Pas d'upsell, pas de collecte de données.

### <a id="why-explore"></a>🧭 Ce qu'un simple wrapper yt-dlp ne sait pas faire : l'onglet Explore

La plupart des téléchargeurs YouTube gratuits ne sont qu'un champ d'URL posé sur yt-dlp. Arroxy utilise aussi yt-dlp, mais il a en plus **Explore**, un navigateur intégré à l'application qui ouvre YouTube ou n'importe quel autre site. Explore franchit des limites qu'un simple champ d'URL ne peut pas franchir :

- **Les vidéos qui demandent un compte, sans exporter de cookies** — vidéos privées, réservées aux membres et soumises à une limite d'âge (avec un compte dont l'âge est vérifié), ainsi que tes listes À regarder plus tard et J'aime, et les vidéos protégées par une connexion sur d'autres sites. Un simple wrapper a besoin d'un export cookies.txt ou doit lire les cookies de ton navigateur web, ce que Chrome sous Windows bloque désormais. Dans Arroxy, tu te connectes une fois dans Explore et il s'occupe du reste
- **« Connectez-vous pour confirmer que vous n'êtes pas un robot »** — quand YouTube affiche ce message, Arroxy relance le téléchargement avec ta connexion Explore au lieu d'échouer
- **Le jeton de téléchargement de YouTube** — le navigateur intégré d'Arroxy obtient le jeton que YouTube attend avant un téléchargement. Sans lui, YouTube peut proposer moins de formats et une qualité inférieure à celle demandée
- **Pas de liens à copier** — trouve une vidéo, une playlist ou une chaîne dans Explore et télécharge-la en un clic, ou fais un clic droit sur n'importe quel lien de la page
- **Bloqueur de publicités quand tu veux** — un clic sur le bouclier et Explore bloque les publicités et les traqueurs sur ses pages

---

## <a id="privacy"></a>🔒 Confidentialité

Les téléchargements sont récupérés directement via [yt-dlp](https://github.com/yt-dlp/yt-dlp) depuis YouTube vers le dossier que tu choisis — rien ne passe par un serveur tiers. L'historique de visionnage, l'historique de téléchargement, les URLs et le contenu des fichiers restent sur ton appareil.

Aucune télémétrie — juste un signal anonyme par jour : version de l’app, OS, langue, canal d’installation et pays, pour compter les utilisateurs actifs. Aucun identifiant, URL, titre de vidéo, chemin de fichier ni info de compte. Tu peux le désactiver dans les Paramètres.

Explore garde sa propre connexion, séparée de ton navigateur, et Arroxy ne lit ni ne remplit jamais le formulaire de connexion : tu saisis tes identifiants sur la page de Google elle-même. Les téléchargements se font sans connexion ; seulement quand l'un échoue d'une manière qu'un compte peut corriger, Arroxy relit la connexion à ce moment-là, la garde dans un fichier temporaire pour ce téléchargement et supprime le fichier ensuite. Se déconnecter d'Explore dans les Paramètres l'oublie.

---

## <a id="faq"></a>❓ Questions fréquentes

<details>
<summary><strong>C'est vraiment gratuit ?</strong></summary>

Oui — licence MIT, pas de niveau premium, pas de fonctions verrouillées.

</details>

<details>
<summary><strong>En quoi Arroxy se distingue-t-il des autres GUI yt-dlp ?</strong></summary>

La plupart des GUI yt-dlp gratuites sont des wrappers qui n'acceptent qu'un lien. Arroxy ajoute **Explore**, un navigateur YouTube intégré à l'application : tu parcours et télécharges sans copier de liens, et tu t'y connectes une fois pour télécharger les vidéos privées, réservées aux membres et soumises à une limite d'âge ainsi que tes listes À regarder plus tard et J'aime, sans exporter de cookies. Arroxy utilise cette connexion quand YouTube te demande de confirmer que tu n'es pas un robot, et son navigateur intégré obtient le jeton de téléchargement de YouTube pour que les téléchargements ne se rabattent pas sur moins de formats. Voir [Pourquoi Arroxy](#why).

</details>

<details>
<summary><strong>Quelles qualités de vidéo puis-je télécharger ?</strong></summary>

Tout ce que YouTube propose : 8K (4320p), 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, plus audio seul. Les flux 60 fps et HDR sont préservés tels quels, et le téléchargement pas à pas te laisse choisir AV1, VP9 ou H.264 à chaque résolution.

</details>

<details>
<summary><strong>Puis-je extraire uniquement l'audio en MP3 ?</strong></summary>

Oui. Choisis *audio seul* dans le menu des formats puis MP3, M4A/AAC, Opus ou WAV.

</details>

<details>
<summary><strong>Comment télécharger des vidéos qui demandent un compte YouTube ?</strong></summary>

Connecte-toi une fois dans l'onglet Explore. Arroxy pourra alors télécharger les vidéos privées et réservées aux membres que ton compte peut voir, les vidéos soumises à une limite d'âge si l'âge du compte est vérifié, ainsi que tes listes À regarder plus tard et J'aime. Il n'utilise la connexion que lorsqu'un téléchargement échoue d'une manière qu'un compte peut corriger ; tout le reste se télécharge comme avant. C'est le choix **Connexion Explore**, listé en premier et marqué Recommandé dans les paramètres des cookies, et Arroxy le sélectionne pour toi la première fois que tu ouvres Explore. Le wiki de yt-dlp note que [l'automatisation avec un compte connecté peut signaler un compte Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies), donc un compte secondaire est le choix le plus sûr.

</details>

<details>
<summary><strong>Ça continuera de fonctionner si YouTube change quelque chose ?</strong></summary>

yt-dlp est mis à jour automatiquement au lancement, et Arroxy publie des correctifs rapidement quand YouTube change quelque chose. Quand YouTube demande de confirmer que tu n'es pas un robot, Arroxy essaie aussi ta connexion Explore si tu t'y es connecté, et les cookies d'un fichier ou de ton navigateur sont disponibles dans les paramètres des cookies.

</details>

<details>
<summary><strong>Dans quelles langues Arroxy est-il disponible ?</strong></summary>

31 langues prêtes à l’emploi : Afaan Oromoo · Bahasa Indonesia · Deutsch · English · Español · Français · Italiano · Kiswahili · O'zbekcha · Polski · Português · Tiếng Việt · Türkçe · አማርኛ · العربية · اردو · پښتو · فارسی · বাংলা · हिन्दी · ไทย · မြန်မာဘာသာ · ខ្មែរ · Ελληνικά · Русский · Српски · Українська · 中文 · 日本語 · 한국어 · 繁體中文. Arroxy détecte automatiquement la langue de ton système d’exploitation au premier lancement, et tu peux changer à tout moment depuis le sélecteur de langue dans la barre d’outils. Les JSON de locale Runtime se trouvent dans src/shared/i18n/locales/, et les catalogues PO destinés aux traducteurs se trouvent dans i18n/locales/ — ouvre une PR sur GitHub pour contribuer.

</details>

<details>
<summary><strong>Dois-je installer autre chose ?</strong></summary>

Non. yt-dlp, ffmpeg et ffprobe sont téléchargés automatiquement au premier lancement et mis en cache sur ta machine. Après ça, aucune configuration supplémentaire.

</details>

<details>
<summary><strong>Puis-je télécharger des playlists ou des chaînes entières ?</strong></summary>

Oui — les deux. Colle une URL de playlist ou de chaîne (p. ex. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`) ; choisis combien d’entrées analyser, puis mets toute la liste en file ou sélectionne des vidéos précises. Les filtres par date arrivent bientôt.

</details>

<details>
<summary><strong>macOS dit "l'application est endommagée" — que faire ?</strong></summary>

C'est Gatekeeper de macOS qui bloque une app non signée, pas un vrai endommagement. Voir [macOS first launch](#macos-first-launch) pour les commandes Terminal qui retirent la quarantaine et lancent Arroxy.

</details>

<details>
<summary><strong>Télécharger des vidéos YouTube est-il légal ?</strong></summary>

Pour un usage personnel et privé, c'est généralement accepté dans la plupart des juridictions. Tu es responsable de respecter les [Conditions d'Utilisation](https://www.youtube.com/t/terms) de YouTube et les lois sur le droit d'auteur de ton pays.

</details>

---

## <a id="roadmap"></a>🗺️ Feuille de route

Toujours prévu — approximativement par ordre de priorité :

| Fonctionnalité    | Description    |
| ---------------- | ---------------- |
| **Filtres de playlists et chaînes** | Filtres par plage de dates lors de l’énumération d’une playlist ou d’une chaîne |
| **Préférences de pistes audio YouTube** | Définir une piste de langue parlée préférée pour toute l’app, avec des choix différents par profil quand YouTube propose plusieurs pistes audio |
| **Reprise par nouvel essai renforcée** | Un nouveau chemin de relance pour les téléchargements interrompus par des connexions internet instables ou problématiques |
| **Tiroir de gestionnaire de téléchargements complet** | Transformer le tiroir de file en gestionnaire plus complet, avec changement de dossier de destination pour les éléments en file |
| **Téléchargements programmés** | Démarre une file à une heure définie (lancements nocturnes) |
| **Paquet AUR** | Installation sur Arch Linux et Omarchy avec `yay -S arroxy-bin` |

Tu as une fonctionnalité en tête ? [Ouvre une demande](../../issues) — les retours de la communauté orientent les priorités.

---

## <a id="support"></a>💖 Soutenir Arroxy

Arroxy est gratuit et sous licence MIT — pas de publicité, pas de télémétrie, pas de version payante. S'il te fait gagner du temps, tu peux soutenir le développement avec Bitcoin, Tron ou Ethereum : les adresses se trouvent dans [DONATE.md](DONATE.md), la seule source officielle. Arroxy ne t'enverra jamais d'adresse par e-mail ou par message privé. Mettre une étoile au dépôt, signaler des bugs et améliorer les traductions aident tout autant.

<a href="DONATE.md"><img src="https://img.shields.io/badge/Bitcoin-DONATE.md-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Bitcoin donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Tron-DONATE.md-EF0027?style=for-the-badge&logo=tron&logoColor=white" alt="Tron donation address" /></a> <a href="DONATE.md"><img src="https://img.shields.io/badge/Ethereum-DONATE.md-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum donation address" /></a>

---

## <a id="tech"></a>🛠️ Construit avec

<details>
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
| Node.js | 24.21.0 | `mise install` ou `.node-version` |
| Bun     | 1.4.2  | `mise install` ou `package.json` `packageManager` |

Recommandé : installe `mise`, puis lance `mise install` dans le checkout. Sans mise, active manuellement Node.js depuis `.node-version` et Bun depuis `package.json` avant `bun run bootstrap`.

### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Visual Studio Build Tools et Python peuvent être nécessaires pour les recompilations natives.

### macOS

```bash
brew install mise
xcode-select --install
```

Après le clonage, lance `mise trust && mise install` depuis le checkout. Si ton shell utilise déjà `fnm`, `nvm` ou un Bun installé via Homebrew, active mise dans `~/.zshrc` pour qu'Arroxy utilise Node.js 24.21.0 et Bun 1.4.2 :

```bash
printf '
# mise
if command -v mise >/dev/null 2>&1; then
  eval "$(mise activate zsh)"
fi
' >> ~/.zshrc
exec zsh
```

### Linux (Ubuntu / Debian)

```bash
curl -fsSL https://bun.sh/install | bash

# Dépendances de build et runtime Electron
sudo apt install -y build-essential python3 tar libgtk-3-0 libnss3 libasound2t64

# Tests E2E uniquement (Electron a besoin d'un affichage)
sudo apt install -y xvfb
```

### Cloner & lancer

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd Arroxy
mise trust
mise install           # recommandé ; saute cette étape si tu as activé les outils épinglés manuellement
bun run bootstrap
bun run doctor
bun run dev            # app Electron contre le renderer Vite
```

### Créer un paquet distribuable

```bash
bun run build        # vérification des types + compilation
bun run dist         # paquet pour l'OS actuel
bun run dist:win     # paquet Windows sur un hôte compatible
```

> `bun run bootstrap` installe les dépendances, reconstruit les dépendances Electron, vérifie Electron, prépare les ffmpeg/ffprobe intégrés pour le développement et installe Playwright Chromium. Les builds de release gèrent yt-dlp, ffmpeg et ffprobe à l'exécution dans le dossier de données de l’app ; aucun n’est inclus dans l’installateur.

</details>

---

## <a id="troubleshooting"></a>🩺 Troubleshooting

<details>
<summary><strong>🖥️ App won't open / no window appears</strong></summary>

The Arroxy process starts but no window shows up. Most often this is a GPU driver hang during startup. Try, in order:

**1. Check the log.** It records startup, GPU info, and any crash. Path:

| Platform | Path                             |
| -------- | -------------------------------- |
| Windows  | `%APPDATA%\Arroxy\logs\main.log` |
| macOS    | `~/Library/Logs/Arroxy/main.log` |
| Linux    | `~/.config/Arroxy/logs/main.log` |

**2. Launch with hardware acceleration disabled.** Open a terminal / Command Prompt and run the executable with a flag:

```bash
# Windows (Portable) — PowerShell, run from the folder containing the exe
.\Arroxy-win-x64-Portable.exe --disable-gpu

# Windows (Portable) — Command Prompt (cmd.exe), from the same folder
Arroxy-win-x64-Portable.exe --disable-gpu

# Windows (Installed) — works in both PowerShell and cmd.exe
"%LOCALAPPDATA%\Programs\Arroxy\Arroxy.exe" --disable-gpu

# macOS
/Applications/Arroxy.app/Contents/MacOS/Arroxy --disable-gpu

# Linux (AppImage)
./Arroxy-linux-x64.AppImage --disable-gpu
```

If that works, the GPU/driver is the cause. Make the change permanent (next step).

**3. Persist the flag via `argv.json`.** Create the file at:

| Platform | Path                                             |
| -------- | ------------------------------------------------ |
| Windows  | `%APPDATA%\Arroxy\argv.json`                     |
| macOS    | `~/Library/Application Support/Arroxy/argv.json` |
| Linux    | `~/.config/Arroxy/argv.json`                     |

With contents:

```json
{ "disable-hardware-acceleration": true }
```

Arroxy reads this before opening any window, so it works even when the window never appeared.

**4. Other flags worth trying** (combine if needed): `--disable-software-rasterizer`, `--disable-gpu-sandbox`, `--in-process-gpu`.

**5. Stale window position.** If the window may be opening off-screen (multi-monitor change since last run), delete `<userData>\window-state.json` and relaunch.

**6. Still stuck?** Open an issue with your OS version and any output from running with `--enable-logging --v=1`. If the app window does open, attach the file from **Settings → Save diagnostics file**: it holds both logs and your app details, with your user folder name removed. Otherwise attach `main.log`.

</details>

---

## 📜 Conditions d'utilisation

Arroxy est un outil destiné à un usage personnel et privé uniquement. Tu es seul responsable du fait que tes téléchargements respectent les [Conditions d'Utilisation](https://www.youtube.com/t/terms) de YouTube et les lois sur le droit d'auteur de ta juridiction. N'utilise pas Arroxy pour télécharger, reproduire ou distribuer du contenu sur lequel tu n'as pas de droits. Les développeurs ne sont pas responsables de tout usage abusif.

## Star History

<a href="https://www.star-history.com/?repos=antonio-orionus%2FArroxy&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=antonio-orionus/Arroxy&type=timeline&legend=top-left" />
 </picture>
</a>

<div align="center">
  <sub>Licence MIT · Fait avec soin par <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
