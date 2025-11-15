
import React from 'react';

interface LicenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
}

export const LicenseModal: React.FC<LicenseModalProps> = ({ isOpen, onClose, onAccept }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Commercial Use License</h2>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                        By downloading the full audio file, you agree to the following terms:
                    </p>
                    <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-400 list-disc list-inside">
                        <li>You are granted a non-exclusive, worldwide, perpetual license to use the generated audio for commercial purposes (e.g., YouTube monetization, audiobooks, podcasts).</li>
                        <li>You may not claim ownership of the underlying voice profile or the TTS technology.</li>
                        <li>You are responsible for the content of the script and ensuring it does not violate any laws or third-party rights.</li>
                        <li>Attribution to "GuruVaani TTS" is appreciated but not required.</li>
                    </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex flex-col sm:flex-row-reverse sm:gap-3">
                     <button
                        type="button"
                        onClick={onAccept}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto"
                    >
                        Accept & Download
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-500 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
