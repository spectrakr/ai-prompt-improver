export class Config {
    private isEnabled: boolean = false;
    private geminiApiKey: string = "";
    private improveGuide: string = "";

    constructor() {}

    getIsEnabled(): boolean {
        return this.isEnabled;
    }

    getGeminiApiKey() {
        return this.geminiApiKey;
    }

    getImproveGuide() {
        return this.improveGuide;
    }

    updateIsEnabled(isEnabled: boolean) {
        this.isEnabled = isEnabled;
    }

    updateGeminiApiKey(geminiApiKey: string) {
        this.geminiApiKey = geminiApiKey;
    }

    updateImproveGuide(value: string) {
        this.improveGuide = value;
    }
}
