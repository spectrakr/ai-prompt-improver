import { ConfigStorage } from "../../common/storage";
import { ModelNameType } from "../../type/modelType";
import { isNotEmpty } from "../utils/stringUtil";

export class ModelConfig {
    private readonly apiKeys: Map<ModelNameType, string>;
    private readonly selectedModel: ModelNameType;

    private constructor(apiKeys: Map<ModelNameType, string>, selectedModel: ModelNameType) {
        this.apiKeys = apiKeys;
        this.selectedModel = selectedModel;
    }

    static from(storage: ConfigStorage): ModelConfig {
        const apiKeys = new Map<ModelNameType, string>();

        apiKeys.set("gemini", storage.modelConfig.gemini.apiKey);
        apiKeys.set("openAi", storage.modelConfig.openAi.apiKey);
        apiKeys.set("claude", storage.modelConfig.claude.apiKey);

        return new ModelConfig(apiKeys, storage.selectedModel);
    }

    update(storage: ConfigStorage): void {}

    getApiKey(modelName: ModelNameType): string {
        return this.apiKeys.get(modelName) || "";
    }

    getSelectedModel(): ModelNameType {
        return this.selectedModel;
    }
    
    validateSelectedModel(): boolean {
        return isNotEmpty(this.getApiKey(this.selectedModel));
    }

    private updateApiKeys(modelConfig: any) {
        const apiKeys = new Map<ModelNameType, string>();

        apiKeys.set("gemini", modelConfig.gemini.apiKey);
        apiKeys.set("openAi", modelConfig.openAi.apiKey);
        apiKeys.set("claude", modelConfig.claude.apiKey);
    }
}
