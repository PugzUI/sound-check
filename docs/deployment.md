# Deployment Guide

This guide covers packaging and release preparation.
For local coding workflow, see `docs/development-guide.md`.

## Build Commands

```bash
# Full production build (frontend + Tauri bundle)
bun run build

# Frontend-only build output
bun run build:web
```

Equivalent direct Tauri command:

```bash
cd src-tauri
cargo tauri build
```

## Build Outputs

- Frontend assets: `dist/`
- Tauri bundles: `src-tauri/target/release/bundle/`

Bundle targets are controlled by `src-tauri/tauri.conf.json`.
Current config uses `bundle.targets: "all"`.

## Versioning

Keep version fields aligned in:
- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`

## Release Checklist

1. Run `bun run check`.
2. Run `bun run test:all`.
3. Build with `bun run build`.
4. Validate generated installers/bundles on target OS.
5. Publish artifacts and release notes.

## Signing / Distribution Notes

Code signing and store-specific workflows are environment-dependent and not hardcoded in this repo.
If you add signing, configure it under Tauri bundle settings in `src-tauri/tauri.conf.json` and document any required CI secrets outside source control.
