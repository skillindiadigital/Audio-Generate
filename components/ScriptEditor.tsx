
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
            placeholder="Paste your text here. Use [pause] or [pause=1200] for custom delays."
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-gray-50 dark:bg-gray-700 disabled:opacity-50"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Supports up to 30,000 words. Scripts are chunked by paragraphs for processing.
            <br />
            <strong>Note:</strong> Only `[pause]` and `[pause=ms]` markers are currently supported.
        </p>
    </div>
);
