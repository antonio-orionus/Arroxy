import {lstat, mkdir, mkdtemp, readFile, readlink, rm, symlink, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it} from 'vitest'

import {parseAgentsMcpConfig, renderMcpTargets, syncAgents} from '../../scripts/agents-sync.js'

const codegraph = {servers: {codegraph: {command: 'codegraph', args: ['serve', '--mcp']}}}

describe('parseAgentsMcpConfig', () => {
	it('accepts a server with command and args', () => {
		expect(parseAgentsMcpConfig(codegraph)).toEqual(codegraph)
	})

	it('rejects unknown server keys so new fields are rendered deliberately', () => {
		expect(() => parseAgentsMcpConfig({servers: {x: {command: 'x', env: {A: '1'}}}})).toThrow()
	})
})

describe('renderMcpTargets', () => {
	it('renders the same servers for Claude Code, Codex, and OpenCode', () => {
		const targets = renderMcpTargets(parseAgentsMcpConfig(codegraph))

		expect(JSON.parse(targets['.mcp.json'])).toEqual({mcpServers: {codegraph: {type: 'stdio', command: 'codegraph', args: ['serve', '--mcp']}}})
		expect(targets['.codex/config.toml']).toContain('[mcp_servers."codegraph"]\ncommand = "codegraph"\nargs = ["serve", "--mcp"]\n')
		expect(JSON.parse(targets['opencode.jsonc'])).toEqual({$schema: 'https://opencode.ai/config.json', mcp: {codegraph: {type: 'local', command: ['codegraph', 'serve', '--mcp'], enabled: true}}})
	})
})

describe('syncAgents', () => {
	let root: string

	beforeEach(async () => {
		root = await mkdtemp(join(tmpdir(), 'agents-sync-'))
		await mkdir(join(root, '.agents/skills/alpha'), {recursive: true})
		await writeFile(join(root, '.agents/skills/alpha/SKILL.md'), '---\nname: alpha\n---\n')
		await mkdir(join(root, '.agents/skills/not-a-skill'), {recursive: true})
		await writeFile(join(root, '.agents/mcp.json'), JSON.stringify(codegraph))
	})

	afterEach(async () => {
		await rm(root, {recursive: true, force: true})
	})

	it('links every shared skill into .claude/skills and writes MCP adapters', async () => {
		await syncAgents(root)

		const link = join(root, '.claude/skills/alpha')
		expect((await lstat(link)).isSymbolicLink()).toBe(true)
		expect(await readFile(join(link, 'SKILL.md'), 'utf8')).toContain('name: alpha')
		await expect(lstat(join(root, '.claude/skills/not-a-skill'))).rejects.toThrow()
		expect(await readFile(join(root, '.mcp.json'), 'utf8')).toContain('codegraph')
	})

	it('is idempotent, prunes dangling links, and leaves non-link entries alone', async () => {
		await mkdir(join(root, '.claude/skills/local-only'), {recursive: true})
		await symlink('../../.agents/skills/gone', join(root, '.claude/skills/gone'))

		await syncAgents(root)
		await syncAgents(root)

		expect(await readlink(join(root, '.claude/skills/alpha'))).toContain('alpha')
		await expect(lstat(join(root, '.claude/skills/gone'))).rejects.toThrow()
		expect((await lstat(join(root, '.claude/skills/local-only'))).isDirectory()).toBe(true)
	})
})
