import { targetUrls } from "../constant/targetUrls";
import { ModelNameType } from "../../type/modelType";
import { isEmpty } from "../utils/stringUtil";
import { targetSubmitButtonSelectors } from "../constant/targetSubmitButtonSelectors";
import { targetInputAreaSelectors } from "../constant/targetInputAreaSelectors";
import { ImproverService } from "../improver/ImproverService";
import { Improvement } from "../improver/Improvement";
import { AnalysisDialog } from "./component/AnalysisDialog";
import { LoadingWindow } from "./component/LoadingWindow";
import { SlackService } from "../thirdparty/slack/SlackService";
import { getAiServiceName } from "../utils/utils";

export class UiManager {
    private static instance: UiManager | null = null;

    private readonly prompttierService: ImproverService;
    private readonly analysisDialog: AnalysisDialog;
    private readonly loadingWindow: LoadingWindow;
    private readonly slackService: SlackService;
    private readonly MAX_RETRY_COUNT = 10;
    private readonly RETRY_DELAY = 500;

    private modelName: ModelNameType = "";
    private inputArea: HTMLElement | null = null;
    private submitButton: HTMLElement | null = null;
    private currentUrl: string = "";

    private constructor() {
        this.prompttierService = ImproverService.getInstance();
        this.analysisDialog = AnalysisDialog.getInstance();
        this.loadingWindow = LoadingWindow.getInstance();
        this.slackService = SlackService.getInstance();
    }

    static getInstance(): UiManager {
        if (UiManager.instance) {
            return UiManager.instance;
        }
        return new UiManager();
    }

    init(): void {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => {
                this.checkAndSetupInputArea();
            });
        } else {
            this.checkAndSetupInputArea();
        }

        this.observeUrlChanges();
    }

    getInputArea(): HTMLElement | null {
        return this.inputArea;
    }

    getSubmitButton(): HTMLElement | null {
        return this.submitButton;
    }

    private observeUrlChanges(): void {
        window.addEventListener("popstate", () => {
            this.checkAndSetupInputArea();
        });

        history.pushState = (...args) => {
            history.pushState.apply(history, args);
            this.checkAndSetupInputArea();
        };

        history.replaceState = (...args) => {
            history.replaceState.apply(history, args);
            this.checkAndSetupInputArea();
        };

        // MutationObserver로 DOM 변경 감지 (SPA 페이지 전환)
        const observer = new MutationObserver(() => {
            const newUrl = window.location.href;
            if (this.currentUrl !== newUrl) {
                this.currentUrl = newUrl;
                this.checkAndSetupInputArea();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    private checkAndSetupInputArea(): void {
        const currentUrl = window.location.href;
        const modelName = getAiServiceName();

        if (isEmpty(modelName)) {
            this.inputArea = null;
            return;
        }

        this.modelName = modelName;
        this.setInputElements();

        if (this.modelName === "gemini") {
            this.slackService.init();
        }
    }

    private setInputElements(): void {
        // 기존 이벤트 리스너 제거
        if (this.inputArea) {
            this.inputArea.removeEventListener("keydown", this.handleInterceptEnter);
        }

        // inputArea와 submitButton 초기화
        this.inputArea = null;
        this.submitButton = null;

        let retryCount = 0;

        const retry = setInterval(() => {
            if (retryCount++ >= this.MAX_RETRY_COUNT) {
                clearInterval(retry);
                console.warn("[Prompttier] Failed to find input elements after", this.MAX_RETRY_COUNT, "retries");
                return;
            }

            this.findElements();

            if (this.inputArea && this.submitButton) {
                clearInterval(retry);
                console.log("[Prompttier] Input elements found, attaching event listener");
                this.inputArea.addEventListener("keydown", this.handleInterceptEnter);
            }
        }, this.RETRY_DELAY);
    }

    private findElements(): void {
        if (!this.inputArea) this.findInputArea();
        if (!this.submitButton) this.findSubmitButton();
    }

    private findInputArea(): void {
        for (const selector of targetInputAreaSelectors[this.modelName]) {
            const element = document.querySelector(selector) as HTMLElement;

            if (element) {
                this.inputArea = element;
            }
        }
    }

    private findSubmitButton(): void {
        for (const selector of targetSubmitButtonSelectors[this.modelName]) {
            const button = document.querySelector(selector) as HTMLElement;

            if (button) {
                this.submitButton = button;
            }
        }
    }

    private handleInterceptEnter = (event: KeyboardEvent): void => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            event.stopPropagation();

            this.prompttierHandler(event).then();
        }
    };

    private prompttierHandler = async (_event: Event): Promise<void> => {
        const originalPrompt = this.inputArea?.textContent?.trim();

        if (!originalPrompt) {
            console.warn("[Prompttier] No prompt to improve");
            return;
        }

        // 로딩 표시
        this.showLoading();

        try {
            const result = await this.prompttierService.improvePrompt(originalPrompt);
            console.log("[Prompttier] Improvement result:", result);

            // 로딩 숨기기
            this.hideLoading();

            // 결과가 없으면 (비활성화 또는 API 키 없음) 원본 그대로 제출
            if (!result) {
                console.warn("[Prompttier] No improvement result, submitting original prompt");
                this.submitPrompt(originalPrompt);
                return;
            }

            // 다이얼로그 표시
            this.showAnalysisDialog(result, originalPrompt);
        } catch (error) {
            console.error("[Prompttier] Failed to improve prompt:", error);
            this.hideLoading();
            alert("프롬프트 개선에 실패했습니다. 콘솔을 확인해주세요.");
        }
    };

    // 로딩 표시
    private showLoading(): void {
        this.loadingWindow.render();
    }

    // 로딩 숨기기
    private hideLoading(): void {
        this.loadingWindow.remove();
    }

    // 분석 다이얼로그 표시
    private showAnalysisDialog(improvement: Improvement, originalPrompt: string): void {
        this.analysisDialog.render(improvement, originalPrompt, this.submitPrompt.bind(this));
    }

    // 프롬프트 제출
    private submitPrompt(text: string): void {
        if (!this.inputArea) {
            console.error("[Prompttier] No input area found");
            return;
        }

        // input 영역에 텍스트 설정 및 이벤트 발생
        this.inputArea.textContent = text;

        // 약간의 딜레이 후 submit 버튼 클릭 (DOM 업데이트 대기)
        setTimeout(() => {
            if (this.submitButton) {
                this.submitButton.click();
            } else {
                console.warn("[Prompttier] No submit button found");
            }
        }, 100);
    }
}
