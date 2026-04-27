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
    feedbackNudge: 'Tu apprécies Arroxy ? J\'adorerais avoir ton avis ! 💬',
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
      folder: 'Enregistrer',
      confirm: 'Confirmer'
    },
    url: {
      heading: 'URL YouTube',
      placeholder: 'https://www.youtube.com/watch?v=...',
      hint: 'Compatible avec les liens youtube.com et youtu.be',
      fetchFormats: 'Récupérer les formats',
      mascotIdle: 'Lance-moi un lien YouTube (vidéo ou Short) — clique sur « Récupérer les formats » et je m\'occupe du reste ✨',
      mascotBusy: 'Téléchargement en arrière-plan… je peux faire plusieurs choses à la fois 😎'
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
      custom: 'Personnalisé…'
    },
    confirm: {
      readyHeadline: 'Prêt à le récupérer !',
      landIn: 'Ton fichier atterrira dans',
      labelVideo: 'Vidéo',
      labelAudio: 'Audio',
      labelSaveTo: 'Dossier',
      labelSize: 'Taille',
      sizeUnknown: 'Inconnue',
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
    empty: 'Les téléchargements en file s\'afficheront ici',
    noDownloads: 'Aucun téléchargement pour l\'instant.',
    clear: 'Effacer',
    clearTitle: 'Effacer les téléchargements terminés',
    tip: 'Ton téléchargement est en file ci-dessous — ouvre-la quand tu veux pour suivre la progression.',
    item: {
      doneAt: 'Terminé {{time}}',
      paused: 'En pause',
      defaultError: 'Échec du téléchargement',
      openUrl: 'Ouvrir l\'URL',
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
    copied: 'Commande copiée dans le presse-papiers'
  },
  status: {
    preparingBinaries: 'Préparation des binaires…',
    mintingToken: 'Génération du jeton YouTube…',
    remintingToken: 'Regénération du jeton…',
    startingYtdlp: 'Démarrage du processus yt-dlp…',
    cancelled: 'Téléchargement annulé',
    complete: 'Téléchargement terminé',
    ytdlpProcessError: 'Erreur du processus yt-dlp : {{error}}',
    ytdlpExitCode: 'yt-dlp s\'est terminé avec le code {{code}}',
    downloadingBinary: 'Téléchargement du binaire {{name}}…',
    unknownStartupFailure: 'Échec inconnu au démarrage du téléchargement'
  },
  errors: {
    ytdlp: {
      botBlock: 'YouTube a signalé cette requête comme un bot. Réessaie dans un instant.',
      ipBlock: 'Ton adresse IP semble bloquée par YouTube. Réessaie plus tard ou utilise un VPN.',
      rateLimit: 'YouTube limite le débit des requêtes. Attends une minute puis réessaie.',
      ageRestricted: 'Cette vidéo est limitée par âge et ne peut pas être téléchargée sans compte connecté.',
      unavailable: 'Cette vidéo n\'est pas disponible — elle est peut-être privée, supprimée ou restreinte par région.',
      geoBlocked: 'Cette vidéo n\'est pas disponible dans ta région.'
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
    }
  },
  formatLabel: {
    audioOnly: 'Audio seul',
    audioFallback: 'Audio',
    audioOnlyDot: 'Audio seul · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: '{{count}} téléchargement en cours',
      message_other: '{{count}} téléchargements en cours',
      detail: 'La fermeture annulera tous les téléchargements actifs.',
      confirm: 'Annuler et quitter',
      keep: 'Continuer le téléchargement'
    }
  }
} as const;

export default fr;
