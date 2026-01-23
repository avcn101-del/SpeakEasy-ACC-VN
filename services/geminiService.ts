
import { GoogleGenAI, Type } from "@google/genai";
import { AACSymbol, WordType } from "../types";
import { FRINGE_VOCAB, getVocabListForAI, getSymbolById } from "../data/fringeVocab";

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
    
    // We send the simplified list (id:label) to the AI
    const vocabList = getVocabListForAI();

    try {
        const response = await ai.models.generateContent({
            model: "gemini-flash-lite-latest", 
            contents: `
            Role: AAC Prediction Engine for a 6-year-old Vietnamese child.
            
            Available Vocabulary (ID:Label):
            [${vocabList}]
            
            Current Sentence Context: "${sentenceText}"
            
            Task: Select the 8 most likely next words from the Available Vocabulary list.
            
            Rules:
            1. ONLY return IDs from the provided list. Do not invent new words.
            2. Prioritize nouns (objects/foods) if the sentence ends with "Want" or "Eat".
            3. Prioritize verbs/adjectives if the sentence starts with "I" or "Con".
            `,
            config: {
                systemInstruction: "You are a precise selector. Return JSON array of strings (IDs).",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING } // We just want an array of IDs
                }
            }
        });

        if (response.text) {
            const predictedIds = JSON.parse(response.text) as string[];
            
            // Map the returned IDs back to our full, consistent Symbol objects
            const results: AACSymbol[] = [];
            
            predictedIds.forEach(id => {
                const symbol = getSymbolById(id);
                if (symbol) {
                    // We clone it to ensure unique React keys if needed, 
                    // though for prediction display the static ID is fine.
                    results.push(symbol);
                }
            });

            // If AI returns nothing or invalid IDs, fallback to a default set
            if (results.length === 0) {
                return FRINGE_VOCAB.slice(0, 8);
            }

            return results;
        }
        return [];
    } catch (error) {
        console.error("Gemini prediction failed:", error);
        // Fallback: Return random mix if AI fails
        return FRINGE_VOCAB.slice(0, 8);
    }
};
