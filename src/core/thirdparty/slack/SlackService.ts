import { targetResponseSelectors } from "../../constant/targetResponseSelectors";
import slackIcon from "../../../resource/svg/slack-svg-48.svg";
import { ConfigManager } from "../../config/ConfigManager";

export class SlackService {
    private static instance: SlackService | null = null;
    private observer: MutationObserver | null = null;
    private readonly SLACK_ICON_SVG = slackIcon;

    private constructor() {}

    static getInstance(): SlackService {
        if (!SlackService.instance) {
            SlackService.instance = new SlackService();
        }
        return SlackService.instance;
    }

    init(): void {
        this.setupObserver();
        this.processExistingResponses();
    }

    private setupObserver(): void {
        if (this.observer) return;

        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === "childList") {
                    mutation.addedNodes.forEach((node) => {
                        if (node instanceof HTMLElement) {
                            this.findAndAttachButtons(node);
                        }
                    });
                }
            }
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    private processExistingResponses(): void {
        this.findAndAttachButtons(document.body);
    }

    private findAndAttachButtons(root: HTMLElement): void {
        const responseSelectors = targetResponseSelectors.gemini;
        for (const selector of responseSelectors) {
            const responses = root.querySelectorAll(selector);
            responses.forEach((response) => {
                if (response instanceof HTMLElement) {
                    this.attachSlackButton(response);
                }
            });
        }
    }

    private attachSlackButton(responseBlock: HTMLElement): void {
        // 이미 버튼이 달려있는지 확인
        if (responseBlock.querySelector(".prompttier-slack-share-container")) {
            return;
        }

        // 컨테이너 생성
        const container = document.createElement("div");
        container.className = "prompttier-slack-share-container";
        container.innerHTML = `
            <button class="prompttier-slack-share-button">
                ${this.SLACK_ICON_SVG}
                공유하기
            </button>
        `;

        // 버튼 클릭 이벤트
        const button = container.querySelector(".prompttier-slack-share-button");
        button?.addEventListener("click", (e) => {
            e.stopPropagation();
            this.handleShare(responseBlock);
        });

        // 상대 좌표 계산을 위해 responseBlock 스타일 확인
        if (window.getComputedStyle(responseBlock).position === "static") {
            responseBlock.style.position = "relative";
        }

        responseBlock.appendChild(container);

        // 호버 이벤트
        responseBlock.addEventListener("mouseenter", () => {
            container.classList.add("visible");
        });

        responseBlock.addEventListener("mouseleave", () => {
            container.classList.remove("visible");
        });
    }

    private async handleShare(responseBlock: HTMLElement): Promise<void> {
        const configManager = ConfigManager.getInstance();
        const webhookUrl = configManager.getSlackWebhookUrl();

        if (!webhookUrl) {
            alert("Slack Webhook URL이 설정되지 않았습니다. 옵션 페이지에서 설정해주세요.");
            return;
        }

        const button = responseBlock.querySelector(".prompttier-slack-share-button") as HTMLButtonElement | null;
        if (button) {
            button.textContent = "전송 중...";
            button.disabled = true;
        }
        const answer = responseBlock.innerText.trim();
        const question = this.findQuestionForResponse(responseBlock);

        const text = question ? `\n🙋‍♂️ *질문*\n${question}\n\n🤖 *AI의 답변*${answer}` : answer;
        const payload = { text };
        console.log("[Slack] Slack payload:", payload);

        try {
            const response = await fetch(webhookUrl, {
                method: "POST",
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                if (button) {
                    button.textContent = "전송됨!";
                    setTimeout(() => {
                        button.innerHTML = `${this.SLACK_ICON_SVG} 공유하기`;
                        button.disabled = false;
                    }, 2000);
                }
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error("Slack 전송 실패:", error);
            if (button) {
                button.textContent = "전송 실패";
                setTimeout(() => {
                    button.innerHTML = `${this.SLACK_ICON_SVG} 공유하기`;
                    button.disabled = false;
                }, 2000);
            }
        }
    }

    private findQuestionForResponse(responseBlock: HTMLElement): string | null {
        // Gemini 구조상 보통 model-response 이전에 user-query 가 있음
        // 형제 노드를 거슬러 올라가며 질문을 찾음
        let current: Element | null = responseBlock;
        while (current) {
            const queryText = current.querySelector(".query-text, .user-query");
            if (queryText) {
                return (queryText as HTMLElement).innerText.trim();
            }
            
            // 이전 형제 탐색
            const prev: Element | null = current.previousElementSibling;
            if (prev) {
                current = prev;
            } else {
                // 부모로 올라가서 다시 탐색
                current = current.parentElement;
                if (current === document.body) break;
            }
        }
        return null;
    }
}