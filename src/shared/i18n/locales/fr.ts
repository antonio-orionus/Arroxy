const fr = {
  common: {
    back: 'Retour',
    continue: 'Continuer',
    retry: 'Réessayer',
    startOver: 'Recommencer',
    loading: 'Chargement…'
  },
  app: {
    feedback: 'Commentaires',
    logs: 'Journaux',
    feedbackNudge: "Tu apprécies Arroxy ? J'adorerais avoir ton avis ! 💬",
    debugCopied: 'Copié !',
    debugCopyTitle: 'Copier les infos de débogage (versions Electron, OS, Chrome)',
    zoomIn: 'Zoom avant',
    zoomOut: 'Zoom arrière'
  },
  titleBar: {
    close: 'Fermer',
    minimize: 'Réduire',
    maximize: 'Agrandir',
    restore: 'Restaurer'
  },
  splash: {
    greeting: 'Salut, content de te revoir !',
    warmup: 'Arroxy se prépare…',
    warning: 'Configuration incomplète — certaines fonctions pourraient ne pas marcher'
  },
  theme: {
    light: 'Mode clair',
    dark: 'Mode sombre',
    system: 'Système par défaut'
  },
  language: {
    label: 'Langue'
  },
  wizard: {
    steps: {
      url: 'URL',
      formats: 'Format',
      subtitles: 'Sous-titres',
      sponsorblock: 'SponsorBlock',
      output: 'Sortie',
      folder: 'Enregistrer',
      confirm: 'Confirmer'
    },
    url: {
      heading: 'URL YouTube',
      placeholder: 'https://www.youtube.com/watch?v=...',
      hint: 'Compatible avec les liens youtube.com et youtu.be',
      fetchFormats: 'Récupérer les formats',
      mascotIdle: "Lance-moi un lien YouTube (vidéo ou Short) — clique sur « Récupérer les formats » et je m'occupe du reste ✨",
      mascotBusy: 'Téléchargement en arrière-plan… je peux faire plusieurs choses à la fois 😎',
      advanced: 'Avancé',
      clearAria: "Effacer l'URL",
      clipboard: {
        toggle: 'Surveiller le presse-papiers',
        toggleDescription: 'Remplit automatiquement le champ URL lorsque vous copiez un lien YouTube.',
        dialog: {
          title: 'URL YouTube détectée',
          body: 'Utiliser ce lien depuis votre presse-papiers ?',
          useButton: "Utiliser l'URL",
          disableButton: 'Désactiver',
          cancelButton: 'Annuler',
          disableNote: 'Vous pouvez réactiver la surveillance du presse-papiers plus tard dans les Réglages avancés.'
        }
      },
      cookies: {
        toggle: 'Utiliser un fichier de cookies',
        toggleDescription: "Aide pour les vidéos avec restriction d'âge, réservées aux membres ou privées du compte.",
        risk: 'Risque : un cookies.txt contient toutes les sessions connectées de ce navigateur — gardez-le privé.',
        fileLabel: 'Fichier de cookies',
        choose: 'Choisir…',
        clear: 'Effacer',
        placeholder: 'Aucun fichier sélectionné',
        helpLink: 'Comment exporter les cookies ?',
        enabledButNoFile: 'Choisissez un fichier pour utiliser les cookies',
        banWarning: 'YouTube peut signaler — et parfois bannir — les comptes dont les cookies sont utilisés par yt-dlp. Préférez un compte jetable.',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'Get cookies.txt LOCALLY (Chrome)'
      },
      closeToTray: {
        toggle: 'Masquer dans la barre des tâches à la fermeture',
        toggleDescription: 'Continuer les téléchargements en arrière-plan après la fermeture de la fenêtre.'
      },
      analytics: {
        toggle: "Envoyer des statistiques d'utilisation anonymes",
        toggleDescription: "Compte uniquement les lancements de l'application. Aucune URL, nom de fichier ou donnée personnelle."
      }
    },
    subtitles: {
      heading: 'Sous-titres',
      autoBadge: 'Auto',
      hint: 'Les fichiers seront enregistrés à côté de la vidéo',
      noLanguages: 'Aucun sous-titre disponible pour cette vidéo',
      skip: 'Ignorer',
      skipSubs: 'Ignorer pour cette vidéo',
      selectAll: 'Tout sélectionner',
      deselectAll: 'Tout désélectionner',
      mascot: "Zéro, un ou plusieurs — c'est vous qui choisissez ✨",
      searchPlaceholder: 'Rechercher des langues…',
      noMatches: 'Aucune langue ne correspond',
      clearAll: 'Tout effacer',
      noSelected: 'Aucun sous-titre sélectionné',
      selectedNote_one: '{{count}} sous-titre sera téléchargé',
      selectedNote_other: '{{count}} sous-titres seront téléchargés',
      sectionManual: 'Manuel',
      sectionAuto: 'Généré automatiquement',
      saveMode: {
        heading: 'Enregistrer en tant que',
        sidecar: 'À côté de la vidéo',
        embed: 'Intégrer dans la vidéo',
        subfolder: 'Sous-dossier subtitles/'
      },
      format: {
        heading: 'Format'
      },
      embedNote: 'Le mode « incorporé » enregistre la sortie en .mkv pour que les pistes de sous-titres soient intégrées de façon fiable.',
      autoAssNote: "Les sous-titres automatiques seront enregistrés en SRT au lieu d'ASS — ils sont toujours nettoyés des duplications de cues en cascade de YouTube, ce que notre convertisseur ASS ne peut pas encore reproduire."
    },
    sponsorblock: {
      modeHeading: 'Filtrer les sponsors',
      mode: {
        off: 'Désactivé',
        mark: 'Marquer comme chapitres',
        remove: 'Supprimer les segments'
      },
      modeHint: {
        off: "Pas de SponsorBlock — la vidéo est lue telle qu'elle a été mise en ligne.",
        mark: 'Marque les segments sponsors comme chapitres (non destructif).',
        remove: 'Supprime les segments sponsors avec FFmpeg.'
      },
      categoriesHeading: 'Catégories',
      cat: {
        sponsor: 'Sponsor',
        intro: 'Intro',
        outro: 'Outro',
        selfpromo: 'Autopromotion',
        music_offtopic: 'Musique hors sujet',
        preview: 'Aperçu',
        filler: 'Remplissage'
      }
    },
    formats: {
      quickPresets: 'Préréglages rapides',
      video: 'Vidéo',
      audio: 'Audio',
      noAudio: 'Sans audio',
      videoOnly: 'Vidéo seule',
      audioOnly: 'Audio seul',
      audioOnlyOption: 'Audio seul (sans vidéo)',
      mascot: 'Meilleur + meilleur = qualité max. Je choisirais ça !',
      sniffing: 'Recherche des meilleurs formats pour toi…',
      loadingHint: 'Ça prend généralement une seconde',
      loadingAria: 'Chargement des formats',
      sizeUnknown: 'Taille inconnue',
      total: 'Total'
    },
    folder: {
      heading: 'Enregistrer dans',
      downloads: 'Téléchargements',
      videos: 'Films',
      desktop: 'Bureau',
      music: 'Musique',
      documents: 'Documents',
      pictures: 'Images',
      home: 'Dossier personnel',
      custom: 'Personnalisé…',
      subfolder: {
        toggle: 'Enregistrer dans un sous-dossier',
        placeholder: 'ex. lo-fi rips',
        invalid: 'Le nom contient des caractères invalides'
      }
    },
    output: {
      embedChapters: {
        label: 'Intégrer les chapitres',
        description: 'Marqueurs de chapitres navigables dans tout lecteur moderne.'
      },
      embedMetadata: {
        label: 'Intégrer les métadonnées',
        description: 'Titre, artiste, description et date de mise en ligne écrits dans le fichier.'
      },
      embedThumbnail: {
        label: 'Intégrer la miniature',
        description: 'Pochette dans le fichier. MP4 / M4A uniquement — ignoré quand les sous-titres sont intégrés.'
      },
      writeDescription: {
        label: 'Enregistrer la description',
        description: 'Enregistre la description de la vidéo en fichier .description à côté du téléchargement.'
      },
      writeThumbnail: {
        label: 'Enregistrer la miniature',
        description: 'Enregistre la miniature en fichier .jpg à côté du téléchargement.'
      }
    },
    confirm: {
      readyHeadline: 'Prêt à le récupérer !',
      landIn: 'Ton fichier atterrira dans',
      labelVideo: 'Vidéo',
      labelAudio: 'Audio',
      labelSubtitles: 'Sous-titres',
      subtitlesNone: '—',
      labelSaveTo: 'Dossier',
      labelSize: 'Taille',
      sizeUnknown: 'Inconnue',
      nothingToDownload: "Le préréglage Sous-titres uniquement est actif mais aucune langue de sous-titres n'est sélectionnée — rien ne sera téléchargé.",
      audioOnly: 'Audio seul',
      addToQueue: '+ File',
      addToQueueTooltip: 'Démarre quand les autres téléchargements terminent — bande passante complète',
      pullIt: 'Récupère-le ! ↓',
      pullItTooltip: 'Démarre tout de suite — en parallèle des autres téléchargements actifs'
    },
    error: {
      icon: 'Erreur'
    }
  },
  videoCard: {
    titlePlaceholder: 'Chargement…',
    domain: 'youtube.com'
  },
  queue: {
    header: 'File de téléchargement',
    toggleTitle: 'Afficher/masquer la file de téléchargement',
    empty: "Les téléchargements en file s'afficheront ici",
    noDownloads: "Aucun téléchargement pour l'instant.",
    activeCount: '{{count}} en cours · {{percent}}%',
    clear: 'Effacer',
    clearTitle: 'Effacer les téléchargements terminés',
    tip: 'Ton téléchargement est en file ci-dessous — ouvre-la quand tu veux pour suivre la progression.',
    item: {
      doneAt: 'Terminé {{time}}',
      paused: 'En pause',
      defaultError: 'Échec du téléchargement',
      openUrl: "Ouvrir l'URL",
      pause: 'Pause',
      resume: 'Reprendre',
      cancel: 'Annuler',
      remove: 'Supprimer'
    }
  },
  update: {
    appVersion: 'Arroxy {{version}}',
    isAvailable: 'est disponible',
    youHave: '— tu as la {{currentVersion}}',
    install: 'Installer et redémarrer',
    downloading: 'Téléchargement…',
    download: 'Télécharger ↗',
    dismiss: 'Masquer la bannière de mise à jour',
    copy: 'Copier la commande dans le presse-papiers',
    copied: 'Commande copiée dans le presse-papiers',
    installFailed: 'Échec de la mise à jour',
    retry: 'Réessayer'
  },
  status: {
    preparingBinaries: 'Préparation des binaires…',
    mintingToken: 'Génération du jeton YouTube…',
    remintingToken: 'Regénération du jeton…',
    startingYtdlp: 'Démarrage du processus yt-dlp…',
    downloadingMedia: 'Téléchargement vidéo & audio…',
    mergingFormats: 'Fusion audio et vidéo…',
    fetchingSubtitles: 'Récupération des sous-titres…',
    sleepingBetweenRequests: 'Attente {{seconds}}s pour éviter les limites…',
    subtitlesFailed: "Vidéo enregistrée — certains sous-titres n'ont pu être téléchargés",
    cancelled: 'Téléchargement annulé',
    complete: 'Téléchargement terminé',
    usedExtractorFallback: 'Téléchargé avec un extracteur assoupli — configurez un cookies.txt pour des téléchargements plus fiables',
    ytdlpProcessError: 'Erreur du processus yt-dlp : {{error}}',
    ytdlpExitCode: "yt-dlp s'est terminé avec le code {{code}}",
    downloadingBinary: 'Téléchargement du binaire {{name}}…',
    unknownStartupFailure: 'Échec inconnu au démarrage du téléchargement'
  },
  errors: {
    ytdlp: {
      botBlock: 'YouTube a signalé cette requête comme un bot. Réessaie dans un instant.',
      ipBlock: 'Ton adresse IP semble bloquée par YouTube. Réessaie plus tard ou utilise un VPN.',
      rateLimit: 'YouTube limite le débit des requêtes. Attends une minute puis réessaie.',
      ageRestricted: 'Cette vidéo est limitée par âge et ne peut pas être téléchargée sans compte connecté.',
      unavailable: "Cette vidéo n'est pas disponible — elle est peut-être privée, supprimée ou restreinte par région.",
      geoBlocked: "Cette vidéo n'est pas disponible dans ta région.",
      outOfDiskSpace: "Espace disque insuffisant. Libère de l'espace et réessaie."
    }
  },
  presets: {
    'best-quality': {
      label: 'Meilleure qualité',
      desc: 'Résolution maximale + meilleur audio'
    },
    balanced: {
      label: 'Équilibré',
      desc: '720p max + bon audio'
    },
    'audio-only': {
      label: 'Audio seul',
      desc: 'Pas de vidéo, meilleur audio'
    },
    'small-file': {
      label: 'Petit fichier',
      desc: 'Résolution la plus basse + audio bas'
    },
    'subtitle-only': {
      label: 'Sous-titres uniquement',
      desc: "Pas de vidéo ni d'audio, juste les sous-titres"
    }
  },
  formatLabel: {
    audioOnly: 'Audio seul',
    audioFallback: 'Audio',
    audioOnlyDot: 'Audio seul · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  tray: {
    tooltip: 'Arroxy',
    menu: {
      statusIdle: 'Inactif',
      statusActive_one: '1 téléchargement · {{percent}}%',
      statusActive_other: '{{count}} téléchargements · {{percent}}%',
      open: 'Ouvrir Arroxy',
      quit: 'Quitter Arroxy'
    }
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: '{{count}} téléchargement en cours',
      message_other: '{{count}} téléchargements en cours',
      detail: 'La fermeture annulera tous les téléchargements actifs.',
      confirm: 'Annuler et quitter',
      keep: 'Continuer le téléchargement'
    },
    closeToTray: {
      message: 'Masquer Arroxy dans la barre des tâches lors de la fermeture ?',
      detail: 'Arroxy continue et termine les téléchargements actifs. Modifiez cela dans Paramètres avancés.',
      hide: 'Masquer dans la barre',
      quit: 'Quitter',
      remember: 'Ne plus demander'
    }
  }
} as const;

export default fr;
