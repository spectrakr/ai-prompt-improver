import { Improvement } from "../../improver/Improvement";
import { PROMPT_ANALYSIS_DIALOG, promptAnalysisDialog } from "./template/promptAnalysis";

export class AnalysisDialog {
    static instance: AnalysisDialog | null = null;

    static getInstance() {
        if (!AnalysisDialog.instance) {
            return new AnalysisDialog();
        }
        return AnalysisDialog.instance;
    }

    render(improvement: Improvement, originalPrompt: string, submitPrompt: (t: string) => void): void {
        const existingDialog = document.getElementById(PROMPT_ANALYSIS_DIALOG);
        if (existingDialog) {
            existingDialog.remove();
        }

        const dialogDiv = document.createElement("div");

        dialogDiv.id = PROMPT_ANALYSIS_DIALOG;
        dialogDiv.innerHTML = promptAnalysisDialog({
            score: improvement.getScore(),
            issues: improvement.getIssues(),
            improved: improvement.getImproved(),
            improvements: improvement.getImprovements(),
        });

        document.body.appendChild(dialogDiv);

        const improvedTextDiv = dialogDiv.querySelector(".improved-text") as HTMLElement;
        if (improvedTextDiv) {
            improvedTextDiv.textContent = improvement.getImproved();
        }

        this.attachDialogEventListeners(dialogDiv, improvement.getImproved(), originalPrompt, submitPrompt);
    }

    // 다이얼로그 이벤트 리스너
    private attachDialogEventListeners(
        dialogDiv: HTMLElement,
        improvedText: string,
        originalPrompt: string,
        submitPrompt: (t: string) => void,
    ): void {
        const closeBtn = dialogDiv.querySelector("#close-dialog");
        closeBtn?.addEventListener("click", () => {
            dialogDiv.remove();
        });

        const overlay = dialogDiv.querySelector(".improvement-overlay");
        overlay?.addEventListener("click", () => {
            dialogDiv.remove();
        });

        const useOriginalBtn = dialogDiv.querySelector("#use-original");
        useOriginalBtn?.addEventListener("click", () => {
            dialogDiv.remove();
            submitPrompt(originalPrompt);
        });

        const useImprovedBtn = dialogDiv.querySelector("#use-improved");
        useImprovedBtn?.addEventListener("click", () => {
            const improvedTextDiv = dialogDiv.querySelector(".improved-text") as HTMLElement;
            const finalText = improvedTextDiv?.textContent || improvedText;

            dialogDiv.remove();
            submitPrompt(finalText);
        });

        const modifyBtn = dialogDiv.querySelector("#modify");
        const completeBtn = dialogDiv.querySelector("#complete");
        const improvedTextDiv = dialogDiv.querySelector(".improved-text") as HTMLElement;

        modifyBtn?.addEventListener("click", () => {
            if (improvedTextDiv) {
                improvedTextDiv.contentEditable = "true";
                improvedTextDiv.focus();
                improvedTextDiv.classList.add("editable");
            }
            (modifyBtn as HTMLElement).style.display = "none";
            (completeBtn as HTMLElement).style.display = "inline-block";
        });

        completeBtn?.addEventListener("click", () => {
            if (improvedTextDiv) {
                improvedTextDiv.contentEditable = "false";
                improvedTextDiv.classList.remove("editable");
            }
            (modifyBtn as HTMLElement).style.display = "inline-block";
            (completeBtn as HTMLElement).style.display = "none";
        });
    }
}
