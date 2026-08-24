// Pins the donation addresses and their QR images.
//
// A changed character in an address silently redirects real money and is
// unrecoverable, and an address is opaque enough that a swap reads as noise in
// a diff. So they are pinned here rather than trusted to review.

import {createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'

const ADDRESSES = {'Bitcoin (native SegWit)': 'bc1qe9yt5tfxam76duht6zu4nlurhhrpt0u5gfxglu', 'Tron (TRX / TRC-20)': 'TCigPD799TZmGuvZx5p1DcifGDL4ML7XKA'}

// QR images are pinned by hash: a swapped PNG shows up in a diff only as
// "binary file changed", so it is the one case review cannot catch.
const QR = {'build/donate-btc.png': '83b25219cf307316e363b011a0a0500a807b28733501dd7a2da76b994c09c7e7', 'build/donate-tron.png': '26e6475c2c09e07426a9d3efa0a8e1e0c8880017f772aaaf98c4f68c6cfac651'}

const donate = readFileSync('DONATE.md', 'utf8')
const errors = []

for (const [label, addr] of Object.entries(ADDRESSES)) {
	if (!donate.includes(addr)) errors.push(`DONATE.md no longer contains the ${label} address: ${addr}`)
}

for (const [file, want] of Object.entries(QR)) {
	let got
	try {
		got = createHash('sha256').update(readFileSync(file)).digest('hex')
	} catch {
		errors.push(`${file} is missing`)
		continue
	}
	if (got !== want) errors.push(`${file} changed (sha256 ${got})`)
}

if (errors.length) {
	console.error('\n  ✗ donation addresses\n')
	for (const e of errors) console.error(`    ${e}`)
	console.error('\n  If you changed these on purpose, update scripts/check-donation-addresses.mjs')
	console.error('  in the same commit. If you did not, do not merge.\n')
	process.exit(1)
}

console.log('  ✓ donation addresses  2 addresses + 2 QR images pinned')
