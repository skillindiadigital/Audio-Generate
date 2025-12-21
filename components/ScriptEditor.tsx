
import React from 'react';

interface ScriptEditorProps {
    script: string;
    setScript: (script: string) => void;
    disabled: boolean;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({ script, setScript, disabled }) => (
    <div>
        <label htmlFor="script" className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Your Script
        </label>
        <textarea
            id="script"
            value={script}
            onChange={(e) => setScript(e.target.value)}
            disabled={disabled}
            rows={15}
            placeholder="Paste your text here. Hindi (हिन्दी) and Sanskrit (संस्कृत) are supported natively."
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-gray-50 dark:bg-gray-700 disabled:opacity-50"
        />
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 space-y-1">
            <p>• <strong>Hindi/Sanskrit:</strong> Enter native script for the most accurate pronunciation.</p>
            <p>• <strong>Pauses:</strong> Use <code>[pause]</code> (800ms) or <code>[pause=1200]</code> for specific delays.</p>
            <p>• <strong>Processing:</strong> Text is processed paragraph by paragraph for optimal quality.</p>
        </div>
    </div>
);
