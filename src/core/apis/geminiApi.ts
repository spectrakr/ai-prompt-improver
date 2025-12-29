import { Prompt } from "../Prompt";
import { systemPrompt } from "../utils/promptConstants";

export const geminiApi = async (apiKey: string, prompt: Prompt) => {
    const promptJson = JSON.stringify(prompt);
    const text = systemPrompt + "\n" + promptJson.toString();

    return fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: text,
                        },
                    ],
                },
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            },
        }),
    });
};
