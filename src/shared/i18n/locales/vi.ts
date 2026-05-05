const vi = {
  common: {
    back: 'Quay lại',
    continue: 'Tiếp tục',
    retry: 'Thử lại',
    startOver: 'Bắt đầu lại',
    loading: 'Đang tải…'
  },
  app: {
    feedback: 'Phản hồi',
    logs: 'Nhật ký',
    feedbackNudge: 'Bạn thích Arroxy không? Tôi rất muốn nghe ý kiến của bạn! 💬',
    debugCopied: 'Đã sao chép!',
    debugCopyTitle: 'Sao chép thông tin gỡ lỗi (phiên bản Electron, OS, Chrome)',
    zoomIn: 'Phóng to',
    zoomOut: 'Thu nhỏ'
  },
  titleBar: {
    close: 'Đóng',
    minimize: 'Thu nhỏ',
    maximize: 'Phóng to',
    restore: 'Khôi phục'
  },
  splash: {
    greeting: 'Xin chào, chào mừng bạn quay lại!',
    warmup: 'Arroxy đang khởi động…',
    warning: 'Thiết lập chưa hoàn tất — một số tính năng có thể không hoạt động'
  },
  theme: {
    light: 'Chế độ sáng',
    dark: 'Chế độ tối',
    system: 'Mặc định hệ thống'
  },
  language: {
    label: 'Ngôn ngữ'
  },
  wizard: {
    steps: {
      url: 'URL',
      formats: 'Định dạng',
      subtitles: 'Phụ đề',
      sponsorblock: 'SponsorBlock',
      output: 'Đầu ra',
      folder: 'Lưu',
      confirm: 'Xác nhận'
    },
    url: {
      heading: 'YouTube URL',
      placeholder: 'https://www.youtube.com/watch?v=...',
      hint: 'Hỗ trợ liên kết youtube.com và youtu.be',
      fetchFormats: 'Tải định dạng',
      mascotIdle: 'Dán cho tôi một liên kết YouTube (video hoặc YouTube Shorts) — rồi nhấn "Tải định dạng" và tôi sẽ bắt tay vào việc ✨',
      mascotBusy: 'Đang tải xuống trong nền… Tôi có thể làm nhiều việc cùng lúc 😎',
      advanced: 'Nâng cao',
      clearAria: 'Xóa URL',
      clipboard: {
        toggle: 'Theo dõi bộ nhớ tạm',
        toggleDescription: 'Tự động điền vào trường URL khi bạn sao chép một liên kết YouTube.',
        dialog: {
          title: 'Đã phát hiện YouTube URL',
          body: 'Sử dụng liên kết này từ bộ nhớ tạm của bạn?',
          useButton: 'Dùng URL',
          disableButton: 'Tắt',
          cancelButton: 'Hủy',
          disableNote: 'Bạn có thể bật lại tính năng theo dõi bộ nhớ tạm sau trong cài đặt Nâng cao.'
        }
      },
      cookies: {
        toggle: 'Dùng tệp cookies',
        toggleDescription: 'Hỗ trợ tải video giới hạn độ tuổi, dành riêng cho thành viên và video riêng tư của tài khoản.',
        risk: 'Rủi ro: một cookies.txt chứa mọi phiên đăng nhập của trình duyệt đó — hãy giữ bí mật.',
        fileLabel: 'Tệp Cookies',
        choose: 'Chọn…',
        clear: 'Xóa',
        placeholder: 'Chưa chọn tệp',
        helpLink: 'Cách xuất cookies?',
        enabledButNoFile: 'Chọn một tệp để dùng cookies',
        banWarning: 'YouTube có thể gắn cờ — và đôi khi cấm — các tài khoản có cookies được yt-dlp sử dụng. Hãy dùng tài khoản phụ khi có thể.',
        extensionFirefox: 'cookies.txt (Firefox)',
        extensionChrome: 'Get cookies.txt LOCALLY (Chrome)'
      },
      proxy: {
        label: 'URL Proxy',
        description: 'Chuyển lưu lượng qua proxy — hữu ích cho nội dung bị chặn theo khu vực.',
        placeholder: 'http://host:port',
        clear: 'Xóa'
      },
      closeToTray: {
        toggle: 'Ẩn xuống khay khi đóng',
        toggleDescription: 'Tiếp tục tải xuống trong nền sau khi đóng cửa sổ.'
      },
      analytics: {
        toggle: 'Gửi thống kê sử dụng ẩn danh',
        toggleDescription: 'Chỉ đếm số lần khởi động ứng dụng. Không có URL, tên tệp hay dữ liệu cá nhân.'
      }
    },
    subtitles: {
      heading: 'Phụ đề',
      autoBadge: 'Tự động',
      hint: 'Các tệp phụ đề sẽ được lưu cạnh video',
      noLanguages: 'Không có phụ đề nào cho video này',
      skip: 'Bỏ qua',
      skipSubs: 'Bỏ qua cho video này',
      selectAll: 'Chọn tất cả',
      deselectAll: 'Bỏ chọn tất cả',
      mascot: 'Chọn không, một hay nhiều — hoàn toàn tùy bạn ✨',
      searchPlaceholder: 'Tìm ngôn ngữ…',
      noMatches: 'Không tìm thấy ngôn ngữ nào',
      clearAll: 'Xóa tất cả',
      noSelected: 'Chưa chọn phụ đề nào',
      selectedNote_one: '{{count}} phụ đề sẽ được tải xuống',
      selectedNote_other: '{{count}} phụ đề sẽ được tải xuống',
      sectionManual: 'Thủ công',
      sectionAuto: 'Tự động tạo',
      saveMode: {
        heading: 'Lưu dưới dạng',
        sidecar: 'Cạnh video',
        embed: 'Nhúng vào video',
        subfolder: 'Thư mục con subtitles/'
      },
      format: {
        heading: 'Định dạng'
      },
      embedNote: 'Chế độ nhúng lưu đầu ra dưới dạng .mkv để các track phụ đề nhúng được đáng tin cậy.',
      autoAssNote: 'Phụ đề tự động tạo sẽ được lưu dưới dạng SRT thay vì ASS — chúng luôn được làm sạch dữ liệu lặp rolling-cue của YouTube, điều mà trình chuyển đổi ASS của chúng tôi chưa hỗ trợ.'
    },
    sponsorblock: {
      modeHeading: 'Lọc nhà tài trợ',
      mode: {
        off: 'Tắt',
        mark: 'Đánh dấu là chương',
        remove: 'Xóa đoạn'
      },
      modeHint: {
        off: 'Không dùng SponsorBlock — video phát như khi tải lên.',
        mark: 'Đánh dấu các đoạn nhà tài trợ là chương (không phá hủy).',
        remove: 'Cắt các đoạn nhà tài trợ khỏi video bằng FFmpeg.'
      },
      categoriesHeading: 'Danh mục',
      cat: {
        sponsor: 'Nhà tài trợ',
        intro: 'Mở đầu',
        outro: 'Kết thúc',
        selfpromo: 'Tự quảng cáo',
        music_offtopic: 'Nhạc ngoài chủ đề',
        preview: 'Xem trước',
        filler: 'Nội dung phụ'
      }
    },
    formats: {
      quickPresets: 'Cài đặt nhanh',
      video: 'Video',
      audio: 'Âm thanh',
      noAudio: 'Không có âm thanh',
      videoOnly: 'Chỉ video',
      audioOnly: 'Chỉ âm thanh',
      audioOnlyOption: 'Chỉ âm thanh (không có video)',
      mascot: 'Tốt nhất + Tốt nhất = chất lượng cao nhất. Tôi sẽ chọn cái đó!',
      sniffing: 'Đang tìm định dạng tốt nhất cho bạn…',
      loadingHint: 'Thường mất một chút thời gian',
      loadingAria: 'Đang tải định dạng',
      sizeUnknown: 'Không biết kích thước',
      total: 'Tổng cộng',
      convert: {
        label: 'Chuyển đổi',
        uncompressed: 'Chuyển đổi · không nén',
        bitrate: 'Tốc độ bit',
        wavLabel: 'WAV (không nén)',
        lossyLabel: '{{target}} {{bitrate}} kbps',
        requiresAudioOnly: 'Chuyển đổi âm thanh yêu cầu chế độ chỉ âm thanh (bỏ chọn lựa chọn video).',
        requiresLossy: 'Đang chọn luồng gốc — tốc độ bit chỉ áp dụng khi chuyển đổi sang mp3, m4a hoặc opus.'
      }
    },
    folder: {
      heading: 'Lưu vào',
      downloads: 'Tải xuống',
      videos: 'Phim',
      desktop: 'Màn hình desktop',
      music: 'Nhạc',
      documents: 'Tài liệu',
      pictures: 'Hình ảnh',
      home: 'Thư mục gốc',
      custom: 'Tùy chỉnh…',
      subfolder: {
        toggle: 'Lưu trong thư mục con',
        placeholder: 'vd. lo-fi rips',
        invalid: 'Tên thư mục chứa ký tự không hợp lệ'
      }
    },
    output: {
      embedChapters: {
        label: 'Nhúng chương',
        description: 'Các mốc chương có thể điều hướng trong mọi trình phát hiện đại.'
      },
      embedMetadata: {
        label: 'Nhúng metadata',
        description: 'Tiêu đề, nghệ sĩ, mô tả và ngày tải lên được ghi vào tệp.'
      },
      embedThumbnail: {
        label: 'Nhúng hình thu nhỏ',
        description: 'Ảnh bìa bên trong tệp. Video WebM sẽ được remux sang MKV; bỏ qua khi có phụ đề được nhúng.'
      },
      writeDescription: {
        label: 'Lưu mô tả',
        description: 'Lưu mô tả video dưới dạng tệp văn bản .description cạnh tệp tải xuống.'
      },
      writeThumbnail: {
        label: 'Lưu hình thu nhỏ',
        description: 'Lưu hình thu nhỏ dưới dạng tệp ảnh .jpg cạnh tệp tải xuống.'
      }
    },
    confirm: {
      readyHeadline: 'Sẵn sàng tải về!',
      landIn: 'Tệp của bạn sẽ được lưu vào',
      labelVideo: 'Video',
      labelAudio: 'Âm thanh',
      labelSubtitles: 'Phụ đề',
      subtitlesNone: '—',
      labelSaveTo: 'Lưu vào',
      labelSize: 'Kích thước',
      sizeUnknown: 'Không xác định',
      nothingToDownload: 'Cài đặt chỉ phụ đề đang hoạt động nhưng chưa chọn ngôn ngữ phụ đề nào — sẽ không có gì được tải xuống.',
      audioOnly: 'Chỉ âm thanh',
      addToQueue: '+ Hàng đợi',
      addToQueueTooltip: 'Bắt đầu khi các tải xuống khác hoàn tất — sử dụng toàn bộ băng thông',
      pullIt: 'Tải về! ↓',
      pullItTooltip: 'Bắt đầu ngay lập tức — chạy song song với các tải xuống đang hoạt động'
    },
    error: {
      icon: 'Lỗi'
    }
  },
  videoCard: {
    titlePlaceholder: 'Đang tải…',
    domain: 'youtube.com'
  },
  queue: {
    header: 'Hàng đợi tải xuống',
    toggleTitle: 'Bật/tắt hàng đợi tải xuống',
    empty: 'Các tải xuống bạn thêm vào hàng đợi sẽ xuất hiện ở đây',
    noDownloads: 'Chưa có tải xuống nào.',
    activeCount: '{{count}} đang tải · {{percent}}%',
    clear: 'Xóa',
    clearTitle: 'Xóa các tải xuống đã hoàn tất',
    tip: 'Tải xuống của bạn đang trong hàng đợi bên dưới — mở bất cứ lúc nào để theo dõi tiến trình.',
    item: {
      doneAt: 'Hoàn tất {{time}}',
      paused: 'Đã tạm dừng',
      defaultError: 'Tải xuống thất bại',
      openUrl: 'Mở URL',
      pause: 'Tạm dừng',
      resume: 'Tiếp tục',
      cancel: 'Hủy',
      remove: 'Xóa'
    }
  },
  update: {
    appVersion: 'Arroxy {{version}}',
    isAvailable: 'đã có sẵn',
    youHave: '— bạn đang dùng {{currentVersion}}',
    install: 'Cài đặt & Khởi động lại',
    downloading: 'Đang tải xuống…',
    download: 'Tải xuống ↗',
    dismiss: 'Ẩn thông báo cập nhật',
    copy: 'Sao chép lệnh vào bộ nhớ tạm',
    copied: 'Đã sao chép lệnh vào bộ nhớ tạm',
    installFailed: 'Cập nhật thất bại',
    retry: 'Thử lại'
  },
  status: {
    preparingBinaries: 'Đang chuẩn bị các tệp nhị phân…',
    mintingToken: 'Đang tạo token YouTube…',
    remintingToken: 'Đang tạo lại token…',
    startingYtdlp: 'Đang khởi động tiến trình yt-dlp…',
    downloadingMedia: 'Đang tải xuống video & âm thanh…',
    mergingFormats: 'Đang ghép âm thanh và video…',
    fetchingSubtitles: 'Đang tải phụ đề…',
    sleepingBetweenRequests: 'Đang chờ {{seconds}}s để tránh giới hạn tốc độ…',
    subtitlesFailed: 'Đã lưu video — một số phụ đề không thể tải xuống',
    cancelled: 'Đã hủy tải xuống',
    complete: 'Tải xuống hoàn tất',
    usedExtractorFallback: 'Đã tải xuống với trình trích xuất dự phòng — thiết lập cookies.txt để tải xuống đáng tin cậy hơn',
    ytdlpProcessError: 'Lỗi tiến trình yt-dlp: {{error}}',
    ytdlpExitCode: 'yt-dlp thoát với mã {{code}}',
    downloadingBinary: 'Đang tải xuống tệp nhị phân {{name}}…',
    unknownStartupFailure: 'Lỗi khởi động tải xuống không xác định'
  },
  errors: {
    ytdlp: {
      botBlock: 'Đã kích hoạt bảo vệ bot. Địa chỉ IP bạn đang dùng rất có thể đã bị gắn cờ (dải địa chỉ trung tâm dữ liệu hoặc điểm thoát VPN bận). Hãy đổi IP hoặc chọn điểm kết nối VPN khác rồi thử lại. Nếu vẫn thất bại, đây có thể là thay đổi tạm thời từ phía YouTube — Arroxy tự động cập nhật yt-dlp khi khởi động, vì vậy bản sửa lỗi sẽ tự động áp dụng khi upstream phát hành.',
      ipBlock: 'Địa chỉ IP của bạn dường như bị YouTube chặn. Hãy thử lại sau hoặc dùng VPN.',
      rateLimit: 'YouTube đang giới hạn tốc độ yêu cầu. Hãy đợi một phút rồi thử lại.',
      ageRestricted: 'Video này bị giới hạn độ tuổi và không thể tải xuống nếu không có tài khoản đã đăng nhập.',
      unavailable: 'Video này không khả dụng — có thể là riêng tư, đã bị xóa hoặc bị chặn theo khu vực.',
      geoBlocked: 'Video này không có sẵn ở khu vực của bạn.',
      outOfDiskSpace: 'Không đủ dung lượng đĩa. Hãy giải phóng dung lượng rồi thử lại.'
    }
  },
  presets: {
    'best-quality': {
      label: 'Chất lượng tốt nhất',
      desc: 'Độ phân giải cao nhất + âm thanh tốt nhất'
    },
    balanced: {
      label: 'Cân bằng',
      desc: 'Tối đa 720p + âm thanh tốt'
    },
    'audio-only': {
      label: 'Chỉ âm thanh',
      desc: 'Không có video, âm thanh tốt nhất'
    },
    'small-file': {
      label: 'Tệp nhỏ',
      desc: 'Độ phân giải thấp nhất + âm thanh thấp'
    },
    'subtitle-only': {
      label: 'Chỉ phụ đề',
      desc: 'Không có video, không có âm thanh, chỉ phụ đề'
    }
  },
  formatLabel: {
    audioOnly: 'Chỉ âm thanh',
    audioFallback: 'Âm thanh',
    audioOnlyDot: 'Chỉ âm thanh · {{audio}}',
    videoDot: '{{resolution}} · {{audio}}'
  },
  tray: {
    tooltip: 'Arroxy',
    menu: {
      statusIdle: 'Đang chờ',
      statusActive_one: '1 đang tải · {{percent}}%',
      statusActive_other: '{{count}} đang tải · {{percent}}%',
      open: 'Mở Arroxy',
      quit: 'Thoát Arroxy'
    }
  },
  dialogs: {
    quitWithActiveDownloads: {
      message_one: '{{count}} tải xuống đang tiến hành',
      message_other: '{{count}} tải xuống đang tiến hành',
      detail: 'Đóng ứng dụng sẽ hủy tất cả các tải xuống đang hoạt động.',
      confirm: 'Hủy tải xuống & Thoát',
      keep: 'Tiếp tục tải xuống'
    },
    closeToTray: {
      message: 'Ẩn Arroxy xuống khay hệ thống khi đóng?',
      detail: 'Arroxy vẫn tiếp tục chạy và hoàn thành các tải xuống đang hoạt động. Thay đổi điều này sau trong cài đặt Nâng cao.',
      hide: 'Ẩn xuống khay',
      quit: 'Thoát',
      remember: 'Không hỏi lại'
    },
    rendererCrashed: {
      message: 'Arroxy đã gặp sự cố',
      detail: 'Tiến trình renderer bị crash ({{reason}}). Tải lại để thử lại.',
      reload: 'Tải lại',
      quit: 'Thoát'
    }
  }
} as const;

export default vi;
