# Architecture

## System Overview

Vibe Check is a Tauri desktop app with a React/TypeScript renderer and a Rust backend for audio analysis.
The frontend owns UI state and interactions; the backend owns file I/O, format detection, and metadata extraction.

## Runtime Layers

### Frontend (`src/`)
- `App.tsx`: single-screen UI, queue management, drag/drop, sorting, keyboard shortcuts, status updates.
- `utils/appHelpers.ts`: format mismatch logic and clipboard copy helper.
- `data/mocks.ts`: shared frontend types plus mock fixtures used by the debug shortcut.
- `main.tsx`: React bootstrap.

### Backend (`src-tauri/src/`)
- `commands.rs`: Tauri command boundary (`analyze_audio_file`, `analyze_audio_files_batch`, `select_audio_files`).
- `audio/formats.rs`: magic-byte signatures and `detect_format`.
- `audio/analyzer.rs`: Symphonia probing, metadata extraction, format normalization, batch analysis.
- `lib.rs` / `main.rs`: Tauri app wiring and plugin registration.

## Data Flow

1. User adds files (native picker or drag/drop).
2. Frontend stores queued file paths and statuses.
3. User starts analysis.
4. Frontend invokes `analyze_audio_files_batch`.
5. Backend analyzes each file (parallelized via Rayon) and returns per-file `Ok`/`Err`.
6. Frontend renders metadata, mismatch/error states, and aggregate status.

## Interaction Model

- **Primary actions:** Browse, Analyze, Clear, Remove per row, Copy status message.
- **Keyboard shortcuts:** `Ctrl+O`, `Delete`, `Enter`, `F5`.
- **Debug shortcut:** `Ctrl+Shift+Z` loads mock tracks.
- **Sorting:** each table header cycles asc -> desc -> unsorted.

## Error Model

- Backend returns stringified `AnalysisError` variants (`FileNotFound`, `IoError`, `UnsupportedFormat`, `ProbeError`).
- Frontend marks rows as `error` on decode failure or extension/content mismatch.
- Global status bar communicates operation outcome; no modal dialogs are used.

## Notes On Scope

- This doc covers architecture only.
- Command/type signatures are in `docs/api-reference.md`.
- Audio internals are in `docs/audio-processing.md`.
- Build/config details are in `docs/configuration-reference.md` and `docs/deployment.md`.
