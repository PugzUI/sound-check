# Troubleshooting

Quick fixes for common runtime and development issues.

## Runtime Issues

### "Analysis requires Tauri environment"
Cause: app is running as plain web app (`bun run dev:web`) so native commands are unavailable.

Fix:
- Run `bun run dev` for full Tauri runtime.

### File row shows error after analysis
Common causes:
- unsupported/corrupt file
- file path no longer valid
- extension/content mismatch flagged as error in UI

Fix:
- verify file exists and opens in a media player
- re-add file from current path
- check detected format column and mismatch tooltip

### Drag/drop not adding paths
Cause:
- browser-only environment can return names without native file paths.

Fix:
- prefer Browse button in non-Tauri environments.
- use full Tauri app for native drag/drop paths.

## Development Issues

### `Gdk-Message: ... Error 71 (Protocol error) dispatching to Wayland display`

Cause: WebKitGTK / GTK on **Wayland** hit a compositor or GPU path that breaks the protocol (common on Hyprland, nested sessions, or certain drivers).

Try one of these, in order:

1. **Force X11 (XWayland)** — usually the fastest fix on Linux:

   ```bash
   bun run dev:x11
   ```

   Equivalent: `GDK_BACKEND=x11 bun run dev`.

2. **Disable WebKit dmabuf renderer** (GPU-related Wayland bugs):

   ```bash
   bun run dev:webkit-wayland
   ```

3. **Combine both** if a single flag is not enough:

   ```bash
   env GDK_BACKEND=x11 WEBKIT_DISABLE_DMABUF_RENDERER=1 bun run dev
   ```

4. Run `bun run dev` from a normal terminal on the same machine (not SSH without forwarding, not a broken `WAYLAND_DISPLAY`).

### Dev port already in use (`1420` or `1421`)

```bash
lsof -ti:1420,1421 | xargs -r kill
```

### Type check failures

```bash
bun run check:types
```

Then fix reported TypeScript errors in `src/`.

### Rust check/test failures

```bash
bun run check:rust
bun run test:rust
```

If diagnostics are unclear:

```bash
cd src-tauri
RUST_BACKTRACE=1 cargo test -- --nocapture
```

### Frontend tests failing around native APIs
Cause: missing/misconfigured mocks for `@tauri-apps/api/core` or clipboard.

Fix:
- review `src/setupTests.ts`
- ensure tests that override mocks reset them per test.
