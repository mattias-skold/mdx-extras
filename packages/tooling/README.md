# @mdxeditor/tooling

Shared development tooling and configuration for MDXEditor packages. Provides consistent ESLint, TypeScript, Prettier, and Vite configurations across all packages in the monorepo.

## Overview

This package is private and not published to npm. It exists to centralize development tooling configuration and ensure consistency across all MDXEditor plugin packages.

## Included Configurations

### TypeScript Configuration

**File:** `tsconfig.base.json`

Provides a strict TypeScript configuration with:

- Strict mode enabled
- `noUnusedLocals` and `noUnusedParameters` checks
- `noFallthroughCasesInSwitch` enforcement
- ES2020 target with ESNext module resolution
- React JSX support

**Usage in packages:**

```json
{
  "extends": "@mdxeditor/tooling/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

### ESLint Configuration

**File:** `eslint.config.mjs`

Provides strict ESLint rules with:

- TypeScript ESLint with `strictTypeChecked` ruleset
- Project-aware type checking
- Ignores for common build/config files

**Usage in packages:**

```javascript
import baseConfig from '@mdxeditor/tooling/eslint.config.mjs';

export default [
  ...baseConfig,
  // Package-specific overrides if needed
];
```

### Prettier Configuration

**File:** `prettier.config.mjs`

Provides consistent code formatting with:

- No semicolons
- Double quotes
- 2-space indentation
- No trailing commas

**Usage in packages:**

```javascript
import prettierConfig from '@mdxeditor/tooling/prettier.config.mjs';

export default prettierConfig;
```

Or reference in package.json:

```json
{
  "prettier": "@mdxeditor/tooling/prettier.config.mjs"
}
```

### Vite Configuration

**File:** `vite.config.base.js`

Provides library build configuration with:

- ES module output
- TypeScript declaration generation with `vite-plugin-dts`
- React/React-DOM as external peer dependencies
- Source map and declaration map generation
- Entry point at `src/index.tsx`

**Usage in packages:**

```javascript
import { defineConfig } from 'vite';
import baseConfig from '@mdxeditor/tooling/vite.config.base';

export default defineConfig({
  ...baseConfig,
  // Package-specific overrides if needed
});
```

## Package Structure

```
packages/tooling/
├── eslint.config.mjs        # ESLint configuration
├── prettier.config.mjs      # Prettier configuration
├── tsconfig.base.json       # TypeScript configuration
├── vite.config.base.js      # Vite library build config
└── package.json
```

## Dependencies

This package includes:

- **TypeScript** (`^5.9.3`) - Type checking
- **ESLint** (`^9.39.1`) - Linting with strict TypeScript rules
- **Prettier** (`^3.6.2`) - Code formatting
- **Vite** (`^7.2.2`) - Build tool
- **vite-plugin-dts** (`^4.5.4`) - TypeScript declaration generation

## Development Commands

```bash
# Type check the tooling package itself
pnpm type-check

# Format files
pnpm format
```

## Usage Pattern

Packages in the monorepo import these configurations directly:

```json
{
  "name": "@mdxeditor/my-plugin",
  "devDependencies": {
    "@mdxeditor/tooling": "workspace:*"
  }
}
```

Then extend the configs as shown in the examples above.

## Benefits

- **Consistency**: All packages use the same code quality standards
- **Maintainability**: Update tooling once, apply everywhere
- **DRY**: No duplicate configuration across packages
- **Strict**: Enforces best practices with strict TypeScript and ESLint rules

## Contributing

This package is part of the [MDXEditor Extras](https://github.com/mdx-editor/extras) monorepo. See the main repository for contribution guidelines.

## License

MIT
