# Tooling Migration Audit

Audit date: 2026-06-08.

This note captures the Tailwind, ESLint, Prettier, Biome, and Oxlint findings from the local tooling audit. It is written as a decision aid for future cleanup, not as an implementation plan that has already been approved.

## Lives in

| Path | Role |
| --- | --- |
| `package.json` | Tool dependencies, scripts, lint-staged config |
| `eslint.config.mjs` | Current ESLint flat config and project-specific rule policy |
| `.prettierrc` | Current Prettier options |
| `.prettierignore` | Current Prettier ignores |
| `.github/workflows/ci.yml` | Current CI quality gate |
| `.github/workflows/release.yml` | Release quality gate |
| `.husky/pre-commit` | lint-staged entry point |
| `electron.vite.config.ts` | Electron renderer Vite config with Tailwind plugin |
| `src/renderer/vite.config.mjs` | Browser-mock Vite config with Tailwind plugin |
| `src/renderer/src/styles.css` | Tailwind v4 CSS-first entry and theme tokens |
| `components.json` | shadcn/base-nova Tailwind and alias config |

## Current state

Tailwind v4 is configured correctly.

- `@tailwindcss/vite` is used in both Electron and browser-mock Vite configs.
- `src/renderer/src/styles.css` uses `@import 'tailwindcss';`, which matches Tailwind v4's CSS-first setup.
- `components.json` correctly points shadcn to `src/renderer/src/styles.css` and has an empty Tailwind config path, which is normal for Tailwind v4 CSS-first configuration.

ESLint is currently the strongest quality gate.

- Uses flat config through `eslint.config.mjs`.
- Uses `typescript-eslint` `recommendedTypeChecked` and `stylisticTypeChecked`.
- Uses `parserOptions.projectService: true`.
- Adds React, React Hooks, React Refresh, JSX a11y, and Node/security rules.
- `bun run lint` passed during the audit.

Prettier is configured but weakly enforced.

- `.prettierrc` sets `printWidth: 10000`, which effectively disables normal wrapping.
- `bun run format:check` failed during the audit on five files:
  - `src/main/services/playlistScanPath.ts`
  - `src/renderer/src/components/ui/field.tsx`
  - `src/renderer/src/components/ui/input-group.tsx`
  - `src/renderer/src/components/ui/label.tsx`
  - `src/renderer/src/components/ui/textarea.tsx`
- `format:check` is not part of `bun run check`.
- CI runs `bun run lint`, `knip`, `typecheck`, `madge`, LOC, pins, and tests, but does not run Prettier.
- Prettier runs in the pre-commit hook via lint-staged, so staged local changes are formatted, but CI can still accept unformatted code.

Tailwind class ordering is not enforced today.

- No `prettier-plugin-tailwindcss`.
- No `eslint-plugin-tailwindcss`.
- No VS Code Tailwind `classRegex` or equivalent settings.
- The renderer uses `cn()` with `clsx` and `tailwind-merge`, but class sorting is not currently gated.

## Biome replacement findings

Biome can replace some tooling but not all current ESLint coverage by itself.

Biome 2.4.16 was tested against a temporary copy of the repo config.

### Prettier migration

`biome migrate prettier --write` failed because the current `.prettierrc` uses `printWidth: 10000`. Biome accepts line widths only up to `320`.

That means a Biome formatter migration is not drop-in. The project must first choose a real line width, for example `100` or `120`.

### ESLint migration

With the most favorable migration flags:

```bash
biome migrate eslint --write --include-inspired --include-nursery
```

Biome reported:

| Metric | Count | Share |
| --- | ---: | ---: |
| ESLint rules found by migrator | 264 | 100% |
| Migrated to Biome rules | 168 | 63.64% |
| Unsupported by Biome | 96 | 36.36% |
| Not yet implemented | 82 | 31.06% |
| Unknown plugin source | 14 | 5.30% |

Against rules actually enabled on current project files:

| Metric | Covered by Biome | Lost vs current ESLint | Loss |
| --- | ---: | ---: | ---: |
| Unique active rules | 147 / 212 | 65 / 212 | 30.66% |
| Rule applications across current files | 39,952 / 59,566 | 19,614 / 59,566 | 32.93% |
| Error-level unique rules | 143 / 195 | 52 / 195 | 26.67% |
| Error-level rule applications | 38,997 / 56,329 | 17,332 / 56,329 | 30.77% |

So replacing ESLint with Biome alone would drop about 31% of currently enabled unique static-analysis rules, or about 33% weighted by file-rule applications.

The 65 lost active rules break down as:

| Bucket | Count |
| --- | ---: |
| Type-aware TypeScript | 14 |
| React compiler hooks | 14 |
| TypeScript syntax/style | 11 |
| Security plugin | 11 |
| Legacy React plugin | 10 |
| Core JS | 5 |

Important lost examples:

- `@typescript-eslint/no-unsafe-assignment`
- `@typescript-eslint/no-unsafe-call`
- `@typescript-eslint/no-unsafe-member-access`
- `@typescript-eslint/no-unsafe-return`
- `@typescript-eslint/restrict-template-expressions`
- `@typescript-eslint/unbound-method`
- `@typescript-eslint/no-unnecessary-type-assertion`
- `react-hooks/static-components`
- `react-hooks/use-memo`
- `react-hooks/immutability`
- `react-hooks/refs`
- `react-hooks/set-state-in-effect`
- `react-hooks/set-state-in-render`
- `react-hooks/purity`
- `security/detect-non-literal-regexp`
- all other active `eslint-plugin-security` rules

## Replacement options for lost Biome rules

Biome alone does not preserve current coverage. Biome plus Oxlint can get much closer.

### Oxlint and tsgolint

Oxlint 1.68.0 and `oxlint-tsgolint` were evaluated as replacement candidates.

Current docs say type-aware linting requires the extra `oxlint-tsgolint` package and `--type-aware`.

```bash
bun add -D oxlint oxlint-tsgolint
oxlint --type-aware
```

Local temp probe results:

- `oxlint` alone could not run type-aware rules from this repo checkout and reported that `oxlint-tsgolint` was missing.
- A temp install of `oxlint` plus `oxlint-tsgolint` did run type-aware rules.
- A fixture with `any` violations triggered:
  - `typescript/no-unsafe-assignment`
  - `typescript/no-unsafe-call`

Oxlint's rule index includes native replacements for the TypeScript rule gap, including:

- `typescript/await-thenable`
- `typescript/no-array-delete`
- `typescript/no-duplicate-type-constituents`
- `typescript/no-redundant-type-constituents`
- `typescript/no-unnecessary-type-assertion`
- `typescript/no-unsafe-argument`
- `typescript/no-unsafe-assignment`
- `typescript/no-unsafe-call`
- `typescript/no-unsafe-enum-comparison`
- `typescript/no-unsafe-member-access`
- `typescript/no-unsafe-return`
- `typescript/no-unsafe-unary-minus`
- `typescript/restrict-template-expressions`
- `typescript/triple-slash-reference`
- `typescript/unbound-method`

Oxlint also covers most lost legacy React rules natively, including:

- `react/jsx-no-constructed-context-values`
- `react/jsx-no-undef`
- `react/no-direct-mutation-state`
- `react/no-find-dom-node`
- `react/no-is-mounted`
- `react/no-render-return-value`
- `react/no-unescaped-entities`
- `react/require-render-return`

Oxlint covers most lost core JS rules natively:

- `no-delete-var`
- `no-invalid-regexp`
- `no-unexpected-multiline`
- `no-useless-assignment`

`no-octal` was not in the Oxlint rule index, but Biome's parser rejects legacy octal literals such as `const x = 010;`, so that risk is still gated if Biome runs over JS files.

### Oxlint JS-plugin bridge

Oxlint has a JavaScript plugin bridge for ESLint-compatible plugins. The docs call this bridge alpha.

Temp probes showed the bridge can run the repo's current plugin rules under aliases.

`eslint-plugin-security` worked under an alias:

```json
{
  "jsPlugins": [
    {
      "name": "security-js",
      "specifier": "eslint-plugin-security"
    }
  ],
  "rules": {
    "security-js/detect-non-literal-regexp": "error",
    "security-js/detect-child-process": "warn"
  }
}
```

A fixture triggered:

- `security-js/detect-non-literal-regexp`
- `security-js/detect-child-process`

`eslint-plugin-react-hooks` also worked under an alias:

```json
{
  "jsPlugins": [
    {
      "name": "react-hooks-js",
      "specifier": "eslint-plugin-react-hooks"
    }
  ],
  "rules": {
    "react-hooks-js/static-components": "error",
    "react-hooks-js/set-state-in-render": "error"
  }
}
```

A fixture triggered:

- `react-hooks-js/static-components`
- `react-hooks-js/set-state-in-render`

This matters because the official React docs still surface React Compiler diagnostics through `eslint-plugin-react-hooks`. There is no clear standalone non-ESLint replacement for the new compiler-oriented hooks rules.

`eslint-plugin-react` can also be loaded through the JS-plugin bridge for React rules that are not native in Oxlint, such as `jsx-uses-vars` or `no-deprecated`, though those specific rules are lower value in this TypeScript + React 19 app than the hooks/compiler and type-safety rules.

### Semgrep and CodeQL

Semgrep and CodeQL are viable security-analysis additions, but they are not exact replacements for the current ESLint rule names.

Semgrep Community Edition can run JavaScript, TypeScript, React, OWASP, and secrets rulesets in CI, and supports custom rules. It is a good complement or eventual replacement for some `eslint-plugin-security` intent.

Example Semgrep command from docs:

```bash
semgrep scan \
  --config p/default \
  --config p/javascript \
  --config p/typescript \
  --config p/react \
  --config p/owasp-top-ten \
  --config p/secrets
```

CodeQL can run JavaScript/TypeScript `default`, `security-extended`, and `security-and-quality` suites in GitHub code scanning. It is a stronger CI security scanner than ESLint, but it does not replace local lint ergonomics or exact plugin checks.

## Exact replacement matrix

If using Biome plus Oxlint plus `oxlint-tsgolint` plus Oxlint JS plugins:

| Bucket | Lost from Biome | Replacement |
| --- | ---: | --- |
| TypeScript semantic/style rules | 25 | Oxlint `typescript/*` plus `oxlint-tsgolint`; `@typescript-eslint/no-unused-expressions` maps to Oxlint core `no-unused-expressions` |
| Core JS rules | 5 | Oxlint covers 4; Biome parser rejects legacy octal literals, covering `no-octal` risk |
| Legacy React rules | 10 | Oxlint native React covers 8; Oxlint JS-plugin bridge can run `eslint-plugin-react` for the remaining 2 |
| React compiler hooks rules | 14 | Oxlint JS-plugin bridge can run `eslint-plugin-react-hooks` under an alias |
| Security rules | 11 | Oxlint JS-plugin bridge can run `eslint-plugin-security` under an alias |

Replacement coverage with the JS-plugin bridge: 65 / 65 of the rules Biome loses.

Replacement coverage with only native Biome plus native Oxlint plus tsgolint: roughly 37 / 65, plus `no-octal` covered by Biome parser. The remaining gaps are mainly React compiler hooks and security plugin rules.

## Recommended paths

### Conservative path

Use Biome only for formatting and keep ESLint for linting.

```json
{
  "format": "biome format --write src tests",
  "format:check": "biome format --check src tests",
  "lint": "eslint ."
}
```

Pros:

- Lowest regression risk.
- Keeps all existing ESLint semantics.
- Removes current Prettier weakness once line width is fixed.

Cons:

- Does not reduce lint stack complexity.
- Keeps slower ESLint type-aware linting.

### Balanced path

Use Biome for formatting, Oxlint for native fast linting, and keep a narrow ESLint fallback for React Hooks compiler rules and security.

Potential shape:

```json
{
  "format": "biome format --write src tests",
  "format:check": "biome format --check src tests",
  "lint": "oxlint --type-aware && eslint ."
}
```

Then disable ESLint rules already covered by Oxlint once parity is proven, possibly with `eslint-plugin-oxlint`.

Pros:

- Better performance path.
- Keeps reliable ESLint fallback for high-value plugin rules.
- Lets the repo migrate gradually.

Cons:

- Two linters during migration.
- Requires careful duplicate-rule management.

### Aggressive path

Use Biome for formatting and Oxlint for linting, including JS-plugin bridge aliases for React Hooks and security.

Pros:

- Can preserve the measured 65 / 65 lost-rule coverage.
- Potentially much faster than ESLint.

Cons:

- Relies on Oxlint's JS-plugin bridge, which current docs mark as alpha.
- Needs fixture tests proving the bridged rules continue to fire.
- More moving parts in `.oxlintrc`.

## Migration prerequisites

Before any migration:

1. Replace `.prettierrc` `printWidth: 10000` with a real line width.
2. Add formatting to CI or `bun run check`.
3. Decide whether Tailwind class sorting is desired.
4. If using Biome class sorting, note that `useSortedClasses` is a lint rule with unsafe fixes, not formatter behavior.
5. If using Oxlint type-aware linting, add both `oxlint` and `oxlint-tsgolint`.
6. If using Oxlint JS plugins, add fixture probes for:
   - `react-hooks-js/static-components`
   - `react-hooks-js/set-state-in-render`
   - `security-js/detect-non-literal-regexp`
   - `security-js/detect-child-process`
   - one `typescript/no-unsafe-*` rule through tsgolint

## Source docs checked

- Tailwind CSS v4 Vite setup and CSS-first configuration: `https://tailwindcss.com`
- TypeScript ESLint typed linting and `projectService`: `https://typescript-eslint.io`
- Prettier configuration and ESLint interaction: `https://prettier.io`
- Biome migration, formatter, type-aware linting, React hooks, and `useSortedClasses`: `https://biomejs.dev`
- Oxlint type-aware linting, rules index, JS plugins, and migration guidance: `https://oxc.rs`
- React `eslint-plugin-react-hooks` compiler lint docs: `https://react.dev/reference/eslint-plugin-react-hooks`
- Semgrep JavaScript/TypeScript rulesets and CI usage: `https://semgrep.dev`
- CodeQL JavaScript/TypeScript security query suites: `https://codeql.github.com`
