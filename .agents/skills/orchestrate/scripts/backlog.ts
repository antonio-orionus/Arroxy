// Moves `.internal` backlog entries to `## Fixed`, or tags them in place.
//
//   bun backlog.ts <file> fix <entry substring> <note>     move an `- **…` entry under ## Fixed
//   bun backlog.ts <file> tag <entry substring> <tag>      prefix the entry with **[tag]**
//   bun backlog.ts <file> done-item <N> <tag>              tag item N of a numbered backlog
import {readFileSync, writeFileSync} from 'node:fs'

const [path, cmd, key, note] = process.argv.slice(2)
if (!path || !cmd || !key || !note) {
	console.error('usage: backlog.ts <file> fix|tag|done-item <key> <note>')
	process.exit(2)
}
const lines = readFileSync(path, 'utf8').split('\n')

function findOne(match: (line: string) => boolean): number {
	const hits = lines.flatMap((line, i) => (match(line) ? [i] : []))
	if (hits.length !== 1) {
		console.error(`expected one entry matching ${JSON.stringify(key)}, found ${hits.length}`)
		process.exit(1)
	}
	return hits[0]
}

if (cmd === 'done-item') {
	const prefix = `${key}. **`
	const i = findOne(line => line.startsWith(prefix))
	if (!lines[i].includes('[Done')) lines[i] = lines[i].replace(prefix, `${key}. **[${note}]** **`)
} else if (cmd === 'tag') {
	const i = findOne(line => line.startsWith('- **') && line.includes(key))
	if (!lines[i].includes(note)) lines[i] = lines[i].replace('- **', `- **[${note}]** **`)
} else if (cmd === 'fix') {
	const i = findOne(line => line.startsWith('- **') && line.includes(key))
	const [entry] = lines.splice(i, 1)
	if (lines[i - 1] === '' && lines[i] === '') lines.splice(i, 1)
	const fixed = lines.indexOf('## Fixed')
	if (fixed === -1) {
		console.error('no "## Fixed" heading')
		process.exit(1)
	}
	// Oldest first: after the last entry of the Fixed list, before whatever follows it.
	if (lines[fixed + 1] !== '') lines.splice(fixed + 1, 0, '')
	let end = fixed + 2
	while (end < lines.length && lines[end].startsWith('- ')) end++
	lines.splice(end, 0, `${entry.trimEnd()} ${note}`)
} else {
	console.error(`unknown command ${cmd}`)
	process.exit(2)
}
writeFileSync(path, lines.join('\n'))
