<!-- translated from README.md as of 2026-04-27 -->

<div align="center">
  <img src="src/renderer/src/assets/App-icon-HQ.png" alt="Mascotte Arroxy" width="180" />

# Arroxy — Téléchargeur YouTube gratuit et open source

**Lire en :** [English](README.md) · [Español](README.es.md) · [Deutsch](README.de.md) · **Français** · [日本語](README.ja.md) · [中文](README.zh.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [हिन्दी](README.hi.md)

![Langues](https://img.shields.io/badge/i18n-9_langues-blue) ![Licence](https://img.shields.io/badge/licence-MIT-green) ![Plateformes](https://img.shields.io/badge/plateformes-Windows_%7C_macOS_%7C_Linux-lightgrey)

**4K &nbsp;•&nbsp; 1080p60 &nbsp;•&nbsp; HDR &nbsp;•&nbsp; Shorts &nbsp;·&nbsp; Windows &nbsp;•&nbsp; macOS &nbsp;•&nbsp; Linux**

**Marre des publicités YouTube qui gâchent tes vidéos ?**
Télécharge n'importe quelle vidéo ou Short en pleine qualité — 4K, 1080p60, HDR et au-delà. Rapide, gratuit, 100 % à toi.

Pas de pub. Pas de tracking. Pas de cookies. Pas de connexion. Pas de blabla.

[**Dernière version →**](../../releases/latest) &nbsp;·&nbsp; [Windows](#téléchargement) · [macOS](#téléchargement) · [Linux](#téléchargement)

<img src="build/demo.gif" alt="Démo Arroxy" width="720" />

</div>

> 🌐 Traduction assistée par IA. Le [README en anglais](README.md) fait foi. Tu vois une erreur ? [Les PRs sont les bienvenues](../../pulls).

---

## Pourquoi Arroxy ?

|                                              | Arroxy | Extensions navigateur | Convertisseurs en ligne | Autres téléchargeurs |
| -------------------------------------------- | ------ | --------------------- | ----------------------- | -------------------- |
| Gratuit pour toujours                        | ✅     | ⚠️                    | ⚠️                      | ✅                   |
| Sans publicité                               | ✅     | ⚠️                    | ❌                      | ✅                   |
| Sans compte                                  | ✅     | ✅                    | ⚠️                      | ⚠️                   |
| Marche hors ligne _(plus ou moins)_          | ✅     | ❌                    | ❌                      | ✅                   |
| Tes fichiers restent en local                | ✅     | ✅                    | ❌                      | ✅                   |
| Aucune limite d'usage                        | ✅     | ⚠️                    | 🚫                      | ✅                   |
| Open source                                  | ✅     | ⚠️                    | ❌                      | ⚠️                   |
| Jamais de login ni cookies                   | ✅     | ✅                    | ⚠️                      | ⚠️                   |
| Aucun risque de bannissement Google          | ✅     | ✅                    | ⚠️                      | ⚠️                   |

> _« Marche hors ligne » signifie qu'aucune conversion ne se fait sur le serveur de quelqu'un d'autre — toute la chaîne tourne sur ta machine. Tu as quand même besoin d'Internet pour atteindre YouTube. Oui, on sait._

> **Pourquoi c'est important :** La plupart des téléchargeurs YouTube de bureau finissent par te demander d'exporter les cookies de ton navigateur dès que YouTube met à jour sa détection de bots. Ces sessions expirent toutes les ~30 minutes — et la doc de yt-dlp prévient elle-même que l'automatisation à base de cookies peut faire bannir ton compte Google. Arroxy ne demande jamais de cookies, ni de login, ni d'identifiants. Il demande les mêmes tokens que YouTube envoie à n'importe quel vrai navigateur — zéro risque pour ton compte, aucune expiration.

Arroxy est une application desktop **gratuite, open source et soucieuse de la vie privée** — pensée pour les gens qui veulent de la simplicité sans superflu. Tes téléchargements ne passent jamais par un serveur tiers. Zéro télémétrie, zéro collecte de données. Colle une URL, c'est parti.

---

## Ce qu'il fait

- **Colle n'importe quelle URL YouTube** — vidéos, Shorts, peu importe — Arroxy récupère tous les formats disponibles en quelques secondes
- **Choisis la qualité** — jusqu'à 4K UHD (2160p), 1440p, 1080p, 720p, 60 fps et plus, audio seul (MP3/AAC/Opus), ou un préréglage rapide (Meilleure qualité / Équilibré / Petit fichier)
- **Support complet du haut framerate** — les flux 60 fps, 120 fps et HDR sont préservés exactement comme YouTube les encode
- **Choisis où enregistrer** — le dernier dossier est mémorisé, ou choisis-en un nouveau à chaque fois
- **Un clic pour télécharger** — barre de progression en temps réel, annulable à tout moment
- **File d'attente multi-vidéos** — le panneau de téléchargement suit tout en parallèle
- **Disponible en 9 langues** — English, Español, Deutsch, Français, 日本語, 中文, Русский, Українська, हिन्दी — détecte la langue de ton système, modifiable à tout moment

<div align="center">
  <img src="build/Main-screenshot.png" width="48%" alt="Coller une URL" />
  <img src="build/Choosing-format-screenshot.png" width="48%" alt="Choisir la qualité" />
  <br/>
  <img src="build/Choosing-destination-screenshot.png" width="48%" alt="Choisir où enregistrer" />
  <img src="build/Downloading-in-parallel-screenshot.png" width="48%" alt="File de téléchargement en action" />
</div>

---

## Fonctions prévues

Sur la feuille de route — pas encore livré, par ordre de priorité approximatif.

| Fonction                                  | Description                                                                                              |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Téléchargement de playlists et chaînes** | Colle l'URL d'une playlist ou d'une chaîne pour mettre toutes les vidéos en file, avec filtres date/nombre |
| **Saisie d'URLs en lot**                  | Colle plusieurs URLs d'un coup et lance tout ensemble                                                    |
| **Conversion de format**                  | Convertis les téléchargements en MP3, WAV, FLAC ou autres sans outil supplémentaire                       |
| **Modèles de noms de fichier**            | Nomme par titre, auteur, date, résolution ou combinaison — avec aperçu en direct                         |
| **Téléchargement des sous-titres**        | Récupère les sous-titres auto ou manuels avec la vidéo, dans toute langue disponible                     |
| **Téléchargements programmés**            | Définis une heure pour qu'Arroxy démarre — pratique pour les grosses files la nuit                       |
| **Limites de vitesse de téléchargement**  | Plafonne la bande passante pour ne pas saturer ta connexion pendant que tu travailles                    |
| **Découpe de clips**                      | Spécifie un début et une fin pour ne télécharger qu'un segment d'une vidéo                               |

> Une fonctionnalité en tête qui n'est pas ici ? [Ouvre une demande](../../issues) — la voix de la communauté oriente la suite.

---

## Téléchargement

> Arroxy est en développement actif. Récupère le dernier build sur la page [Releases](../../releases).

| Plateforme | Format                                  |
| ---------- | --------------------------------------- |
| Windows    | Installeur (NSIS) ou `.exe` portable    |
| macOS      | `.dmg` (Intel + Apple Silicon)          |
| Linux      | `.AppImage`                             |

Télécharge, lance, terminé.

### Installation via gestionnaire de paquets

| Canal    | Commande                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------- |
| Winget   | `winget install AntonioOrionus.Arroxy` (ou `winget install arroxy`)                                 |
| Scoop    | `scoop bucket add arroxy https://github.com/antonio-orionus/scoop-bucket && scoop install arroxy`   |
| Homebrew | `brew tap antonio-orionus/arroxy && brew install --cask arroxy`                                     |

### Windows : Installeur vs Portable

Deux builds disponibles — choisis celui qui te convient :

|                                  | Installeur NSIS | `.exe` portable               |
| -------------------------------- | --------------- | ----------------------------- |
| Installation requise             | Oui             | Non — exécutable de partout   |
| Mises à jour automatiques        | ✅ dans l'app    | ❌ téléchargement manuel      |
| Vitesse de démarrage             | ✅ plus rapide   | ⚠️ démarrage à froid plus lent |
| Ajouté au menu Démarrer          | ✅              | ❌                             |
| Désinstallation simple           | ✅              | ❌ supprime juste le fichier   |

**Recommandation :** prends l'installeur NSIS si tu veux qu'Arroxy se mette à jour tout seul et démarre plus vite. Prends le `.exe` portable si tu préfères ne rien installer ni toucher au registre.

### Premier lancement sur macOS

> **Note :** Je n'ai pas de Mac, donc le build macOS n'est pas testé par moi-même. Si quelque chose ne marche pas — l'app ne se lance pas, le `.dmg` est cassé, le contournement de quarantaine échoue — merci d'[ouvrir un issue](../../issues) pour me prévenir. Tout retour des utilisateurs macOS est franchement apprécié.

Arroxy n'est pas encore signé. macOS affichera un avertissement de sécurité au premier lancement — c'est normal, ça ne veut pas dire que le fichier est endommagé.

**Méthode 1 : Réglages Système (recommandé)**

| Étape | Action                                                                                                                         |
| :---: | ------------------------------------------------------------------------------------------------------------------------------ |
|   1   | Clic droit sur l'icône d'Arroxy et choisis **Ouvrir**.                                                                         |
|   2   | Une boîte de dialogue d'avertissement apparaît. Clique sur **Annuler** (pas sur « Mettre à la corbeille »).                    |
|   3   | Ouvre **Réglages Système → Confidentialité et sécurité**.                                                                      |
|   4   | Descends jusqu'à la section **Sécurité** — tu verras _« Arroxy a été bloqué car il ne provient pas d'un développeur identifié. »_ |
|   5   | Clique sur **Ouvrir quand même**, puis confirme avec ton mot de passe ou Touch ID.                                             |

Après l'étape 5, Arroxy s'ouvre normalement et l'avertissement ne reviendra plus.

**Méthode 2 : Terminal (avancé)**

Si ce qui précède ne marche pas, exécute ceci une fois après avoir glissé Arroxy dans Applications :

```bash
xattr -dr com.apple.quarantine /Applications/Arroxy.app
```

### Premier lancement sur Linux

Les AppImages ne s'installent pas — elles s'exécutent directement. Tu dois juste marquer le fichier comme exécutable d'abord.

**Méthode 1 : Gestionnaire de fichiers**

Clic droit sur le fichier `.AppImage` → **Propriétés** → **Permissions** → active **Autoriser l'exécution du fichier comme programme**, puis double-clique pour lancer.

**Méthode 2 : Terminal**

```bash
chmod +x Arroxy-*.AppImage
./Arroxy-*.AppImage
```

S'il refuse encore de se lancer, il te manque peut-être FUSE (requis par AppImage) :

```bash
# Ubuntu / Debian
sudo apt install -y libfuse2

# Fedora
sudo dnf install -y fuse-libs

# Arch
sudo pacman -S fuse2
```

---

## Confidentialité

Arroxy tourne entièrement sur ta machine. Quand tu télécharges une vidéo :

1. Arroxy appelle l'URL YouTube directement avec [yt-dlp](https://github.com/yt-dlp/yt-dlp) — un outil open source auditable et toujours à jour
2. Le fichier est sauvegardé directement dans le dossier que tu as choisi
3. Zéro télémétrie. Rien n'est journalisé, tracé ou envoyé où que ce soit — jamais.

Ton historique de visionnage, ton historique de téléchargement et le contenu des fichiers restent sur ton appareil. 100 % privé.

---

## Questions fréquentes

**Quelles qualités de vidéo puis-je télécharger ?**
Tout ce que YouTube propose — 4K UHD (2160p), 1440p QHD, 1080p Full HD, 720p, 480p, 360p et audio seul. Les flux haut framerate (60 fps, 120 fps) et HDR sont préservés tels quels. Arroxy te montre tous les formats disponibles et te laisse choisir précisément ce que tu veux récupérer.

**C'est vraiment gratuit ?**
Oui. Licence MIT. Pas de version premium, pas de fonctions verrouillées.

**Dans quelles langues Arroxy est-il disponible ?**
Neuf, prêtes à l'emploi : English, Español (espagnol), Deutsch (allemand), Français, 日本語 (japonais), 中文 (chinois), Русский (russe), Українська (ukrainien) et हिन्दी (hindi). Arroxy détecte la langue de ton système d'exploitation au premier lancement et tu peux changer à tout moment depuis le sélecteur de langue dans la barre d'outils. Envie d'ajouter ou d'améliorer une traduction ? Les fichiers de langue sont de simples objets TypeScript dans `src/shared/i18n/locales/` — [ouvre une PR](../../pulls).

**Faut-il installer quelque chose ?**
Non. yt-dlp et ffmpeg sont téléchargés automatiquement au premier lancement depuis leurs releases officielles GitHub et mis en cache sur ta machine. Après ça, aucune configuration supplémentaire.

**Est-ce que ça continuera de marcher si YouTube change quelque chose ?**
Oui — et Arroxy a deux couches de résilience. Premièrement, yt-dlp est l'un des outils open source les plus activement maintenus — il est mis à jour dans les heures qui suivent les changements YouTube. Deuxièmement, Arroxy ne dépend pas du tout des cookies ni de ton compte Google, donc aucune session n'expire et aucun identifiant à renouveler. Cette combinaison le rend bien plus stable que les outils dépendant de cookies de navigateur exportés.

**Puis-je télécharger des playlists ?**
Aujourd'hui, seules les vidéos individuelles sont supportées. Le support des playlists et des chaînes est sur la feuille de route — voir [Fonctions prévues](#fonctions-prévues).

**A-t-il besoin de mon compte YouTube ou de cookies ?**
Non — et c'est plus important qu'il n'y paraît. La plupart des outils qui cessent de fonctionner après une mise à jour de YouTube te disent d'exporter les cookies YouTube de ton navigateur. Ce contournement casse toutes les ~30 minutes quand YouTube renouvelle les sessions, et la doc de yt-dlp prévient que ça peut faire signaler ton compte Google. Arroxy n'utilise jamais de cookies ni d'identifiants. Pas de login. Pas de compte lié. Rien à expirer, rien à bannir.

**macOS dit « l'application est endommagée » ou « ne peut pas être ouverte » — que faire ?**
C'est Gatekeeper de macOS qui bloque une app non signée — pas un vrai dommage. Voir [Premier lancement sur macOS](#premier-lancement-sur-macos) pour la marche à suivre.

**C'est légal ?**
Télécharger des vidéos pour un usage personnel est généralement accepté dans la plupart des juridictions. Tu es responsable de respecter les Conditions d'Utilisation de YouTube et les lois de ton pays.

---

## Détails techniques

Pour les détails techniques, les instructions de compilation depuis les sources, les prérequis par plateforme et la contribution, voir le [README en anglais](README.md#tech-details).

---

> **Conditions d'utilisation :** Arroxy est un outil destiné à un usage personnel et privé. Tu es seul responsable du fait que tes téléchargements respectent les [Conditions d'utilisation](https://www.youtube.com/t/terms) de YouTube et le droit d'auteur de ta juridiction. N'utilise pas Arroxy pour télécharger, reproduire ou distribuer du contenu sur lequel tu n'as pas de droits. Les développeurs d'Arroxy ne sont pas responsables de tout usage abusif.

<div align="center">
  <sub>Licence MIT · Fait avec soin par <a href="https://x.com/OrionusAI">@OrionusAI</a></sub>
</div>
