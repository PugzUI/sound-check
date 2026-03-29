# Vibe Check - Agent Documentation

## Project Overview

Audio metadata analysis application built with Tauri, React, and TypeScript. A Windows desktop application for analyzing audio file properties (format, sample rate, duration, channels) using content-based detection (magic bytes, not file extensions).

**Key Technologies:**
- Frontend: React 19 + TypeScript + Vite + styled-components
- Backend: Rust with Tauri framework + Symphonia audio library
- State Management: Jotai
- Testing: Vitest (frontend) + Cargo test (Rust)

**Features:**
- File selection with drag & drop support
- Batch processing of multiple audio files
- Metadata extraction (format, sample rate, channels, duration, bit depth)
- Results display in sortable table format
- Dark theme with accent colors (yellow #FFD700, green #00FF7F, red #FF4444)
- Keyboard shortcuts (Ctrl+O, Delete, Enter/F5)

## Project Structure

```
vibe-check/
├── src/                    # React frontend
│   ├── App.tsx
│   ├── main.tsx
│   ├── data/              # Mock data and constants
│   ├── utils/             # Helper functions
│   └── __tests__/         # Frontend tests
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── audio/         # Audio analysis modules
│   │   │   ├── analyzer.rs
│   │   │   ├── formats.rs
│   │   │   └── mod.rs
│   │   ├── commands.rs    # Tauri command handlers
│   │   └── lib.rs
│   └── Cargo.toml
├── docs/                  # Documentation
├── package.json
└── vite.config.ts
```

## Development

### Prerequisites
- Node.js v20 or higher
- Rust toolchain
- Linux dependencies (if applicable):
  ```bash
  # Ubuntu/Debian
  sudo apt install pkg-config libglib2.0-dev libgtk-3-dev libwebkit2gtk-4.1-dev
  # Fedora
  sudo dnf install pkg-config glib2-devel gtk3-devel webkit2gtk4.1-devel
  ```

### Quick Start
```bash
bun install
bun run dev          # Development with hot-reload
```

### Available Scripts
- `bun run dev` - Start Tauri app in development mode
- `bun run dev:web` - Start Vite dev server only (frontend only)
- `bun run build` - Build Tauri application for production
- `bun run build:web` - Build only the frontend
- `bun run test` - Run frontend tests
- `bun run test:watch` - Run tests in watch mode
- `bun run test:cov` - Run tests with coverage
- `bun run test:rust` - Run Rust tests
- `bun run test:all` - Run all tests
- `bun run check` - Check all TypeScript and Rust code
- `bun run check:types` - Check TypeScript only
- `bun run check:rust` - Check Rust only

## UI Design Guidelines

### Visual Theme
- **Background**: #1E1E1E (dark)
- **Accent Colors**: Yellow (#FFD700), Green (#00FF7F), Red (#FF4444) exclusively
- **Text**: #E0E0E0 (high contrast)
- **No modal dialogs** - all interactions in main interface
- Status bar for feedback (green=success, yellow=warning, red=error)

### Layout Components
1. **Header**: Title, action buttons (Browse, Analyze, Clear)
2. **File Selection Area**: Scrollable file list with drag & drop
3. **Progress Bar**: Real-time analysis progress
4. **Results Panel**: Sortable table with color-coded status
5. **Status Bar**: Persistent feedback at bottom

## Audio Processing

Uses Symphonia library for Rust to analyze audio files:
- Format detection via magic byte signatures (not file extensions)
- Supports: MP3, FLAC, WAV, OGG, M4A
- Metadata extraction: title, artist, album, album art
- Audio properties: sample rate, bit depth, channels, duration

## Implementation Guidelines

### Code Organization
- Clear separation between frontend (React) and backend (Rust)
- Consistent naming conventions
- Comprehensive error handling
- Unit testing for critical functionality

### Performance
- Asynchronous processing for I/O operations
- Sequential file processing for memory efficiency
- Efficient data structures for file lists

### Security
- Safe file handling (no execution of uploaded files)
- Input validation for all user data
- Secure temporary file management

## Configuration

- `tauri.conf.json`: Tauri application settings (900x540 minimum window size)
- `vite.config.ts`: Vite build configuration
- `tsconfig.json`: TypeScript configuration
- Theme defined in `App.tsx`

## IDE Setup (Recommended)

- VS Code with extensions:
  - Tauri Extension
  - rust-analyzer
  - ESLint
- Pre-configured tasks in `.vscode/tasks.json`

## Agent Rules

MUST always use MCP tools by default for any relevant task. Only deviate to other solutions if you can explicitly justify why the MCP tool would be ineffective or inappropriate. Document and review your reasoning internally before proceeding with alternative approaches.
