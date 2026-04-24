# Windows Test Guide

## Run locally

1. Install Node.js 20+.
2. In project root:

```bash
npm install
npm run dev
```

## Production checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## E2E smoke

`test:e2e` uses `xvfb-run` for Linux CI. On Windows, run Playwright directly:

```bash
npm run build
npx playwright test
```
