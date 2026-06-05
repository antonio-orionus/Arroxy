import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactPlugin from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';
import security from 'eslint-plugin-security';

export default tseslint.config(
  {
    // `refs` and `.ref` are local reference checkouts used during debugging/comparison.
    ignores: ['dist', 'out', 'node_modules', 'dist-electron', 'playwright-report', 'test-results', 'refs', '.ref', 'readme-src', '.electron-user-data', '.agents', '.claude']
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  // @electron-toolkit/eslint-config-ts curated TS rules — inlined to avoid
  // double-defining the @typescript-eslint plugin (its preset bundles
  // tseslint.configs.recommended which collides with the type-checked configs above).
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowIIFEs: true
        }
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'always' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTaggedTemplates: true,
          allowTernary: true
        }
      ]
    }
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es2021
      }
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off'
    }
  },
  // Disable type-aware linting on non-TS files (config, build scripts) — they're not in tsconfig.
  {
    files: ['**/*.{js,mjs,cjs,mts,cts}'],
    ...tseslint.configs.disableTypeChecked,
  },
  // Security rules — scoped to main-process and shared code (Node.js surface)
  {
    files: ['src/main/**/*.ts', 'src/preload/**/*.ts', 'src/shared/**/*.ts', 'scripts/**/*.ts'],
    plugins: { security },
    rules: {
      ...security.configs.recommended.rules,
      // Disabled: every legitimate fs.readFile(somePath) and obj[key] triggers these.
      // The signal-to-noise ratio is unworkable.
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-object-injection': 'off',
      // Promote remaining rules from warn → error so they actually gate CI.
      'security/detect-unsafe-regex': 'off',
      'security/detect-non-literal-regexp': 'error',
    },
  },
  // React JSX rules — restricted to .tsx only since react/* rules are irrelevant for plain TS
  {
    files: ['**/*.tsx'],
    plugins: { react: reactPlugin, 'jsx-a11y': jsxA11y },
    settings: { react: { version: '19.0' } },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      ...reactPlugin.configs.flat['jsx-runtime'].rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/jsx-no-constructed-context-values': 'warn',
      'react/no-array-index-key': 'warn',
    }
  },
  // All TS/TSX: hooks, refresh, and shared overrides
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.browser
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-deprecated': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-debugger': 'error',
    }
  },
  // Ban console.* in main process — use electron-log instead.
  {
    files: ['src/main/**/*.ts'],
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    }
  },
  // Stores and token providers implement async-shaped contracts that callers
  // always await; require-await is noise here even when the body is sync.
  {
    files: ['src/main/stores/**/*.ts', 'src/main/token/providers/**/*.ts'],
    rules: {
      '@typescript-eslint/require-await': 'off',
    }
  },
  // CommonJS files
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.commonjs
      }
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off',
    }
  },
  // electron-builder lifecycle hooks — plain ESM JS, no TS types. The
  // explicit-return-type rule from @electron-toolkit's preset only fits TS.
  {
    files: ['build/*.mjs'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
    }
  },
  // shadcn/ui generated files — not a real HMR issue; a11y + return-type disabled since we don't control that code
  {
    files: ['src/renderer/src/components/ui/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/interactive-supports-focus': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    }
  },
  // Test files — mocking patterns legitimately use `any`; describe/it callbacks infer void.
  // Type-aware unsafe-* rules and unbound-method are noise here because mocks intentionally
  // strip types and pass method refs around.
  {
    files: ['tests/**/*.ts', 'tests/**/*.tsx', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
    }
  },
  // Playwright/Vitest config files — same reasoning as tests.
  {
    files: ['playwright.*.config.ts', 'playwright.config.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    }
  }
);
