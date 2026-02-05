import { LlmClient } from "./LlmClient";
import { Improvement, ImprovementResult } from "../improver/Improvement";
import { CommonConfig } from "../config/CommonConfig";
import Anthropic from "@anthropic-ai/sdk";
import { systemPrompt, persona, responseGuide } from "../constant/promptConstants";
import { isEmpty } from "../utils/stringUtil";

export class ClaudeClient implements LlmClient {
    private client: Anthropic;
    private commonConfig: CommonConfig;
    private modelName: string = "claude-3-5-sonnet-20241022";

    constructor(apiKey: string, commonConfig: CommonConfig) {
        this.client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
        this.commonConfig = commonConfig;
    }

    async analyzePrompt(originalPrompt: string): Promise<Improvement> {
        try {
            const improveGuide = this.commonConfig.getImproveGuide();
            const userPrompt = this.buildPrompt(improveGuide, originalPrompt);

            const message = await this.client.messages.create({
                model: this.modelName,
                max_tokens: this.commonConfig.getMaxOutputTokens(),
                temperature: this.commonConfig.getTemperature(),
                top_p: this.commonConfig.getTopP(),
                system: `${systemPrompt}\n\n${persona}\n\n${responseGuide}`,
                messages: [
                    {
                        role: "user",
                        content: userPrompt,
                    },
                ],
            });
            const textBlock = message.content.find((block) => block.type === "text");

            if (isEmpty(textBlock) || textBlock?.type !== "text") {
                throw new Error("No text response from Claude");
            }

            const text = textBlock.text;
            const parsed = JSON.parse(text) as ImprovementResult;
            return Improvement.fromResult(parsed);
        } catch (error) {
            throw new Error(`Failed to analyze prompt with Claude: ${error}`);
        }
    }

    private buildPrompt(improveGuide: string, originalPrompt: string): string {
        return `**improveGuide:**
${improveGuide}

**originalPrompt:**
${originalPrompt}`;
    }
}