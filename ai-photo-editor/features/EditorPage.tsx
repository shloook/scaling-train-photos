import React, { useState, useCallback } from 'react';
import { ImageUploader } from '../components/ImageUploader';
import { EditorControls } from '../components/EditorControls';
import { ImageViewer } from '../components/ImageViewer';
import { applyImageEdit } from '../services/geminiService';

export const EditorPage: React.FC = () => {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [objectToRemove, setObjectToRemove] = useState<string>('');
  const [textPrompt, setTextPrompt] = useState<string>('');
  
  const handleImageUpload = useCallback((file: File) => {
    setOriginalImageFile(file);
    setEditedImage(null);
    setError(null);
    setObjectToRemove('');
    setTextPrompt('');
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleEdit = useCallback(async (tool: string, option?: string) => {
    if (!originalImageFile) return;

    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    let prompt = '';
    switch (tool) {
      case 'remove-bg':
        prompt = 'Remove the background from this image. The new background should be transparent.';
        break;
      case 'color-correct':
        prompt = 'Perform professional color correction on this image. Enhance brightness, contrast, and saturation for a vibrant but natural look.';
        break;
      case 'remove-object':
        if (!objectToRemove.trim()) {
          setError('Please describe the object you want to remove.');
          setIsLoading(false);
          return;
        }
        prompt = `Remove the ${objectToRemove} from this image. Intelligently fill in the space where the object was.`;
        break;
      case 'style-filter':
        prompt = `Apply a ${option} style to this image.`;
        break;
      case 'text-prompt':
        if (!option || !option.trim()) {
            setError('Please enter a description of the edit you want to make.');
            setIsLoading(false);
            return;
        }
        prompt = option;
        break;
      default:
        setIsLoading(false);
        setError('Unknown editing tool selected.');
        return;
    }

    try {
      const resultDataUrl = await applyImageEdit(originalImageFile, prompt);
      setEditedImage(resultDataUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred during image processing.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImageFile, objectToRemove]);

  const resetState = useCallback(() => {
    setOriginalImageFile(null);
    setOriginalImagePreview(null);
    setEditedImage(null);
    setError(null);
    setIsLoading(false);
    setObjectToRemove('');
    setTextPrompt('');
  }, []);

  return (
    <>
      {!originalImageFile ? (
        <div className="max-w-xl mx-auto">
           <ImageUploader onImageUpload={handleImageUpload} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <EditorControls 
              onEdit={handleEdit} 
              isLoading={isLoading} 
              objectToRemove={objectToRemove}
              setObjectToRemove={setObjectToRemove}
              textPrompt={textPrompt}
              setTextPrompt={setTextPrompt}
              onReset={resetState}
              editedImage={editedImage}
            />
          </div>
          <div className="lg:col-span-8 xl:col-span-9">
            {error && (
              <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <ImageViewer
              originalImage={originalImagePreview}
              editedImage={editedImage}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </>
  );
};
