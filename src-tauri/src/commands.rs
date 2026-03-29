use tauri::command;

use crate::audio::{analyze_file, analyze_files_batch, AudioMetadata};

/// Analyze a single audio file
#[command]
pub async fn analyze_audio_file(path: String) -> Result<AudioMetadata, String> {
    analyze_file(&path).map_err(|e| e.to_string())
}

/// Analyze multiple audio files in batch
#[command]
pub async fn analyze_audio_files_batch(paths: Vec<String>) -> Vec<Result<AudioMetadata, String>> {
    analyze_files_batch(paths)
}

/// Open file picker dialog for audio files
#[command]
pub async fn select_audio_files(app: tauri::AppHandle) -> Result<Vec<String>, String> {
    use tauri_plugin_dialog::DialogExt;
    let (tx, rx) = tokio::sync::oneshot::channel();

    app.dialog()
        .file()
        .add_filter("Audio Files", &["mp3", "flac", "wav", "ogg", "m4a", "aac"])
        .add_filter("All Files", &["*"])
        .pick_files(move |files| {
            let _ = tx.send(files);
        });

    let result = rx.await.map_err(|e| e.to_string())?;

    match result {
        Some(files) => {
            let paths: Vec<String> = files
                .iter()
                .map(|p| p.as_path().unwrap().to_string_lossy().to_string())
                .collect();
            Ok(paths)
        }
        None => Ok(vec![]),
    }
}
