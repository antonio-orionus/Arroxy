# Windows Test Guide

## Run locally

1. Install [Bun](https://bun.sh).
2. In project root:

```bash
bun install
bun run dev
```

## Production checks

```bash
bun run typecheck
bun run lint
bun run test
bun run build
```

## E2E smoke

`test:e2e` uses `xvfb-run` for Linux CI. On Windows, run Playwright directly:

```bash
bun run build
bunx playwright test
```
