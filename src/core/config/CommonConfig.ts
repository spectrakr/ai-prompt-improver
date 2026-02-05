import { ConfigStorage } from "../../common/storage";

export class CommonConfig {
    private improverEnabled: boolean;
    private improveGuide: string;
    private temperature: number;
    private topP: number;
    private maxOutputTokens: number;

    private constructor(
        improverEnabled: boolean,
        improveGuide: string,
        temperature: number,
        topP: number,
        maxOutputTokens: number
    ) {
        this.improverEnabled = improverEnabled;
        this.improveGuide = improveGuide;
        this.temperature = temperature;
        this.topP = topP;
        this.maxOutputTokens = maxOutputTokens;
    }

    static from(storage: ConfigStorage): CommonConfig {
        return new CommonConfig(
            storage.improverEnabled,
            storage.improveGuide,
            storage.commonConfig.temperature,
            storage.commonConfig.topP,
            storage.commonConfig.maxOutputTokens
        );
    }

    update(storage: ConfigStorage): void {
        this.improverEnabled = storage.improverEnabled;
        this.improveGuide = storage.improveGuide;
        this.temperature = storage.commonConfig.temperature;
        this.topP = storage.commonConfig.topP;
        this.maxOutputTokens = storage.commonConfig.maxOutputTokens;
    }

    // Getters
    getImproverEnabled(): boolean {
        return this.improverEnabled;
    }

    getImproveGuide(): string {
        return this.improveGuide;
    }

    getTemperature(): number {
        return this.temperature;
    }

    getTopP(): number {
        return this.topP;
    }

    getMaxOutputTokens(): number {
        return this.maxOutputTokens;
    }

    // Setters (optional, for manual updates)
    setImproverEnabled(enabled: boolean): void {
        this.improverEnabled = enabled;
    }

    setImproveGuide(guide: string): void {
        this.improveGuide = guide;
    }
}