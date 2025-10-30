import React from 'react';

interface EditorControlsProps {
  onEdit: (tool: string, option?: string) => void;
  isLoading: boolean;
  objectToRemove: string;
  setObjectToRemove: (value: string) => void;
  textPrompt: string;
  setTextPrompt: (value: string) => void;
  onReset: () => void;
  editedImage: string | null;
}

const styleFilters = [
    { id: 'cartoon', name: 'Cartoon' },
    { id: 'watercolor painting', name: 'Watercolor' },
    { id: 'cyberpunk', name: 'Cyberpunk' },
    { id: 'pencil sketch', name: 'Sketch' },
    { id: 'pop art', name: 'Pop Art' },
];

export const EditorControls: React.FC<EditorControlsProps> = ({ 
    onEdit, 
    isLoading, 
    objectToRemove, 
    setObjectToRemove,
    textPrompt,
    setTextPrompt, 
    onReset,
    editedImage
}) => {

  const handleToolClick = (tool: string, option?: string) => {
    if (tool !== 'remove-object' && tool !== 'text-prompt') {
        onEdit(tool, option);
    }
  };

  return (
    <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 p-6 rounded-2xl shadow-lg flex flex-col gap-6 sticky top-24">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">Quick Tools</h3>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleToolClick('remove-bg')}
            disabled={isLoading}
            className="w-full text-left px-4 py-3 bg-gray-700 hover:bg-indigo-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Remove Background
          </button>
          <button
            onClick={() => handleToolClick('color-correct')}
            disabled={isLoading}
            className="w-full text-left px-4 py-3 bg-gray-700 hover:bg-indigo-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Auto Color Correct
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-base font-semibold mb-3 text-white">Edit with Text</h3>
        <div className="flex flex-col gap-3">
          <textarea
            value={textPrompt}
            onChange={(e) => setTextPrompt(e.target.value)}
            placeholder="e.g., 'make the sky look like a sunset'"
            className="w-full h-24 px-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
            disabled={isLoading}
          />
          <button
            onClick={() => onEdit('text-prompt', textPrompt)}
            disabled={isLoading || !textPrompt.trim()}
            className="w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Apply Text Edit
          </button>
        </div>
      </div>

       <div>
        <h3 className="text-base font-semibold mb-3 text-white">Remove Object</h3>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={objectToRemove}
            onChange={(e) => setObjectToRemove(e.target.value)}
            placeholder="e.g., 'the red car'"
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            disabled={isLoading}
          />
          <button
            onClick={() => onEdit('remove-object')}
            disabled={isLoading || !objectToRemove.trim()}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-indigo-600 rounded-lg transition-all disabled:opacity-50"
          >
            Apply Removal
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold mb-3 text-white">Style Filters</h3>
        <div className="grid grid-cols-2 gap-3">
          {styleFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleToolClick('style-filter', filter.id)}
              disabled={isLoading}
              className="px-3 py-2 text-sm bg-gray-700 hover:bg-indigo-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {filter.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="border-t border-gray-700 pt-6 mt-2 flex flex-col gap-3">
        <a
          href={editedImage ?? '#'}
          download="edited-image.png"
          role="button"
          aria-disabled={!editedImage || isLoading}
          className={`w-full text-center px-4 py-3 font-semibold rounded-lg transition-colors ${
            !editedImage || isLoading
              ? 'bg-gray-600 text-white opacity-50 cursor-not-allowed pointer-events-none'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
          onClick={(e) => {
            if (!editedImage || isLoading) e.preventDefault();
          }}
        >
          Download Image
        </a>
         <button
            onClick={onReset}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Start Over
          </button>
      </div>
    </div>
  );
};
