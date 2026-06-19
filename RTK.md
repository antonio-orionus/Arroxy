# RTK - Rust Token Killer (Codex CLI)

**Usage**: Token-optimized CLI proxy for shell commands.

## Rule

Use `rtk` for shell commands after verifying that it is available on `PATH`.

Bootstrap check:

```bash
command -v rtk
```

If `rtk` is unavailable, run the command directly and mention that `rtk` was not found.

Examples:

```bash
rtk git status
rtk npm test
rtk pnpm test
rtk pytest -q
```

## Command Proxy Limits

`rtk` is a command proxy with specialized subcommands, not a transparent shell
prefix. Prefer the specialized commands when they match the command shape, and
fall back to raw execution when native shell semantics matter.

- `rtk find` is optimized for simple native `find` predicates such as `-name`,
  `-type`, and path arguments. For compound predicates or actions such as
  `(`, `)`, `-o`, `-a`, `!`, `-not`, `-exec`, `-delete`, or `-print0`, use
  `rtk proxy find ...` or raw `find`.
- `rtk test` runs test commands and filters failures. It is not POSIX
  `/usr/bin/test`; for checks such as `test -d path`, use
  `rtk run "test -d path"` or raw shell `test`.

Examples:

```bash
rtk proxy find .ref/fallow -maxdepth 2 -type f \( -name 'package.json' -o -name 'Cargo.toml' \)
rtk run "test -d .ref/fallow/.git && echo yes"
```

## Meta Commands

```bash
rtk gain            # Token savings analytics
rtk gain --history  # Recent command savings history
rtk run "<cmd>"     # Run a shell command via sh -c without filtering
rtk proxy <cmd>     # Run raw command without filtering
```

## Verification

```bash
rtk --version
rtk gain
which rtk
```
