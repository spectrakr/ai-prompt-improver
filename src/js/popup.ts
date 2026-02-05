import { ConfigManager } from "../core/config/ConfigManager";

// DOM 요소
const improverEnableToggle = document.getElementById("enableToggle") as HTMLInputElement;
const toggleStatus = document.getElementById("toggleStatus") as HTMLSpanElement;
const geminiApiKeyInput = document.getElementById("geminiApiKey") as HTMLInputElement;
const openAiApiKeyInput = document.getElementById("openAiApiKey") as HTMLInputElement;
const claudeApiKeyInput = document.getElementById("claudeApiKey") as HTMLInputElement;
const saveButton = document.getElementById("save") as HTMLButtonElement;
const openSettingsButton = document.getElementById("openSettings") as HTMLButtonElement;

let clearErrorTimer: NodeJS.Timeout;
let configManager: ConfigManager;

// 설정 로드
async function loadSettings(): Promise<void> {
    try {
        configManager = ConfigManager.getInstance();
        await configManager.init();

        const modelConfig = configManager.getModelConfig();
        const commonConfig = configManager.getCommonConfig();

        // 기능 활성화 상태 로드
        improverEnableToggle.checked = commonConfig.getImproverEnabled();
        updateToggle();

        geminiApiKeyInput.value = modelConfig.getApiKey("gemini") || "";
        openAiApiKeyInput.value = modelConfig.getApiKey("openAi") || "";
        claudeApiKeyInput.value = modelConfig.getApiKey("claude") || "";
    } catch (error) {
        console.error("설정 로드 실패:", error);
    }
}

// 설정 저장
async function saveSettings(): Promise<void> {
    try {
        const geminiApiKey = geminiApiKeyInput.value.trim();
        const openAiApiKey = openAiApiKeyInput.value.trim();
        const claudeApiKey = claudeApiKeyInput.value.trim();
        const improverEnabled = improverEnableToggle.checked;

        // 에러 스타일 초기화
        clearValidationErrors();

        // 최소 하나의 API 키 필요 검증
        if (!geminiApiKey && !openAiApiKey && !claudeApiKey) {
            showValidationError();
            return;
        }

        console.log("storage updated");
        // ConfigManager를 통해 storage 업데이트 (자동으로 도메인 객체도 업데이트됨)
        await configManager.updateStorage((current) => ({
            ...current,
            improverEnabled,
            modelConfig: {
                gemini: { apiKey: geminiApiKey },
                openAi: { apiKey: openAiApiKey },
                claude: { apiKey: claudeApiKey },
            },
        }));

        // 버튼을 "저장됨" 상태로 변경
        setSavedButtonState();
    } catch (error) {
        console.error("설정 저장 실패:", error);
    }
}

// API 키 검증 에러 표시
function showValidationError(): void {
    const infoBox = document.querySelector(".info-box") as HTMLElement;

    geminiApiKeyInput.classList.add("error");
    openAiApiKeyInput.classList.add("error");
    claudeApiKeyInput.classList.add("error");

    if (infoBox) {
        infoBox.classList.add("error");
    }

    clearTimeout(clearErrorTimer);
    clearErrorTimer = setTimeout(clearValidationErrors, 2000);
}

// 검증 에러 스타일 제거
function clearValidationErrors(): void {
    const infoBox = document.querySelector(".info-box") as HTMLElement;

    geminiApiKeyInput.classList.remove("error");
    openAiApiKeyInput.classList.remove("error");
    claudeApiKeyInput.classList.remove("error");

    if (infoBox) {
        infoBox.classList.remove("error");
    }
}

// 저장 버튼을 "저장됨" 상태로 변경
function setSavedButtonState(): void {
    saveButton.textContent = "저장됨";
    saveButton.classList.add("saved");
    saveButton.disabled = true;
}

// 저장 버튼을 원래 상태로 복귀
function resetSaveButton(): void {
    saveButton.textContent = "저장";
    saveButton.classList.remove("saved");
    saveButton.disabled = false;
}

// 입력 필드 변경 감지
function handleInputChange(): void {
    resetSaveButton();
}

// 기능 활성화 토글 처리
function updateToggle(): void {
    handleInputChange();

    if (improverEnableToggle.checked) {
        toggleStatus.textContent = "활성";
        toggleStatus.classList.add("active");
        return;
    }
    toggleStatus.textContent = "비활성";
    toggleStatus.classList.remove("active");
}

// 고급 설정 페이지 열기
function openOptionsPage(): void {
    chrome.runtime.openOptionsPage();
}

// 이벤트 리스너
document.addEventListener("DOMContentLoaded", loadSettings);
improverEnableToggle.addEventListener("change", updateToggle);
saveButton.addEventListener("click", saveSettings);
openSettingsButton.addEventListener("click", openOptionsPage);

// 입력 필드 변경 감지
[geminiApiKeyInput, openAiApiKeyInput, claudeApiKeyInput].forEach((input) => {
    input.addEventListener("input", handleInputChange);
});

// Enter 키로 저장
[geminiApiKeyInput, openAiApiKeyInput, claudeApiKeyInput].forEach((input) => {
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            saveSettings();
        }
    });
});
