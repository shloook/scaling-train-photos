import React from 'react';
import { Spinner } from './Spinner';

interface ImageViewerProps {
  originalImage: string | null;
  editedImage: string | null;
  isLoading: boolean;
}

const ImageCard: React.FC<{ title: string; imageUrl: string | null; children?: React.ReactNode }> = ({ title, imageUrl, children }) => (
  <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 flex flex-col h-full">
    <h3 className="text-lg font-semibold mb-4 text-center text-white">{title}</h3>
    <div className="relative flex-grow flex items-center justify-center bg-black/20 rounded-lg min-h-[200px] sm:min-h-[300px] md:min-h-[400px]">
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="max-w-full max-h-full object-contain rounded-md" />
      ) : (
        <div className="text-gray-500">
          {children || <p>No image</p>}
        </div>
      )}
    </div>
  </div>
);

export const ImageViewer: React.FC<ImageViewerProps> = ({ originalImage, editedImage, isLoading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ImageCard title="Original" imageUrl={originalImage} />
      
      <div className="relative">
         <ImageCard title="Edited" imageUrl={editedImage}>
            {!isLoading && <p>AI-edited image will appear here</p>}
         </ImageCard>
         {isLoading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-2xl">
            <Spinner />
            <p className="mt-4 text-white font-medium">AI is working its magic...</p>
          </div>
        )}
      </div>
    </div>
  );
};
