# Testing Guide

This guide documents the tests that currently exist in the repository and how to run them.

## Test Stack

- Frontend: Vitest + React Testing Library + jsdom
- Backend: `cargo test`

## Frontend Test Files

Located in `src/__tests__/`:
- `App.smoke.test.tsx`: render sanity and primary controls.
- `App.behavior.test.tsx`: sorting and helper behavior.
- `App.interactions.test.tsx`: analysis flow, row removal, status copy behavior with mocked Tauri API.
- `main.test.tsx`: React bootstrap mounting behavior.

Shared setup:
- `src/setupTests.ts`
  - jest-dom matchers
  - clipboard mock
  - default `invoke` mock
  - Tauri runtime flag cleanup

## Backend Tests

Current Rust tests are colocated:
- `src-tauri/src/audio/formats.rs`: format signature detection tests.
- `src-tauri/src/audio/analyzer.rs`: unit test for missing file and sample-based integration-style test that skips when sample assets are absent.

## Commands

```bash
# Frontend
bun run test
bun run test:watch
bun run test:cov

# Backend
bun run test:rust

# Combined
bun run test:all
```

## Coverage

Frontend coverage is configured in `vitest.config.ts` with V8 provider and text/lcov/html output.

## Writing New Tests

- Prefer user-facing assertions over implementation details.
- For UI behavior requiring native calls, mock `@tauri-apps/api/core` `invoke`.
- Keep helper/unit tests close to behavior they validate.
- For Rust, add unit tests near logic (`#[cfg(test)]`) unless cross-module integration requires a separate test target.
