
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
    // Male Voices
    { id: 'kore', name: 'Guru (kore)', description: 'A deep, calm, and warm voice, steady and compassionate. The ideal spiritual guide for reflective narration.' },
    { id: 'puck', name: 'Storyteller (puck)', description: 'A friendly and engaging storyteller\'s voice, carrying a warm, sincere, and peaceful tone.' },
    { id: 'fenrir', name: 'Instructor (fenrir)', description: 'A clear and composed instructor\'s voice, delivering content with a steady, compassionate, and spiritual undertone.' },
    { id: 'algieba', name: 'Lecturer (algieba)', description: 'A deep, steady lecturer\'s voice, perfect for delivering profound spiritual or reflective content with authority and warmth.' },
    { id: 'gacrux', name: 'Reassurance (gacrux)', description: 'A deeply calm and reassuring voice, full of compassion and sincerity, ideal for peaceful and contemplative messages.' },
    { id: 'rasalgethi', name: 'Narrator (rasalgethi)', description: 'A mature narrator\'s voice, delivering stories with a wise, reflective tone and a slow, composed pace.' },
    // Female Voices
    { id: 'charon', name: 'Guide (charon)', description: 'A deep, steady guide\'s voice, exuding wisdom and peace. Authoritative yet compassionate for spiritual teachings.' },
    { id: 'zephyr', name: 'Companion (zephyr)', description: 'A warm and compassionate companion\'s voice, speaking with a calm, reflective, and sincere tone.' },
    { id: 'autonoe', name: 'Professional (autonoe)', description: 'A clear and professional voice, maintaining a calm, steady delivery for spiritual and reflective content.' },
    { id: 'leda', name: 'Friend (leda)', description: 'A warm and friendly voice, sharing stories and wisdom with a sincere, compassionate, and peaceful delivery.' },
    { id: 'callirrhoe', name: 'Youthful (callirrhoe)', description: 'A youthful voice that is clear and sincere, delivering messages with a calm, composed, and spiritual tone.' },
];

const App: React.FC = () => {
    const [script, setScript] = useState<string>('');
    const [selectedVoice, setSelectedVoice] = useState<string>('kore');
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
        const ssmlContent = text.replace(/\[pause(?:=(\d+))?\]/g, (_, duration) => `<break time="${duration || 800}ms"/>`);

        // According to Gemini API documentation, any input containing SSML tags
        // must be wrapped in <speak> tags for the API to interpret it as SSML.
        // Without this wrapper, SSML tags like <break> are ignored, and more importantly,
        // the speechConfig (which sets the voice) is also disregarded, leading to a default voice.
        return `<speak>${ssmlContent}</speak>`;
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
