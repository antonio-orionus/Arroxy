import {lstat, mkdir, mkdtemp, readFile, readlink, rm, symlink, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it} from 'vite-plus/test'

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
		expect(targets['.codex/config.toml']).not.toContain('developer_instructions')
	})

	it('adds the personal instructions for Codex and OpenCode when there are any', () => {
		const targets = renderMcpTargets(parseAgentsMcpConfig(codegraph), '# Mine\n\nSay "hi".\n')

		const toml = targets['.codex/config.toml']
		expect(toml).toContain('developer_instructions = "# Mine\\n\\nSay \\"hi\\".\\n"\n')
		// A TOML key after a table header would belong to that table, so it must come first.
		expect(toml.indexOf('developer_instructions')).toBeLessThan(toml.indexOf('[mcp_servers.'))
		expect(JSON.parse(targets['opencode.jsonc'])).toMatchObject({instructions: ['.internal/AGENTS.md']})
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

	it('wires .internal/AGENTS.md into every tool when it exists', async () => {
		await mkdir(join(root, '.internal'), {recursive: true})
		await writeFile(join(root, '.internal/AGENTS.md'), '# Personal rules\n')

		await syncAgents(root)
		await syncAgents(root)

		expect((await lstat(join(root, 'CLAUDE.local.md'))).isSymbolicLink()).toBe(true)
		expect(await readFile(join(root, 'CLAUDE.local.md'), 'utf8')).toBe('# Personal rules\n')
		expect(await readFile(join(root, '.codex/config.toml'), 'utf8')).toContain('developer_instructions = "# Personal rules\\n"')
		expect(JSON.parse(await readFile(join(root, 'opencode.jsonc'), 'utf8'))).toMatchObject({instructions: ['.internal/AGENTS.md']})
	})

	it('drops a stale CLAUDE.local.md link without .internal/AGENTS.md, and keeps a hand-written one', async () => {
		await symlink('.internal/AGENTS.md', join(root, 'CLAUDE.local.md'))

		await syncAgents(root)

		await expect(lstat(join(root, 'CLAUDE.local.md'))).rejects.toThrow()
		expect(await readFile(join(root, '.codex/config.toml'), 'utf8')).not.toContain('developer_instructions')

		await writeFile(join(root, 'CLAUDE.local.md'), 'mine')
		await mkdir(join(root, '.internal'), {recursive: true})
		await writeFile(join(root, '.internal/AGENTS.md'), '# Personal rules\n')
		await syncAgents(root)

		expect(await readFile(join(root, 'CLAUDE.local.md'), 'utf8')).toBe('mine')
	})

	it('keeps a CLAUDE.local.md link that points somewhere else', async () => {
		await writeFile(join(root, 'mine.md'), 'mine')
		await symlink('mine.md', join(root, 'CLAUDE.local.md'))

		await syncAgents(root)
		await mkdir(join(root, '.internal'), {recursive: true})
		await writeFile(join(root, '.internal/AGENTS.md'), '# Personal rules\n')
		await syncAgents(root)

		expect(await readlink(join(root, 'CLAUDE.local.md'))).toBe('mine.md')
	})

	it('links the private skills in .internal/skills into .agents/skills, and so into every tool', async () => {
		await mkdir(join(root, '.internal/skills/private-flow'), {recursive: true})
		await writeFile(join(root, '.internal/skills/private-flow/SKILL.md'), '---\nname: private-flow\n---\n')

		await syncAgents(root)
		await syncAgents(root)

		// A Windows junction stores an absolute target; elsewhere the link stays relative, so the checkout can move.
		const target = await readlink(join(root, '.agents/skills/private-flow'))
		if (process.platform === 'win32') expect(target).toContain(join('.internal', 'skills', 'private-flow'))
		else expect(target).toBe(join('../../.internal/skills', 'private-flow'))
		expect(await readFile(join(root, '.claude/skills/private-flow/SKILL.md'), 'utf8')).toContain('name: private-flow')
	})

	it('drops the link of a private skill that is gone, and leaves other skills alone', async () => {
		await symlink('../../.internal/skills/retired', join(root, '.agents/skills/retired'))
		await mkdir(join(root, '.internal/skills/alpha'), {recursive: true})
		await writeFile(join(root, '.internal/skills/alpha/SKILL.md'), '---\nname: private alpha\n---\n')

		await syncAgents(root)

		await expect(lstat(join(root, '.agents/skills/retired'))).rejects.toThrow()
		expect(await readFile(join(root, '.agents/skills/alpha/SKILL.md'), 'utf8')).toContain('name: alpha')
	})

	it('fails instead of unwiring when .internal/AGENTS.md exists but cannot be read', async () => {
		await mkdir(join(root, '.internal/AGENTS.md'), {recursive: true})

		await expect(syncAgents(root)).rejects.toThrow()
	})
})
