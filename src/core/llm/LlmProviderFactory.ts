import { LlmClient } from "./LlmClient";
import { CommonConfig } from "../config/CommonConfig";
import { ModelConfig } from "../config/ModelConfig";
import { GeminiClient } from "./GeminiClient";
import { ClaudeClient } from "./ClaudeClient";
import { OpenAiClient } from "./OpenAiClient";
import { ModelNameType } from "../../type/modelType";

export class LlmProviderFactory {
    static create(commonConfig: CommonConfig, modelConfig: ModelConfig): LlmClient | null {
        const selectedModelName = modelConfig.getSelectedModel();

        if (!selectedModelName) {
            console.warn("No model selected");
            return null;
        }

        const apiKey = modelConfig.getApiKey(selectedModelName);
        if (!apiKey) {
            console.warn(`No API key for model: ${selectedModelName}`);
            return null;
        }

        return this.createClient(selectedModelName, apiKey, commonConfig);
    }

    private static createClient(
        modelName: ModelNameType,
        apiKey: string,
        commonConfig: CommonConfig
    ): LlmClient | null {
        switch (modelName) {
            case "gemini":
                return new GeminiClient(apiKey, commonConfig);
            case "claude":
                return new ClaudeClient(apiKey, commonConfig);
            case "openAi":
                return new OpenAiClient(apiKey, commonConfig);
            default:
                console.warn(`Unknown model: ${modelName}`);
                return null;
        }
    }
}