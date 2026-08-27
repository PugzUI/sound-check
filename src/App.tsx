import React, { useCallback, useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import styled, {
  ThemeProvider,
  createGlobalStyle,
  keyframes,
  css,
  type DefaultTheme,
} from "styled-components";
import "./App.css";

import { MOCK_FILES, type FileItem, type AudioMetadata } from "./data/mocks";
import { copyStatusMessage, hasFormatMismatch, type StatusState, type StatusTone } from "./utils/appHelpers";

type SortKey = "name" | "format" | "sample_rate" | "duration" | "channels" | "bit_depth" | "status";

const theme: DefaultTheme = {
  colors: {
    background: "#121212",
    surface: "#1E1E1E",
    surfaceAlt: "#141414",
    border: "#2A2A2A",
    text: "#cfcfcf",
    muted: "#777777",
    yellow: "#FFD700",
    green: "#4CAF50",
    red: "#FF5252",
  },
};

const GlobalStyles = createGlobalStyle`
  :root {
    --bg: ${theme.colors.background};
    --surface: ${theme.colors.surface};
    --surface-alt: ${theme.colors.surfaceAlt};
    --border-color: ${theme.colors.border};
    --text: ${theme.colors.text};
    --muted: ${theme.colors.muted};
    --accent-yellow: ${theme.colors.yellow};
    --accent-green: ${theme.colors.green};
    --accent-red: ${theme.colors.red};
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: "Inter", system-ui, -apple-system, sans-serif;
    line-height: 1.4;
    font-size: 14px;
  }

  ::selection {
    background: var(--accent-yellow);
    color: #0A0A0A;
  }

  /* Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--surface);
  }

  ::-webkit-scrollbar-corner {
    background: var(--surface);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
    border: 1px solid var(--surface);
    box-shadow: inset 0 0 0 1px var(--surface);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--accent-yellow);
    box-shadow: inset 0 0 0 1px var(--surface);
  }
`;

const Shell = styled.div`
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: ${(p) => p.theme.colors.background};
  color: ${(p) => p.theme.colors.text};
  min-width: 700px;
  min-height: 420px;
`;

const Header = styled.header`
  padding: 10px;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: ${(p) => p.theme.colors.surface};
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  min-height: 30px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 22px;
  font-weight: 400;
  letter-spacing: 0.05em;
  color: ${(p) => p.theme.colors.text};
  font-family: 'Audiowide', cursive;
  background: linear-gradient(135deg, #FFD700 0%, #FF5252 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(255, 82, 82, 0.2);
  padding-left: 8px;
`;

const Actions = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  padding-right: 10px;
`;



const Button = styled.button<{
  $tone?: "green" | "yellow" | "red" | "neutral";
}>`
  padding: 6px 16px;
  font-size: 13px;
  border-radius: 6px;
  border: 1px solid
    ${(p) =>
    p.$tone === "green"
      ? p.theme.colors.green
      : p.$tone === "yellow"
        ? p.theme.colors.yellow
        : p.$tone === "red"
          ? p.theme.colors.red
          : p.theme.colors.border};
  background: ${(p) =>
    p.$tone === "green"
      ? `${p.theme.colors.green}22`
      : p.$tone === "yellow"
        ? `${p.theme.colors.yellow}22`
        : p.$tone === "red"
          ? `${p.theme.colors.red}22`
          : p.theme.colors.surface};
  color: ${(p) => p.theme.colors.text};
  font-weight: 500;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: all 0.15s ease;
  min-width: 100px;

  &:hover {
    box-shadow: 0 0 0 1px
      ${(p) =>
    p.$tone === "green"
      ? `${p.theme.colors.green}99`
      : p.$tone === "yellow"
        ? `${p.theme.colors.yellow}99`
        : p.$tone === "red"
          ? `${p.theme.colors.red}99`
          : `${p.theme.colors.border}99`};
    transform: none;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Content = styled.main`
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  overflow: hidden;
`;

const Panel = styled.section`
  position: relative;
  background: ${(p) => p.theme.colors.surface};
  background-image:
    linear-gradient(
      90deg,
      rgba(255, 215, 0, 0.02) 0,
      rgba(255, 215, 0, 0.02) 1px,
      transparent 1px
    ),
    linear-gradient(
      0deg,
      rgba(255, 215, 0, 0.02) 0,
      rgba(255, 215, 0, 0.02) 1px,
      transparent 1px
    );
  background-size: 12px 12px, 12px 12px;
  background-blend-mode: soft-light;
  border: 1px solid ${(p) => p.theme.colors.border};
  box-shadow: inset 0 0 0 1px ${(p) => `${p.theme.colors.yellow}22`};
  border-radius: 6px;
  padding: 6px 6px 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 0;
  flex: 1;
`;

const IndicatorLed = styled.span<{ $tone: "amber" | "green" | "red"; $pulse?: boolean }>`
  position: relative;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: ${(p) =>
    p.$tone === "amber"
      ? `${p.theme.colors.yellow}d0`
      : p.$tone === "red"
        ? `${p.theme.colors.red}d0`
        : `${p.theme.colors.green}d0`};
  color: ${(p) =>
    p.$tone === "amber"
      ? `${p.theme.colors.yellow}70`
      : p.$tone === "red"
        ? `${p.theme.colors.red}70`
        : `${p.theme.colors.green}70`};
  box-shadow:
    inset 0 -1px 1px rgba(0, 0, 0, 0.45),
    inset 0 1px 1px rgba(255, 255, 255, 0.14),
    0 0 1px
      ${(p) =>
    p.$tone === "amber"
      ? `${p.theme.colors.yellow}55`
      : p.$tone === "red"
        ? `${p.theme.colors.red}55`
        : `${p.theme.colors.green}55`};
  border: 1px solid ${(p) => `${p.theme.colors.border}e0`};
  flex-shrink: 0;
  animation: ${(p) => (p.$pulse ? css`${ledPulse} 2.6s ease-in-out infinite` : "none")};

  &::after {
    content: "";
    position: absolute;
    inset: 0.5px 1px 1px 0.5px;
    border-radius: 50%;
    background: radial-gradient(circle at 40% 30%, #ffffff55 0%, #ffffff11 50%, transparent 60%);
    opacity: 0.9;
    pointer-events: none;
  }
`;

const ledPulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow:
      inset 0 -1px 2px rgba(0, 0, 0, 0.35),
      0 0 5px currentColor,
      0 1px 2px rgba(0, 0, 0, 0.35);
  }
  50% {
    transform: scale(1.08);
    box-shadow:
      inset 0 -1px 2px rgba(0, 0, 0, 0.35),
      0 0 8px currentColor,
      0 2px 3px rgba(0, 0, 0, 0.4);
  }
  100% {
    transform: scale(1);
    box-shadow:
      inset 0 -1px 2px rgba(0, 0, 0, 0.35),
      0 0 5px currentColor,
      0 1px 2px rgba(0, 0, 0, 0.35);
  }
`;

const pulseGlow = keyframes`
  0% {
    box-shadow: 0 0 0 1px rgba(255, 215, 0, 0.16);
  }
  50% {
    box-shadow: 0 0 0 1px rgba(255, 215, 0, 0.44);
  }
  100% {
    box-shadow: 0 0 0 1px rgba(255, 215, 0, 0.16);
  }
`;

const DropZone = styled.div<{ $active: boolean; $pulse?: boolean }>`
  border: 1px dashed ${(p) => (p.$active ? p.theme.colors.yellow : p.theme.colors.border)};
  background: ${(p) =>
    p.$active ? `${p.theme.colors.yellow}11` : p.$pulse ? `${p.theme.colors.yellow}08` : ""};
  color: ${(p) => p.theme.colors.muted};
  padding: 10px 10px 10px;
  border-radius: 6px;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 13px;
  box-shadow: ${(p) => (p.$pulse ? `0 0 0 1px rgba(255, 215, 0, 0.16)` : "none")};
  animation: ${(p) =>
    p.$pulse
      ? css`
          ${pulseGlow} 6s ease-in-out infinite
        `
      : "none"};

  &:hover {
    border-color: ${(p) => `${p.theme.colors.yellow}cc`};
    color: ${(p) => p.theme.colors.text};
    box-shadow: ${(p) =>
    p.$pulse ? `0 0 0 1px rgba(255, 215, 0, 0.44)` : `0 0 0 1px ${p.theme.colors.yellow}55`};
  }
`;

const TableWrap = styled.div<{ $hasRows: boolean }>`
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 6px;
  overflow: auto;
  background: ${(p) => p.theme.colors.surfaceAlt};
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  scrollbar-gutter: ${(p) => (p.$hasRows ? "stable" : "auto")};
  position: relative;

  &::after {
    content: "";
    position: absolute;
    width: 8px;
    height: 8px;
    background: ${(p) => `${p.theme.colors.surface}cc`};
    border: 1px solid ${(p) => `${p.theme.colors.border}cc`};
    border-radius: 2px;
    box-shadow:
      calc(100% - 8px) 0 0 0 ${(p) => `${p.theme.colors.surface}cc`},
      0 calc(100% - 8px) 0 0 ${(p) => `${p.theme.colors.surface}cc`},
      calc(100% - 8px) calc(100% - 8px) 0 0 ${(p) => `${p.theme.colors.surface}cc`};
    pointer-events: none;
  }
`;

const StatusIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  letter-spacing: 0.2px;
  color: ${(p) => p.theme.colors.text};
`;

const StyledTable = styled.table`
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  min-width: 520px;

  /* Column width definitions */
  --col-track: 128px;
  --col-format: 92px;
  --col-sample-rate: 92px;
  --col-bit-depth: 102px;
  --col-channels: 82px;
  --col-duration: 92px;
  --col-actions: 84px;

  /* Responsive column widths */
  @media (max-width: 900px) {
    --col-track: 118px;
    --col-format: 86px;
    --col-sample-rate: 86px;
    --col-bit-depth: 96px;
    --col-channels: 76px;
    --col-duration: 86px;
    --col-actions: 78px;
  }

  @media (max-width: 700px) {
    --col-track: 104px;
    --col-format: 74px;
    --col-sample-rate: 74px;
    --col-bit-depth: 84px;
    --col-channels: 64px;
    --col-duration: 74px;
    --col-actions: 72px;
  }

  thead {
    background: ${(p) => p.theme.colors.surface};
    position: sticky;
    top: 0;
    z-index: 1;
  }

  th,
  td {
    padding: 5px 6px;
    border-bottom: 1px solid ${(p) => p.theme.colors.border};
    font-size: 12px;
    white-space: nowrap;
    vertical-align: middle;
    min-height: 26px;
    line-height: 1.2;
  }

  /* Apply column widths */
  th:nth-child(1), td:nth-child(1) { width: var(--col-track); min-width: 102px; text-align: left; }
  th:nth-child(2), td:nth-child(2) { width: var(--col-format); text-align: center; }
  th:nth-child(3), td:nth-child(3) { width: var(--col-sample-rate); text-align: center; }
  th:nth-child(4), td:nth-child(4) { width: var(--col-bit-depth); text-align: center; }
  th:nth-child(5), td:nth-child(5) { width: var(--col-channels); text-align: center; }
  th:nth-child(6), td:nth-child(6) { width: var(--col-duration); text-align: center; }
  th:nth-child(7), td:nth-child(7) { width: var(--col-actions); text-align: right; padding: 0 8px 0 4px; }

  th {
    font-size: 11px;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: ${(p) => p.theme.colors.muted};
    cursor: pointer;
    padding-top: 8px;
    padding-bottom: 8px;
    text-align: center;
  }

  tbody tr:not(.empty):hover {
    background: ${(p) => `${p.theme.colors.yellow}0b`};
  }

  tbody tr:hover .remove-btn {
    opacity: 1;
    pointer-events: auto;
  }

  tbody tr.empty td {
    text-align: center;
    color: ${(p) => p.theme.colors.muted};
    font-weight: 500;
    padding: 11px 6px;
  }
`;

const HeaderContent = styled.div<{ $center?: boolean; $offsetX?: number; $offsetY?: number; $align?: "flex-start" | "center" | "flex-end" }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: ${(p) => p.$align ?? (p.$center ? "center" : "center")};
  transform: ${(p) => {
    const x = p.$offsetX ?? 0;
    const y = p.$offsetY ?? 0;
    return x || y ? `translate(${x}px, ${y}px)` : "none";
  }};
  width: 100%;
  padding: 0 10px;
  white-space: nowrap;
  text-align: ${(p) =>
    p.$align === "flex-start"
      ? "left"
      : p.$align === "flex-end"
        ? "right"
        : "center"};
`;

const TrackCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const TrackInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
`;


const StatusDot = styled.span<{ $tone: StatusTone }>`
  position: relative;
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 100%;
  background: ${(p) =>
    p.$tone === "success"
      ? p.theme.colors.green
      : p.$tone === "warning"
        ? p.theme.colors.yellow
        : p.$tone === "error"
          ? p.theme.colors.red
          : p.theme.colors.muted};
  box-shadow:
    inset 0 -1px 1px rgba(0, 0, 0, 0.35),
    inset 0 1px 1px rgba(255, 255, 255, 0.12);
  border: 1px solid ${(p) => `${p.theme.colors.border}e0`};
  vertical-align: middle;
  flex-shrink: 0;

  &::after {
    content: "";
    position: absolute;
    inset: 0.5px 1px 1px 0.5px;
    border-radius: 50%;
    background: radial-gradient(circle at 40% 30%, #ffffff55 0%, #ffffff11 50%, transparent 60%);
    opacity: 0.9;
    pointer-events: none;
  }
`;

const TrackTitle = styled.span`
  font-weight: 600;
  color: ${(p) => p.theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 10px;
  min-width: 0;
`;

const TrackArtist = styled.span`
  font-size: 10px;
  color: ${(p) => p.theme.colors.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RemoveButton = styled.button.attrs({ className: 'remove-btn' })`
  border: none;
  background: transparent;
  color: ${(p) => p.theme.colors.muted};
  cursor: pointer;
  font-size: 16px;
  padding: 0px 6px;
  border-radius: 6px;
  transition: all 0.12s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  opacity: 0;
  pointer-events: none;

  &:hover {
    color: ${(p) => p.theme.colors.red};
    background: ${(p) => `${p.theme.colors.red}12`};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const FormatCell = styled.span<{ $mismatch?: boolean }>`
  color: ${(p) => (p.$mismatch ? p.theme.colors.red : "inherit")};
  font-weight: ${(p) => (p.$mismatch ? 600 : "inherit")};
  font-size: 10px;
`;

const StatusBar = styled.footer<{ $tone: StatusTone }>`
  margin: 0 10px 10px;
  border-radius: 6px;
  padding: 4px 12px;
  border: 1px solid ${(p) => `${p.theme.colors.border}aa`};
  background: ${(p) => `${p.theme.colors.surface}f6`};
  color: ${(p) => p.theme.colors.muted};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-weight: 500;
`;

const CopyButton = styled.button`
  border: none;
  background: transparent;
  color: ${(p) => p.theme.colors.muted};
  cursor: pointer;
  font-size: 16px;
  padding: 6px 8px;
  border-radius: 6px;
  transition: all 0.12s ease;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    color: ${(p) => p.theme.colors.yellow};
    background: ${(p) => `${p.theme.colors.yellow}12`};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const SortIcon = styled.span<{ $active: boolean; $direction: "asc" | "desc"; $left?: boolean }>`
  position: ${(p) => (p.$left ? "static" : "absolute")};
  right: ${(p) => (p.$left ? "auto" : "4px")};
  top: ${(p) => (p.$left ? "auto" : "50%")};
  transform: ${(p) =>
    p.$left
      ? p.$active && p.$direction === "desc"
        ? "rotate(180deg)"
        : "none"
      : `translateY(-50%) rotate(${p.$active && p.$direction === "desc" ? "180deg" : "0deg"})`};
  font-size: 9px;
  transition: all 0.2s ease;
  color: ${(p) => (p.$active ? p.theme.colors.yellow : "transparent")};
  text-shadow: ${(p) => (p.$active ? `0 0 8px ${p.theme.colors.yellow}` : "none")};
  opacity: ${(p) => (p.$active ? 1 : 0)};
  margin-right: ${(p) => (p.$left ? "6px" : "0")};
`;

const formatDuration = (seconds: number) => {
  if (!seconds || Number.isNaN(seconds)) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
};

const formatSampleRate = (rate: number) =>
  rate ? `${(rate / 1000).toFixed(1)} kHz` : "-";

const formatBitDepth = (bits: number | null | undefined, format?: string | null) => {
  if (bits) return `${bits}-bit`;
  if (format) {
    const f = format.toLowerCase();
    if (f.includes("mp3") || f.includes("aac") || f.includes("m4a") || f.includes("vorbis") || f.includes("ogg")) {
      return "Lossy";
    }
  }
  return "-";
};

const formatChannels = (channels: number) => {
  if (!channels) return "-";
  if (channels === 1) return "Mono";
  if (channels === 2) return "Stereo";
  return `${channels} ch`;
};

const deriveName = (path: string) => {
  const segments = path.split(/[/\\]/);
  return segments[segments.length - 1] || path;
};

const cleanFileName = (filename: string): string =>
  filename
    .replace(/^\d{1,3}\s*[\-–.:]\s*/i, "")
    .replace(/^track\s+\d{1,3}\s*[\-–.:]\s*/i, "")
    .replace(/^\d{1,3}\.\s*/, "")
    .trim();

function App() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<StatusState>({
    tone: "info",
    message: "Ready",
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey | null; direction: "asc" | "desc" }>(
    { key: null, direction: "asc" },
  );


  const isTauri = () => {
    return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
  };

  const addFiles = useCallback((paths: string[]) => {
    const unique = paths.filter(Boolean);
    if (!unique.length) return;

    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.path));
      const additions = unique
        .filter((p) => !existing.has(p))
        .map<FileItem>((p) => ({
          path: p,
          name: deriveName(p),
          status: "pending",
        }));

      if (!additions.length) {
        setStatus({
          tone: "warning",
          message: "All dropped files were already in the list.",
        });
        return prev;
      }

      setStatus({
        tone: "success",
        message: `Added ${additions.length} file${additions.length === 1 ? "" : "s"} to the queue.`,
      });
      return [...prev, ...additions];
    });
  }, []);

  const handleBrowse = useCallback(async () => {
    if (!isTauri()) {
      setStatus({
        tone: "warning",
        message: "Tauri API not available. Run 'bun run tauri dev'.",
      });
      return;
    }
    try {
      const picked = await invoke<string[]>("select_audio_files");
      addFiles(picked);
    } catch (error) {
      setStatus({
        tone: "error",
        message: `File picker failed: ${error}`,
      });
    }
  }, [addFiles]);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragActive(false);
      const droppedPaths = Array.from(event.dataTransfer.files)
        .map((file) => (file as unknown as { path?: string }).path || file.name)
        .filter(Boolean);
      addFiles(droppedPaths);
    },
    [addFiles],
  );

  useEffect(() => {
    if (!isTauri()) return;

    let unlisten: (() => void) | undefined;

    (async () => {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        unlisten = await getCurrentWindow().onDragDropEvent(({ payload }) => {
          if (payload.type === "enter" || payload.type === "over") {
            setDragActive(true);
            return;
          }

          if (payload.type === "drop") {
            setDragActive(false);
            addFiles(payload.paths);
            return;
          }

          if (payload.type === "leave") {
            setDragActive(false);
          }
        });
      } catch (error) {
        console.error("Failed to register native drag/drop listener", error);
      }
    })();

    return () => {
      unlisten?.();
    };
  }, [addFiles]);

  const handleClear = useCallback(() => {
    setFiles([]);
    setStatus({ tone: "info", message: "Selection cleared." });
  }, []);

  const analyze = useCallback(async () => {
    if (isAnalyzing) return;

    if (!isTauri()) {
      setStatus({
        tone: "warning",
        message: "Analysis requires Tauri environment.",
      });
      return;
    }

    if (!files.length) {
      setStatus({
        tone: "warning",
        message: "Add at least one audio file to analyze.",
      });
      return;
    }

    setIsAnalyzing(true);
    setStatus({
      tone: "info",
      message: `Analyzing ${files.length} file${files.length === 1 ? "" : "s"}...`,
    });

    setFiles((prev) =>
      prev.map((item) => ({ ...item, status: "processing", error: undefined, metadata: undefined }))
    );

    try {
      const paths = files.map((f) => f.path);
      const results = await invoke<Array<{ Ok?: AudioMetadata; Err?: string }>>(
        "analyze_audio_files_batch",
        { paths }
      );

      let errorCount = 0;
      let successCount = 0;

      const updatedFiles = files.map<FileItem>((item, index) => {
        const result = results[index];
        if (result?.Ok) {
          const mismatch = hasFormatMismatch(item.name, result.Ok.format);
          if (mismatch) {
            errorCount++;
          } else {
            successCount++;
          }
          return {
            ...item,
            status: mismatch ? "error" : "success",
            metadata: result.Ok,
            error: mismatch
              ? `Format mismatch: file is .${item.name.split(".").pop()} but detected as ${result.Ok.format}`
              : undefined,
          };
        }

        errorCount++;
        return {
          ...item,
          status: "error",
          error: result?.Err || "Unknown error",
          metadata: undefined,
        };
      });

      setFiles(updatedFiles);
      if (!sort.key) {
        setSort({ key: "status", direction: "desc" });
      }

      setIsAnalyzing(false);
      if (errorCount > 0) {
        setStatus({
          tone: "error",
          message: `Incorrect format detected in ${errorCount} file${errorCount === 1 ? "" : "s"}.`,
        });
      } else {
        setStatus({
          tone: "success",
          message: `${successCount}/${successCount} ✓ · All cleared`,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error ?? "Unknown error");
      setFiles((prev) =>
        prev.map((item) => ({ ...item, status: "error", error: message }))
      );
      setIsAnalyzing(false);
      setStatus({
        tone: "error",
        message: `Batch analysis failed: ${message}`,
      });
    }
  }, [files, isAnalyzing, sort]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        setFiles(MOCK_FILES);
        setStatus({
          tone: "info",
          message: "Loaded mock tracks.",
        });
        return;
      }
      if (event.ctrlKey && event.key.toLowerCase() === "o") {
        event.preventDefault();
        handleBrowse();
      } else if (event.key === "Delete") {
        event.preventDefault();
        handleClear();
      } else if (event.key === "Enter" || event.key === "F5") {
        event.preventDefault();
        analyze();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [analyze, handleBrowse, handleClear]);

  const sortedFiles = useMemo(() => {
    const sortable = [...files];
    const { key, direction } = sort;

    if (!key) return sortable;

    const getValue = (file: FileItem) => {
      switch (key) {
        case "name":
          return file.name.toLowerCase();
        case "format":
          return (file.metadata?.format || "Unknown").toLowerCase();
        case "sample_rate":
          return file.metadata?.sample_rate || 0;
        case "duration":
          return file.metadata?.duration || 0;
        case "channels":
          return file.metadata?.channels || 0;
        case "bit_depth":
          return file.metadata?.bit_depth || 0;
        case "status": {
          const rank: Record<FileItem["status"], number> = {
            pending: 1,
            processing: 2,
            success: 3,
            error: 4,
          };
          return rank[file.status] ?? 99;
        }
        default:
          return file.name.toLowerCase();
      }
    };

    sortable.sort((a, b) => {
      const av = getValue(a);
      const bv = getValue(b);
      if (av === bv) return a.name.localeCompare(b.name);
      if (typeof av === "number" && typeof bv === "number") {
        return direction === "asc" ? av - bv : bv - av;
      }
      return direction === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

    return sortable;
  }, [files, sort]);

  const handleSort = (key: SortKey) => {
    setSort((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") {
          return { key, direction: "desc" };
        } else {
          return { key: null, direction: "asc" };
        }
      }
      return { key, direction: "asc" };
    });
  };



  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Shell>
        <Header>
          <TopBar>
            <Title>Sound Check</Title>
            <Actions>
              <Button onClick={handleBrowse} $tone="yellow">
                Browse Files
              </Button>
              <Button onClick={analyze} $tone="green" disabled={isAnalyzing}>
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </Button>
              <Button onClick={handleClear} $tone="red" disabled={!files.length}>
                Clear
              </Button>
            </Actions>
          </TopBar>
        </Header>

        <Content>
          <Panel>
            <DropZone
              $active={dragActive}
              $pulse={files.length === 0}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              onDrop={handleDrop}
              onClick={handleBrowse}
            >
              {files.length === 0
                ? "Drop audio files here or click to browse"
                : `${files.length} file${files.length === 1 ? "" : "s"} loaded · Drop more or click to add`}
            </DropZone>

            <TableWrap $hasRows={sortedFiles.length > 0}>
              <StyledTable>
                <colgroup>
                  <col style={{ width: "var(--col-track)" }} />
                  <col style={{ width: "var(--col-format)" }} />
                  <col style={{ width: "var(--col-sample-rate)" }} />
                  <col style={{ width: "var(--col-bit-depth)" }} />
                  <col style={{ width: "var(--col-channels)" }} />
                  <col style={{ width: "var(--col-duration)" }} />
                  <col style={{ width: "var(--col-actions)" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th onClick={() => handleSort("name")} title="Track">
                      <HeaderContent $center $offsetY={1}>
                        <span>Track</span>
                        <SortIcon $active={sort.key === "name"} $direction={sort.direction}>
                          ▲
                        </SortIcon>
                      </HeaderContent>
                    </th>
                    <th onClick={() => handleSort("format")} title="Format">
                      <HeaderContent $center $offsetY={1}>
                        <span>Format</span>
                        <SortIcon $active={sort.key === "format"} $direction={sort.direction}>
                          ▲
                        </SortIcon>
                      </HeaderContent>
                    </th>
                    <th onClick={() => handleSort("sample_rate")} title="Sample Rate">
                      <HeaderContent $center $offsetY={1}>
                        <span>Sample Rate</span>
                        <SortIcon $active={sort.key === "sample_rate"} $direction={sort.direction}>
                          ▲
                        </SortIcon>
                      </HeaderContent>
                    </th>
                    <th onClick={() => handleSort("bit_depth")} title="Bit Depth">
                      <HeaderContent $center $offsetY={1}>
                        <span>Bit Depth</span>
                        <SortIcon $active={sort.key === "bit_depth"} $direction={sort.direction}>
                          ▲
                        </SortIcon>
                      </HeaderContent>
                    </th>
                    <th onClick={() => handleSort("channels")} title="Channels">
                      <HeaderContent $center $offsetY={1}>
                        <span>Channels</span>
                        <SortIcon $active={sort.key === "channels"} $direction={sort.direction}>
                          ▲
                        </SortIcon>
                      </HeaderContent>
                    </th>
                    <th onClick={() => handleSort("duration")} title="Duration">
                      <HeaderContent $center $offsetY={1}>
                        <span>Duration</span>
                        <SortIcon $active={sort.key === "duration"} $direction={sort.direction}>
                          ▲
                        </SortIcon>
                      </HeaderContent>
                    </th>
                    <th onClick={() => handleSort("status")} title="Status / Actions">
                      <HeaderContent $center $offsetY={1}>
                        <span>Status</span>
                        <SortIcon $active={sort.key === "status"} $direction={sort.direction}>
                          ▲
                        </SortIcon>
                      </HeaderContent>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFiles.length === 0 ? (
                    <tr className="empty" aria-label="No files loaded yet">
                      <td colSpan={7}>No files loaded yet.</td>
                    </tr>
                  ) : (
                    sortedFiles.map((file) => (
                      <tr key={`result-${file.path}`}>
                        <td>
                          <TrackCell>
                            <TrackInfo>
                              <TrackTitle title={file.metadata?.title || file.name}>
                                {file.metadata?.title
                                  ? `${file.metadata.title}.${file.name.split(".").pop()}`
                                  : cleanFileName(file.name)}
                              </TrackTitle>
                              <TrackArtist>
                                {file.metadata?.artist && file.metadata?.album
                                  ? `${file.metadata.artist} · ${file.metadata.album}`
                                  : file.metadata?.artist || file.metadata?.album || "Unknown"}
                              </TrackArtist>
                            </TrackInfo>
                          </TrackCell>
                        </td>
                        <td>
                          <FormatCell
                            $mismatch={hasFormatMismatch(file.name, file.metadata?.format)}
                            title={
                              hasFormatMismatch(file.name, file.metadata?.format)
                                ? `Format mismatch: file is .${file.name.split(".").pop()} but detected as ${file.metadata?.format}`
                                : file.metadata?.format || "Unknown"
                            }
                          >
                            {file.metadata?.format || "Unknown"}
                          </FormatCell>
                        </td>
                        <td title={formatSampleRate(file.metadata?.sample_rate || 0)}>{formatSampleRate(file.metadata?.sample_rate || 0)}</td>
                        <td title={formatBitDepth(file.metadata?.bit_depth, file.metadata?.format)}>{formatBitDepth(file.metadata?.bit_depth, file.metadata?.format)}</td>
                        <td title={formatChannels(file.metadata?.channels || 0)}>{formatChannels(file.metadata?.channels || 0)}</td>
                        <td title={formatDuration(file.metadata?.duration || 0)}>{formatDuration(file.metadata?.duration || 0)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <StatusDot
                              $tone={
                                file.status === "processing"
                                  ? "warning"
                                  : file.status === "success"
                                    ? hasFormatMismatch(file.name, file.metadata?.format)
                                      ? "error"
                                      : "success"
                                    : file.status === "error"
                                      ? "error"
                                      : "info"
                              }
                              title={file.status}
                            />
                            <RemoveButton
                              onClick={(e) => {
                                e.stopPropagation();
                                setFiles(prev => prev.filter(f => f.path !== file.path));
                                setStatus({
                                  tone: "info",
                                  message: `Removed ${file.name} from the queue.`
                                });
                              }}
                              title="Remove this file"
                            >
                              ×
                            </RemoveButton>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </StyledTable>
            </TableWrap>
          </Panel>
        </Content>

        <StatusBar $tone={status.tone} style={isAnalyzing ? { borderTopLeftRadius: 0, borderTopRightRadius: 0 } : undefined}>
          <StatusIndicator>
            <IndicatorLed $tone={
              status.tone === "error"
                ? "red"
                : status.tone === "warning" || isAnalyzing
                  ? "amber"
                  : "green"
            } $pulse={status.tone === "warning" || isAnalyzing} />
            <div>{status.message}</div>
          </StatusIndicator>
          <CopyButton
            onClick={async () => {
              await copyStatusMessage(status.message, setStatus);
            }}
            aria-label="Copy status message to clipboard"
            title="Copy status message"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </CopyButton>
        </StatusBar>
      </Shell >
    </ThemeProvider >
  );
}

export default App;
export { copyStatusMessage, hasFormatMismatch };
