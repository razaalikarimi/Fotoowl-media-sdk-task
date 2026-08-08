# Headless Media SDK

A framework-agnostic headless SDK and component library for the Pexels API, designed with strict dependency inversion and architectural boundaries.

## Architecture

This monorepo is built using `pnpm` workspaces and is split into the following packages:

### 1. Core (`@media-sdk/media-core`)
- **Responsibility**: Framework-agnostic business logic, API communication, caching, event emission, and error handling.
- **Dependencies**: None (Zero dependencies). Uses native `fetch`.
- **Key Features**: Request deduplication, TTL caching, hierarchical custom errors, API key validation.

### 2. React Wrapper (`@media-sdk/media-react`)
- **Responsibility**: Connects the Core SDK to React's lifecycle.
- **Dependencies**: `@media-sdk/media-core`, `react`.
- **Key Features**: `MediaProvider` for Context-based client injection, custom hooks (`useMediaSearch`, `useMediaItem`, `useMediaEvents`) for declarative data fetching.

### 3. Native Wrapper (`@media-sdk/media-native`)
- **Responsibility**: Connects the Core SDK to React Native.
- **Dependencies**: `@media-sdk/media-core`, `react`.
- **Key Features**: React Native specific context and hooks, avoiding DOM-specific logic.

### 4. React Headless UI (`@media-sdk/media-ui-react`)
- **Responsibility**: Accessible, headless UI logic (prop-getters, state management) for common media components (Grid, Lightbox, Reels).
- **Dependencies**: `react`. (STRICT RULE: **No dependencies** on `media-core` or `media-react`).
- **Key Features**: `IntersectionObserver` infinite scroll, keyboard navigation, focus trapping, aria attributes.

### 5. Native Headless UI (`@media-sdk/media-ui-native`)
- **Responsibility**: React Native equivalent of the headless UI components (using FlatList abstractions).
- **Dependencies**: `react`. (STRICT RULE: **No dependencies** on `media-core` or `media-native`).

### 6. Web App (`apps/web`)
- **Responsibility**: The composition layer. Wires the data from `media-react` into the headless components from `media-ui-react`, and applies consumer-level CSS styling.
- **Dependencies**: `@media-sdk/media-core`, `@media-sdk/media-react`, `@media-sdk/media-ui-react`.

## Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up your API Key:**
   ```bash
   cp .env.example apps/web/.env
   # Add your Pexels API key to apps/web/.env
   ```

3. **Build the SDK packages:**
   ```bash
   pnpm build
   ```

4. **Run the Web Application:**
   ```bash
   pnpm dev
   ```

5. **Run Tests:**
   ```bash
   pnpm test
   ```

## Development & AI Skills

This repository includes custom AI skills (located in `skills/`) to help AI assistants adhere to the architectural constraints:

- `wiring-data`: Rules for using `@media-sdk/media-react` to fetch data.
- `using-components`: Rules for composing data with `@media-sdk/media-ui-react` prop-getters.

## AI Assistance & Skills Usage

As explicitly encouraged by the assignment constraints, this project was developed utilizing Agentic AI workflows. 

### How AI was used:
- **Architecture Enforcement**: The strict separation of concerns (Core -> React Data -> Headless UI -> Visual Composition) was strictly steered by human prompts to ensure the AI did not leak logic across boundaries.
- **Code Generation & Refactoring**: AI was heavily utilized to generate boilerplate, implement the Pexels API fetching, and translate standard React components into Headless Hook patterns (`useMediaGrid`, `useMediaLightbox`).
- **Visual Polish**: The heavy Framer Motion animations and glassmorphism styling in the web app were generated via AI iterators.

### How SKILL docs were tested:
The `SKILL.md` documents (located in `skills/`) were created to provide contextual boundaries for the AI. 
- During the development of the final `apps/web` composition layer, the AI was explicitly pointed to the `wiring-data` and `using-components` skills. 
- These documents successfully steered the AI to correctly extract data using Context/Providers and to map the prop-getters (`getGridProps`, `getItemProps`) into motion components without accidentally re-inventing the data fetching logic inside the UI layer.
