import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import App, { copyStatusMessage, hasFormatMismatch } from "../App";

describe("App behavior", () => {
  it("sorts tracks by name when header is toggled", async () => {
    render(<App />);
    const user = userEvent.setup();

    const dropZone = screen.getByText(/drop audio files here or click to browse/i);

    const fileB = new File([""], "b-track.flac");
    const fileA = new File([""], "a-track.mp3");

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [fileB, fileA],
      },
    });

    // Initial order is insertion order: b then a
    const getTrackNames = () =>
      within(screen.getByRole("table")).getAllByRole("row").slice(1).map((row) => within(row).getByText(/track/i).textContent);

    expect(getTrackNames()).toEqual(["b-track.flac", "a-track.mp3"]);

    // Sort ascending
    await user.click(screen.getByRole("columnheader", { name: /track/i }));
    expect(getTrackNames()).toEqual(["a-track.mp3", "b-track.flac"]);

    // Sort descending
    await user.click(screen.getByRole("columnheader", { name: /track/i }));
    expect(getTrackNames()).toEqual(["b-track.flac", "a-track.mp3"]);
  });

  it("copies status message helper triggers clipboard and status updates", async () => {
    vi.useFakeTimers();
    const setStatus = vi.fn();
    const clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };

    await copyStatusMessage("Hello", setStatus as any, clipboard);

    expect(clipboard.writeText).toHaveBeenCalledWith("Hello");
    expect(setStatus).toHaveBeenCalledWith({
      tone: "success",
      message: "Status message copied to clipboard!",
    });

    vi.runAllTimers();

    expect(setStatus).toHaveBeenCalledWith({
      tone: "info",
      message: "Ready",
    });
    vi.useRealTimers();
  });
});

describe("format mismatch logic", () => {
  it("detects mismatch between filename and detected format", () => {
    expect(hasFormatMismatch("track.flac", "mp3")).toBe(true);
    expect(hasFormatMismatch("song.mp3", "mpeg")).toBe(false);
    expect(hasFormatMismatch("audio.wav", "pcm")).toBe(false);
  });

  it("accepts broader mappings across container/codec variants", () => {
    // OGG family
    expect(hasFormatMismatch("loop.ogg", "vorbis")).toBe(false);
    expect(hasFormatMismatch("voice.opus", "opus")).toBe(false);
    expect(hasFormatMismatch("voice.ogg", "opus")).toBe(false);

    // AAC/ALAC containers
    expect(hasFormatMismatch("tune.m4a", "aac")).toBe(false);
    expect(hasFormatMismatch("hires.m4a", "alac")).toBe(false);
    expect(hasFormatMismatch("hires.alac", "aac")).toBe(false);

    // AIFF
    expect(hasFormatMismatch("sample.aiff", "aiff")).toBe(false);
    expect(hasFormatMismatch("sample.aifc", "pcm")).toBe(false);

    // WMA
    expect(hasFormatMismatch("track.wma", "asf")).toBe(false);

    // WavPack
    expect(hasFormatMismatch("archive.wv", "wavpack")).toBe(false);

    // CAF
    expect(hasFormatMismatch("fx.caf", "pcm")).toBe(false);
  });
});
