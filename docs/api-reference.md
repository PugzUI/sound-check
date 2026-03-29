# API Reference

This document covers runtime contracts between the React app and the Rust backend.
It intentionally excludes architecture, setup, and deployment details.

## Frontend Types (`src/data/mocks.ts`)

```ts
export type AudioMetadata = {
  path: string;
  format: string;
  sample_rate: number;
  duration: number;
  channels: number;
  bit_depth?: number | null;
  codec?: string | null;
  title?: string | null;
  artist?: string | null;
  album?: string | null;
  album_art?: string | null;
};

export type FileItem = {
  path: string;
  name: string;
  status: "pending" | "processing" | "success" | "error";
  metadata?: AudioMetadata;
  error?: string;
};
```

## Frontend Helper Contracts (`src/utils/appHelpers.ts`)

### `hasFormatMismatch(filename, detectedFormat)`
- Input: filename plus detected format string.
- Output: boolean mismatch decision.
- Behavior: extension-aware matching with aliases (for example, `ogg` accepts `vorbis` and `opus`).

### `copyStatusMessage(message, setStatus, clipboard?)`
- Copies text to clipboard.
- On success:
  - sets status to success message.
  - resets status back to `Ready` after 2 seconds.

## Tauri Commands (`src-tauri/src/commands.rs`)

### `analyze_audio_file(path: String) -> Result<AudioMetadata, String>`
- Analyze a single file path.
- Returns normalized metadata on success; string error on failure.

### `analyze_audio_files_batch(paths: Vec<String>) -> Vec<Result<AudioMetadata, String>>`
- Analyze a list of file paths.
- Order of results matches order of input paths.
- Used by the main Analyze flow in the UI.

### `select_audio_files(app: tauri::AppHandle) -> Result<Vec<String>, String>`
- Opens native picker.
- Current filter list in code:
  - `mp3`, `flac`, `wav`, `ogg`, `m4a`, `aac`
- Returns empty array when user cancels.

## Backend Types (`src-tauri/src/audio/analyzer.rs`)

### `AudioMetadata`

```rust
pub struct AudioMetadata {
    pub path: String,
    pub format: String,
    pub sample_rate: u32,
    pub duration: f64,
    pub channels: u8,
    pub bit_depth: Option<u8>,
    pub codec: Option<String>,
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
    pub album_art: Option<String>,
}
```

### `AnalysisError`
- `FileNotFound(String)`
- `IoError(std::io::Error)`
- `UnsupportedFormat`
- `ProbeError(String)`

## Format Normalization Contract

`analyzer.rs` normalizes raw codec/detection labels to lowercase output formats used in the UI.

Examples:
- MPEG variants -> `mp3`
- Vorbis/Opus family -> `ogg` or `opus`
- MP4/AAC family -> `aac` or `alac`
- PCM/WAVE family -> `wav`

## Keyboard/API-Adjacent Behavior (`src/App.tsx`)

- `Ctrl+O` -> triggers `select_audio_files`.
- `Enter`/`F5` -> triggers `analyze_audio_files_batch`.
- `Delete` -> clears queue (frontend only).
- `Ctrl+Shift+Z` -> loads local mock fixtures (frontend only, no backend call).
