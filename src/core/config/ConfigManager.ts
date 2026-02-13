import { ConfigStorage, PROMPTTIER_DEFAULT_CONFIG } from "../../common/storage";
import { CommonConfig } from "./CommonConfig";
import { ModelConfig } from "./ModelConfig";

export class ConfigManager {
    private static instance: ConfigManager | null = null;

    private commonConfig: CommonConfig | null = null;
    private modelConfig: ModelConfig | null = null;
    private slackWebhookUrl: string = "";
    private initialized: boolean = false;

    private constructor() {
    }

    static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    async init(): Promise<void> {
        if (this.initialized) {
            return;
        }

        try {
            const result = await chrome.storage.sync.get("prompttierConfig");
            const configStorage: ConfigStorage =
                (result.prompttierConfig as ConfigStorage) || PROMPTTIER_DEFAULT_CONFIG;

            this.commonConfig = CommonConfig.from(configStorage);
            this.modelConfig = ModelConfig.from(configStorage);
            this.slackWebhookUrl = configStorage.slackWebhookUrl || "";

            this.setupStorageListener();

            this.initialized = true;
        } catch (error) {
            console.error("Failed to initialize ConfigManager:", error);
            throw error;
        }
    }

    private setupStorageListener(): void {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            console.log("Storage changed:", changes, areaName);
            if (areaName !== "sync") return;

            const configChange = changes.prompttierConfig;
            if (!configChange) return;

            const newConfig: ConfigStorage = configChange.newValue as ConfigStorage;
            this.updateConfigs(newConfig);
        });
    }

    private updateConfigs(configStorage: ConfigStorage): void {
        if (!this.commonConfig || !this.modelConfig) {
            console.error("ConfigManager not initialized");
            return;
        }

        this.commonConfig.update(configStorage);
        this.modelConfig.update(configStorage);
        this.slackWebhookUrl = configStorage.slackWebhookUrl || "";
    }

    getCommonConfig(): CommonConfig {
        if (!this.initialized || !this.commonConfig) {
            throw new Error("ConfigManager not initialized. Call init() first.");
        }
        return this.commonConfig;
    }

    getModelConfig(): ModelConfig {
        if (!this.initialized || !this.modelConfig) {
            throw new Error("ConfigManager not initialized. Call init() first.");
        }
        return this.modelConfig;
    }

    getSlackWebhookUrl(): string {
        if (!this.initialized) {
            throw new Error("ConfigManager not initialized. Call init() first.");
        }
        return this.slackWebhookUrl;
    }

    async updateStorage(
        updates: Partial<ConfigStorage> | ((current: ConfigStorage) => ConfigStorage)
    ): Promise<void> {
        try {
            const result = await chrome.storage.sync.get("prompttierConfig");
            const currentConfig: ConfigStorage =
                (result.prompttierConfig as ConfigStorage) || PROMPTTIER_DEFAULT_CONFIG;

            let newConfig: ConfigStorage;
            if (typeof updates === "function") {
                newConfig = updates(currentConfig);
            } else {
                newConfig = { ...currentConfig, ...updates };
            }

            await chrome.storage.sync.set({ prompttierConfig: newConfig });
        } catch (error) {
            console.error("Failed to update storage:", error);
            throw error;
        }
    }
}
