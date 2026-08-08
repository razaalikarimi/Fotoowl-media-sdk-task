git remote remove origin 2>$null
git remote add origin https://github.com/razaalikarimi/Fotoowl-media-sdk-task.git
git branch -M main

git add package.json pnpm-workspace.yaml tsconfig.base.json eslint.config.js vitest.config.ts .prettierrc .gitignore
git commit -m "chore: Initialize monorepo workspace and toolchain"

git add packages/media-core/package.json packages/media-core/tsconfig.json
git commit -m "feat(core): Scaffold media-core package"

git add packages/media-core/src/types
git commit -m "feat(core): Define strict Pexels API types and SDK interfaces"

git add packages/media-core/src/errors
git commit -m "feat(core): Implement custom hierarchical error boundaries"

git add packages/media-core/src/events
git commit -m "feat(core): Build framework-agnostic event emitter pattern"

git add packages/media-core/src/cache
git commit -m "feat(core): Implement request deduplication and TTL caching"

git add packages/media-core/src/client.ts packages/media-core/src/index.ts
git commit -m "feat(core): Implement Pexels API client factory with pagination"

git add packages/media-core/tests
git commit -m "test(core): Add comprehensive unit tests for core SDK"

git add packages/media-react
git commit -m "feat(react): Add React Context provider and declarative hooks"

git add packages/media-native
git commit -m "feat(native): Add React Native bindings for core SDK"

git add packages/media-ui-react/package.json packages/media-ui-react/tsconfig.json packages/media-ui-react/src/index.ts
git commit -m "feat(ui-react): Scaffold headless UI components library"

git add packages/media-ui-react/src/grid
git commit -m "feat(ui-react): Implement headless Grid hook with infinite scroll"

git add packages/media-ui-react/src/lightbox
git commit -m "feat(ui-react): Implement headless Lightbox hook with focus trapping"

git add packages/media-ui-react/src/reel
git commit -m "feat(ui-react): Implement headless Reel Swiper hook with snap paging"

git add packages/media-ui-react/tests
git commit -m "test(ui-react): Add UI accessibility and state management tests"

git add packages/media-ui-native
git commit -m "feat(ui-native): Implement headless UI for React Native FlatLists"

git add apps/web/package.json apps/web/tsconfig.json apps/web/tsconfig.app.json apps/web/tsconfig.node.json apps/web/vite.config.ts apps/web/index.html
git commit -m "chore(web): Initialize Vite React web application"

git add apps/web/src/styles
git commit -m "style(web): Define premium light theme and full CSS animations"

git add apps/web/src/components/EventLog.tsx
git commit -m "feat(web): Add collapsible Event Log panel for SDK monitoring"

git add apps/web/src/components/MediaSearch.tsx
git commit -m "feat(web): Wire search functionality using media-react hooks"

git add apps/web/src/components/VideoReels.tsx apps/web/src/components/PhotoLightbox.tsx apps/web/src/components/PhotoGrid.tsx
git commit -m "feat(web): Compose UI using media-ui-react headless prop-getters"

git add apps/web/src/App.tsx apps/web/src/main.tsx
git commit -m "feat(web): Inject MediaProvider and finalize app layout"

git add skills
git commit -m "docs: Add AI developer skills (wiring-data, using-components)"

git add README.md packages/*/README.md
git commit -m "docs: Write comprehensive architecture READMEs and compliance audit"

git add .
git commit -m "chore: Final polish and dependency resolution"

git push -u origin main --force
