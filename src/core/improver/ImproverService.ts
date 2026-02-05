import { ConfigManager } from "../config/ConfigManager";
import { LlmProviderFactory } from "../llm/LlmProviderFactory";
import { LlmClient } from "../llm/LlmClient";
import { Improvement } from "./Improvement";

export class ImproverService {
    private static instance: ImproverService | null = null;
    private configManager: ConfigManager;
    private llmClient: LlmClient | null = null;

    static getInstance(): ImproverService {
        if (!ImproverService.instance) {
            ImproverService.instance = new ImproverService();
        }
        return ImproverService.instance;
    }

    private constructor() {
        this.configManager = ConfigManager.getInstance();
    }

    async improvePrompt(originalPrompt: string): Promise<Improvement | null> {
        if (!this.isEnabled()) return null;

        this.llmClient = this.getLlmClient();
        if (!this.llmClient) return null;

        return this.llmClient.analyzePrompt(originalPrompt);
    }

    private isEnabled(): boolean {
        const commonConfig = this.configManager.getCommonConfig();
        return commonConfig.getImproverEnabled();
    }

    private showLoading(): void {}

    private getLlmClient(): LlmClient | null {
        const modelConfig = this.configManager.getModelConfig();
        const commonConfig = this.configManager.getCommonConfig();

        return LlmProviderFactory.create(commonConfig, modelConfig);
    }
}