import { StorageData } from "../core/types/type";

chrome.storage.sync.get(["geminiApiKey", "improverEnabled", "improveGuide"], (result: StorageData) => {
    (document.getElementById("enabled") as HTMLInputElement).checked = result.improverEnabled || false;
    (document.getElementById("apiKey") as HTMLInputElement).value = result.geminiApiKey || "";
    (document.getElementById("improvementDirection") as HTMLInputElement).value = result.improveGuide || "";
});

(document.getElementById("save") as HTMLButtonElement).addEventListener("click", () => {
    const enabled = (document.getElementById("enabled") as HTMLInputElement).checked;
    const apiKey = (document.getElementById("apiKey") as HTMLInputElement).value.trim();
    const improveGuide = (document.getElementById("improvementDirection") as HTMLInputElement).value.trim();
    console.log(improveGuide);

    if (!apiKey) {
        showStatus("API 키를 입력해주세요", "error");
        return;
    }

    chrome.storage.sync.set(
        {
            geminiApiKey: apiKey,
            improverEnabled: enabled,
            improveGuide: improveGuide,
        },
        () => {
            showStatus("설정이 저장되었습니다", "success");
        },
    );
});

const showStatus = (message: string, type: string) => {
    const status = document.getElementById("status") as Element;
    status.textContent = message;
    status.className = `status ${type}`;

    setTimeout(() => {
        status.textContent = "";
        status.className = "status";
    }, 3000);
};
