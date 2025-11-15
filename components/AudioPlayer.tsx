
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { type AudioChunk } from '../types';
import { PlayIcon, PauseIcon, DownloadIcon } from './icons';

interface AudioPlayerProps {
    chunk: AudioChunk;
    index: number;
    audioContext: AudioContext;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ chunk, index, audioContext }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    const stopPlayback = useCallback(() => {
        if (sourceRef.current) {
            sourceRef.current.stop();
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        setIsPlaying(false);
    }, []);

    const playPlayback = useCallback(() => {
        stopPlayback(); // Stop any existing playback first
        const source = audioContext.createBufferSource();
        source.buffer = chunk.buffer;
        source.connect(audioContext.destination);
        source.onended = () => {
            setIsPlaying(false);
            sourceRef.current = null;
        };
        source.start();
        sourceRef.current = source;
        setIsPlaying(true);
    }, [audioContext, chunk.buffer, stopPlayback]);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            stopPlayback();
        };
    }, [stopPlayback]);

    const handleTogglePlay = () => {
        if (isPlaying) {
            stopPlayback();
        } else {
            if (audioContext.state === 'suspended') {
                audioContext.resume().then(playPlayback);
            } else {
                playPlayback();
            }
        }
    };

    const handleDownload = () => {
        const url = URL.createObjectURL(chunk.blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `GuruVaani_Chunk_${index + 1}.wav`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center justify-between transition-all hover:shadow-lg">
            <div className="flex items-center gap-4">
                <button
                    onClick={handleTogglePlay}
                    className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                </button>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Audio Chunk {index + 1}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({chunk.buffer.duration.toFixed(2)}s)
                </span>
            </div>
            <button
                onClick={handleDownload}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                aria-label="Download chunk"
            >
                <DownloadIcon className="w-6 h-6" />
            </button>
        </div>
    );
};
