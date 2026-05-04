import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactPlugin from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';
import security from 'eslint-plugin-security';
import electronToolkitTs from '@electron-toolkit/eslint-config-ts';

export default tseslint.config(
  {
    ignores: ['dist', 'out', 'node_modules', 'dist-electron', 'playwright-report', 'test-results', 'refs', 'landing-src', 'readme-src']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // @electron-toolkit/eslint-config-ts — curated TS rules for Electron (ban-ts-comment,
  // explicit-function-return-type with expression allowances, no-empty-function, etc.)
  ...electronToolkitTs.configs.recommended,
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
      'security/detect-unsafe-regex': 'error',
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
    }
  },
  // All TS/TSX: hooks, refresh, and shared overrides
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
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
      'no-empty': ['error', { allowEmptyCatch: true }],
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
  // Test files — mocking patterns legitimately use `any`; describe/it callbacks infer void
  {
    files: ['tests/**/*.ts', 'tests/**/*.tsx', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    }
  }
);
