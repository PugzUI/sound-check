import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { vi } from "vitest";
import App from "../App";
import { invoke } from "@tauri-apps/api/core";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

describe("App interactions and analysis flow", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Ensure a clean Tauri flag and clipboard per test
    // @ts-expect-error: jsdom globals
    delete window.__TAURI_INTERNALS__;
    // @ts-expect-error: jsdom globals
    navigator.clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
  });

  it(
    "runs analysis via Tauri, renders metadata states, supports removal and copy",
    async () => {
      const user = userEvent.setup();

    // Pretend we are in a Tauri runtime
    // @ts-expect-error: jsdom globals
    window.__TAURI_INTERNALS__ = {};

    (invoke as unknown as ReturnType<typeof vi.fn>).mockImplementation((cmd: string) => {
      if (cmd === "analyze_audio_files_batch") {
        return Promise.resolve([
          {
            Ok: {
              format: "mp3",
              sample_rate: 44100,
              duration: 125,
              channels: 2,
              bit_depth: 16,
              title: "Title",
              artist: "Artist",
              album: "Album",
            },
          },
          { Err: "boom" },
        ]);
      }
      if (cmd === "select_audio_files") {
        return Promise.resolve([]);
      }
      return Promise.resolve([]);
    });

    render(<App />);

    const dropZone = screen.getByText(/drop audio files here/i);
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [{ path: "C:/music/one.flac" }, { path: "C:/music/two.mp3" }],
      },
    });

    await user.click(screen.getByRole("button", { name: /analyze/i }));

    // Wait for analyze to complete and surface warning (errors present)
    await screen.findByText(/incorrect format detected/i);

    const table = screen.getByRole("table");
    const titleCell = within(table).getByText(/Title\.flac/i);
    expect(titleCell).toBeInTheDocument();
    expect(within(titleCell.closest("tr") as HTMLTableRowElement).getByText("mp3")).toBeInTheDocument();
    expect(
      within(titleCell.closest("tr") as HTMLTableRowElement).getByTitle(/Format mismatch/i),
    ).toBeInTheDocument();

    const errorRow = within(table).getByText(/two\.mp3/i).closest("tr") as HTMLTableRowElement;
    expect(errorRow).toBeTruthy();

    // Remove a row and ensure status updates
    fireEvent.click(within(errorRow).getByTitle(/remove this file/i));
    expect(screen.getByText(/removed two\.mp3 from the queue/i)).toBeInTheDocument();

    // Copy current status to clipboard and let timer reset it
    await user.click(screen.getByRole("button", { name: /copy status message/i }));
      expect(screen.getByText(/status message copied/i)).toBeInTheDocument();
    },
    10000,
  );
});
