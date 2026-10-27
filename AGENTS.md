# FinanceTracker

Expo SDK 57 + expo-router app (React Native 0.86). File-based routing in `src/app/`.

## Commands

- `npm start` — start Expo dev server
- `npm run android | ios | web` — start on specific platform
- `npm test` — run Jest (jest-expo preset). Single test: `npx jest <path>`
- `npm run lint` — `expo lint`
- `npm run reset-project` — clears starter code into `app-example/` and blanks `src/app/`

## Routing & imports

- Routes: `src/app/index.tsx` (`/`), `src/app/explore.tsx` (`/explore`), root layout `src/app/_layout.tsx` (tab navigator)
- `app.json`: `experiments.typedRoutes: true`, `reactCompiler: true` (experimental)
- Aliases: `@/*` → `./src/*`, `@/assets/*` → `./assets/*` (tsconfig paths)
- Entry point: `expo-router/entry` (package.json `main`)
- TypeScript: strict, extends `expo/tsconfig.base`

## Tests

- One snapshot test: `src/components/themed-text.test.tsx`, snapshot in `src/components/__snapshots__/`
- No tests dir content; `tests/` is empty
- Add tests next to components using `@testing-library/react-native`

## Gotchas

- `.expo/`, `expo-env.d.ts`, and generated `ios`/`android` folders are gitignored — do not commit them
- No CI workflows, no pre-commit config, no AGENTS.md existed before this file
- `expo-env.d.ts` header says "should not be edited"
