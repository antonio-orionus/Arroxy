const es = {
  common: {
    back: 'Atrás',
    continue: 'Continuar',
    retry: 'Reintentar',
    startOver: 'Empezar de nuevo',
    loading: 'Cargando…'
  },
  app: {
    feedback: 'Comentarios',
    logs: 'Registros',
    feedbackNudge: '¿Disfrutando Arroxy? ¡Me encantaría saber de ti! 💬',
    debugCopied: '¡Copiado!',
    debugCopyTitle: 'Copiar info de depuración (versiones de Electron, OS, Chrome)',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar'
  },
  titleBar: {
    close: 'Cerrar',
    minimize: 'Minimizar',
    maximize: 'Maximizar',
    restore: 'Restaurar'
  },
  splash: {
    greeting: '¡Hey, bienvenido de vuelta!',
    warmup: 'Arroxy se está preparando…',
    warning: 'Configuración incompleta — algunas funciones podrían no funcionar'
  },
  theme: {
    light: 'Modo claro',
    dark: 'Modo oscuro',
    system: 'Predeterminado del sistema'
  },
  language: {
    label: 'Idioma'
  },
  wizard: {
    steps: {
      url: 'URL',
      formats: 'Formato',
      subtitles: 'Subtítulos',
      folder: 'Guardar',
      confirm: 'Confirmar'
    },
    url: {
      heading: 'URL de YouTube',
      placeholder: 'https://www.youtube.com/watch?v=...',
      hint: 'Compatible con enlaces youtube.com y youtu.be',
      fetchFormats: 'Obtener formatos',
      mascotIdle: 'Pásame un enlace de YouTube (vídeo o Short) — luego pulsa "Obtener formatos" y me pongo manos a la obra ✨',
      mascotBusy: 'Descargando en segundo plano… puedo hacer varias cosas a la vez 😎'
    },
    subtitles: {
      heading: 'Subtítulos',
      autoBadge: 'Auto',
      hint: 'Los archivos se guardarán junto al vídeo',
      noLanguages: 'No hay subtítulos disponibles para este vídeo',
      skip: 'Omitir',
      selectAll: 'Seleccionar todo',
      deselectAll: 'Deseleccionar todo',
      mascot: 'Elige cero, uno o varios — ¡tú decides! ✨',
      searchPlaceholder: 'Buscar idiomas…',
      noMatches: 'No hay idiomas que coincidan',
      clearAll: 'Eliminar todo',
      noSelected: 'Sin subtítulos seleccionados',
      sectionManual: 'Manual',
      sectionAuto: 'Generado automáticamente',
      saveMode: {
        heading: 'Save as',
        sidecar: 'Next to video',
        embed: 'Embed into video',
        subfolder: 'Subtitles/ subfolder'
      },
      format: {
        heading: 'Format'
      },
      embedNote: 'El modo «incrustar» guarda la salida como .mkv para que las pistas de subtítulos se incrusten de forma fiable.'
    },
    formats: {
      quickPresets: 'Ajustes rápidos',
      video: 'Vídeo',
      audio: 'Audio',
      noAudio: 'Sin audio',
      videoOnly: 'Solo vídeo',
      audioOnly: 'Solo audio',
      audioOnlyOption: 'Solo audio (sin vídeo)',
      mascot: 'Lo mejor + lo mejor = máxima calidad. ¡Yo elegiría eso!',
      sniffing: 'Buscando los mejores formatos para ti…',
      loadingHint: 'Suele tardar un segundo',
      loadingAria: 'Cargando formatos',
      sizeUnknown: 'Tamaño desconocido',
      total: 'Total'
    },
    folder: {
      heading: 'Guardar en',
      downloads: 'Descargas',
      videos: 'Películas',
      desktop: 'Escritorio',
      custom: 'Personalizado…'
    },
    confirm: {
      readyHeadline: '¡Listo para descargar!',
      landIn: 'Tu archivo se guardará en',
      labelVideo: 'Vídeo',
      labelAudio: 'Audio',
      labelSubtitles: 'Subtítulos',
      subtitlesNone: '—',
      labelSaveTo: 'Guardar en',
      labelSize: 'Tamaño',
      sizeUnknown: 'Desconocido',
      audioOnly: 'Solo audio',
      addToQueue: '+ Cola',
      addToQueueTooltip: 'Empieza cuando terminen otras descargas — usa todo el ancho de banda',
      pullIt: '¡Bájalo! ↓',
      pullItTooltip: 'Empieza al instante — corre junto a otras descargas activas'
    },
    error: {
      icon: 'Error'
    }
  },
  videoCard: {
    titlePlaceholder: 'Cargando…',
    domain: 'youtube.com'
  },
  queue: {
    header: 'Cola de descargas',
    toggleTitle: 'Mostrar/ocultar cola de descargas',
    empty: 'Las descargas que añadas aparecerán aquí',
    noDownloads: 'Aún no hay descargas.',
    activeCount: '{{count}} descargando · {{percent}}%',
    clear: 'Limpiar',
    clearTitle: 'Limpiar descargas completadas',
    tip: 'Tu descarga está en la cola — ábrela cuando quieras para ver el progreso.',
    item: {
      doneAt: 'Listo {{time}}',
      paused: 'En pausa',
      defaultError: 'Falló la descarga',
      openUrl: 'Abrir URL',
      pause: 'Pausar',
      resume: 'Reanudar',
      cancel: 'Cancelar',
      remove: 'Quitar'
    }
  },
  update: {
    appVersion: 'Arroxy {{version}}',
    isAvailable: 'está disponible',
    youHave: '— tienes la {{currentVersion}}',
    install: 'Instalar y reiniciar',
    downloading: 'Descargando…',
    download: 'Descargar ↗',
    dismiss: 'Cerrar aviso de actualización',
    copy: 'Copiar comando al portapapeles',
    copied: 'Comando copiado al portapapeles'
  },
  status: {
    preparingBinaries: 'Preparando binarios…',
    mintingToken: 'Generando token de YouTube…',
    remintingToken: 'Regenerando token…',
    startingYtdlp: 'Iniciando proceso yt-dlp…',
    downloadingMedia: 'Descargando video y audio…',
    mergingFormats: 'Combinando audio y video…',
    fetchingSubtitles: 'Obteniendo subtítulos…',
    sleepingBetweenRequests: 'Esperando {{seconds}}s para evitar límites…',
    subtitlesFailed: 'Video guardado — algunos subtítulos no se pudieron descargar',
    cancelled: 'Descarga cancelada',
    complete: 'Descarga completada',
    ytdlpProcessError: 'Error en el proceso yt-dlp: {{error}}',
    ytdlpExitCode: 'yt-dlp terminó con código {{code}}',
    downloadingBinary: 'Descargando binario {{name}}…',
    unknownStartupFailure: 'Fallo desconocido al iniciar la descarga'
  },
  errors: {
    ytdlp: {
      botBlock: 'YouTube marcó esta solicitud como un bot. Inténtalo de nuevo en un momento.',
      ipBlock: 'Tu dirección IP parece estar bloqueada por YouTube. Inténtalo más tarde o usa una VPN.',
      rateLimit: 'YouTube está limitando las solicitudes. Espera un minuto y reintenta.',
      ageRestricted: 'Este vídeo tiene restricción de edad y no se puede descargar sin una cuenta iniciada.',
      unavailable: 'Este vídeo no está disponible — puede ser privado, eliminado o estar restringido por región.',
      geoBlocked: 'Este vídeo no está disponible en tu región.'
    }
  },
  presets: {
    'best-quality': {
      label: 'Mejor calidad',
      desc: 'Resolución máxima + mejor audio'
    },
    balanced: {
      label: 'Equilibrado',
      desc: '720p máx + buen audio'
    },
    'audio-only': {
      label: 'Solo audio',
      desc: 'Sin vídeo, mejor audio'
    },
    'small-file': {
      label: 'Archivo pequeño',
      desc: 'Resolución mínima + audio bajo'
    },
    'subtitle-only': {
      label: 'Solo subtítulos',
      desc: 'Sin vídeo ni audio, solo subtítulos'
    }
  },
  formatLabel: {
    audioOnly: 'Solo audio',
    audioFallback: 'Audio',
    audioOnlyDot: 'Solo audio · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: '{{count}} descarga en curso',
      message_other: '{{count}} descargas en curso',
      detail: 'Cerrar cancelará todas las descargas activas.',
      confirm: 'Cancelar descargas y salir',
      keep: 'Seguir descargando'
    }
  }
} as const;

export default es;
