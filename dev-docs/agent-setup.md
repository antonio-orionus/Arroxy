# Agent setup

How to run Arroxy with any coding agent without the repo depending on one.

| Lives in | Role |
| --- | --- |
| `AGENTS.md` | Operating rules for every agent (`CLAUDE.md` is a symlink to it) |
| `.agents/memory/` | Project memory — index in `MEMORY.md` |
| `.agents/skills/`, `skills-lock.json` | Project-owned skills (tracked) and third-party skills (restored) |
| `.agents/mcp.json` | MCP servers, declared once |
| `scripts/agents-sync.ts` | Generates the per-tool adapters below |

## Layers

1. **Shared sources** — the tracked files above. The only place agent config is edited.
2. **Per-tool adapters** — gitignored, rebuilt by `bun run agents:sync` (also run by `bun run bootstrap` and `bun run agents:skills:restore`):

   | Shared source | Claude Code | Codex | OpenCode |
   | --- | --- | --- | --- |
   | `AGENTS.md` | `CLAUDE.md` symlink (tracked) | read natively | read natively |
   | `.agents/skills/*` | links in `.claude/skills/` | read natively | read natively |
   | `.agents/mcp.json` | `.mcp.json` | `.codex/config.toml` | `opencode.jsonc` |

   OpenCode also scans `.claude/skills/`, so it logs a harmless `duplicate skill name` warning for skills reached both ways.

3. **Harness plugins** — installed per machine, per tool, never tracked. The repo must work without them.

## Recommended plugins

Each tool wires plugins its own way, so install separately in every tool you use.

| Plugin | Claude Code | Codex CLI | OpenCode |
| --- | --- | --- | --- |
| Superpowers | `/plugin install superpowers@claude-plugins-official` | `/plugins` → search `superpowers` → Install | add `"superpowers@git+https://github.com/obra/superpowers.git"` to `plugin` in `~/.config/opencode/opencode.json` |
| CodeGraph prompt hook | `UserPromptSubmit` hook running `codegraph prompt-hook` in `.claude/settings.json` (local) | none — rely on the CodeGraph section of `AGENTS.md` | none — same |

Current install steps: [Superpowers README](https://github.com/obra/superpowers#installation).

## Adding things

- **An MCP server:** add it to `.agents/mcp.json`, run `bun run agents:sync`. Fields beyond `command`/`args` are rejected until `scripts/agents-sync.ts` renders them for every tool.
- **A project skill:** add `.agents/skills/<name>/SKILL.md`, whitelist the directory in `.gitignore`, run `bun run agents:sync`.
- **A third-party skill:** install through the Skills CLI so `skills-lock.json` records it.
- **Another tool:** check where it reads skills and MCP config, then extend `scripts/agents-sync.ts` and the table above.
- **A plugin workflow the repo relies on:** write the rule into `AGENTS.md` or a project skill instead of naming the plugin.
