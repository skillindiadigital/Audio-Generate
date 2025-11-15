
import React from 'react';
import { DownloadIcon, SparklesIcon } from './icons';

interface ControlsProps {
    onSynthesize: () => void;
    onDownloadAll: () => void;
    isSynthesizing: boolean;
    canDownload: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ onSynthesize, onDownloadAll, isSynthesizing, canDownload }) => (
    <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <button
            onClick={onSynthesize}
            disabled={isSynthesizing}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
        >
            <SparklesIcon className="w-5 h-5 mr-2" />
            {isSynthesizing ? 'Synthesizing...' : 'Synthesize Audio'}
        </button>
        <button
            onClick={onDownloadAll}
            disabled={isSynthesizing || !canDownload}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-500 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            <DownloadIcon className="w-5 h-5 mr-2" />
            Download All as WAV
        </button>
    </div>
);
