# Repository Guidelines

## Project Structure & Module Organization

This is a Vite, React, TypeScript, and React Three Fiber architectural walkthrough. Keep application setup in `src/app/`, reusable UI in `src/components/`, and scene rendering in `src/scene/`. The authoritative house data lives in `src/architecture/`: update `schema.ts`, `dimensions.ts`, and `house.ts` before changing geometry renderers. Player movement and collision logic belong in `src/navigation/`. Keep reference material in `reference/` and design decisions, assumptions, and implementation notes in `docs/`.

## Build, Test, and Development Commands

- `npm install` installs the project dependencies.
- `npm run dev` starts the Vite development server.
- `npm run build` runs TypeScript checks and creates the production bundle; run it before handing off changes.
- `npm run preview` serves the built bundle for a production-style local check.

There is no separate automated test runner currently. Use the debug/inspector controls in the app and validate the documented walkthrough route manually after architectural or navigation changes.

## Coding Style & Naming Conventions

Use TypeScript, two-space indentation, semicolons, and double quotes, matching the existing source. Name React components and exported types in `PascalCase` (`HouseScene`, `HouseSpec`); use `camelCase` for functions, values, and data fields. Name component files in `PascalCase` and supporting modules in descriptive lower camel-case or existing folder conventions.

Do not scatter architectural measurements through meshes or collision code. Extend the centralized house specification and derive rendering, collision volumes, and route checks from it. Prefer clear named dimensions over unexplained numeric literals.

## Architectural Changes and Validation

Preserve the reference-led, data-driven model. When an uncertain design choice is necessary, record it in `docs/ASSUMPTIONS.md`; record meaningful technical choices in the relevant documentation. Keep floors vertically aligned, stairs continuous, and exterior openings consistent with the house spec. Avoid furniture and visual polish unless the task explicitly includes them.

For navigation changes, manually check the intended route: front gate, driveway, entrance, ground floor, stairs, upper floors, balcony/backyard. Confirm walls stop movement, floors support the player, and all exterior viewpoints remain inspectable.

## Commits and Pull Requests

No readable commit history is available to establish a repository convention. Use concise, imperative messages such as `feat(navigation): add stair collision volumes` or `fix(architecture): align upper floor slab`. Keep each commit focused. Pull requests should explain the architectural impact, list validation performed, link relevant issues, and include screenshots or a short recording for visible 3D changes.
