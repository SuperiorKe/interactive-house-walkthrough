# Codex House Build Pack

This package contains the working context for building an interactive 3D walkthrough from the supplied architectural reference.

## Files

- `reference/house-reference-board.jpg` — source reference image
- `docs/ARCHITECTURE.md` — product and architectural reconstruction context
- `docs/CODEX_PROMPTS.md` — sequential prompts for Codex
- `docs/BUILD_STRATEGY.md` — implementation strategy

## Recommended workflow

1. Create/open the actual application repository.
2. Copy `reference/` and `docs/` into that repository.
3. Give Codex **Prompt 1** first.
4. Let Codex inspect and produce its reconstruction notes.
5. Review those notes before asking for Prompt 2.
6. Proceed milestone by milestone.
7. Keep the reference image in the repository throughout development.

The goal is not to generate one impressive render.

The goal is to construct a coherent, editable, walkable digital model of the house.
