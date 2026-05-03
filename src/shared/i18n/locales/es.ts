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
      sponsorblock: 'SponsorBlock',
      output: 'Salida',
      folder: 'Guardar',
      confirm: 'Confirmar'
    },
    url: {
      heading: 'URL de YouTube',
      placeholder: 'https://www.youtube.com/watch?v=...',
      hint: 'Compatible con enlaces youtube.com y youtu.be',
      fetchFormats: 'Obtener formatos',
      mascotIdle: 'Pásame un enlace de YouTube (vídeo o Short) — luego pulsa "Obtener formatos" y me pongo manos a la obra ✨',
      mascotBusy: 'Descargando en segundo plano… puedo hacer varias cosas a la vez 😎',
      advanced: 'Avanzado',
      clearAria: 'Borrar URL',
      clipboard: {
        toggle: 'Vigilar portapapeles',
        toggleDescription: 'Rellena automáticamente el campo URL al copiar un enlace de YouTube.',
        dialog: {
          title: 'URL de YouTube detectada',
          body: '¿Usar este enlace de tu portapapeles?',
          useButton: 'Usar URL',
          disableButton: 'Desactivar',
          cancelButton: 'Cancelar',
          disableNote: 'Puedes volver a activar la vigilancia del portapapeles más tarde en Avanzado.'
        }
      },
      cookies: {
        toggle: 'Usar archivo de cookies',
        toggleDescription: 'Ayuda con vídeos restringidos por edad, solo para miembros y privados de tu cuenta.',
        risk: 'Riesgo: un cookies.txt contiene todas las sesiones iniciadas de ese navegador — guárdalo en privado.',
        fileLabel: 'Archivo de cookies',
        choose: 'Elegir…',
        clear: 'Quitar',
        placeholder: 'Sin archivo seleccionado',
        helpLink: '¿Cómo exporto las cookies?',
        enabledButNoFile: 'Selecciona un archivo para usar cookies',
        banWarning: 'YouTube puede marcar — y a veces banear — cuentas cuyas cookies usa yt-dlp. Usa una cuenta desechable cuando puedas.',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'Get cookies.txt LOCALLY (Chrome)'
      },
      closeToTray: {
        toggle: 'Minimizar a la bandeja al cerrar',
        toggleDescription: 'Continuar descargas en segundo plano al cerrar la ventana.'
      }
    },
    subtitles: {
      heading: 'Subtítulos',
      autoBadge: 'Auto',
      hint: 'Los archivos se guardarán junto al vídeo',
      noLanguages: 'No hay subtítulos disponibles para este vídeo',
      skip: 'Omitir',
      skipSubs: 'Omitir para este video',
      selectAll: 'Seleccionar todo',
      deselectAll: 'Deseleccionar todo',
      mascot: 'Elige cero, uno o varios — ¡tú decides! ✨',
      searchPlaceholder: 'Buscar idiomas…',
      noMatches: 'No hay idiomas que coincidan',
      clearAll: 'Eliminar todo',
      noSelected: 'Sin subtítulos seleccionados',
      selectedNote_one: 'Se descargará {{count}} subtítulo',
      selectedNote_other: 'Se descargarán {{count}} subtítulos',
      sectionManual: 'Manual',
      sectionAuto: 'Generado automáticamente',
      saveMode: {
        heading: 'Guardar como',
        sidecar: 'Junto al vídeo',
        embed: 'Incrustar en el vídeo',
        subfolder: 'Subcarpeta subtitles/'
      },
      format: {
        heading: 'Format'
      },
      embedNote: 'El modo «incrustar» guarda la salida como .mkv para que las pistas de subtítulos se incrusten de forma fiable.',
      autoAssNote: 'Los subtítulos automáticos se guardarán como SRT en lugar de ASS — siempre se limpian de la duplicación de cues en cascada de YouTube, algo que nuestro convertidor ASS aún no puede replicar.'
    },
    sponsorblock: {
      modeHeading: 'Filtrar patrocinadores',
      mode: {
        off: 'Desactivado',
        mark: 'Marcar como capítulos',
        remove: 'Eliminar segmentos'
      },
      modeHint: {
        off: 'Sin SponsorBlock — el vídeo se reproduce tal cual fue subido.',
        mark: 'Marca segmentos de sponsor como capítulos (no destructivo).',
        remove: 'Elimina segmentos de sponsor del vídeo con FFmpeg.'
      },
      categoriesHeading: 'Categorías',
      cat: {
        sponsor: 'Patrocinio',
        intro: 'Intro',
        outro: 'Outro',
        selfpromo: 'Autopromoción',
        music_offtopic: 'Música fuera de tema',
        preview: 'Vista previa',
        filler: 'Relleno'
      }
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
      music: 'Música',
      documents: 'Documentos',
      pictures: 'Imágenes',
      home: 'Carpeta personal',
      custom: 'Personalizado…',
      subfolder: {
        toggle: 'Guardar en subcarpeta',
        placeholder: 'p. ej. lo-fi rips',
        invalid: 'El nombre tiene caracteres no válidos'
      }
    },
    output: {
      embedChapters: {
        label: 'Incrustar capítulos',
        description: 'Marcadores de capítulo navegables en cualquier reproductor moderno.'
      },
      embedMetadata: {
        label: 'Incrustar metadatos',
        description: 'Título, artista, descripción y fecha de subida escritos en el archivo.'
      },
      embedThumbnail: {
        label: 'Incrustar miniatura',
        description: 'Portada dentro del archivo. Solo MP4 / M4A — se omite al incrustar subtítulos.'
      },
      writeDescription: {
        label: 'Guardar descripción',
        description: 'Guarda la descripción del vídeo como archivo .description junto a la descarga.'
      },
      writeThumbnail: {
        label: 'Guardar miniatura',
        description: 'Guarda la miniatura como archivo .jpg junto a la descarga.'
      }
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
      nothingToDownload: 'El ajuste preestablecido Solo subtítulos está activo pero no hay ningún idioma de subtítulos seleccionado — no se descargará nada.',
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
    usedExtractorFallback: 'Descargado con extractor relajado — configura un cookies.txt para descargas más fiables',
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
      geoBlocked: 'Este vídeo no está disponible en tu región.',
      outOfDiskSpace: 'No hay suficiente espacio en disco. Libera espacio e inténtalo de nuevo.'
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
  tray: {
    tooltip: 'Arroxy',
    menu: {
      statusIdle: 'Inactivo',
      statusActive_one: '1 descargando · {{percent}}%',
      statusActive_other: '{{count}} descargando · {{percent}}%',
      open: 'Abrir Arroxy',
      quit: 'Salir de Arroxy'
    }
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: '{{count}} descarga en curso',
      message_other: '{{count}} descargas en curso',
      detail: 'Cerrar cancelará todas las descargas activas.',
      confirm: 'Cancelar descargas y salir',
      keep: 'Seguir descargando'
    },
    closeToTray: {
      message: '¿Ocultar Arroxy en la bandeja del sistema al cerrar?',
      detail: 'Arroxy sigue ejecutándose y termina las descargas activas. Cámbialo en Ajustes avanzados.',
      hide: 'Ocultar en bandeja',
      quit: 'Salir',
      remember: 'No volver a preguntar'
    }
  }
} as const;

export default es;
