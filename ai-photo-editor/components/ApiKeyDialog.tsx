
import React from 'react';

interface ApiKeyDialogProps {
  setHasApiKey: (hasKey: boolean) => void;
}

export const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ setHasApiKey }) => {

  const handleSelectKey = async () => {
    if (typeof window.aistudio?.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      // Assume success after the dialog is closed to avoid race conditions.
      setHasApiKey(true);
    } else {
        alert("API key selection is not available in this environment.");
    }
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg text-center">
      <h3 className="text-lg font-semibold text-white mb-2">API Key Required</h3>
      <p className="text-gray-300 mb-4">
        Video generation with Veo requires you to select an API key.
        Project setup and billing are required.
      </p>
      <button
        onClick={handleSelectKey}
        className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Select API Key
      </button>
      <a 
        href="https://ai.google.dev/gemini-api/docs/billing" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-sm text-indigo-400 hover:underline mt-4 block"
      >
        Learn more about billing
      </a>
    </div>
  );
};
