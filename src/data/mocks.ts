export type AudioMetadata = {
    path: string;
    format: string;
    sample_rate: number;
    duration: number;
    channels: number;
    bit_depth?: number | null;
    codec?: string | null;
    title?: string | null;
    artist?: string | null;
    album?: string | null;
    album_art?: string | null;
};

export type FileItem = {
    path: string;
    name: string;
    status: "pending" | "processing" | "success" | "error";
    metadata?: AudioMetadata;
    error?: string;
};

export const SAMPLE_PATHS = [
    "C:\\Users\\Anwender\\Documents\\Workspaces\\Sound_Check\\samples\\01 - Globular - Popping Out.flac",
    "C:\\Users\\Anwender\\Documents\\Workspaces\\Sound_Check\\samples\\01 - Globular - Popping Out.m4a",
    "C:\\Users\\Anwender\\Documents\\Workspaces\\Sound_Check\\samples\\01 - Globular - Popping Out.mp3",
    "C:\\Users\\Anwender\\Documents\\Workspaces\\Sound_Check\\samples\\01 - Globular - Popping Out.ogg",
    "C:\\Users\\Anwender\\Documents\\Workspaces\\Sound_Check\\samples\\01 - Globular - Popping Out.wav",
    "C:\\Users\\Anwender\\Documents\\Workspaces\\Sound_Check\\samples\\01 - Globular - Wrong Format.flac",
    "C:\\Users\\Anwender\\Documents\\Workspaces\\Sound_Check\\samples\\01 - Globular - Wrong Format.m4a",
    "C:\\Users\\Anwender\\Documents\\Workspaces\\Sound_Check\\samples\\01 - Globular - Wrong Format.mp3",
    "C:\\Users\\Anwender\\Documents\\Workspaces\\Sound_Check\\samples\\01 - Globular - Wrong Format.ogg",
];

const baseMocks: FileItem[] = [
    // Valid Tracks
    {
        path: "/samples/01 - Globular - Popping Out.flac",
        name: "01 - Globular - Popping Out.flac",
        status: "success",
        metadata: {
            path: "/samples/01 - Globular - Popping Out.flac",
            format: "flac",
            sample_rate: 44100,
            duration: 245,
            channels: 2,
            bit_depth: 16,
            title: "Popping Out",
            artist: "Globular",
            album: "Entangled Everything",
        }
    },
    {
        path: "/samples/01 - Globular - Popping Out.m4a",
        name: "01 - Globular - Popping Out.m4a",
        status: "success",
        metadata: {
            path: "/samples/01 - Globular - Popping Out.m4a",
            format: "aac",
            sample_rate: 44100,
            duration: 245,
            channels: 2,
            bit_depth: null,
            title: "Popping Out",
            artist: "Globular",
            album: "Entangled Everything",
        }
    },
    {
        path: "/samples/01 - Globular - Popping Out.mp3",
        name: "01 - Globular - Popping Out.mp3",
        status: "success",
        metadata: {
            path: "/samples/01 - Globular - Popping Out.mp3",
            format: "mp3",
            sample_rate: 44100,
            duration: 245,
            channels: 2,
            bit_depth: null,
            title: "Popping Out",
            artist: "Globular",
            album: "Entangled Everything",
        }
    },
    {
        path: "/samples/01 - Globular - Popping Out.ogg",
        name: "01 - Globular - Popping Out.ogg",
        status: "success",
        metadata: {
            path: "/samples/01 - Globular - Popping Out.ogg",
            format: "vorbis",
            sample_rate: 44100,
            duration: 245,
            channels: 2,
            bit_depth: null,
            title: "Popping Out",
            artist: "Globular",
            album: "Entangled Everything",
        }
    },
    {
        path: "/samples/01 - Globular - Popping Out.wav",
        name: "01 - Globular - Popping Out.wav",
        status: "success",
        metadata: {
            path: "/samples/01 - Globular - Popping Out.wav",
            format: "wav",
            sample_rate: 44100,
            duration: 245,
            channels: 2,
            bit_depth: 24,
            title: "Popping Out",
            artist: "Globular",
            album: "Entangled Everything",
        }
    },
    // Format Mismatches / "Wrong Format" Samples
    {
        path: "/samples/01 - Globular - Wrong Format.flac",
        name: "01 - Globular - Wrong Format.flac",
        status: "success",
        metadata: {
            path: "/samples/01 - Globular - Wrong Format.flac",
            format: "mp3", // Deliberate mismatch
            sample_rate: 44100,
            duration: 120,
            channels: 2,
            bit_depth: null,
            title: "Trap Sample",
            artist: "Unknown",
        }
    },
    {
        path: "/samples/01 - Globular - Wrong Format.m4a",
        name: "01 - Globular - Wrong Format.m4a",
        status: "success",
        metadata: {
            path: "/samples/01 - Globular - Wrong Format.m4a",
            format: "vorbis", // Deliberate mismatch
            sample_rate: 48000,
            duration: 120,
            channels: 2,
            bit_depth: null,
            title: "Trap Sample",
            artist: "Unknown",
        }
    },
    {
        path: "/samples/01 - Globular - Wrong Format.mp3",
        name: "01 - Globular - Wrong Format.mp3",
        status: "success",
        metadata: {
            path: "/samples/01 - Globular - Wrong Format.mp3",
            format: "wav", // Deliberate mismatch
            sample_rate: 44100,
            duration: 120,
            channels: 2,
            bit_depth: 16,
            title: "Trap Sample",
            artist: "Unknown",
        }
    },
    {
        path: "/samples/01 - Globular - Wrong Format.ogg",
        name: "01 - Globular - Wrong Format.ogg",
        status: "success",
        metadata: {
            path: "/samples/01 - Globular - Wrong Format.ogg",
            format: "aac", // Deliberate mismatch
            sample_rate: 44100,
            duration: 120,
            channels: 2,
            bit_depth: null,
            title: "Trap Sample",
            artist: "Unknown",
        }
    },
    // Error Case
    {
        path: "/samples/corrupted.wav",
        name: "corrupted_file.wav",
        status: "error",
        error: "Failed to decode stream: invalid data",
    }
];

export const MOCK_FILES: FileItem[] = [
    ...baseMocks,
    ...baseMocks.map((item, idx) => {
        const dup: FileItem = {
            ...item,
            path: `${item.path}__dup${idx}`,
            name: item.name.replace(/(\.[^.]+)$/, " (alt)$1"),
            metadata: item.metadata
                ? {
                    ...item.metadata,
                    path: item.metadata.path ? `${item.metadata.path}__dup${idx}` : `${item.path}__dup${idx}`,
                    title: item.metadata.title ? `${item.metadata.title} (alt)` : item.metadata.title,
                    artist: item.metadata.artist ?? item.metadata.artist,
                    album: item.metadata.album ?? item.metadata.album,
                }
                : undefined,
            error: item.error,
        };
        return dup;
    }),
];
