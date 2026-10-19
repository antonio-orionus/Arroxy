import {useCallback, useEffect, useRef, useState} from 'react'

export interface CopyFeedback<Key> {
	// What was copied last, until the feedback delay passes; null otherwise.
	copied: Key | null
	markCopied: (key: Key) => void
	reset: () => void
}

// A copy button's brief "Copied" state. `Key` tells several copy buttons apart
// (one dialog, many addresses); a single button uses the default `true`.
// Another copy restarts the delay, and the pending timer is cleared on reset
// and on unmount, so closing a dialog mid-delay never updates an unmounted view.
export function useCopyFeedback<Key = true>(ms: number): CopyFeedback<Key> {
	const [copied, setCopied] = useState<Key | null>(null)
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

	const clearTimer = useCallback((): void => {
		if (timer.current !== null) clearTimeout(timer.current)
		timer.current = null
	}, [])

	useEffect(() => clearTimer, [clearTimer])

	const markCopied = useCallback(
		(key: Key): void => {
			clearTimer()
			setCopied(() => key)
			timer.current = setTimeout(() => {
				timer.current = null
				setCopied(null)
			}, ms)
		},
		[clearTimer, ms]
	)

	const reset = useCallback((): void => {
		clearTimer()
		setCopied(null)
	}, [clearTimer])

	return {copied, markCopied, reset}
}
