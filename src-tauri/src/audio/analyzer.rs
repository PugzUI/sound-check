use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::path::Path;
use symphonia::core::formats::FormatOptions;
use symphonia::core::io::MediaSourceStream;
use symphonia::core::meta::{MetadataOptions, StandardTagKey};
use symphonia::core::codecs::DecoderOptions;
use symphonia::core::codecs::CodecType;
use symphonia::core::probe::Hint;
use thiserror::Error;

use super::formats::detect_format;

#[derive(Error, Debug)]
pub enum AnalysisError {
    #[error("File not found: {0}")]
    FileNotFound(String),

    #[error("Unable to read file: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Unsupported format or corrupted file")]
    UnsupportedFormat,

    #[error("Failed to probe audio: {0}")]
    ProbeError(String),
}

/// Audio metadata result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioMetadata {
    /// File path
    pub path: String,

    /// Detected format (e.g., "MP3", "FLAC")
    pub format: String,

    /// Sample rate in Hz
    pub sample_rate: u32,

    /// Duration in seconds
    pub duration: f64,

    /// Number of channels
    pub channels: u8,

    /// Bit depth (if available)
    pub bit_depth: Option<u8>,

    /// Codec name
    pub codec: Option<String>,

    /// Track title
    pub title: Option<String>,

    /// Artist name
    pub artist: Option<String>,

    /// Album name
    pub album: Option<String>,

    /// Album art as base64 data URL (e.g., "data:image/jpeg;base64,...")
    pub album_art: Option<String>,
}

/// Analyze a single audio file and extract metadata
pub fn analyze_file<P: AsRef<Path>>(path: P) -> Result<AudioMetadata, AnalysisError> {
    let path_str = path.as_ref().to_string_lossy().to_string();

    let file = File::open(&path).map_err(|_| AnalysisError::FileNotFound(path_str.clone()))?;

    let mut header = [0u8; 32];
    use std::io::Read;
    let mut header_file = File::open(&path)?;
    header_file.read(&mut header)?;

    let detected_format = detect_format(&header).unwrap_or("Unknown");

    let mss = MediaSourceStream::new(Box::new(file), Default::default());

    let mut hint = Hint::new();
    if let Some(ext) = path.as_ref().extension() {
        hint.with_extension(ext.to_str().unwrap_or(""));
    }

    let format_opts = FormatOptions::default();
    let metadata_opts = MetadataOptions::default();

    let mut probed = symphonia::default::get_probe()
        .format(&hint, mss, &format_opts, &metadata_opts)
        .map_err(|e| AnalysisError::ProbeError(e.to_string()))?;

    let format_reader = &mut probed.format;

    // Copy track parameters before packet iteration borrows the reader mutably.
    let (codec_params, _time_base, codec, track_id) = {
        let track = format_reader
            .default_track()
            .ok_or(AnalysisError::UnsupportedFormat)?;
        (
            track.codec_params.clone(),
            track.codec_params.time_base,
            track.codec_params.codec,
            track.id,
        )
    };

    let mut sample_rate = codec_params.sample_rate.unwrap_or(0);
    let mut channels = codec_params
        .channels
        .map(|c| c.count() as u8)
        .or_else(|| codec_params.channel_layout.map(|l| l.into_channels().count() as u8))
        .unwrap_or(0);
    let bit_depth = codec_params.bits_per_sample.map(|b| b as u8);

    let mut duration = if let Some(n_frames) = codec_params.n_frames {
        if sample_rate > 0 {
            n_frames as f64 / sample_rate as f64
        } else {
            0.0
        }
    } else {
        0.0
    };

    // Fallback to decoder params for streams with incomplete container metadata.
    if sample_rate == 0 || channels == 0 || duration == 0.0 {
        if let Ok(decoder) =
            symphonia::default::get_codecs().make(&codec_params, &DecoderOptions::default())
        {
            let params = decoder.codec_params();
            if sample_rate == 0 {
                sample_rate = params.sample_rate.unwrap_or(0);
            }
            if channels == 0 {
                channels = params
                    .channels
                    .map(|c| c.count() as u8)
                    .or_else(|| params.channel_layout.map(|l| l.into_channels().count() as u8))
                    .unwrap_or(0);
            }
            if duration == 0.0 {
                if let Some(n_frames) = params.n_frames {
                    if let Some(sr) = params.sample_rate {
                        if sr > 0 {
                            duration = n_frames as f64 / sr as f64;
                        }
                    }
                }
            }
        }
    }

    // Last fallback: decode packets to estimate duration from frame count.
    if duration == 0.0 && sample_rate > 0 {
        if let Ok(mut decoder) =
            symphonia::default::get_codecs().make(&codec_params, &DecoderOptions::default())
        {
            let mut total_frames: u64 = 0;
            while let Ok(packet) = format_reader.next_packet() {
                if packet.track_id() != track_id {
                    continue;
                }
                if let Ok(audio_buf) = decoder.decode(&packet) {
                    total_frames += audio_buf.frames() as u64;
                }
            }
            if total_frames > 0 {
                duration = total_frames as f64 / sample_rate as f64;
            }
        }
    }

    let codec_name = format!("{:?}", codec);
    let normalized_format = normalize_format(codec, &detected_format);

    // Conservative defaults for containers that may omit layout/rate metadata.
    if channels == 0
        && (normalized_format == "aac" || normalized_format == "alac" || normalized_format == "m4a")
    {
        channels = 2;
    }
    if channels == 0 && (normalized_format == "ogg" || normalized_format == "opus") {
        channels = 2;
    }
    if sample_rate == 0 && (normalized_format == "ogg" || normalized_format == "opus") {
        sample_rate = 44100;
    }

    let mut title: Option<String> = None;
    let mut artist: Option<String> = None;
    let mut album: Option<String> = None;
    let mut album_art: Option<String> = None;

    if let Some(metadata_rev) = probed.metadata.get() {
        if let Some(current) = metadata_rev.current() {
            for tag in current.tags() {
                if let Some(std_key) = tag.std_key {
                    match std_key {
                        StandardTagKey::TrackTitle => {
                            title = Some(tag.value.to_string());
                        }
                        StandardTagKey::Artist | StandardTagKey::AlbumArtist => {
                            if artist.is_none() {
                                artist = Some(tag.value.to_string());
                            }
                        }
                        StandardTagKey::Album => {
                            album = Some(tag.value.to_string());
                        }
                        _ => {}
                    }
                }
            }

            for visual in current.visuals() {
                if album_art.is_none() {
                    let mime = visual.media_type.as_str();
                    let data = BASE64.encode(&visual.data);
                    album_art = Some(format!("data:{};base64,{}", mime, data));
                }
            }
        }
    }

    Ok(AudioMetadata {
        path: path_str,
        format: normalized_format,
        sample_rate,
        duration,
        channels,
        bit_depth,
        codec: Some(codec_name),
        title,
        artist,
        album,
        album_art,
    })
}

fn normalize_format(codec: CodecType, detected: &str) -> String {
    let codec_label = format!("{:?}", codec).to_lowercase();
    let detected_lower = detected.to_lowercase();

    let candidates = [codec_label.as_str(), detected_lower.as_str()];

    for label in candidates {
        if label.contains("mp3") || label.contains("mpeg") {
            return "mp3".to_string();
        }
        if label.contains("flac") {
            return "flac".to_string();
        }
        if label.contains("opus") {
            return "opus".to_string();
        }
        if label.contains("vorbis") || label.contains("ogg") {
            return "ogg".to_string();
        }
        if label.contains("aac") || label.contains("mp4a") {
            return "aac".to_string();
        }
        if label.contains("alac") {
            return "alac".to_string();
        }
        if label.contains("aiff") || label.contains("aif") || label.contains("aifc") {
            return "aiff".to_string();
        }
        if label.contains("wma") || label.contains("asf") {
            return "wma".to_string();
        }
        if label.contains("wavpack") || label == "wv" {
            return "wv".to_string();
        }
        if label.contains("caf") {
            return "caf".to_string();
        }
        if label.contains("wav") || label.contains("wave") || label.contains("pcm") {
            return "wav".to_string();
        }
    }

    if detected_lower != "unknown" {
        return detected_lower;
    }

    codec_label
}

/// Analyze multiple files in parallel
pub fn analyze_files_batch<P: AsRef<Path> + Sync + Send>(
    paths: Vec<P>,
) -> Vec<Result<AudioMetadata, String>> {
    use rayon::prelude::*;

    paths
        .par_iter()
        .map(|path| analyze_file(path).map_err(|e| e.to_string()))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_analyze_nonexistent_file() {
        let result = analyze_file("nonexistent.mp3");
        assert!(result.is_err());
    }
}

#[cfg(test)]
mod integration_tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn test_analyze_real_samples() {
        // Base path to samples - adjust if running from a different working dir
        // This assumes we run cargo test from src-tauri/
        let base_path = PathBuf::from("../samples");

        if !base_path.exists() {
            println!(
                "Skipping test: samples directory not found at {:?}",
                base_path
            );
            return;
        }

        // Test a known valid file (Popping Out.flac is usually there based on mock data)
        let flac_path = base_path.join("01 - Globular - Popping Out.flac");
        if flac_path.exists() {
            let result = analyze_file(&flac_path);
            match result {
                Ok(metadata) => {
                    println!("Successfully analyzed FLAC: {:?}", metadata);
                    assert_eq!(metadata.format, "flac");
                    assert_eq!(metadata.sample_rate, 44100);
                    assert_eq!(metadata.channels, 2);
                }
                Err(e) => panic!("Failed to analyze existing FLAC file: {}", e),
            }
        }
    }
}
