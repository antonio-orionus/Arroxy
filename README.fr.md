<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Mascotte Arroxy" width="180" />

# Arroxy — Téléchargeur YouTube (+ 2000 sites) gratuit et open source pour Windows, macOS & Linux

**4K · 1080p60 · HDR · Playlists · MP3 · Shorts · Music · Channels · Subtitles · SponsorBlock · +2000 sites**

**Lire en :** [Afaan Oromoo](README.om.md) · [Deutsch](README.de.md) · [English](README.md) · [Español](README.es.md) · **Français** · [Kiswahili](README.sw.md) · [O'zbekcha](README.uz.md) · [Tiếng Việt](README.vi.md) · [አማርኛ](README.am.md) · [العربية](README.ar.md) · [اردو](README.ur.md) · [پښتو](README.ps.md) · [বাংলা](README.bn.md) · [हिन्दी](README.hi.md) · [မြန်မာဘာသာ](README.my.md) · [Ελληνικά](README.el.md) · [Русский](README.ru.md) · [Српски](README.sr.md) · [Українська](README.uk.md) · [中文](README.zh.md) · [日本語](README.ja.md)

[![Version](https://img.shields.io/github/v/release/antonio-orionus/Arroxy?label=Release&color=blueviolet)](https://github.com/antonio-orionus/Arroxy/releases/latest) [![Build](https://img.shields.io/github/actions/workflow/status/antonio-orionus/Arroxy/release.yml?label=Build)](https://github.com/antonio-orionus/Arroxy/actions/workflows/release.yml) [![Site web](https://img.shields.io/badge/website-arroxy.orionus.dev-blueviolet)](https://arroxy.orionus.dev/) ![Licence](https://img.shields.io/badge/license-MIT-green) ![Plateformes](https://img.shields.io/badge/platform-cross--platform-1f2937?logo=github&logoColor=white) ![Langues](https://img.shields.io/badge/i18n-21_languages-blue)

Télécharge des vidéos, Shorts, musiques, chaînes, podcasts ou pistes audio depuis **YouTube et plus de 2000 sites supportés** — jusqu'à 4K HDR à 60 fps, ou en MP3 / AAC / Opus. Fonctionne en local sur Windows, macOS et Linux. **Pas de pub, pas de superflu, pas d'upsell.**

[**↓ Télécharger la dernière version**](../../releases/latest) &nbsp;·&nbsp; [**Site web**](https://arroxy.orionus.dev/) &nbsp;·&nbsp; [Windows](#download) · [macOS](#download) · [Linux](#download)

<img src="build/demo.gif" alt="Démo Arroxy" width="720" />

Si Arroxy te fait gagner du temps, une ⭐ aide les autres à le trouver.

</div>

> **What is Arroxy?** Arroxy is a free, open-source desktop GUI that downloads videos, audio, playlists, and subtitles from YouTube and 2000+ other [yt-dlp](https://github.com/yt-dlp/yt-dlp)-supported sites. It runs on Windows 10/11, macOS 11+ (Intel + Apple Silicon), and Linux (AppImage, Flatpak, tar.gz). MIT licensed. No account, no ads, no usage limits. Distributed via [Winget](https://winget.run/pkg/AntonioOrionus/Arroxy), [Scoop](https://github.com/antonio-orionus/scoop-bucket), [Homebrew Cask](https://github.com/antonio-orionus/homebrew-arroxy), Flatpak, AppImage, and direct download.
>
> _Last updated: 2026-05-14._

> 🌐 Traduction assistée par IA. Le [README en anglais](README.md) fait foi. Tu vois une erreur ? [Les PRs sont les bienvenues](../../pulls).

---

## Sommaire

- [Pourquoi Arroxy](#why)
- [Fonctionnalités](#features)
- [Téléchargement](#download)
- [Confidentialité](#privacy)
- [Questions fréquentes](#faq)
- [Feuille de route](#roadmap)
- [Construit avec](#tech)

---

## <a id="why"></a>Pourquoi Arroxy

Une comparaison côte à côte avec les alternatives les plus courantes :

|            | Arroxy | 4K Video Downloader | JDownloader | Y2Mate / online converters | Browser extensions |
| ---------- | :----: | :-----------------: | :---------: | :------------------------: | :----------------: |
| Gratuit, pas de niveau premium |   ✅   |         ⚠️          |     ✅      |             ⚠️             |         ⚠️         |
| Open source |   ✅   |         ❌          |     ❌      |             ❌             |         ⚠️         |
| Traitement 100 % local |   ✅   |         ✅          |     ✅      |             ❌             |         ✅         |
| Pas de connexion ni d'export de cookies |   ✅   |         ⚠️          |     ⚠️      |             ⚠️             |         ✅         |
| Pas de limites d'utilisation |   ✅   |         ⚠️          |     ✅      |             🚫             |         ⚠️         |
| Application de bureau multiplateforme |   ✅   |         ✅          |     ✅      |            N/A             |         ❌         |
| Sous-titres + SponsorBlock |   ✅   |         ⚠️          |     ❌      |             ❌             |         ❌         |

Arroxy est conçu pour une seule chose : coller une URL et obtenir un fichier local propre. Pas de comptes, pas d'upsell, pas de collecte de données.

---

## <a id="features"></a>Fonctionnalités

### Qualité & formats

- Jusqu'à **4K UHD (2160p)**, 1440p, 1080p, 720p, 480p, 360p
- **Haut framerate** préservé tel quel — 60 fps, 120 fps, HDR
- **Audio seul** en MP3, M4A/AAC, Opus ou WAV
- Préréglages rapides : *Meilleure qualité* · *Équilibré* · *Petit fichier*

### Confidentialité & contrôle

- Traitement 100 % local — les téléchargements vont directement de YouTube à ton disque
- Pas de connexion, pas de cookies, pas de compte Google lié
- Fichiers enregistrés directement dans le dossier que tu choisis

### Flux de travail

- **Modes de démarrage flexibles** — choisis un téléchargement unique guidé, un sélecteur de playlist/chaîne, un collage d’URL en lot ou Quick Download avec tes valeurs par défaut enregistrées
- **File de téléchargement centrale** — chaque tâche unique, playlist, lot ou rapide arrive au même endroit pour suivre, mettre en pause, reprendre, annuler, réessayer et gérer la priorité
- **Surveillance du presse-papiers** — copie un lien YouTube et Arroxy remplit automatiquement l'URL quand tu reviens sur l'app (désactivable dans les Paramètres avancés)
- **Nettoyage auto des URLs** — supprime les paramètres de tracking (`si`, `pp`, `utm_*`, `fbclid`, `gclid`) et dénoue les liens `youtube.com/redirect`
- **Mode tray** — fermer la fenêtre garde les téléchargements en cours en arrière-plan
- **21 langues** — détecte automatiquement la langue du système, modifiable à tout moment
- **Synchronisation de playlist** — rescane une playlist par rapport à un dossier local pour ignorer les vidéos déjà téléchargées ; génère un fichier de playlist `.m3u` mis à jour à chaque vidéo téléchargée
- **Contrôles de vitesse et de rythme** — limite la bande passante, ajoute des pauses entre les requêtes et règle les threads de fragments avec des préréglages (*Désactivé · Équilibré · Prudent · Personnalisé*)

### Sous-titres & post-traitement

- **Sous-titres** en SRT, VTT ou ASS — manuels ou auto-générés, dans toute langue disponible
- Enregistre à côté de la vidéo, intègre dans un `.mkv`, ou organise dans un sous-dossier `Subtitles/`
- **SponsorBlock** — passe ou marque les sponsors, intros, outros, autopromos en chapitres
- **Métadonnées intégrées** — titre, date de mise en ligne, chaîne, description, miniature et marqueurs de chapitres écrits dans le fichier

### YouTube + 2000 sites

- **YouTube, en entier** — Vidéos, Shorts, Chaînes, Playlists, YouTube Music et Podcasts traités comme des sources de premier rang
- **2000+ autres sites** via yt-dlp — Vimeo, Twitch, Twitter/X, TikTok, SoundCloud, Bandcamp, Bilibili, BBC iPlayer, archive.org et bien plus encore
- **L'audio seul et les sous-titres** fonctionnent sur chaque site supporté, pas seulement YouTube
- Si un site change, yt-dlp publie des correctifs chaque semaine et Arroxy met à jour le binaire automatiquement au lancement

<div align="center">
  <img src="build/Main-screenshot.png" width="48%" alt="Coller une URL" />
  <img src="build/Choosing-format-screenshot.png" width="48%" alt="Choisir la qualité" />
  <br/>
  <img src="build/Choosing-destination-screenshot.png" width="48%" alt="Choisir où enregistrer" />
  <img src="build/Downloading-in-parallel-screenshot.png" width="48%" alt="File de téléchargement en action" />
  <br/>
  <img src="build/Subtitles-screenshot.png" width="48%" alt="Sélecteur de langue et de format pour les sous-titres" />
</div>

---

## <a id="download"></a>Téléchargement

| Plateforme | Format   |
| ------------------- | ------------------- |
| Windows             | Installeur (NSIS) ou `.exe` portable   |
| macOS               | `.dmg` (Intel + Apple Silicon)   |
| Linux               | `.AppImage` ou `.flatpak` (sandboxed) |

[**Récupère la dernière version →**](../../releases/latest)

### <a id="why-warning"></a>Pourquoi tu peux voir un avertissement

Arroxy est open source et sous licence MIT. Les builds Windows et macOS **ne sont pas signés numériquement** — les certificats Apple Developer ID et Windows EV coûtent chacun plusieurs centaines de dollars par an, que paye un projet indépendant de sa poche. Sans ces signatures, Windows SmartScreen et macOS Gatekeeper t'avertiront au premier lancement. Ces avertissements signifient *ton OS ne reconnaît pas l'éditeur* — ils ne signifient pas qu'Arroxy est un malware.

Trois façons de vérifier Arroxy toi-même, par ordre de rigueur croissante :

- **Lis le code source.** Chaque ligne est sur [GitHub](https://github.com/antonio-orionus/Arroxy) et tu peux [le compiler depuis les sources](#tech).
- **Vérifie le SHA256.** Compare ton fichier avec le [`SHA256SUMS`](../../releases/latest) publié — voir [Vérifier ton téléchargement](#verify) ci-dessous.
- **Lance un scan tiers.** Envoie le fichier sur [VirusTotal](https://www.virustotal.com).

### <a id="windows-first-launch"></a>Premier lancement sur Windows

Au premier lancement, tu peux voir **"Windows protected your PC"** ou **"Unknown publisher."** Cela s'applique à la fois à `Arroxy-Setup-*.exe` et à `Arroxy-Portable-*.exe`. Arroxy est gratuit et open source, et les builds Windows ne sont pas signés avec un certificat payant, c'est pourquoi SmartScreen les signale. Cela ne signifie **pas** automatiquement qu'Arroxy est dangereux. Pour continuer :

<div align="center">
  <img src="build/win-smartscreen-more-info.png" width="46%" alt="SmartScreen "Windows protected your PC" dialog with the "More info" link highlighted" />
  <img src="build/win-smartscreen-run-anyway.png" width="46%" alt="SmartScreen dialog after expanding More info, showing the "Run anyway" button" />
</div>

1. Clique sur **More info**.
2. Clique sur **Run anyway**.

#### Si Windows Defender signale ou supprime le fichier

L'heuristique de Defender signale parfois les installeurs NSIS non signés et les portables Electron comme suspects. Si Defender met en quarantaine `Arroxy-Setup-*.exe` ou `Arroxy-Portable-*.exe`, restaure-le depuis **Windows Security → Virus & threat protection → Protection history**, puis ajoute l'exécutable Arroxy comme élément autorisé sous **Manage settings → Add or remove exclusions**. Comme pour SmartScreen, le déclencheur est la signature d'éditeur manquante, pas un malware détecté.

> Ne télécharge Arroxy que depuis la page officielle GitHub Releases. Si tu as obtenu le fichier depuis un autre site ou que quelqu'un te l'a envoyé, supprime-le et télécharge une copie fraîche depuis la source officielle. Le code source est public, tu peux donc l'inspecter ou compiler Arroxy toi-même si tu préfères.

### <a id="macos-first-launch"></a>Premier lancement sur macOS

Arroxy n'est pas encore signé pour macOS, donc Gatekeeper bloquera le premier lancement. Le chemin exact pour l'autoriser dépend de ta version de macOS — Sequoia 15 a durci l'ancienne méthode de contournement via clic droit → Ouvrir.

#### macOS Sequoia 15 et ultérieur (actuel)

Sur Sequoia 15 et versions plus récentes, clic droit → Ouvrir ne contourne plus Gatekeeper pour de nombreuses apps en quarantaine. Utilise le panneau Réglages Système à la place :

1. Fais glisser `Arroxy.app` depuis le DMG monté vers `/Applications`.
2. Double-clique sur Arroxy. La boîte de dialogue de blocage apparaît — clique sur **Done** (ne clique pas sur *Move to Trash*).
3. Ouvre **System Settings → Privacy & Security** et descends jusqu'à la section **Security**. Tu verras *"Arroxy was blocked to protect your Mac"* (ou un message quasi identique).
4. Clique sur **Open Anyway**, confirme avec ton mot de passe ou Touch ID, puis relance Arroxy depuis `/Applications`.

#### macOS Sonoma 14 et antérieur

1. Fais glisser `Arroxy.app` depuis le DMG monté vers `/Applications`.
2. Clic droit (ou Control-clic) sur `Arroxy.app` dans `/Applications` et choisis **Open**.
3. La boîte de dialogue d'avertissement dispose maintenant d'un bouton **Open** — clique dessus et confirme. Arroxy s'ouvre normalement et l'avertissement ne réapparaît plus jamais.

#### "App is damaged" ou blocage Gatekeeper persistant — correction via Terminal

Si macOS dit *"Arroxy is damaged and can't be opened"*, ou qu'aucune des étapes ci-dessus ne lève le blocage, l'attribut de quarantaine sur le DMG en est la cause (certains navigateurs et le comportement de translocation propre à macOS le définissent). Supprime-le de l'app installée :

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
```

**Apple Silicon vs Intel :** sur un Mac de la série M (M1 / M2 / M3 / M4), télécharge le DMG `arm64`. Sur les Macs Intel, télécharge le DMG `x64`. Le mauvais build fonctionne quand même via Rosetta, mais est notablement plus lent.

> Les builds macOS sont produits via CI sur des runners Apple Silicon et Intel. Si tu rencontres des problèmes, merci d'[ouvrir un issue](../../issues) — les retours des utilisateurs macOS orientent activement le cycle de test macOS.

### <a id="linux-first-launch"></a>Premier lancement sur Linux

Les AppImages s'exécutent directement — pas d'installation. Tu dois juste marquer le fichier comme exécutable.

**Gestionnaire de fichiers :** clic droit sur le `.AppImage` → **Propriétés** → **Permissions** → active **Autoriser l'exécution du fichier comme programme**, puis double-clique.

**Terminal :**

```bash
chmod +x Arroxy-*.AppImage
./Arroxy-*.AppImage
```

Si le lancement échoue encore, il te manque peut-être FUSE :

```bash
# Ubuntu / Debian
sudo apt install -y libfuse2

# Fedora
sudo dnf install -y fuse-libs

# Arch
sudo pacman -S fuse2
```

**Intégration bureau optionnelle :** installe [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) une fois, et toute AppImage sur laquelle tu double-cliques est automatiquement enregistrée dans ton menu de lancement — aucun fichier `.desktop` manuel nécessaire.

**Flatpak (alternative en sandbox) :** télécharge `Arroxy-*.flatpak` depuis la même page de release.

```bash
flatpak install --user Arroxy-*.flatpak
flatpak run io.github.antonio_orionus.Arroxy
```

<details>
<summary><strong><a id="verify"></a>Vérifier ton téléchargement (SHA256)</strong></summary>

Chaque release publie un fichier `SHA256SUMS` accompagnant les binaires. Pour vérifier que ton téléchargement n'a pas été corrompu ou altéré en transit, hache ton fichier en local et compare la ligne dans `SHA256SUMS`. Ouvre la page de la dernière release → **Assets** → télécharge `SHA256SUMS`.

**Windows (PowerShell or Command Prompt) :**

```powershell
certutil -hashfile Arroxy-Setup-<version>.exe SHA256
```

**macOS (Terminal) :**

```bash
shasum -a 256 Arroxy-<version>-arm64.dmg
```

**Linux (Terminal) :**

```bash
sha256sum Arroxy-*.AppImage
```

Tu veux un scan antimalware tiers ? Envoie le fichier sur [VirusTotal](https://www.virustotal.com). Une poignée de flags heuristiques génériques de moteurs mineurs est normale pour des apps Electron non signées ; des détections généralisées par les grands moteurs seraient une vraie préoccupation.

</details>

<details>
<summary><strong>Installation via gestionnaire de paquets</strong></summary>

Tu utilises déjà un gestionnaire de paquets ? Tu peux passer la voie de téléchargement manuel.

| Canal | Commande                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Winget             | `winget install AntonioOrionus.Arroxy`                                                            |
| Scoop              | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy` |
| Homebrew           | `brew tap antonio-orionus/arroxy && brew install --cask arroxy`                                   |
| Flatpak            | `flatpak install --user Arroxy-*.flatpak`                                                         |

</details>

<details>
<summary><strong>Windows : Installeur vs Portable</strong></summary>

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

## <a id="privacy"></a>Confidentialité

Les téléchargements sont récupérés directement via [yt-dlp](https://github.com/yt-dlp/yt-dlp) depuis YouTube vers le dossier que tu choisis — rien ne passe par un serveur tiers. L'historique de visionnage, l'historique de téléchargement, les URLs et le contenu des fichiers restent sur ton appareil.

Arroxy envoie une télémétrie anonyme et agrégée via [OpenPanel](https://openpanel.dev) — juste assez pour comprendre les lancements, OS, versions de l’app et crashs. Pas d’URLs, de titres de vidéos, de chemins de fichiers, d’infos de compte, de fingerprinting ni de données personnelles. L’identifiant par installation est aléatoire et non lié à ton identité. Tu peux te désabonner dans les Paramètres.

---

## <a id="faq"></a>Questions fréquentes

**C'est vraiment gratuit ?**
Oui — licence MIT, pas de niveau premium, pas de fonctions verrouillées.

**Quelles qualités de vidéo puis-je télécharger ?**
Tout ce que YouTube propose : 4K UHD (2160p), 1440p, 1080p, 720p, 480p, 360p, plus audio seul. Les flux 60 fps, 120 fps et HDR sont préservés tels quels.

**Puis-je extraire uniquement l'audio en MP3 ?**
Oui. Choisis *audio seul* dans le menu des formats puis MP3, M4A/AAC, Opus ou WAV.

**Ai-je besoin d'un compte YouTube ou de cookies ?**
Par défaut, non — Arroxy fonctionne sans compte YouTube, sans connexion et sans export de cookies. Un support de cookies optionnel est disponible dans les paramètres avancés (Source des cookies : fichier ou navigateur) pour le contenu nécessitant une authentification, comme les vidéos à restriction d'âge ou réservées aux membres. C'est désactivé par défaut. Si tu l'actives, le wiki de yt-dlp note que [l'automatisation à base de cookies peut signaler un compte Google](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies) ; un compte jetable est alors le choix le plus sûr.

**Ça continuera de fonctionner si YouTube change quelque chose ?**
yt-dlp est mis à jour automatiquement au lancement, et Arroxy publie des correctifs rapidement quand YouTube change quelque chose. Si jamais tu rencontres un problème, un support de cookies optionnel est disponible dans les paramètres avancés en solution de repli.

**Dans quelles langues Arroxy est-il disponible ?**
Vingt-et-une, prêtes à l'emploi : English, Español (espagnol), Deutsch (allemand), Français, 日本語 (japonais), 中文 (chinois), Русский (russe), Українська (ukrainien), हिन्दी (hindi), Afaan Oromoo, Kiswahili, O'zbekcha (ouzbek), Tiếng Việt (vietnamien), አማርኛ (amharique), العربية (arabe), اردو (ourdou), پښتو (pachto), বাংলা (bengali), မြန်မာဘာသာ (birman), Ελληνικά (grec) et Српски (serbe). Arroxy détecte la langue de ton système d'exploitation au premier lancement et tu peux changer à tout moment depuis le sélecteur de langue dans la barre d'outils. Les traductions sont de simples objets TypeScript dans src/shared/i18n/locales/ — ouvre une PR sur GitHub pour contribuer.

**Dois-je installer autre chose ?**
Non. yt-dlp est téléchargé automatiquement au premier lancement et mis en cache sur ta machine ; ffmpeg et ffprobe sont inclus dans l’app. Après ça, aucune configuration supplémentaire.

**Puis-je télécharger des playlists ou des chaînes entières ?**
Oui — les deux. Colle une URL de playlist ou de chaîne (p. ex. `youtube.com/@handle`, `/channel/UC…`, `/c/Name`, `/user/Old`) ; choisis combien d’entrées analyser, puis mets toute la liste en file ou sélectionne des vidéos précises. Les filtres par date arrivent bientôt.

**macOS dit "l'application est endommagée" — que faire ?**
C'est Gatekeeper de macOS qui bloque une app non signée, pas un vrai endommagement. Voir ["App is damaged" — correction via Terminal](#macos-first-launch) pour la commande `xattr` en une ligne qui règle le problème.

**Télécharger des vidéos YouTube est-il légal ?**
Pour un usage personnel et privé, c'est généralement accepté dans la plupart des juridictions. Tu es responsable de respecter les [Conditions d'Utilisation](https://www.youtube.com/t/terms) de YouTube et les lois sur le droit d'auteur de ton pays.

---

## <a id="roadmap"></a>Feuille de route

Toujours prévu — approximativement par ordre de priorité :

| Fonctionnalité    | Description    |
| ---------------- | ---------------- |
| **Filtres de playlists et chaînes** | Filtres par plage de dates lors de l’énumération d’une playlist ou d’une chaîne |
| **Modèles de noms de fichier personnalisés** | Nomme les fichiers par titre, auteur, date, résolution — avec aperçu en direct |
| **Téléchargements programmés** | Démarre une file à une heure définie (lancements nocturnes) |
| **Découpe de clips** | Télécharge uniquement un segment par heure de début/fin |

Tu as une fonctionnalité en tête ? [Ouvre une demande](../../issues) — les retours de la communauté orientent les priorités.

---

## <a id="tech"></a>Construit avec

<details>
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

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Aucun outil de compilation natif requis — le projet n'a pas d'addons Node natifs.

### macOS

```bash
xcode-select --install
curl -fsSL https://bun.sh/install | bash
```

### Linux (Ubuntu / Debian)

```bash
curl -fsSL https://bun.sh/install | bash

# Dépendances runtime Electron
sudo apt install -y libgtk-3-0 libnss3 libasound2t64

# Tests E2E uniquement (Electron a besoin d'un affichage)
sudo apt install -y xvfb
```

### Cloner & lancer

```bash
git clone https://github.com/antonio-orionus/Arroxy
cd arroxy
bun install
bun run dev          # build de développement avec rechargement à chaud
```

### Créer un paquet distribuable

```bash
bun run build        # vérification des types + compilation
bun run dist         # paquet pour l'OS actuel
bun run dist:win     # compilation croisée exe portable Windows
```

> yt-dlp est récupéré depuis GitHub au premier lancement et mis en cache dans le dossier de données de l’app. ffmpeg et ffprobe sont inclus dans chaque release d’Arroxy.

</details>

---

## <a id="troubleshooting"></a>Troubleshooting

### App won't open / no window appears

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
.\Arroxy-Portable-<version>.exe --disable-gpu

# Windows (Portable) — Command Prompt (cmd.exe), from the same folder
Arroxy-Portable-<version>.exe --disable-gpu

# Windows (Installed) — works in both PowerShell and cmd.exe
"%LOCALAPPDATA%\Programs\Arroxy\Arroxy.exe" --disable-gpu

# macOS
/Applications/Arroxy.app/Contents/MacOS/Arroxy --disable-gpu

# Linux (AppImage)
./Arroxy-*.AppImage --disable-gpu
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

**6. Still stuck?** Open an issue with: OS version, the contents of `main.log`, and any output from running with `--enable-logging --v=1`.

---

## Conditions d'utilisation

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
