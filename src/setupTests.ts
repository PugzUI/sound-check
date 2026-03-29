import "@testing-library/jest-dom";

// Provide a minimal clipboard mock for tests
if (!globalThis.navigator) {
  (globalThis as any).navigator = {} as Navigator;
}

if (!globalThis.navigator.clipboard) {
  (globalThis.navigator as any).clipboard = {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(""),
  };
}

// Ensure Tauri detection doesn't run in tests
// App checks for this flag to gate Tauri-only flows.
if ((globalThis as any).__TAURI_INTERNALS__ !== undefined) {
  delete (globalThis as any).__TAURI_INTERNALS__;
}

// Mock the Tauri core invoke API to avoid real native calls.
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn().mockResolvedValue([]),
}));

