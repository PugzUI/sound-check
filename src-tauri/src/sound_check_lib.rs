// Audio processing modules
mod audio;
mod commands;

use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            analyze_audio_file,
            analyze_audio_files_batch,
            select_audio_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
