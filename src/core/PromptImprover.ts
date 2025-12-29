import { PromptUIManger } from "./PromptUIManger";
import { Config } from "./config/Config";
import { getErrorMessage, showError } from "./utils/utils";
import { geminiApi } from "./apis/geminiApi";
import { GeminiElements } from "./GeminiElements";
import { Prompt } from "./Prompt";

export class PromptImprover {
    private readonly uiManager: PromptUIManger;
    private readonly config: Config;
    private readonly geminiElements: GeminiElements;

    constructor(uiManager: PromptUIManger, config: Config, geminiElements: GeminiElements) {
        this.uiManager = uiManager;
        this.config = config;
        this.geminiElements = geminiElements;
    }

    public init() {
        this.uiManager.render();

        const inputArea = this.geminiElements.getInputArea() as HTMLInputElement;
        const observer = new MutationObserver(() => {
            const existingCheckbox = document.getElementById("prompt-improver-checkbox");

            if (!existingCheckbox) {
                this.uiManager.updateCheckboxAdded(false);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
        });

        setInterval(() => {
            const existingCheckbox = document.getElementById("prompt-improver-checkbox");

            if (!existingCheckbox && this.config.getGeminiApiKey()) {
                this.uiManager.updateCheckboxAdded(false);
            }
        }, 3000);

        this.interceptSubmit(inputArea);
    }

    private interceptSubmit(inputArea: HTMLInputElement) {
        if (inputArea.dataset.improverAttached === "true") {
            return;
        }

        inputArea.dataset.improverAttached = "true";
        inputArea.addEventListener("keydown", (e) => this.interceptSubmitKeyboardEvent(e), true);

        const observer = new MutationObserver(() => {
            const submitButton = this.geminiElements.getSubmitButton() as HTMLButtonElement;

            if (submitButton && !submitButton.dataset.improverAttached) {
                submitButton.dataset.improverAttached = "true";
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    private async interceptSubmitKeyboardEvent(e: KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            const inputArea = this.geminiElements.getInputArea() as HTMLInputElement;
            const checkbox = document.getElementById("improver-toggle") as HTMLInputElement;

            if (checkbox && checkbox.checked && this.config.getGeminiApiKey()) {
                const prompt: string = this.getPromptText(inputArea);

                if (prompt.trim().length > 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();

                    await this.handlePromptImprovement(prompt);
                }
            }
        }
    }

    private getPromptText(inputArea: HTMLInputElement) {
        if (inputArea.contentEditable === "true" || inputArea.isContentEditable) {
            return inputArea.innerText || inputArea.textContent || "";
        }
        return inputArea.value || "";
    }

    private async handlePromptImprovement(originalPrompt: string) {
        this.uiManager.showLoading();

        try {
            const analysis = await this.analyzePrompt(originalPrompt);

            this.uiManager.hideLoading();
            this.uiManager.showImprovementDialog(analysis);
        } catch (error) {
            this.uiManager.hideLoading();
            console.error("Gemini Prompt Improver 오류:", error);
            showError("프롬프트 분석 중 오류가 발생했습니다: " + getErrorMessage(error));
        }
    }

    private async analyzePrompt(originalPrompt: string): Promise<any> {
        const improveGuide = this.config.getImproveGuide();
        const prompt = new Prompt(improveGuide, originalPrompt);
        const apiKey = this.config.getGeminiApiKey();

        return geminiApi(apiKey, prompt).then(async (response) => {
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API 요청 실패: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();

            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error("API 응답 형식이 올바르지 않습니다");
            }

            const text = data.candidates[0].content.parts[0].text;
            const jsonMatch = text.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            throw new Error("응답 파싱 실패");
        });
    }
}
