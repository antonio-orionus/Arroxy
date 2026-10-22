# Agent setup

How to run Arroxy with any coding agent without the repo depending on one.

| Lives in | Role |
| --- | --- |
| `AGENTS.md` | Operating rules for every agent (`CLAUDE.md` is a symlink to it) |
| `.agents/memory/` | Project memory — index in `MEMORY.md` |
| `.agents/skills/`, `skills-lock.json` | Project-owned skills (tracked) and third-party skills (restored) |
| `.agents/mcp.json` | MCP servers, declared once |
| `scripts/agents-sync.ts` | Generates the per-tool adapters below |
| `scripts/internal-docs.ts` | Links `.internal` to the maintainer-only `arroxy-internal` clone (`internal:sync`, `internal:save`) |

## Layers

1. **Shared sources** — the tracked files above. The only place agent config is edited.
2. **Per-tool adapters** — gitignored, rebuilt by `bun run agents:sync` (also run by `bun run bootstrap` and `bun run agents:skills:restore`):

   | Shared source | Claude Code | Codex | OpenCode |
   | --- | --- | --- | --- |
   | `AGENTS.md` | `CLAUDE.md` symlink (tracked) | read natively | read natively |
   | `.agents/skills/*` | links in `.claude/skills/` | read natively | read natively |
   | `.agents/mcp.json` | `.mcp.json` | `.codex/config.toml` | `opencode.jsonc` |
   | `.internal/AGENTS.md` (untracked) | `CLAUDE.local.md` symlink | copied into `developer_instructions` in `.codex/config.toml` | `instructions` in `opencode.jsonc` |
   | `.internal/skills/*` (untracked) | links in `.agents/skills/`, then `.claude/skills/` | read through `.agents/skills/` | read through `.agents/skills/` |

   `.internal/AGENTS.md` is the maintainer's personal layer: how he works on Arroxy, kept in the private repo so it changes without a PR, and loaded at session start like `AGENTS.md`. Its private skills (such as his `land` flow) are linked in beside the tracked ones; a tracked skill of the same name wins. The repo never depends on it, and without it these adapters are simply not written. Codex cannot include a file, so it gets a copy: `internal:sync` and `internal:save` rerun `agents:sync` to refresh it.

   OpenCode also scans `.claude/skills/`, so it logs a harmless `duplicate skill name` warning for skills reached both ways.

3. **Harness plugins** — installed per machine, per tool, never tracked. The repo must work without them.

## Memory

Project memory lives in `.agents/memory/`, indexed by `MEMORY.md`; read the index before working. Write new memories there with the same frontmatter, never in a tool's own memory. Route a lesson by audience:

- maintainer-only plans and notes → `.internal/` (then `bun run internal:save`);
- how the maintainer runs Arroxy (reviews, merging, releasing) → `.internal/AGENTS.md`, or `.internal/memory/` for a longer lesson;
- cross-repo personal preferences → `~/.agents/AGENTS.md`;
- everything else, including deep-dive references → `.agents/memory/`.

## Harness plugins

Plugins (Superpowers, a CodeGraph prompt hook) are installed per machine and per tool, each in that tool's own way, and never tracked. Nothing here may depend on one: write a rule the repo relies on into `AGENTS.md` or a project skill instead.

## Adding things

- **An MCP server:** add it to `.agents/mcp.json`, run `bun run agents:sync`. Fields beyond `command`/`args` are rejected until `scripts/agents-sync.ts` renders them for every tool.
- **A project skill:** add `.agents/skills/<name>/SKILL.md`, whitelist the directory in `.gitignore`, run `bun run agents:sync`.
- **A third-party skill:** install through the Skills CLI so `skills-lock.json` records it.
- **Another tool:** check where it reads skills and MCP config, then extend `scripts/agents-sync.ts` and the table above.
- **A plugin workflow the repo relies on:** write the rule into `AGENTS.md` or a project skill instead of naming the plugin.
