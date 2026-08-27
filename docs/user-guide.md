# User Guide

Sound Check analyzes audio files and shows detected format + core metadata in one table.

## Basic Workflow

1. Add files:
   - click **Browse Files**, or
   - drag files into the drop zone.
2. Click **Analyze**.
3. Review results in the table.
4. Sort any column if needed.

## What You See

Each row can show:
- track/file name
- detected format
- sample rate
- bit depth (when available)
- channels
- duration
- row status indicator

Status bar (bottom):
- shows current operation/result summary

## Keyboard Shortcuts

- `Ctrl+O`: open file picker
- `Enter`: start analysis
- `F5`: start analysis
- `Delete`: clear all queued files

## Understanding Mismatch Errors

A file can be marked as error even when decoded successfully if extension and detected format disagree.

Example:
- filename ends in `.flac`
- detected content is `mp3`

This is intentional and helps catch mislabeled files.

## Managing Queue Items

- Remove one file: click `×` in that row.
- Clear all files: click **Clear** or press `Delete`.

## Notes

- Native file picking and full analysis require running in Tauri runtime.
- Browser-only mode is useful for UI development but does not provide full native behavior.
