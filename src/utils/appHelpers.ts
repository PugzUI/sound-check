import type React from "react";

export type StatusTone = "info" | "success" | "warning" | "error";
export type StatusState = { tone: StatusTone; message: string };

const formatMap: Record<string, string[]> = {
  mp3: ["mp3", "mpeg"],
  flac: ["flac"],
  wav: ["wav", "wave", "pcm"],
  aiff: ["aiff", "aif", "aifc"],
  ogg: ["ogg", "vorbis", "opus"],
  opus: ["opus", "ogg"],
  m4a: ["m4a", "aac", "mp4", "alac"],
  aac: ["aac", "m4a", "mp4"],
  alac: ["alac", "m4a", "mp4", "aac"],
  wma: ["wma", "asf"],
  wv: ["wv", "wavpack"],
  caf: ["caf", "pcm"],
  lossless: ["flac", "wav", "wave", "pcm", "aiff", "alac", "wv"],
};

export const hasFormatMismatch = (filename: string, detectedFormat: string | undefined): boolean => {
  if (!detectedFormat) return false;
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const format = detectedFormat.toLowerCase();

  const expectedFormats = formatMap[ext];
  if (!expectedFormats) return false;

  return !expectedFormats.some((f) => format.includes(f));
};

export const copyStatusMessage = async (
  message: string,
  setStatus: React.Dispatch<React.SetStateAction<StatusState>>,
  clipboard: Pick<Clipboard, "writeText"> | undefined = typeof navigator !== "undefined" ? navigator.clipboard : undefined,
) => {
  try {
    if (!clipboard?.writeText) throw new Error("Clipboard API unavailable");
    await clipboard.writeText(message);
    setStatus({
      tone: "success",
      message: "Status message copied to clipboard!",
    });
    setTimeout(() => {
      setStatus({
        tone: "info",
        message: "Ready",
      });
    }, 2000);
  } catch (error) {
    console.error("Failed to copy:", error);
  }
};
