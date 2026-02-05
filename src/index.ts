import { ConfigManager } from "./core/config/ConfigManager";
import { UiManager } from "./core/ui/UiManager";

const init = async () => {
    const configManager = ConfigManager.getInstance();
    const uiManager = UiManager.getInstance();

    configManager.init().then(() => console.log("ConfigManager Initialized"));
    uiManager.init();
};

init().then(() => console.log("Prompttier Initialized"));
