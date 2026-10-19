export {YT_DLP_ERROR_KINDS, RATE_LIMIT_EVIDENCE} from './kinds.js'
export type {YtDlpErrorKind, ClassifierKind, ClassifiedError, RateLimitEvidence} from './kinds.js'

export {classifyYtDlpStderr, classifyAll, ERROR_PATTERNS} from './classifier.js'
export type {ClassifyOpts} from './classifier.js'

export {extractLastError, isPostprocessFailure} from './extractors.js'

export {rateLimitEvidence, rateLimitLine, accountCookiesRejected, sabrSkippedClient} from './signals.js'
export {SIGNAL_PATTERNS} from './patterns.js'

export {errorKindMetadata, ERROR_KIND_METADATA} from './metadata.js'
export type {KindMetadata} from './metadata.js'
