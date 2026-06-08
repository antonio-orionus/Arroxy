# Tooling Migration Audit

Audit date: 2026-06-08.

Implementation branch: `tooling-migration-main`.

## Implemented Decision

Arroxy migrated in one phase from direct ESLint + Prettier scripts to:

- Biome 2.4.16 for formatting and syntax/parser gating.
- Oxlint 1.68.0 for linting.
- `oxlint-tsgolint` 0.23.0 for type-aware TypeScript rules.
- Oxlint JS-plugin bridge for rules that Biome/Oxlint native coverage would otherwise lose.
- `scripts/check-tooling-parity.mjs` for representative regression probes.

The migration intentionally uses a token-minimizing Biome formatter profile: `lineWidth: 320`, tabs, compact object spacing, `expand: "never"`, `semicolons: "asNeeded"`, and `arrowParentheses: "asNeeded"`. Biome rejects the old Prettier `printWidth: 10000`; 320 is Biome's practical maximum and preserves the repo's token-minimizing preference better than conventional wrapping.

The dense formatter profile reduced the Biome-managed file set from 3,004,113 bytes to 2,795,254 bytes versus the previous PR commit: -208,859 bytes, or -6.952%.

Docs/prose are not part of the Biome formatter include list. Formatting is scoped to code, tests, scripts, CSS, config JSON, and core project config files.

## Current Tooling Surface

| Path | Role |
| --- | --- |
| `biome.jsonc` | Dense formatter config; Tailwind v4 parser enabled; `lineWidth: 320`; linter disabled |
| `.oxlintrc.json` | Type-aware Oxlint config and JS-plugin bridge policy |
| `scripts/check-tooling-parity.mjs` | Fixture probes for formatter/parser, type-aware lint, React hooks/compiler, and security bridge rules |
| `package.json` | `format`, `format:check`, `lint`, `lint:parity`, `check`, and lint-staged commands |
| `.github/workflows/ci.yml` | CI runs format check, lint, lint parity, knip, typecheck, madge, pins, and tests |

Primary commands:

```bash
bun run format        # biome format --write
bun run format:check  # biome ci
bun run lint          # oxlint --type-aware .
bun run lint:parity   # node scripts/check-tooling-parity.mjs
bun run check         # includes format, lint, parity, typecheck, knip, madge, pins, i18n, tests
```

## Tailwind

Tailwind v4 was already configured correctly:

- `@tailwindcss/vite` is used in both Electron and browser-mock Vite configs.
- `src/renderer/src/styles.css` uses Tailwind v4 CSS-first directives.
- `components.json` points shadcn to `src/renderer/src/styles.css`.

Biome needs `css.parser.tailwindDirectives: true`; otherwise it rejects `@theme`, `@custom-variant`, and `@apply`.

Tailwind class sorting is still intentionally not enforced. Biome's class-sorting support is lint/assist-style behavior, not a plain formatter replacement, and would need a separate decision.

## Biome-Only Regression Measurement

Biome alone is not an ESLint replacement for this repo.

Measured against the previous ESLint config:

| Metric | Covered by Biome | Lost vs previous ESLint | Loss |
| --- | ---: | ---: | ---: |
| Unique active rules | 147 / 212 | 65 / 212 | 30.66% |
| Rule applications across current files | 39,952 / 59,566 | 19,614 / 59,566 | 32.93% |
| Error-level unique rules | 143 / 195 | 52 / 195 | 26.67% |
| Error-level rule applications | 38,997 / 56,329 | 17,332 / 56,329 | 30.77% |

The 65 lost active rules break down as:

| Bucket | Count |
| --- | ---: |
| Type-aware TypeScript | 14 |
| React compiler hooks | 14 |
| TypeScript syntax/style | 11 |
| Security plugin | 11 |
| Legacy React plugin | 10 |
| Core JS | 5 |

Important examples include `no-unsafe-*`, `restrict-template-expressions`, `unbound-method`, React compiler hook rules such as `static-components` and `set-state-in-render`, and `security/detect-non-literal-regexp`.

## Replacement Strategy

Biome covers formatting and parser-level syntax checks. Its parser rejects legacy octal literals, covering the old `no-octal` risk.

Oxlint plus `oxlint-tsgolint` covers the high-value type-aware TypeScript gap, including:

- `typescript/no-unsafe-assignment`
- `typescript/no-unsafe-call`
- `typescript/no-unsafe-member-access`
- `typescript/no-unsafe-return`
- `typescript/restrict-template-expressions`
- `typescript/unbound-method`
- `typescript/no-unnecessary-type-assertion`

Oxlint native React/a11y rules cover most legacy React and JSX accessibility rules.

Oxlint JS-plugin bridge covers the remaining plugin-specific rules:

- `eslint-plugin-react-hooks` is loaded as `react-hooks-js` because Oxlint reserves `react-hooks` for its native plugin.
- `eslint-plugin-security` is loaded as `security`, preserving existing `eslint-disable-next-line security/...` suppressions.
- `eslint-plugin-react` is loaded as `react-js` for the remaining non-native React rule currently kept: `react-js/no-deprecated`.

Representative parity probes are checked by `scripts/check-tooling-parity.mjs`:

- Biome rejects a legacy octal literal.
- Oxlint type-aware lint catches `no-unsafe-assignment`, `no-unsafe-call`, `no-unsafe-member-access`, `no-unsafe-return`, `restrict-template-expressions`, and `unbound-method`.
- React hooks bridge catches `rules-of-hooks`, `set-state-in-render`, and `static-components`.
- Security bridge catches `detect-child-process` and `detect-non-literal-regexp`.
- React bridge catches `react-js/no-deprecated`.
- The repo config contains the parity-critical rule IDs.

The JS-plugin bridge is still an operational risk because Oxlint documents it as alpha. The parity script is the guardrail for this one-phase migration.

## Expected Regression

Static-analysis coverage should not regress materially versus the previous ESLint intent if the Oxlint JS-plugin bridge remains compatible:

- Biome-only loss was measured at 65 active rules.
- The implemented stack replaces those lost buckets with Oxlint native rules, `oxlint-tsgolint`, Biome parser coverage, and JS-plugin bridge rules.
- The main remaining risk is bridge compatibility drift, not known missing rule intent.

If the bridge becomes unstable, the fallback is not a staged migration; it is to add a narrow secondary scanner for the affected bucket:

- React compiler hooks: restore a tiny ESLint command scoped only to hooks/compiler rules, or use Oxlint native `react-hooks` if it reaches parity.
- Security plugin: restore a tiny ESLint security command, or add Semgrep/CodeQL for CI security coverage.

## Follow-Up Cleanup

The migration keeps broad `typescript/no-explicit-any`, `typescript/no-unsafe-*`, and `typescript/unbound-method` exceptions for current JS/MJS scripts and tests. Removing those exceptions in this PR opens a large pre-existing cleanup across build hooks, test mocks, E2E helpers, and shadcn UI wrappers, so the one-phase migration preserves the existing gate and documents the cleanup instead of mixing it into the tooling swap.

## Source Docs Checked

- Tailwind CSS v4 Vite setup and CSS-first configuration: `https://tailwindcss.com`
- Biome formatter, migration, config, and Tailwind parser behavior: `https://biomejs.dev`
- Oxlint type-aware linting, rules, JS plugins, and migration guidance: `https://oxc.rs`
- React `eslint-plugin-react-hooks` compiler lint docs: `https://react.dev/reference/eslint-plugin-react-hooks`
- Semgrep JavaScript/TypeScript rulesets and CI usage: `https://semgrep.dev`
- CodeQL JavaScript/TypeScript security query suites: `https://codeql.github.com`
