import React, { useState, useCallback, useEffect } from 'react';
import { generateImage, generateVideo } from '../services/geminiService';
import { ImageUploader } from '../components/ImageUploader';
import { Spinner } from '../components/Spinner';
import { SegmentedControl } from '../components/SegmentedControl';
import { ApiKeyDialog } from '../components/ApiKeyDialog';
import { HistoryPanel } from '../components/HistoryPanel';

type GeneratorType = 'image' | 'video';
type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
type VideoAspectRatio = '16:9' | '9:16';
type VideoResolution = '720p' | '1080p';

export type ImageHistoryItem = {
  id: string;
  prompt: string;
  aspectRatio: AspectRatio;
  imageUrl: string;
};

const imageAspectRatios: { value: AspectRatio, label: string }[] = [
    { value: '1:1', label: 'Square (1:1)' },
    { value: '16:9', label: 'Landscape (16:9)' },
    { value: '9:16', label: 'Portrait (9:16)' },
    { value: '4:3', label: 'Standard (4:3)' },
    { value: '3:4', label: 'Tall (3:4)' },
];

const videoAspectRatios: { value: VideoAspectRatio, label: string }[] = [
    { value: '16:9', label: 'Landscape (16:9)' },
    { value: '9:16', label: 'Portrait (9:16)' },
];

const videoResolutions: { value: VideoResolution, label: string }[] = [
    { value: '720p', label: 'HD (720p)' },
    { value: '1080p', label: 'Full HD (1080p)' },
];


export const GeneratorPage: React.FC = () => {
    const [generatorType, setGeneratorType] = useState<GeneratorType>('image');
    const [prompt, setPrompt] = useState<string>('');
    const [imageAspectRatio, setImageAspectRatio] = useState<AspectRatio>('1:1');
    const [videoAspectRatio, setVideoAspectRatio] = useState<VideoAspectRatio>('16:9');
    const [videoResolution, setVideoResolution] = useState<VideoResolution>('720p');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
    const [startImageFile, setStartImageFile] = useState<File | null>(null);
    const [startImagePreview, setStartImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [imageHistory, setImageHistory] = useState<ImageHistoryItem[]>([]);
    
    // VEO API Key State
    const [hasApiKey, setHasApiKey] = useState<boolean>(false);
    const [isCheckingApiKey, setIsCheckingApiKey] = useState<boolean>(true);


    const checkApiKey = useCallback(async () => {
      if (typeof window.aistudio?.hasSelectedApiKey === 'function') {
        setIsCheckingApiKey(true);
        const keyStatus = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(keyStatus);
        setIsCheckingApiKey(false);
      } else {
         // If aistudio is not available, assume we can proceed for local dev
        setHasApiKey(true);
        setIsCheckingApiKey(false);
      }
    }, []);

    useEffect(() => {
        if (generatorType === 'video') {
            checkApiKey();
        }
    }, [generatorType, checkApiKey]);

    const handleImageGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const imageUrl = await generateImage(prompt, imageAspectRatio);
            setGeneratedImage(imageUrl);
            
            const newHistoryItem: ImageHistoryItem = {
                id: crypto.randomUUID(),
                prompt,
                aspectRatio: imageAspectRatio,
                imageUrl,
            };
            setImageHistory(prev => [newHistoryItem, ...prev]);

        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred during image generation.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVideoGenerate = async () => {
        if (!prompt.trim() && !startImageFile) {
            setError('Please enter a prompt or upload a starting image.');
            return;
        }

        if (typeof window.aistudio?.hasSelectedApiKey === 'function') {
            const keyStatus = await window.aistudio.hasSelectedApiKey();
            if (!keyStatus) {
                setError("API Key not selected. Please select an API key to proceed.");
                setHasApiKey(false);
                return;
            }
            setHasApiKey(true);
        }

        setIsLoading(true);
        setError(null);
        setGeneratedVideo(null);

        try {
            const videoUrl = await generateVideo(prompt, videoAspectRatio, videoResolution, startImageFile);
            setGeneratedVideo(videoUrl);
        } catch (e) {
            if (e instanceof Error && e.message.includes("Requested entity was not found.")) {
                setError("API Key is invalid. Please select a valid key.");
                setHasApiKey(false);
                if (typeof window.aistudio?.openSelectKey === 'function') {
                    await window.aistudio.openSelectKey();
                    setHasApiKey(true);
                }
            } else {
                setError(e instanceof Error ? e.message : 'An unknown error occurred during video generation.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = useCallback((file: File) => {
        setStartImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setStartImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }, []);
    
    const clearStartImage = () => {
        setStartImageFile(null);
        setStartImagePreview(null);
    };

    const handleReuseHistoryItem = useCallback((item: ImageHistoryItem) => {
      setPrompt(item.prompt);
      setImageAspectRatio(item.aspectRatio);
      setGeneratedImage(item.imageUrl);
      window.scrollTo(0, 0);
    }, []);

    const handleClearHistory = useCallback(() => {
      setImageHistory([]);
    }, []);

    const renderImageGenerator = () => (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 xl:col-span-3">
                <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 p-6 rounded-2xl shadow-lg flex flex-col gap-6 sticky top-24">
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-white">Image Generation</h3>
                        <p className="text-sm text-gray-400 mb-4">Describe the image you want to create.</p>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'A cinematic shot of a raccoon astronaut on Mars'"
                            className="w-full h-32 px-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold mb-3 text-white">Aspect Ratio</h3>
                        <SegmentedControl
                            options={imageAspectRatios}
                            value={imageAspectRatio}
                            onChange={(val) => setImageAspectRatio(val as AspectRatio)}
                        />
                    </div>
                    <button
                        onClick={handleImageGenerate}
                        disabled={isLoading || !prompt.trim()}
                        className="w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading && <Spinner />}
                        {isLoading ? 'Generating...' : 'Generate Image'}
                    </button>
                </div>
                {imageHistory.length > 0 && (
                  <div className="mt-8">
                      <HistoryPanel
                          history={imageHistory}
                          onReuse={handleReuseHistoryItem}
                          onClear={handleClearHistory}
                      />
                  </div>
                )}
            </div>
            <div className="lg:col-span-8 xl:col-span-9">
                 {error && (
                    <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 flex flex-col aspect-square">
                    <h3 className="text-lg font-semibold mb-4 text-center text-white">Generated Image</h3>
                    <div className="relative flex-grow flex items-center justify-center bg-black/20 rounded-lg">
                        {isLoading && !generatedImage ? (
                            <div className="flex flex-col items-center">
                                <Spinner />
                                <p className="mt-4 text-white font-medium">Generating your image...</p>
                            </div>
                        ) : generatedImage ? (
                            <img src={generatedImage} alt="Generated by AI" className="max-w-full max-h-full object-contain rounded-md" />
                        ) : (
                            <p className="text-gray-500">Your generated image will appear here</p>
                        )}
                         {generatedImage && !isLoading && (
                            <a
                            href={generatedImage}
                            download="generated-image.png"
                            className="absolute bottom-4 right-4 bg-indigo-600 text-white font-bold py-2 px-4 rounded-full hover:bg-indigo-700 transition-transform hover:scale-105 shadow-lg"
                            >
                            Download
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
    
    const renderVideoGenerator = () => {
         if (isCheckingApiKey) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Spinner />
                </div>
            );
        }

        if (!hasApiKey) {
            return (
                <div className="max-w-md mx-auto">
                    <ApiKeyDialog setHasApiKey={setHasApiKey} />
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 xl:col-span-3">
                    <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 p-6 rounded-2xl shadow-lg flex flex-col gap-6 sticky top-24">
                         <div>
                            <h3 className="text-lg font-semibold mb-3 text-white">Video Generation</h3>
                            <p className="text-sm text-gray-400 mb-4">Describe the video you want to create.</p>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., 'A majestic whale breaching in a neon ocean'"
                                className="w-full h-32 px-4 py-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold mb-3 text-white">Starting Image (Optional)</h3>
                            {!startImagePreview ? (
                                <div className="p-4 border-2 border-dashed border-gray-600 rounded-lg">
                                    <ImageUploader onImageUpload={handleImageUpload} />
                                </div>
                            ) : (
                                <div className="relative">
                                    <img src={startImagePreview} alt="Start" className="rounded-lg w-full" />
                                    <button onClick={clearStartImage} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 leading-none text-xl hover:bg-black/80">&times;</button>
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-base font-semibold mb-3 text-white">Aspect Ratio</h3>
                            <SegmentedControl
                                options={videoAspectRatios}
                                value={videoAspectRatio}
                                onChange={(val) => setVideoAspectRatio(val as VideoAspectRatio)}
                            />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold mb-3 text-white">Resolution</h3>
                             <SegmentedControl
                                options={videoResolutions}
                                value={videoResolution}
                                onChange={(val) => setVideoResolution(val as VideoResolution)}
                            />
                        </div>

                         <button
                            onClick={handleVideoGenerate}
                            disabled={isLoading || (!prompt.trim() && !startImageFile)}
                            className="w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading && <Spinner />}
                            {isLoading ? 'Generating Video...' : 'Generate Video'}
                        </button>
                    </div>
                </div>
                 <div className="lg:col-span-8 xl:col-span-9">
                    {error && (
                        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 flex flex-col aspect-video">
                        <h3 className="text-lg font-semibold mb-4 text-center text-white">Generated Video</h3>
                        <div className="relative flex-grow flex items-center justify-center bg-black/20 rounded-lg">
                           {isLoading && !generatedVideo ? (
                                <div className="flex flex-col items-center text-center p-4">
                                    <Spinner />
                                    <p className="mt-4 text-white font-medium">Generating your video...</p>
                                    <p className="text-sm text-gray-400 mt-2">This can take a few minutes. Please be patient.</p>
                                </div>
                            ) : generatedVideo ? (
                               <video src={generatedVideo} controls autoPlay loop className="max-w-full max-h-full object-contain rounded-md" />
                            ) : (
                                <p className="text-gray-500">Your generated video will appear here</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="max-w-md mx-auto mb-8">
                 <SegmentedControl
                    options={[
                        { label: 'Generate Image', value: 'image' },
                        { label: 'Generate Video', value: 'video' },
                    ]}
                    value={generatorType}
                    onChange={(val) => {
                        setGeneratorType(val as GeneratorType);
                        setError(null);
                        setPrompt('');
                    }}
                 />
            </div>
            {generatorType === 'image' ? renderImageGenerator() : renderVideoGenerator()}
        </div>
    );
};
