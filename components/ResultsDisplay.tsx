
import React from 'react';
import { type AudioChunk } from '../types';
import { AudioPlayer } from './AudioPlayer';

interface ResultsDisplayProps {
    audioChunks: AudioChunk[];
    audioContext: AudioContext;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ audioChunks, audioContext }) => (
    <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Generated Audio Chunks</h2>
        <div className="space-y-4">
            {audioChunks.map((chunk, index) => (
                <AudioPlayer
                    key={chunk.id}
                    chunk={chunk}
                    index={index}
                    audioContext={audioContext}
                />
            ))}
        </div>
    </div>
);
