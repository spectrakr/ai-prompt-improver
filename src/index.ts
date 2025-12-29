import { StorageData } from "./core/types/type";
import { Config } from "./core/config/Config";
import { PromptUIManger } from "./core/PromptUIManger";
import { PromptImprover } from "./core/PromptImprover";
import { GeminiElements } from "./core/GeminiElements";

const init = async () => {
    const config = new Config();
    const geminiElements = new GeminiElements();

    try {
        await geminiElements.loadElement();
    } catch (error) {
        throw new Error("Failed initializing");
    }

    const uiManager = new PromptUIManger(config, geminiElements);
    const promptImprover = new PromptImprover(uiManager, config, geminiElements);

    chrome.storage.sync.get(["improverEnabled", "geminiApiKey", "improveGuide"], (result: StorageData) => {
        const isEnabled = result.improverEnabled || false;
        const geminiApiKey = result.geminiApiKey || "";
        const improveGuide = result.improveGuide || "";

        config.updateIsEnabled(isEnabled);
        config.updateGeminiApiKey(geminiApiKey);
        config.updateImproveGuide(improveGuide);

        if (geminiApiKey) {
            promptImprover.init();
        }
    });

    chrome.storage.onChanged.addListener((changes) => {
        const isEnabledChange = changes.improverEnabled;
        const geminiApiKeyChange = changes.geminiApiKey;
        const improveGuide = changes.improveGuide;

        if (isEnabledChange) {
            uiManager.updateCheckboxState();
        }

        if (geminiApiKeyChange && !uiManager.getCheckboxAdded() && geminiApiKeyChange.newValue) {
            config.updateIsEnabled(isEnabledChange.newValue as boolean);
            config.updateGeminiApiKey(geminiApiKeyChange.newValue as string);
            config.updateImproveGuide(improveGuide.newValue as string);

            promptImprover.init();
        }
    });
};

init();
