import { LlmClient } from "./LlmClient";
import { Improvement, ImprovementResult } from "../improver/Improvement";
import { CommonConfig } from "../config/CommonConfig";
import OpenAI from "openai";
import { systemPrompt, persona, responseGuide } from "../constant/promptConstants";
import { isEmpty } from "../utils/stringUtil";
import { ConversationContext } from "../context/ContextService";
import { buildPrompt } from "../utils/utils";

export class OpenAiClient implements LlmClient {
    private client: OpenAI;
    private commonConfig: CommonConfig;
    private modelName: string = "gpt-4o-mini";

    constructor(apiKey: string, commonConfig: CommonConfig) {
        this.client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
        this.commonConfig = commonConfig;
    }

    async analyzePrompt(originalPrompt: string, contexts: ConversationContext[]): Promise<Improvement> {
        try {
            const improveGuide = this.commonConfig.getImproveGuide();
            const userPrompt = buildPrompt(improveGuide, originalPrompt, contexts);
            const completion = await this.client.chat.completions.create({
                model: this.modelName,
                messages: [
                    { role: "system", content: `${systemPrompt}\n\n${persona}\n\n${responseGuide}` },
                    { role: "user", content: userPrompt },
                ],
                temperature: this.commonConfig.getTemperature(),
                top_p: this.commonConfig.getTopP(),
                max_tokens: this.commonConfig.getMaxOutputTokens(),
                response_format: { type: "json_object" },
            });
            const text = completion.choices[0]?.message?.content;

            if (isEmpty(text)) throw new Error("No response from OpenAI");

            const parsed = JSON.parse(text as string) as ImprovementResult;
            return Improvement.fromResult(parsed);
        } catch (error) {
            throw new Error(`Failed to analyze prompt with OpenAI: ${error}`);
        }
    }
}