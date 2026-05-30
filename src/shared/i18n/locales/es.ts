const es = {
  common: {
    back: 'Atrás',
    continue: 'Continuar',
    retry: 'Reintentar',
    startOver: 'Empezar de nuevo'
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
  about: {
    button: 'Acerca de',
    openTitle: 'Acerca de Arroxy',
    tagline: 'Descargador de vídeo y audio rápido y sencillo para escritorio.',
    websiteLink: 'Sitio web',
    githubLink: 'GitHub',
    licenseLine: 'Licencia MIT · por Antonio Orionus',
    thirdPartyNotices: 'Ver avisos de terceros'
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
    downloading: 'Descargando {{binary}}…',
    warmupFailedNoDiag: 'Error en la configuración. Abre el registro de configuración para más detalles.'
  },
  repair: {
    title: 'La configuración necesita tu ayuda',
    deps: {
      ytDlp: 'yt-dlp',
      ffmpeg: 'FFmpeg',
      ffprobe: 'FFprobe',
      deno: 'Deno'
    },
    hints: {
      unknown: 'No se pudo verificar.',
      downloadFailed: 'La descarga falló. Comprueba tu conexión a internet e inténtalo de nuevo.',
      extractFailed: 'Error al extraer el archivo. La descarga puede estar dañada — reinténtalo.',
      hashFailed: 'El checksum del archivo descargado no coincide. Vuelve a intentar la descarga.',
      spawnFailed: 'El archivo no existe o no se pudo ejecutar. Elige una copia que funcione.',
      permissionDenied: 'El sistema no pudo ejecutar el archivo. Elige una copia de confianza o reinténtalo como administrador.',
      blockedOrQuarantined: 'Windows bloqueó el archivo (SmartScreen / Defender). Elige una copia instalada o añade la carpeta de runtime a las excepciones.',
      badExitCode: 'El binario no respondió a --version. Puede estar dañado o ser la versión incorrecta.',
      timeout: 'La comprobación de versión agotó el tiempo de espera. El archivo puede estar bloqueado — reinténtalo.',
      pairIncomplete: 'ffmpeg y ffprobe deben configurarse juntos como pareja.'
    },
    actions: {
      chooseExecutable: 'Elegir ejecutable',
      resetToDefault: 'Restablecer predeterminado',
      retrySetup: 'Reintentar configuración',
      cancel: 'Cancelar',
      openDependencyFolder: 'Abrir carpeta de dependencias',
      viewSetupLog: 'Ver registro de configuración'
    }
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
      playlistItems: 'Playlist',
      playlistPresets: 'Calidad',
      formats: 'Formato',
      subtitles: 'Subtítulos',
      sponsorblock: 'SponsorBlock',
      output: 'Salida',
      folder: 'Guardar',
      confirm: 'Confirmar'
    },
    playlist: {
      heading: 'Elementos de la Playlist',
      itemCount_one: '{{count}} video',
      itemCount_other: '{{count}} videos',
      itemCountAudio_one: '{{count}} pista',
      itemCountAudio_other: '{{count}} pistas',
      selectAll: 'Seleccionar todo',
      selectNone: 'Deseleccionar todo',
      rangeFrom: 'Desde',
      rangeTo: 'Hasta',
      rangeApply: 'Aplicar rango',
      selectedCount_one: '{{count}} seleccionado',
      selectedCount_other: '{{count}} seleccionados',
      noSelection: 'Selecciona al menos un video para continuar',
      loadingItems: 'Obteniendo Playlist…',
      thumbnailAlt: 'Miniatura del video',
      durationUnknown: 'live',
      syncChange: 'Cambiar carpeta…',
      syncApply: 'Aplicar sincronización',
      syncScanning: 'Comprobando carpeta…',
      syncFoundTitle: 'Ya está en la carpeta',
      syncFoundDesc: '{{n}} de estos vídeos ya están en {{dir}}. ¿Sincronizar para descargar solo los nuevos?',
      syncNoneTitle: 'Aún no hay nada descargado',
      syncNoneDesc: 'No se encontraron vídeos de esta playlist en {{dir}}.',
      alreadyDownloaded: 'Ya descargado'
    },
    playlistPresets: {
      heading: 'Elige la calidad para el lote',
      subhead: 'Cada vídeo resuelve el nivel elegido de forma independiente — las playlists heterogéneas funcionan sin sorpresas.',
      itemCount_one: '{{count}} elemento',
      itemCount_other: '{{count}} elementos'
    },
    mixedPrompt: {
      title: 'Este enlace tiene una Playlist',
      body: '¿Solo el video en el que hiciste clic o prefieres elegir de la Playlist? En el siguiente paso podrás seleccionar videos concretos o un rango.',
      singleVideo: 'Solo este',
      pickFromPlaylist: 'Elegir de la Playlist'
    },
    url: {
      heading: 'URL de YouTube',
      placeholder: 'https://www.youtube.com/watch?v=...',
      fetchFormats: 'Obtener formatos',
      features: {
        heading: 'Qué puede bajar Arroxy',
        youtube: {
          heading: 'YouTube',
          video: 'Vídeos',
          channel: 'Canales',
          playlist: 'Playlists',
          short: 'Shorts',
          music: 'Música',
          podcast: 'Podcasts'
        },
        anySite: {
          heading: '2000+ sitios',
          video: 'Vídeos',
          videoPlaylist: 'Playlists de vídeo',
          musicPlaylist: 'Playlists de música'
        },
        always: {
          heading: 'Siempre disponible',
          audioOnly: 'Solo audio',
          subtitles: 'Subtítulos'
        }
      },
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
        sourceLabel: 'Fuente de cookies',
        sourceOff: 'Desactivado',
        sourceFile: 'Archivo',
        sourceBrowser: 'Navegador',
        toggleDescription: 'Ayuda con vídeos restringidos por edad, solo para miembros y privados de tu cuenta.',
        risk: 'Riesgo: un cookies.txt contiene todas las sesiones iniciadas de ese navegador — guárdalo en privado.',
        fileLabel: 'Archivo de cookies',
        choose: 'Elegir…',
        clear: 'Quitar',
        placeholder: 'Sin archivo seleccionado',
        helpLink: '¿Cómo exporto las cookies?',
        enabledButNoFile: 'Selecciona un archivo para usar cookies',
        browserLabel: 'Navegador',
        browserPlaceholder: 'Elige un navegador…',
        browserHelp: 'Lee las cookies directamente del navegador. El navegador debe estar cerrado para los basados en Chromium.',
        enabledButNoBrowser: 'Elige un navegador para usar cookies',
        banWarning: 'YouTube puede marcar — y a veces banear — cuentas cuyas cookies usa yt-dlp. Usa una cuenta desechable cuando puedas.',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'Obtener cookies.txt LOCALMENTE (Chrome)'
      },
      proxy: {
        label: 'Proxy URL',
        description: 'Enruta el tráfico a través de un proxy — útil para contenido con restricciones geográficas.',
        placeholder: 'http://host:port',
        clear: 'Borrar'
      },
      singleFilenameId: {
        toggle: 'Añadir ID del vídeo a nombres de archivo individuales',
        toggleDescription: 'Mantiene únicas las descargas sueltas cuando los títulos cambian o coinciden.'
      },
      networkPacing: {
        heading: 'Descargas suaves',
        description: 'Añade pequeñas pausas durante cada descarga para que Arroxy no sobrecargue el sitio. Los valores son segundos salvo que se indique lo contrario.',
        presetLabel: '¿Qué tan cauteloso debe ser Arroxy?',
        tooltip: 'Estas pausas ocurren dentro de cada descarga. Arroxy sigue descargando en cola de una en una.',
        summary: 'Pausas: {{requests}} entre comprobaciones, {{downloads}} antes de iniciar el medio, {{subtitles}} antes de archivos de subtítulos. Conexiones: {{fragments}}.',
        presets: {
          off: 'Desactivado',
          balanced: 'Equilibrado',
          careful: 'Cuidadoso',
          custom: 'Personalizado'
        },
        tooltips: {
          off: 'Usa solo las pequeñas pausas base que Arroxy mantiene para medios y subtítulos.',
          balanced: 'Por defecto. Añade pausas cortas y usa una conexión de descarga.',
          careful: 'Añade pausas más largas para playlists grandes o redes que frecuentemente alcanzan límites.',
          custom: 'Ajusta tú mismo los controles avanzados por descarga.'
        },
        fields: {
          sleepRequests: 'Pausa entre comprobaciones de metadatos',
          sleepInterval: 'Pausa antes de iniciar el medio: mín',
          maxSleepInterval: 'Pausa antes de iniciar el medio: máx',
          sleepSubtitles: 'Pausa antes de archivos de subtítulos',
          concurrentFragments: 'Conexiones de descarga'
        },
        units: {
          seconds: 'seg',
          threads: 'hilos'
        }
      },
      closeToTray: {
        toggle: 'Minimizar a la bandeja al cerrar',
        toggleDescription: 'Continuar descargas en segundo plano al cerrar la ventana.'
      },
      analytics: {
        toggle: 'Enviar estadísticas de uso anónimas',
        toggleDescription: 'Solo cuenta los inicios de la app. Sin URLs, nombres de archivo ni datos personales.'
      }
    },
    subtitles: {
      autoBadge: 'Auto',
      noLanguages: 'No hay subtítulos disponibles para este vídeo',
      skip: 'Omitir',
      skipSubs: 'Omitir para este video',
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
      keepAudio: 'Mantener tal cual',
      keepAudioMeta: 'Audio integrado',
      audioOnly: 'Solo audio',
      audioOnlyOption: 'Solo audio (sin vídeo)',
      mascot: 'Lo mejor + lo mejor = máxima calidad. ¡Yo elegiría eso!',
      sniffing: 'Buscando los mejores formatos para ti…',
      loadingHint: 'Espera a que termine el análisis — las listas de reproducción y búsquedas pueden tardar un momento.',
      loadingAria: 'Cargando formatos',
      sizeUnknown: 'Tamaño desconocido',
      total: 'Total',
      skipToConfirm: 'Saltar a confirmar',
      skipToConfirmTooltip: 'Usa tus preferencias guardadas para todos los pasos restantes. Para cambiar una opción, continúa paso a paso — tu elección se guardará para la próxima vez.',
      convert: {
        label: 'Convertir',
        uncompressed: 'Convertir · sin compresión',
        bitrate: 'Tasa de bits',
        wavLabel: 'WAV (uncompressed)',
        lossyLabel: '{{target}} {{bitrate}} kbps',
        requiresAudioOnly: 'La conversión de audio requiere el modo solo audio (deselecciona el vídeo).',
        requiresLossy: 'Se ha seleccionado una transmisión nativa — la tasa de bits solo se aplica al convertir a mp3, m4a u opus.'
      },
      botWall: {
        heading: 'YouTube ha limitado esta consulta',
        bodyUnconfigured: 'La lista de formatos puede estar incompleta. Configura las cookies en los ajustes avanzados, o cambia de red e inténtalo de nuevo.',
        bodyDisabled: 'Las cookies están configuradas pero desactivadas. Actívalas y vuelve a intentarlo para obtener la lista completa, o cambia de red e inténtalo de nuevo.',
        bodyEnabled: 'Incluso con cookies, YouTube ha limitado esta consulta. Inténtalo más tarde o cambia de red.',
        retryCta: 'Reintentar',
        enableRetryCta: 'Activar cookies y reintentar'
      },
      cookiesError: {
        heading: 'Las cookies podrían ser la causa',
        currentModeLabel: 'Fuente de cookies',
        currentModeFile: 'Archivo',
        currentModeBrowser: 'Navegador',
        explanationFile: 'El archivo de cookies puede estar vacío, caducado o en un formato incorrecto (yt-dlp espera Netscape cookies.txt). Prueba a exportar las cookies de nuevo, elegir un archivo diferente, cambiar al modo Navegador o desactivar las cookies.',
        explanationBrowser: 'Las cookies se leen directamente del navegador. Si el navegador está abierto en este momento, su base de datos de cookies puede estar bloqueada (familia Chromium). El navegador también debe tener la sesión de YouTube iniciada. Prueba a cerrar el navegador, cambiar a otro, cambiar al modo Archivo o desactivar las cookies.',
        openSettingsCta: 'Abrir ajustes de cookies',
        needsCookies: {
          heading: 'Este sitio requiere inicio de sesión',
          body: 'yt-dlp no pudo acceder a este vídeo sin autenticación. Configura las cookies en los ajustes avanzados — apúntalas a un navegador en el que ya hayas iniciado sesión o importa un archivo cookies.txt.'
        },
        dpapi: {
          heading: 'Cookies de Chrome bloqueadas por el cifrado de Windows',
          explanation: 'Chrome 127 y versiones posteriores cifran las cookies de un modo que otras aplicaciones no pueden leer en Windows. Prueba una de las soluciones siguientes.',
          fixFirefoxLabel: 'Cambiar a Firefox',
          fixFirefoxBody: 'Firefox no usa App-Bound Encryption. Abre los ajustes de cookies y elige Firefox en la lista de navegadores.',
          fixFileLabel: 'Exportar cookies.txt',
          fixFileBody: 'Exporta las cookies de Chrome con una extensión del navegador, luego cambia esta aplicación al modo Archivo y selecciona el archivo exportado.',
          fixUnsafeLabel: 'Iniciar Chrome con App-Bound Encryption desactivada',
          fixUnsafeBody: 'Añade --disable-features=LockProfileCookieDatabase al acceso directo de inicio de Chrome. Advertencia: esto invalida las cookies cifradas anteriormente, por lo que se cerrará tu sesión en todos los sitios y deberás iniciarla de nuevo.',
          docsLinkLabel: 'Documentación de yt-dlp (issue #10927)'
        }
      }
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
        description: 'Portada dentro del archivo. El vídeo WebM se remultiplexará a MKV; se omite al incrustar subtítulos.'
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
      thumbnailEmbedNotSupported: 'Thumbnail embed omitido — el container de salida no lo admite.',
      subtitleEmbedAudioOnly: 'Subtitle embed cambiado a sidecar — las pistas de audio no admiten streams de subtítulos embebidos.',
      audioOnly: 'Solo audio',
      addToQueue: '+ Cola',
      addToQueueTooltip: 'Empieza cuando terminen otras descargas — usa todo el ancho de banda',
      pullIt: '¡Bájalo! ↓',
      pullItTooltip: 'Empieza al instante — corre junto a otras descargas activas',
      labelPlaylist: 'Playlist',
      labelPreset: 'Calidad',
      labelItems: 'Elementos',
      itemsValue_one: '{{count}} de {{total}} vídeo',
      itemsValue_other: '{{count}} de {{total}} vídeos',
      itemsValueAudio_one: '{{count}} de {{total}} pista',
      itemsValueAudio_other: '{{count}} de {{total}} pistas'
    }
  },
  videoCard: {
    titlePlaceholder: 'Cargando…'
  },
  queue: {
    header: 'Cola de descargas',
    toggleTitle: 'Mostrar/ocultar cola de descargas',
    empty: 'Las descargas que añadas aparecerán aquí',
    noDownloads: 'Aún no hay descargas.',
    activeCount: '{{count}} descargando · {{percent}}%',
    clear: 'Limpiar',
    clearTitle: 'Limpiar descargas completadas',
    pauseAll: 'Pausar todo',
    pauseAllTitle: 'Pausar todas las descargas activas',
    cancelAll: 'Cancelar todo',
    cancelAllTitle: 'Cancelar todas las descargas activas y pendientes',
    tip: 'Tu descarga está en la cola — ábrela cuando quieras para ver el progreso.',
    item: {
      doneAt: 'Listo {{time}}',
      paused: 'En pausa',
      defaultError: 'Falló la descarga',
      openUrl: 'Abrir URL',
      pause: 'Pausar',
      hold: 'Retener',
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
    copied: 'Comando copiado al portapapeles',
    installFailed: 'Actualización fallida',
    retry: 'Reintentar'
  },
  status: {
    preparingBinaries: 'Preparando binarios…',
    mintingToken: 'Generando token de YouTube…',
    remintingToken: 'Regenerando token…',
    startingYtdlp: 'Iniciando proceso yt-dlp…',
    downloadingMedia: 'Descargando video y audio…',
    mergingFormats: 'Combinando audio y video…',
    extractingAudio: 'Convirtiendo audio…',
    convertingVideo: 'Convirtiendo vídeo…',
    embeddingMetadata: 'Incrustando metadatos…',
    movingFiles: 'Moviendo archivos…',
    fetchingSubtitles: 'Obteniendo subtítulos…',
    sleepingBetweenRequests: 'Esperando {{seconds}}s para evitar límites…',
    subtitlesFailed: 'Video guardado — algunos subtítulos no se pudieron descargar',
    cancelled: 'Descarga cancelada',
    complete: 'Descarga completada',
    usedExtractorFallback: 'Descargado con extractor relajado — configura un cookies.txt para descargas más fiables',
    ytdlpProcessError: 'Error en el proceso yt-dlp: {{error}}',
    ytdlpExitCode: 'yt-dlp terminó con código {{code}}',
    downloadingBinary: 'Descargando binario {{name}}…',
    unknownStartupFailure: 'Fallo desconocido al iniciar la descarga',
    diskSpaceInsufficient: 'Espacio en disco insuficiente — se necesitan {{required}}, solo hay {{free}} disponibles',
    fetchingSponsorBlock: 'Contactando SponsorBlock…',
    retryingSponsorBlock: 'SponsorBlock no disponible, reintentando ({{attempt}}/{{total}})…'
  },
  errors: {
    ytdlp: {
      botBlock: 'La protección contra bots se activó. La IP que estás usando probablemente está marcada (rango de datacenter o salida de VPN con mucho tráfico). Cambia tu IP o elige un punto de salida de VPN diferente y vuelve a intentarlo. Si sigue fallando, puede ser un cambio temporal de YouTube — Arroxy actualiza yt-dlp automáticamente al iniciar, por lo que la corrección llegará sola en cuanto esté disponible en el repositorio.',
      ipBlock: 'Tu dirección IP parece estar bloqueada por YouTube. Inténtalo más tarde o usa una VPN.',
      rateLimit: 'YouTube está limitando las solicitudes. Espera un minuto y reintenta.',
      ageRestricted: 'Este vídeo tiene restricción de edad y no se puede descargar sin una cuenta iniciada.',
      unavailable: 'Este vídeo no está disponible — puede ser privado, eliminado o estar restringido por región.',
      geoBlocked: 'Este vídeo no está disponible en tu región.',
      outOfDiskSpace: 'No hay suficiente espacio en disco. Libera espacio e inténtalo de nuevo.',
      unsupportedUrl: 'Eso no parece una URL de vídeo. Pega un enlace a un vídeo de YouTube, un Short o una playlist.',
      chunkTransferFailure: 'El servidor cortó la descarga repetidamente y yt-dlp se rindió tras varios intentos. Esto suele ocurrir con los formatos de mayor tamaño (4K HDR / VP9 de alta tasa de bits). Vuelve a intentarlo, cambia de red/VPN o elige un formato de menor resolución.',
      postprocessFailure: 'yt-dlp terminó la descarga, pero el post-procesado (mezcla / mux / conversión) falló. A menudo es un problema transitorio de ffmpeg — reintenta, y si persiste prueba con otra combinación de formatos.',
      parse: 'No se pudo analizar la respuesta del sitio. Es posible que el extractor de yt-dlp esté desfasado. Arroxy actualiza yt-dlp automáticamente al iniciar — reintenta en unos minutos cuando llegue el arreglo.',
      network: 'Error de red. Comprueba tu conexión y reintenta.',
      drmProtected: 'Este vídeo está protegido con DRM. yt-dlp no puede eliminar el DRM, por lo que el archivo no se puede descargar.',
      loginRequired: 'Este vídeo requiere una cuenta con sesión iniciada. Configura un cookies.txt (Ajustes → Cookies) y vuelve a intentarlo.',
      unknown: 'La descarga falló. Mira la salida en bruto a continuación.'
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
  playlistPresets: {
    'video-best': { label: 'Mejor calidad', desc: 'Mayor resolución + mejor audio por elemento' },
    'video-2160p': { label: 'Hasta 4K', desc: 'Limitado a 2160p, baja a inferior por elemento' },
    'video-1440p': { label: 'Hasta 1440p', desc: 'Limitado a 2K, baja a inferior por elemento' },
    'video-1080p': { label: 'Hasta 1080p', desc: 'Limitado por elemento, baja a inferior' },
    'video-720p': { label: 'Hasta 720p', desc: 'Archivos más pequeños, amplia compatibilidad' },
    'video-480p': { label: 'Hasta 480p', desc: 'Bajo ancho de banda' },
    'video-360p': { label: 'Hasta 360p', desc: 'Vídeo más pequeño' },
    'audio-best': { label: 'Audio (mejor)', desc: 'Mejor audio nativo, sin recodificación' },
    'audio-mp3': { label: 'Audio (MP3)', desc: 'Convertir a MP3 192 kbps' }
  },
  formatLabel: {
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
    },
    rendererCrashed: {
      message: 'Arroxy encontró un problema',
      detail: 'El proceso de renderizado falló ({{reason}}). Recarga para intentarlo de nuevo.',
      reload: 'Recargar',
      quit: 'Salir'
    }
  },
  share: {
    title: 'Compartir Arroxy',
    description: 'Arroxy es gratuito y de código abierto. Compartirlo ayuda a que más personas lo descubran.',
    copyLink: 'Copiar enlace',
    copied: '¡Copiado!',
    defaultMessage: 'Arroxy — free, open-source YouTube downloader for Windows, macOS & Linux.\n4K · HDR · MP3 · Shorts · Subtitles · SponsorBlock',
    footerTooltip: 'Compartir Arroxy',
    footerLabel: 'Compartir',
    shareAction: 'Compartir Arroxy',
    inlineCard: {
      body: '¿Disfrutando Arroxy? Compártelo con alguien a quien le pueda resultar útil.',
      dismiss: 'Descartar sugerencia de compartir'
    },
    highValueBanner: {
      body: '¿Disfrutando Arroxy? Ayuda a otros a descubrirlo.',
      dismiss: 'Descartar sugerencia de compartir'
    }
  }
} as const;

export default es;
