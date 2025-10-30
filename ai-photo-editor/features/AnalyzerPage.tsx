
import React, { useState, useCallback } from 'react';
import { ImageUploader } from '../components/ImageUploader';
import { Spinner } from '../components/Spinner';
import { analyzeImage } from '../services/geminiService';

export const AnalyzerPage: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = useCallback((file: File) => {
        setImageFile(file);
        setAnalysis('');
        setError(null);
        
        const reader = new FileReader();
        reader.onloadend = () => {
        setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }, []);

    const handleAnalyze = async (useProModel: boolean) => {
        if (!imageFile) return;

        setIsLoading(true);
        setError(null);
        setAnalysis('');

        try {
            const result = await analyzeImage(imageFile, useProModel);
            setAnalysis(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred during analysis.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const resetState = useCallback(() => {
        setImageFile(null);
        setImagePreview(null);
        setAnalysis('');
        setError(null);
        setIsLoading(false);
    }, []);


    if (!imageFile) {
        return (
            <div className="max-w-xl mx-auto">
                <ImageUploader onImageUpload={handleImageUpload} />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-6">
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 flex flex-col">
                    <h3 className="text-lg font-semibold mb-4 text-center text-white">Your Image</h3>
                    <div className="relative flex-grow flex items-center justify-center bg-black/20 rounded-lg">
                        <img src={imagePreview!} alt="Uploaded for analysis" className="max-w-full max-h-[50vh] object-contain rounded-md" />
                    </div>
                </div>
                 <div className="bg-gray-800/80 border border-gray-700 p-6 rounded-2xl shadow-lg flex flex-col gap-4">
                    <h3 className="text-lg font-semibold text-white">Analysis Tools</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={() => handleAnalyze(false)}
                            disabled={isLoading}
                            className="px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            Quick Analyze
                        </button>
                        <button
                            onClick={() => handleAnalyze(true)}
                            disabled={isLoading}
                            className="px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            Deep Analyze
                        </button>
                    </div>
                     <button
                        onClick={resetState}
                        disabled={isLoading}
                        className="w-full mt-2 px-4 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        Upload Another
                    </button>
                </div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                 <h3 className="text-lg font-semibold mb-4 text-white">AI Analysis Result</h3>
                {error && (
                    <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                 <div className="relative bg-black/20 rounded-lg min-h-[400px] p-4 prose prose-invert prose-p:text-gray-300">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <Spinner />
                            <p className="mt-4">Analyzing image...</p>
                        </div>
                    ) : (
                        <p className="whitespace-pre-wrap">{analysis || 'Analysis result will appear here.'}</p>
                    )}
                 </div>
            </div>
        </div>
    );
};
