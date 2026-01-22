import { GoogleGenAI, Type } from "@google/genai";
import { AACSymbol, WordType } from "../types";

// In a real production app, you would proxy this through a backend to protect the key.
// For this demo, we assume the environment variable is present or the user will select it via the window.aistudio flow if we implemented that.
// Since the prompt asks to use process.env.API_KEY, we will use it.

const createAI = () => {
    if (!process.env.API_KEY) {
        console.warn("API_KEY is missing. Gemini features will be disabled.");
        return null;
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const predictNextSymbols = async (currentSentence: string[]): Promise<AACSymbol[]> => {
    const ai = createAI();
    if (!ai) return [];

    const sentenceText = currentSentence.join(' ');
    
    // Enhanced prompt to ensure context-aware predictions for a Vietnamese child.
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `The user is a 6-year-old child communicating in Vietnamese via an AAC app.
            
            Current sentence context: "${sentenceText}"
            
            Task: detailed grammatical and semantic analysis of the sentence so far to predict the single most likely NEXT word.
            Provide 4 distinct options that grammatically fit the context.
            
            Requirements:
            - Vocabulary suitable for a 6-year-old.
            - Must flow naturally from the previous words.
            - Return JSON with label (Vietnamese), emoji, color (tailwind bg-*-200 border-*-400), and type (NOUN, VERB, ADJECTIVE).
            - Colors: Nouns=orange, Verbs=green, Adjectives=blue.`,
            config: {
                systemInstruction: "You are an expert Speech Language Pathologist assisting a Vietnamese child. Prioritize grammatical correctness and core vocabulary.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            label: { type: Type.STRING },
                            emoji: { type: Type.STRING },
                            color: { type: Type.STRING },
                            type: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        if (response.text) {
            const rawData = JSON.parse(response.text);
            // Map to our AACSymbol type, adding IDs
            return rawData.map((item: any, index: number) => ({
                id: `prediction-${index}-${Date.now()}`,
                label: item.label,
                emoji: item.emoji,
                color: item.color,
                type: item.type as WordType
            }));
        }
        return [];
    } catch (error) {
        console.error("Gemini prediction failed:", error);
        return [];
    }
};