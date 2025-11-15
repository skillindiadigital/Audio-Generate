
import React, { useState, useCallback, useRef } from 'react';
import { synthesizeText } from './services/geminiService';
import { decodeBase64Audio, audioBufferToWavBlob, stitchAudioBuffers } from './utils/audioUtils';
import { type AudioChunk } from './types';
import { Header } from './components/Header';
import { VoiceSelector } from './components/VoiceSelector';
import { ScriptEditor } from './components/ScriptEditor';
import { Controls } from './components/Controls';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LicenseModal } from './components/LicenseModal';
import { Spinner } from './components/Spinner';

const voiceOptions = [
    { id: 'Kore', name: 'Guru (Kore)', description: 'Deep, warm, calm male voice. Ideal for spiritual narration.' },
    { id: 'Puck', name: 'Storyteller (Puck)', description: 'Friendly and engaging male voice.' },
    { id: 'Charon', name: 'Guide (Charon)', description: 'A deep, authoritative female voice.' },
    { id: 'Fenrir', name: 'Instructor (Fenrir)', description: 'An energetic and clear male voice.' },
    { id: 'Zephyr', name: 'Companion (Zephyr)', description: 'A warm and conversational female voice.' },
];

const App: React.FC = () => {
    const [script, setScript] = useState<string>('');
    const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
    const [audioChunks, setAudioChunks] = useState<AudioChunk[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [progressMessage, setProgressMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const audioContextRef = useRef<AudioContext | null>(null);

    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        return audioContextRef.current;
    }, []);

    const preprocessText = (text: string): string => {
        // Replace custom pause markers with SSML break tags.
        // The API can handle SSML fragments (like <break>) without the root <speak> tag.
        // Removing the <speak> tag wrapper fixes an issue where the speechConfig was being ignored.
        return text.replace(/\[pause(?:=(\d+))?\]/g, (_, duration) => `<break time="${duration || 800}ms"/>`);
    };
    
    const handleSynthesize = useCallback(async () => {
        if (!script.trim()) {
            setError("Script cannot be empty.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAudioChunks([]);

        // Split script into chunks (e.g., by paragraphs)
        const textChunks = script.split(/\n\s*\n/).filter(chunk => chunk.trim().length > 0);
        
        if (textChunks.length === 0) {
            setError("No valid text chunks found to synthesize.");
            setIsLoading(false);
            return;
        }

        const newAudioChunks: AudioChunk[] = [];
        const context = getAudioContext();

        for (let i = 0; i < textChunks.length; i++) {
            try {
                setProgressMessage(`Synthesizing chunk ${i + 1} of ${textChunks.length}...`);
                const processedChunk = preprocessText(textChunks[i]);
                const base64Audio = await synthesizeText(processedChunk, selectedVoice);

                if (base64Audio) {
                    const buffer = await decodeBase64Audio(base64Audio, context);
                    const blob = audioBufferToWavBlob(buffer);
                    newAudioChunks.push({ id: Date.now() + i, buffer, blob });
                    setAudioChunks([...newAudioChunks]);
                }
            } catch (err) {
                console.error(err);
                const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                setError(`Failed on chunk ${i + 1}: ${errorMessage}`);
                setIsLoading(false);
                return;
            }
        }

        setProgressMessage('');
        setIsLoading(false);
    }, [script, getAudioContext, selectedVoice]);

    const handleDownloadAll = useCallback(async () => {
        if (audioChunks.length === 0) return;
        
        const stitchedBuffer = stitchAudioBuffers(audioChunks.map(c => c.buffer), getAudioContext());
        const stitchedBlob = audioBufferToWavBlob(stitchedBuffer);
        const url = URL.createObjectURL(stitchedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'GuruVaani_Full_Audio.wav';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [audioChunks, getAudioContext]);

    const openLicenseModal = () => {
        if (audioChunks.length > 0) {
            setIsModalOpen(true);
        }
    };
    
    const onLicenseAccept = () => {
        setIsModalOpen(false);
        handleDownloadAll();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
            <main className="container mx-auto p-4 md:p-8">
                <Header />
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
                    <VoiceSelector
                        options={voiceOptions}
                        selectedVoice={selectedVoice}
                        onVoiceChange={setSelectedVoice}
                        disabled={isLoading}
                    />
                    <ScriptEditor script={script} setScript={setScript} disabled={isLoading} />
                    <Controls 
                        onSynthesize={handleSynthesize} 
                        onDownloadAll={openLicenseModal}
                        isSynthesizing={isLoading}
                        canDownload={audioChunks.length > 0}
                    />

                    {isLoading && (
                        <div className="mt-6 flex flex-col items-center justify-center text-center">
                            <Spinner />
                            <p className="mt-4 text-lg text-indigo-500 dark:text-indigo-400 font-medium">{progressMessage}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Please wait, this may take a few moments...</p>
                        </div>
                    )}

                    {error && (
                        <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-400 dark:border-red-600 rounded-lg">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}
                </div>

                {audioChunks.length > 0 && !isLoading && (
                    <ResultsDisplay audioChunks={audioChunks} audioContext={getAudioContext()} />
                )}
            </main>
            
            <LicenseModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAccept={onLicenseAccept}
            />
        </div>
    );
};

export default App;
