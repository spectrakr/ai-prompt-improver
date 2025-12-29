import { Config } from "./config/Config";
import { checkboxStyle, loadingWindow } from "./utils/constants";
import { GeminiElements } from "./GeminiElements";

export class PromptUIManger {
    private checkboxAdded: boolean = false;
    private readonly config: Config;
    private readonly geminiElements: GeminiElements;

    constructor(config: Config, geminiElements: GeminiElements) {
        this.config = config;
        this.geminiElements = geminiElements;
    }

    public render() {
        if (this.checkboxAdded) return;

        this.addCheckbox();
    }

    public getCheckboxAdded(): boolean {
        return this.checkboxAdded;
    }

    public updateCheckboxState() {
        const checkbox = document.getElementById("improver-toggle") as HTMLInputElement;
        if (checkbox) {
            checkbox.checked = this.config.getIsEnabled();
        }
    }

    public updateCheckboxAdded(checkboxAdded: boolean) {
        this.checkboxAdded = checkboxAdded;
        this.render();
    }

    public showLoading() {
        const loading = document.createElement("div");

        loading.id = "improver-loading";
        loading.className = "improver-loading";
        loading.innerHTML = loadingWindow;

        document.body.appendChild(loading);
    }

    public hideLoading() {
        const loading = document.getElementById("improver-loading");

        if (loading) loading.remove();
    }

    public showImprovementDialog(analysis: any) {
        const existingDialog = document.getElementById("improvement-dialog");
        if (existingDialog) existingDialog.remove();

        const $dialog = document.createElement("div");
        $dialog.id = "improvement-dialog";
        $dialog.className = "improvement-dialog";
        $dialog.innerHTML = this.createDialog(analysis);

        const $improvedText = $dialog.querySelector(".improved-text") as HTMLDivElement;
        $improvedText.textContent = analysis.improved;

        document.body.appendChild($dialog);
        this.addDialogEvents($dialog, analysis);
    }

    private async addCheckbox() {
        const checkboxContainer = document.createElement("div");
        const container = this.geminiElements.getContainer() as HTMLDivElement;

        checkboxContainer.id = "prompt-improver-checkbox";
        checkboxContainer.className = "improver-checkbox-container";
        checkboxContainer.style.cssText = checkboxStyle;
        checkboxContainer.innerHTML = this.createCheckbox();

        container.insertBefore(checkboxContainer, container.firstChild);
        this.checkboxAdded = true;

        const checkbox = document.getElementById("improver-toggle") as HTMLInputElement;

        checkbox.addEventListener("change", (e: Event) => {
            const isEnabled = (e.target as HTMLInputElement).checked;
            chrome.storage.sync.set({ improverEnabled: isEnabled }).then(() => this.config.updateIsEnabled(isEnabled));
        });
    }

    private createCheckbox() {
        return `
        <label class="improver-checkbox-label">
          <input type="checkbox" id="improver-toggle" ${this.config.getIsEnabled() ? "checked" : ""}>
          <span>프롬프트 개선 사용</span>
        </label>
        `;
    }

    private createDialog(analysis: any) {
        return `
            <div class="improvement-overlay"></div>
            <div class="improvement-content">
              <div class="improvement-header">
                <h3>프롬프트 개선 제안</h3>
                <button class="close-btn" id="close-dialog">×</button>
              </div>
              
              <div class="improvement-body">
                <div class="score-section">
                  <span class="score-label">현재 점수:</span>
                  <span class="score-value">${analysis.score}/10</span>
                </div>
                
                ${
                    analysis.issues && analysis.issues.length > 0
                        ? `
                  <div class="issues-section">
                    <h4>발견된 문제:</h4>
                    <ul>
                      ${analysis.issues.map((issue: string) => `<li>${issue}</li>`).join("")}
                    </ul>
                  </div>
                `
                        : ""
                }
                
                <div class="improved-section">
                  <h4>개선된 프롬프트</h4>
                  <div class="improved-text"></div>
                  <button class="btn btn-primary" id="modify" style="margin-top: 20px">수정</button>
                  <button class="btn btn-primary" id="complete" style="margin-top: 20px; display: none">완료</button>
                </div>
                
                ${
                    analysis.improvements && analysis.improvements.length > 0
                        ? `
                  <div class="improvements-section">
                    <h4>개선 사항</h4>
                    <ul>
                      ${analysis.improvements.map((imp: string) => `<li>${imp}</li>`).join("")}
                    </ul>
                  </div>
                `
                        : ""
                }
              </div>
              
              <div class="improvement-footer">
                <button class="btn btn-secondary" id="use-original">원본 사용</button>
                <button class="btn btn-primary" id="use-improved">개선된 프롬프트 사용</button>
              </div>
            </div>
          `;
    }

    private addDialogEvents(dialog: HTMLDivElement, analysis: any) {
        (dialog.querySelector(".improvement-overlay") as Element).addEventListener("click", () => dialog.remove());

        (dialog.querySelector(".improvement-content") as Element).addEventListener("click", (e) => e.stopPropagation());

        (document.getElementById("modify") as Element).addEventListener("click", () => this.switchToTextarea());

        (document.getElementById("complete") as Element).addEventListener("click", () => this.switchToDiv());

        (document.getElementById("close-dialog") as Element).addEventListener("click", () => dialog.remove());

        (document.getElementById("use-original") as Element).addEventListener("click", () => {
            dialog.remove();
            this.simulateSubmit();
        });

        (document.getElementById("use-improved") as Element).addEventListener("click", () => {
            const $improved = document.querySelector(".improved-text") as HTMLElement;

            if ($improved.tagName === "textarea") {
                analysis.improved = ($improved as HTMLInputElement).value;
            } else {
                analysis.improved = ($improved as HTMLDivElement).textContent;
            }

            dialog.remove();

            this.setPromptText(analysis.improved);
            setTimeout(() => {
                this.simulateSubmit();
            }, 300);
        });
    }

    private switchToTextarea() {
        const $completeButton = document.getElementById("complete") as HTMLElement;
        const $modifyButton = document.getElementById("modify") as HTMLElement;

        $completeButton.style.display = "block";
        $modifyButton.style.display = "none";

        const $improved = document.querySelector(".improved-text") as Element;
        const $textarea = document.createElement("textarea");

        $textarea.className = $improved.className;
        $textarea.value = $improved.textContent || "";

        $improved.parentNode?.replaceChild($textarea, $improved);
    }

    private switchToDiv() {
        const $completeButton = document.getElementById("complete") as HTMLElement;
        const $modifyButton = document.getElementById("modify") as HTMLElement;

        $completeButton.style.display = "none";
        $modifyButton.style.display = "block";

        const $improved = document.querySelector(".improved-text") as HTMLInputElement;
        const $div = document.createElement("div");

        $div.className = $improved.className;
        $div.textContent = $improved.value || "";

        $improved.parentNode?.replaceChild($div, $improved);
    }

    private simulateSubmit() {
        this.geminiElements.getSubmitButton()?.click();
    }

    private setPromptText(text: string) {
        const inputArea = this.geminiElements.getInputArea() as HTMLInputElement;

        if (inputArea.contentEditable === "true" || inputArea.isContentEditable) {
            inputArea.innerText = text;

            ["input", "change", "keyup"].forEach((eventType) => {
                inputArea.dispatchEvent(new Event(eventType, { bubbles: true }));
            });

            const range = document.createRange();
            const sel = window.getSelection() as Selection;

            range.selectNodeContents(inputArea);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        } else {
            inputArea.value = text;
            inputArea.dispatchEvent(new Event("input", { bubbles: true }));
            inputArea.dispatchEvent(new Event("change", { bubbles: true }));
        }
    }
}
