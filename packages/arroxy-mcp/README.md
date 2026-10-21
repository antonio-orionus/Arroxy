# arroxy-mcp

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Lets local AI agents and scripts drive the [Arroxy](https://github.com/antonio-orionus/Arroxy) desktop app: add links, read the queue, wait for downloads, pause and resume. It is an [MCP](https://modelcontextprotocol.io) server on stdio and a command line in one binary, and it speaks the Arroxy **Control API** ([`arroxy-control`](../arroxy-control)) to the running app over a local socket (a named pipe on Windows).

Arroxy has to be running on the same machine, as the same user. The server starts and lists its tools while Arroxy is closed; a tool call then answers "Arroxy is not running. Open Arroxy and try again."

Node ≥ 20.

It is a private workspace package in the Arroxy repo, not published to npm; it will ship inside Arroxy. Until then, build it and `arroxy-control` from a checkout (`bun run --filter arroxy-control build && bun run --filter arroxy-mcp build`) and run `node <checkout>/packages/arroxy-mcp/dist/cli.js`, written `arroxy-mcp` below.

## Add it to an agent

Claude Code:

```bash
claude mcp add arroxy -- node <checkout>/packages/arroxy-mcp/dist/cli.js
```

Codex:

```bash
codex mcp add arroxy -- node <checkout>/packages/arroxy-mcp/dist/cli.js
```

VS Code:

```bash
code --add-mcp '{"name":"arroxy","command":"node","args":["<checkout>/packages/arroxy-mcp/dist/cli.js"]}'
```

Any other client: run `arroxy-mcp` (or `arroxy-mcp serve`) as a stdio server.

## Allow it in Arroxy

The first call asks Arroxy to allow `arroxy-mcp`, and the call answers:

```text
Arroxy is asking you to allow arroxy-mcp. Choose Allow in Arroxy, then try again.
```

Choose **Allow** in Arroxy and repeat the call. Arroxy then issues a client secret, which the bridge keeps and uses from then on. If you remove the client in Arroxy, the next call says so and forgets the secret; the call after that asks again.

## Tools

The names are permanent.

| Tool | Does | Input |
| --- | --- | --- |
| `arroxy_status` | Readiness, queue state, site cooldowns, and the download profiles | none |
| `arroxy_add_link` | Adds a link; returns an intake handle at once | `url`, optional `profile` (`{kind: "builtin" \| "custom", id}`), `playlistMode` (`video` \| `playlist`), `requestId` |
| `arroxy_get` | Reads one queue item or one intake | `itemId` or `intakeId` |
| `arroxy_list_queue` | Lists the queue a page at a time | optional `cursor`, `limit` |
| `arroxy_wait` | Waits until an item or intake settles or is done | `itemId` or `intakeId`, optional `until` (`settled` \| `done`, default `settled`), `timeoutMs` (default 50000, at most 240000) |
| `arroxy_item_action` | Pauses, resumes, cancels, retries or removes one item | `action`, `itemId` |
| `arroxy_queue_action` | Pauses or resumes the whole queue | `action` (`pauseAll` \| `resumeAll`) |
| `arroxy_answer_intake` | Chooses entries for an intake that needs a choice, retries a failed probe, or cancels it | `action` (`choose` \| `retry` \| `cancel`), `intakeId`, for choose `take` (`all` \| `first`) and `count` |

Results come back as JSON text and as `structuredContent`. Errors come back with `isError` and the Control API's message plus its next step. `arroxy_add_link` makes a fresh `requestId` for each call unless you pass one; resending the same one never queues twice.

## Command line

```bash
arroxy-mcp status
arroxy-mcp profiles
arroxy-mcp queue [--cursor <c>] [--limit <n>]
arroxy-mcp add <url> [--profile builtin:<id>|custom:<id>] [--playlist|--video] [--request-id <id>]
arroxy-mcp get <itemId>
arroxy-mcp get --intake <intakeId>
arroxy-mcp wait <itemId> [--until settled|done] [--timeout <ms>]
arroxy-mcp wait --intake <intakeId>
arroxy-mcp pause|resume|cancel|retry|remove <itemId>
arroxy-mcp pause-all
arroxy-mcp resume-all
arroxy-mcp serve
```

Results print as JSON on stdout. An error prints its message and next step on stderr and exits 1; "Arroxy is not running" exits 2. That is reserved for no `control.json` at all, or one whose socket is gone: when Arroxy's socket exists but cannot be used (permissions, an unsafe folder, no answer), the error says why and exits 1. With no command, `arroxy-mcp` serves MCP.

## Where it looks

Arroxy writes `control.json` (the socket path and a per-launch token) into its user data folder. The bridge reads it again on every call, so restarting Arroxy needs no restart here.

| OS | Arroxy user data |
| --- | --- |
| macOS | `~/Library/Application Support/arroxy` |
| Windows | `%APPDATA%\arroxy` |
| Linux | `${XDG_CONFIG_HOME:-~/.config}/arroxy`, then the Flatpak's `~/.var/app/io.github.antonio_orionus.Arroxy/config/arroxy`; in each place `Arroxy` is tried after `arroxy`, and the one whose socket answers wins |

The bridge refuses a Unix socket whose folder is not owned by you or is open to other users, and it checks that the app proves it holds the token before it sends any credential.

The client secrets live in `clients.json` (owner-only), one entry per Arroxy user data folder. Every change to it is made under a short-lived `clients.json.lock`, so the command line and an MCP server running at once never lose each other's entries:

| OS | Bridge config |
| --- | --- |
| macOS | `~/Library/Application Support/arroxy-mcp` |
| Windows | `%APPDATA%\arroxy-mcp` |
| Linux | `${XDG_CONFIG_HOME:-~/.config}/arroxy-mcp` |

## Environment

| Variable | Effect |
| --- | --- |
| `ARROXY_USER_DATA` | Look for `control.json` only in this folder (a dev or test profile of Arroxy) |
| `ARROXY_MCP_CONFIG_DIR` | Keep `clients.json` in this folder instead |

## License

MIT
