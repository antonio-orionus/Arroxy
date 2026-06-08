// Factory that compiles a catalog of stripping/redirect rules into a sanitizer fn.
import {compileSanitizer} from '@url-sanitize/core'
// Pre-built ClearURLs catalog, daily-synced from upstream clearurls.xyz.
import {clearurlsCatalog} from '@url-sanitize/clearurls'

// Strip embedded whitespace before ClearURLs runs — URLs copied from
// word-wrapped terminals/chat arrive with newlines mid-path that encode
// as %20 and mangle IDs.
const WHITESPACE_RE = /\s+/g

const sanitize = compileSanitizer(clearurlsCatalog)

export function cleanUrl(url: string): string {
	const result = sanitize(url.replace(WHITESPACE_RE, ''))
	// 'blocked' has no .url; domainBlocking=false by default so unreachable.
	return result.kind === 'blocked' ? url : result.url
}
