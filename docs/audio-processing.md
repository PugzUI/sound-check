# Audio Processing

This document covers only audio-analysis internals in the Rust backend.

## Entry Points

- Single file: `analyze_file` in `src-tauri/src/audio/analyzer.rs`
- Batch: `analyze_files_batch` in `src-tauri/src/audio/analyzer.rs`
- Signature detection: `detect_format` in `src-tauri/src/audio/formats.rs`

## Detection Strategy

The analyzer does not trust file extensions. It first reads the file header and applies magic-byte signatures.

Current signatures in `formats.rs`:
- MP3: `FF FB` frame sync at offset `0`
- MP3: `ID3` at offset `0`
- FLAC: `fLaC` at offset `0`
- WAV: `RIFF` at offset `0`
- OGG: `OggS` at offset `0`
- M4A: `ftyp` at offset `4`
- DSF: `DSD ` at offset `0`

## Analysis Pipeline

For each file:
1. Open file and read first 32 bytes.
2. Detect preliminary format from header (`detect_format`).
3. Probe/parse stream with Symphonia.
4. Extract codec parameters (sample rate, channels, bit depth, frame counts when present).
5. Calculate duration:
   - from `n_frames / sample_rate` when available.
   - fallback by decoding packets and summing frames.
6. Extract metadata tags (title, artist, album).
7. Extract first embedded visual and encode as data URL (base64).
8. Normalize output format label.

## Format Normalization

`normalize_format` maps codec/detection labels to stable frontend-facing values.
This avoids inconsistent raw codec naming across files/containers.

Notable mappings include:
- `mpeg` family -> `mp3`
- `vorbis` / `ogg` -> `ogg`
- `opus` -> `opus`
- `aac` / `mp4a` -> `aac`
- `alac` -> `alac`
- `wave` / `pcm` -> `wav`
- plus aliases for `aiff`, `wma`, `wv`, `caf`

## Batch Behavior

`analyze_files_batch` uses Rayon parallel iteration:
- input: `Vec<P>`
- output: `Vec<Result<AudioMetadata, String>>`
- preserves positional order of results relative to input.

## Error Surface

Core error variants (`AnalysisError`):
- `FileNotFound`
- `IoError`
- `UnsupportedFormat`
- `ProbeError`

At command boundaries these are returned as strings to the frontend.

## Tests Present

- `formats.rs`: unit tests for signature detection.
- `analyzer.rs`: nonexistent-file unit test plus optional sample-driven integration-style test (skips when sample directory is absent).
