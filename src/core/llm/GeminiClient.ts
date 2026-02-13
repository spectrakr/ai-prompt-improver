import { LlmClient } from "./LlmClient";
import { Improvement, ImprovementResult } from "../improver/Improvement";
import { CommonConfig } from "../config/CommonConfig";
import { GoogleGenAI } from "@google/genai";
import { isEmpty } from "../utils/stringUtil";
import { ConversationContext } from "../context/ContextService";
import { buildPrompt } from "../utils/utils";

export class GeminiClient implements LlmClient {
    private client: GoogleGenAI;
    private commonConfig: CommonConfig;
    private modelName: string = "gemini-2.5-flash-lite";

    constructor(apiKey: string, commonConfig: CommonConfig) {
        this.client = new GoogleGenAI({ apiKey });
        this.commonConfig = commonConfig;
    }

    async analyzePrompt(originalPrompt: string, contexts: ConversationContext[]): Promise<Improvement> {
        try {
            const improveGuide = this.commonConfig.getImproveGuide();
            const prompt = buildPrompt(improveGuide, originalPrompt, contexts);

            const result = await this.client.models.generateContent({
                model: this.modelName,
                contents: [
                    {
                        role: "user",
                        parts: [{ text: prompt }],
                    },
                ],
                config: {
                    temperature: this.commonConfig.getTemperature(),
                    topP: this.commonConfig.getTopP(),
                    maxOutputTokens: this.commonConfig.getMaxOutputTokens(),
                    responseMimeType: "application/json",
                },
            });

            console.log(result);
            const text = result.text;

            if (isEmpty(text)) throw new Error("No response from Gemini");

            const parsed = JSON.parse(text as string) as ImprovementResult;
            return Improvement.fromResult(parsed);
        } catch (error) {
            throw new Error(`Failed to analyze prompt with Gemini: ${error}`);
        }
    }
}
