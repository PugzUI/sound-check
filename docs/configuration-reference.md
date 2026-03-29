# Configuration Reference

This document lists active configuration files and what each one controls.
It avoids setup and workflow instructions (see `docs/development-guide.md`).

## Project-Level Config

### `package.json`
- App metadata (`name`, `version`, module type).
- bun scripts for dev/build/test/check.
- Frontend and tooling dependencies.

### `tsconfig.json`
- Frontend TypeScript settings (`strict`, `noEmit`, JSX, bundler resolution).
- Includes `src`; excludes test files and Vitest config from normal app typecheck.

### `tsconfig.node.json`
- Node-side TypeScript settings used for tooling/config files.

### `vite.config.ts`
- Dev server port: `1420`.
- HMR port: `1421`.
- Tauri dev host wiring through `TAURI_DEV_HOST`.
- Ignores `src-tauri` from watch.

### `vitest.config.ts`
- `jsdom` test environment.
- Global test APIs enabled.
- Setup file: `src/setupTests.ts`.
- Coverage provider: `v8` with text/lcov/html reports.

### `.editorconfig`
- Baseline formatting (UTF-8, LF, spaces, trim behavior).
- Rust files explicitly use 4-space indentation.

### `.env.example`
- Example env values for local dev.
- Includes `VITE_DEV_PORT=1420` and `VITE_HMR_PORT=1421`.

### `dev.sh`
- Linux helper script for local runtime setup and launching dev flow via D-Bus.

## Tauri / Rust Config

### `src-tauri/Cargo.toml`
- Rust package metadata and dependencies.
- Includes `tauri`, `tauri-plugin-dialog`, `tauri-plugin-opener`, `symphonia`, `rayon`, `tokio`, `thiserror`, `base64`.

### `src-tauri/tauri.conf.json`
- Product metadata (`productName`, `version`, `identifier`).
- Build hooks:
  - `beforeDevCommand`: `bun run dev:web`
  - `beforeBuildCommand`: `bun run build:web`
  - `devUrl`: `http://localhost:1420`
  - `frontendDist`: `../dist`
- Window defaults (900x540 minimum).
- Security CSP currently `null`.
- Bundle active with `targets: "all"`.

### `src-tauri/capabilities/default.json`
- Main window capability declaration.
- Current permissions include:
  - `core:default`
  - `opener:default`
  - `core:window:default`

## VS Code Workspace Files

### `.vscode/tasks.json`
- Predefined tasks for install/dev/test watch.

### `.vscode/launch.json`
- Rust process debug profile.
- Chrome attach profile for renderer debugging.
