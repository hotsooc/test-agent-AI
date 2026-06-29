# AGENTS.md

## Commands

```
npm run dev      # Vite dev server on port 3000
npm run build    # Production build → dist/
npm run lint     # Oxlint (Rust linter, no typecheck)
npm run preview  # Preview production build locally
```

No test framework or typecheck script exists.

## Architecture

- **SPA with tab navigation** — no router. `activeTab` state in `App.tsx` drives page rendering. Pages live in `src/pages/`.
- **UI stack**: React 19, Ant Design 6 (dark theme via `ConfigProvider darkAlgorithm`), TailwindCSS 4 (Vite plugin), Framer Motion.
- **3D**: React Three Fiber + Drei (`src/components/` — `ThreeBackground`, `ModelViewer`, `Loader`).
- **API**: `src/api/valorant.ts` hits `https://valorant-api.com/v1`. Types mirror the API schema in `src/types/valorant.ts`.
- **Entry**: `index.html` references `src/main.jsx` — Vite resolves to `src/main.tsx`. `dist/` is gitignored build output.

## Conventions

- `tsconfig.json` has `strict: false`, `noUnusedLocals: false`, `noUnusedParameters: false` — TypeScript errors won't block builds.
- Default language is `vi-VN`. Labels in `App.tsx` nav items are Vietnamese.
- Ant Design overrides in `src/index.css` use `!important` — component styles cascade through CSS, not ConfigProvider tokens alone.
- No tests exist. Adding a test framework is fair game but not required by current setup.
