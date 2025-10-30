
import { GoogleGenAI, Modality, Chat, GenerateContentResponse } from "@google/genai";

// Utility to convert a File object to a base64 string with its MIME type.
const fileToBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('FileReader did not return a string.'));
      }
      const result = reader.result;
      const mimeType = result.split(':')[1].split(';')[0];
      const base64Data = result.split(',')[1];
      resolve({ mimeType, data: base64Data });
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

// Edits an image based on a text prompt.
export const applyImageEdit = async (imageFile: File, prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const { mimeType, data: base64ImageData } = await fileToBase64(imageFile);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64ImageData, mimeType } },
        { text: prompt },
      ],
    },
    config: { responseModalities: [Modality.IMAGE] },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data found in the AI response.");
};

// Generates an image from a text prompt using Imagen.
export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/png',
      aspectRatio,
    },
  });

  const base64ImageBytes = response.generatedImages[0].image.imageBytes;
  return `data:image/png;base64,${base64ImageBytes}`;
};

// Analyzes an image and returns a text description.
export const analyzeImage = async (imageFile: File, useProModel: boolean): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const { mimeType, data: base64ImageData } = await fileToBase64(imageFile);
  
  const model = useProModel ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
  const config = useProModel ? { thinkingConfig: { thinkingBudget: 32768 } } : {};

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: base64ImageData, mimeType } },
        { text: 'Describe this image in detail.' },
      ],
    },
    config,
  });

  return response.text;
};

// Creates a new chat session.
export const createChat = (): Chat => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
        systemInstruction: 'You are a helpful and friendly assistant.',
    },
  });
};

// Generates a video from a prompt and an optional image.
export const generateVideo = async (
  prompt: string,
  aspectRatio: '16:9' | '9:16',
  resolution: '720p' | '1080p',
  imageFile?: File | null
): Promise<string> => {
    
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let imagePayload;
  if (imageFile) {
    const { mimeType, data } = await fileToBase64(imageFile);
    imagePayload = { imageBytes: data, mimeType };
  }
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    image: imagePayload,
    config: {
      numberOfVideos: 1,
      resolution,
      aspectRatio,
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("Video generation failed or returned no link.");
  }
  
  // The SDK returns a pre-authenticated URL, so no API key is needed for the fetch.
  const response = await fetch(downloadLink);
  const videoBlob = await response.blob();
  return URL.createObjectURL(videoBlob);
};