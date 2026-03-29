/// Format signature for magic byte detection
#[derive(Debug, Clone)]
pub struct FormatSignature {
    pub name: &'static str,
    pub magic_bytes: &'static [u8],
    pub offset: usize,
}

/// Supported audio formats with their magic byte signatures
pub const AUDIO_FORMATS: &[FormatSignature] = &[
    FormatSignature {
        name: "MP3",
        magic_bytes: b"ID3",
        offset: 0,
    },
    FormatSignature {
        name: "MP3",
        magic_bytes: b"\xFF\xFB", // MPEG Frame sync
        offset: 0,
    },
    FormatSignature {
        name: "FLAC",
        magic_bytes: b"fLaC",
        offset: 0,
    },
    FormatSignature {
        name: "WAV",
        magic_bytes: b"RIFF",
        offset: 0,
    },
    FormatSignature {
        name: "OGG",
        magic_bytes: b"OggS",
        offset: 0,
    },
    FormatSignature {
        name: "M4A",
        magic_bytes: b"ftyp",
        offset: 4,
    },
    FormatSignature {
        name: "DSF",
        magic_bytes: b"DSD ",
        offset: 0,
    },
];

/// Detect audio format from file header
pub fn detect_format(header: &[u8]) -> Option<&'static str> {
    for signature in AUDIO_FORMATS {
        let start = signature.offset;
        let end = start + signature.magic_bytes.len();

        if header.len() >= end {
            if &header[start..end] == signature.magic_bytes {
                return Some(signature.name);
            }
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_mp3_id3() {
        let header = b"ID3\x04\x00\x00\x00";
        assert_eq!(detect_format(header), Some("MP3"));
    }

    #[test]
    fn test_detect_flac() {
        let header = b"fLaC\x00\x00\x00";
        assert_eq!(detect_format(header), Some("FLAC"));
    }

    #[test]
    fn test_detect_wav() {
        let header = b"RIFF....WAVEfmt ";
        assert_eq!(detect_format(header), Some("WAV"));
    }

    #[test]
    fn test_detect_unknown() {
        let header = b"UNKNOWN\x00\x00";
        assert_eq!(detect_format(header), None);
    }

    #[test]
    fn test_detect_dsf() {
        let header = b"DSD \x00\x00\x00\x00";
        assert_eq!(detect_format(header), Some("DSF"));
    }
}
