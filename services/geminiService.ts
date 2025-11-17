import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedStory } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        hook: {
            type: Type.STRING,
            description: "A single, powerful, and cinematic prompt for the very first scene. This should be exceptionally descriptive and engaging, following the specific hook scene requirements."
        },
        storyPrompts: {
            type: Type.ARRAY,
            description: "An array of strings, where each string is a detailed, realistic prompt for a subsequent scene in the story.",
            items: {
                type: Type.STRING
            }
        }
    },
    required: ["hook", "storyPrompts"]
};

export const generateStoryPrompts = async (userPrompts: string): Promise<GeneratedStory> => {
    const promptCount = userPrompts.split('\n').filter(line => line.trim() !== '').length;

    const prompt = `
        You are an expert story crafter and a prompt engineer for AI video generation models.
        Your task is to analyze a user's collection of story ideas and generate a completely new, consistent, and cinematic story based on them.

        **CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE RULES WITHOUT EXCEPTION:**

        1.  **Character Consistency:**
            *   Whenever you mention a "puppy", you MUST use the exact phrase: "A cute fluffy white puppy wearing a yellow bandana".
            *   Whenever you mention a "baby", you MUST use the exact phrase: "a 5-month-old baby in a yellow onesie".
            *   Maintain these exact descriptions every single time these characters appear in any prompt.

        2.  **Hook Scene Requirement:**
            *   The 'hook' prompt MUST describe the following specific scene: A witch is standing with her back to "a 5-month-old baby in a yellow onesie". The baby is on the floor, playing happily and unaware. The witch must be secretly holding a dangerous object behind her back (e.g., a large, writhing centipede, a glowing poison potion, or a sharp, cursed dagger). The scene must feel tense and ominous.

        3.  **General Scene Consistency:**
            *   Maintain strict consistency throughout all prompts. If a scene is set during the 'day' in a 'forest', subsequent scenes in that location must also be in a 'forest' during the 'day', unless the story narrative explicitly transitions to 'night'. Do not change locations or time of day randomly between prompts. All details must be consistent.

        4.  **Prompt Count:**
            *   The user has provided ${promptCount} prompts. You MUST generate exactly ${promptCount} new story prompts in the 'storyPrompts' array, in addition to the hook.

        5.  **Output Format:**
            *   The output must be a valid JSON object matching the provided schema. Do not include any text, markdown, or code block formatting outside of the JSON object.

        **User's Original Prompts for Inspiration:**
        ---
        ${userPrompts}
        ---

        Now, based on all the above rules and the user's ideas, generate the new story.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.8,
            },
        });

        const text = response.text.trim();
        const parsedJson = JSON.parse(text);

        // Basic validation
        if (typeof parsedJson.hook === 'string' && Array.isArray(parsedJson.storyPrompts)) {
            return parsedJson as GeneratedStory;
        } else {
            throw new Error("Invalid JSON structure received from API.");
        }

    } catch (error) {
        console.error("Error generating story prompts:", error);
        throw new Error("Failed to generate story from prompts. The model might be overloaded or the input was invalid.");
    }
};
