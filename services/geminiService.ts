import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// In-memory cache to save API calls during session
const imageCache: Record<string, string> = {};

export const generateTarotImage = async (prompt: string): Promise<string> => {
  if (imageCache[prompt]) {
    return imageCache[prompt];
  }

  if (!apiKey) {
    console.warn("No API Key found. Returning placeholder.");
    return `https://picsum.photos/400/600?blur=2`; // Fallback
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
         imageConfig: {
           aspectRatio: "3:4",
         }
      }
    });

    let imageUrl = '';
    
    // Iterate through parts to find the image
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64EncodeString = part.inlineData.data;
                imageUrl = `data:image/png;base64,${base64EncodeString}`;
                break;
            }
        }
    }

    if (!imageUrl) {
        throw new Error("No image data found in response");
    }

    imageCache[prompt] = imageUrl;
    return imageUrl;

  } catch (error) {
    console.error("Error generating image:", error);
    return `https://picsum.photos/400/600?grayscale`; // Error fallback
  }
};