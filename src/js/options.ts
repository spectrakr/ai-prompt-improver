import { PROMPTTIER_DEFAULT_CONFIG } from "../common/storage";
import { ConfigManager } from "../core/config/ConfigManager";
import { ModelNameType } from "../type/modelType";

// DOM 요소
const improverEnabledCheckbox = document.getElementById("improverEnabled") as HTMLInputElement;
const improveGuideTextarea = document.getElementById("improveGuide") as HTMLTextAreaElement;
const selectedModelDropdown = document.getElementById("selectedModel") as HTMLSelectElement;
const geminiApiKeyInput = document.getElementById("geminiApiKey") as HTMLInputElement;
const openAiApiKeyInput = document.getElementById("openAiApiKey") as HTMLInputElement;
const claudeApiKeyInput = document.getElementById("claudeApiKey") as HTMLInputElement;
const temperatureInput = document.getElementById("temperature") as HTMLInputElement;
const temperatureValue = document.getElementById("temperatureValue") as HTMLSpanElement;
const topPInput = document.getElementById("topP") as HTMLInputElement;
const topPValue = document.getElementById("topPValue") as HTMLSpanElement;
const maxOutputTokensInput = document.getElementById("maxOutputTokens") as HTMLInputElement;
const maxTurnsInput = document.getElementById("maxTurns") as HTMLInputElement;
const maxTurnsValue = document.getElementById("maxTurnsValue") as HTMLSpanElement;
const slackWebhookUrlInput = document.getElementById("slackWebhookUrl") as HTMLInputElement;
const saveButton = document.getElementById("save") as HTMLButtonElement;
const resetButton = document.getElementById("reset") as HTMLButtonElement;
const statusDiv = document.getElementById("status") as HTMLDivElement;

let configManager: ConfigManager;
let clearErrorTimer: NodeJS.Timeout;

// 설정 로드
async function loadSettings(): Promise<void> {
    try {
        configManager = ConfigManager.getInstance();
        await configManager.init();

        const commonConfig = configManager.getCommonConfig();
        const modelConfig = configManager.getModelConfig();

        // 기본 설정
        improverEnabledCheckbox.checked = commonConfig.getImproverEnabled();
        improveGuideTextarea.value = commonConfig.getImproveGuide();
        selectedModelDropdown.value = modelConfig.getSelectedModel();

        geminiApiKeyInput.value = modelConfig.getApiKey("gemini");
        openAiApiKeyInput.value = modelConfig.getApiKey("openAi");
        claudeApiKeyInput.value = modelConfig.getApiKey("claude");

        // 고급 설정
        temperatureInput.value = commonConfig.getTemperature().toString();
        topPInput.value = commonConfig.getTopP().toString();
        maxOutputTokensInput.value = commonConfig.getMaxOutputTokens().toString();
        maxTurnsInput.value = commonConfig.getMaxTurns().toString();

        temperatureValue.textContent = commonConfig.getTemperature().toFixed(1);
        topPValue.textContent = commonConfig.getTopP().toFixed(2);
        maxTurnsValue.textContent = commonConfig.getMaxTurns().toString();

        slackWebhookUrlInput.value = configManager.getSlackWebhookUrl();
    } catch (error) {
        console.error("설정 로드 실패:", error);
        showStatus("설정을 불러오는데 실패했습니다.", "error");
    }
}

// 설정 저장
async function saveSettings(): Promise<void> {
    try {
        // 에러 스타일 초기화
        clearValidationErrors();

        const geminiApiKey = geminiApiKeyInput.value.trim();
        const openAiApiKey = openAiApiKeyInput.value.trim();
        const claudeApiKey = claudeApiKeyInput.value.trim();
        const selectedModel = selectedModelDropdown.value as ModelNameType;
        const improverEnabled = improverEnabledCheckbox.checked;
        const maxOutputTokens = parseInt(maxOutputTokensInput.value, 10);

        // 유효성 검사: 활성화 시 최소 하나의 API 키 필요
        if (improverEnabled && !geminiApiKey && !openAiApiKey && !claudeApiKey) {
            showValidationError("최소 하나의 API 키가 필요합니다.");
            return;
        }

        // 유효성 검사: 선택한 모델의 API 키 확인
        if (selectedModel) {
            const hasSelectedModelApiKey =
                (selectedModel === "gemini" && geminiApiKey) ||
                (selectedModel === "openAi" && openAiApiKey) ||
                (selectedModel === "claude" && claudeApiKey);

            if (!hasSelectedModelApiKey) {
                showValidationError("선택한 모델의 API 키를 입력해주세요.");
                highlightModelSelect();
                return;
            }
        }

        // 유효성 검사: 토큰 범위
        if (maxOutputTokens < 1 || maxOutputTokens > 8192) {
            showStatus("최대 출력 토큰은 1에서 8192 사이여야 합니다.", "error");
            return;
        }

        // ConfigManager를 통해 storage 업데이트
        await configManager.updateStorage((current) => ({
            ...current,
            improverEnabled,
            improveGuide: improveGuideTextarea.value.trim(),
            selectedModel,
            modelConfig: {
                gemini: { apiKey: geminiApiKey },
                openAi: { apiKey: openAiApiKey },
                claude: { apiKey: claudeApiKey },
            },
            commonConfig: {
                ...current.commonConfig,
                temperature: parseFloat(temperatureInput.value),
                topP: parseFloat(topPInput.value),
                maxOutputTokens,
                maxTurns: parseInt(maxTurnsInput.value, 10),
            },
            slackWebhookUrl: slackWebhookUrlInput.value.trim(),
        }));

        // 저장 성공
        setSavedButtonState();
        showStatus("설정이 저장되었습니다!", "success");
    } catch (error) {
        console.error("설정 저장 실패:", error);
        showStatus("설정을 저장하는데 실패했습니다.", "error");
    }
}

// 기본값으로 초기화
async function resetSettings(): Promise<void> {
    if (!confirm("모든 설정을 기본값으로 초기화하시겠습니까?")) {
        return;
    }

    try {
        await configManager.updateStorage(PROMPTTIER_DEFAULT_CONFIG);
        await loadSettings();
        showStatus("설정이 초기화되었습니다.", "success");
    } catch (error) {
        console.error("설정 초기화 실패:", error);
        showStatus("설정을 초기화하는데 실패했습니다.", "error");
    }
}

// API 키 검증 에러 표시
function showValidationError(message: string): void {
    const infoBox = document.getElementById("apiKeyInfo") as HTMLElement;

    geminiApiKeyInput.classList.add("error");
    openAiApiKeyInput.classList.add("error");
    claudeApiKeyInput.classList.add("error");

    if (infoBox) {
        infoBox.classList.add("error");
    }

    showStatus(message, "error");

    clearTimeout(clearErrorTimer);
    clearErrorTimer = setTimeout(clearValidationErrors, 3000);
}

// 검증 에러 스타일 제거
function clearValidationErrors(): void {
    const infoBox = document.getElementById("apiKeyInfo") as HTMLElement;

    geminiApiKeyInput.classList.remove("error");
    openAiApiKeyInput.classList.remove("error");
    claudeApiKeyInput.classList.remove("error");
    selectedModelDropdown.classList.remove("error");

    if (infoBox) {
        infoBox.classList.remove("error");
    }
}

// 모델 선택 강조
function highlightModelSelect(): void {
    selectedModelDropdown.classList.add("error");
    setTimeout(() => {
        selectedModelDropdown.classList.remove("error");
    }, 3000);
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

// 상태 메시지 표시
function showStatus(message: string, type: "success" | "error"): void {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;

    setTimeout(() => {
        statusDiv.className = "status";
        statusDiv.textContent = "";
    }, 3000);
}

// 슬라이더 값 업데이트
function updateSliderValues(): void {
    temperatureValue.textContent = parseFloat(temperatureInput.value).toFixed(1);
    topPValue.textContent = parseFloat(topPInput.value).toFixed(2);
    maxTurnsValue.textContent = maxTurnsInput.value;
}

// 이벤트 리스너
document.addEventListener("DOMContentLoaded", loadSettings);
saveButton.addEventListener("click", saveSettings);
resetButton.addEventListener("click", resetSettings);
temperatureInput.addEventListener("input", () => {
    updateSliderValues();
    handleInputChange();
});
topPInput.addEventListener("input", () => {
    updateSliderValues();
    handleInputChange();
});
maxTurnsInput.addEventListener("input", () => {
    updateSliderValues();
    handleInputChange();
});

// 입력 필드 변경 감지
[
    improverEnabledCheckbox,
    improveGuideTextarea,
    selectedModelDropdown,
    geminiApiKeyInput,
    openAiApiKeyInput,
    claudeApiKeyInput,
    maxOutputTokensInput,
    slackWebhookUrlInput,
].forEach((input) => {
    input.addEventListener("input", handleInputChange);
    input.addEventListener("change", handleInputChange);
});

// Ctrl/Cmd + S로 저장
document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveSettings();
    }
});
