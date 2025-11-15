
import React from 'react';
import { MicrophoneIcon, ChevronDownIcon } from './icons';

interface VoiceOption {
    id: string;
    name: string;
    description: string;
}

interface VoiceSelectorProps {
    options: VoiceOption[];
    selectedVoice: string;
    onVoiceChange: (voiceId: string) => void;
    disabled: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ options, selectedVoice, onVoiceChange, disabled }) => {
    const selectedOption = options.find(o => o.id === selectedVoice);

    return (
        <div className="mb-6">
            <label htmlFor="voice-selector" className="flex items-center text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <MicrophoneIcon className="w-6 h-6 mr-2 text-indigo-500" />
                Choose a Voice
            </label>
            <div className="relative">
                <select
                    id="voice-selector"
                    value={selectedVoice}
                    onChange={(e) => onVoiceChange(e.target.value)}
                    disabled={disabled}
                    className="w-full appearance-none p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-gray-50 dark:bg-gray-700 disabled:opacity-50 pr-10"
                    aria-label="Select a voice model"
                >
                    {options.map(option => (
                        <option key={option.id} value={option.id}>
                            {option.name}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 dark:text-gray-300">
                    <ChevronDownIcon className="w-5 h-5" />
                </div>
            </div>
            {selectedOption && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {selectedOption.description}
                </p>
            )}
        </div>
    );
};
