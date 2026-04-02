# WorkNest Mobile Architecture

This document describes the project structure and architectural rules for future development and AI agents.

## Core Folders

- **`src/app/`**: EXCLUSIVELY for routing and navigation. 
  - Uses Expo Router conventions.
  - Groups like `(auth)` and `(app)` separate public and protected routes.
  - Route files should be "dumb" and only render components from `features/`.

- **`src/features/`**: Domain-specific business modules.
  - Each feature (e.g., `auth`, `employees`) is self-contained.
  - Logic is colocated: `api`, `components`, `hooks`, `store`, `types`.
  - Use `index.ts` to export the feature's public API.

- **`src/common/`**: Shared infrastructure and cross-cutting concerns.
  - `api/`: Global client and interceptors.
  - `components/`: Generic UI components (Design System / Atoms).
  - `constants/`: Global app-wide constants.
  - `hooks/`: Generic utility hooks.
  - `storage/`: Persistance layers.
  - `theme/`: Styling tokens and system.
  - `utils/`: Pure functions.

## Guidelines for AI Agents

1. **Feature-First**: When adding a new business capability, create a folder in `src/features/`.
2. **Encapsulation**: Do not reach into a feature's internals. Import only from its `index.ts`.
3. **Hierarchy**: `features` depend on `common`. `common` NEVER depends on `features`.
4. **Thin Routing**: Keep `src/app` thin. If logic grows in a route, move it to a feature hook or service.
5. **Naming**: kebab-case for folders, PascalCase for components/types, camelCase for hooks/utils.
6. **Typography**: Use the custom Apple fonts (**SF Pro** for display/body, **New York** for titles/serifs) through the `Fonts` constant from `@/common/constants/theme` or the `ThemedText` component to maintain brand consistency.

## Typical Feature Structure

```text
features/feature-name/
├── api/             # API calls and data hooks
├── components/      # UI components (PascalCase)
├── hooks/           # Business logic hooks
├── store/           # State management
├── types/           # DTOs and Interfaces
└── index.ts         # Public exports
```
