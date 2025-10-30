import React from 'react';
import { ImageHistoryItem } from '../features/GeneratorPage';

interface HistoryPanelProps {
  history: ImageHistoryItem[];
  onReuse: (item: ImageHistoryItem) => void;
  onClear: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onReuse, onClear }) => {
  return (
    <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 p-6 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">History</h3>
        <button
          onClick={onClear}
          className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          aria-label="Clear all history"
        >
          Clear All
        </button>
      </div>
      {history.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">Your generated images will appear here.</p>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-4 pr-2 -mr-2">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => onReuse(item)}
              className="w-full text-left bg-gray-900/50 p-3 rounded-lg hover:bg-gray-700 transition-colors flex items-start space-x-3 group"
              aria-label={`Reuse prompt: ${item.prompt}`}
            >
              <img 
                src={item.imageUrl} 
                alt={item.prompt} 
                className="w-16 h-16 object-cover rounded-md flex-shrink-0" 
              />
              <div className="flex-grow overflow-hidden">
                <p className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">
                  {item.prompt}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {item.aspectRatio}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
