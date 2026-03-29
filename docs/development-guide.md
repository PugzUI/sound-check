# Development Guide

This guide covers local setup and day-to-day development workflow.
It does not duplicate API, architecture, or deployment internals.

## Prerequisites

- Node.js `v20+`
- Rust stable toolchain
- System dependencies required by Tauri on your OS

Linux packages noted in project docs/rules:
- Ubuntu/Debian: `pkg-config libglib2.0-dev libgtk-3-dev libwebkit2gtk-4.1-dev`
- Fedora: `pkg-config glib2-devel gtk3-devel webkit2gtk4.1-devel`

## First-Time Setup

```bash
bun install
bun run check
```

## Core Commands

```bash
# Full Tauri app (frontend + Rust backend)
bun run dev

# Frontend only (no native Tauri command runtime)
bun run dev:web

# Frontend tests
bun run test

# Rust tests
bun run test:rust

# All tests
bun run test:all

# Type/Rust checks
bun run check

# Production bundle
bun run build
```

## Repository Areas

- `src/`: React app (UI, helpers, tests).
- `src-tauri/src/`: Rust commands + audio analysis modules.
- `docs/`: project documentation.

## Typical Change Workflow

1. Start `bun run dev`.
2. Make frontend and/or Rust changes.
3. Run targeted tests.
4. Run `bun run check`.
5. Run `bun run test:all` before merging larger changes.

## UI Development Notes

- Main app UI lives in `src/App.tsx`.
- Theme and global CSS variables are defined in that file.
- Status messaging and mismatch logic live in `src/utils/appHelpers.ts`.
- `Ctrl+Shift+Z` loads mock fixtures from `src/data/mocks.ts` for fast UI checks.

## Backend Development Notes

- Add/adjust Tauri commands in `src-tauri/src/commands.rs`.
- Audio logic lives in `src-tauri/src/audio/analyzer.rs`.
- Header signatures are in `src-tauri/src/audio/formats.rs`.
- If you add formats, update both signature detection and picker filters.

## Debugging Tips

- Frontend logs: browser devtools console in the webview.
- Rust logs/errors: run from terminal with `bun run dev`.
- Full Rust backtraces:

```bash
RUST_BACKTRACE=1 bun run dev
```

## Related Docs

- Architecture: `docs/architecture.md`
- Runtime contracts: `docs/api-reference.md`
- Testing details: `docs/testing-guide.md`
- Config files: `docs/configuration-reference.md`
