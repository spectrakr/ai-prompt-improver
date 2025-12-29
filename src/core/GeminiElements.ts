import { containerSelectors, inputAreaSelectors, submitButtonSelectors } from "./utils/selectors";
import { Callback } from "./types/type";

export class GeminiElements {
    private readonly MAX_ATTEMPT = 10;
    private readonly SLEEP_MS = 500;

    private inputArea: HTMLInputElement | undefined;
    private container: HTMLDivElement | undefined;
    private submitButton: HTMLButtonElement | undefined;

    public async loadElement() {
        this.inputArea = (await this.attempt(this.findInputArea.bind(this))) as HTMLInputElement;
        this.container = (await this.attempt(this.findContainer.bind(this))) as HTMLDivElement;
        this.submitButton = (await this.attempt(this.findSubmitButton.bind(this))) as HTMLButtonElement;
    }

    public getInputArea() {
        return this.inputArea;
    }

    public getContainer() {
        return this.container;
    }

    public getSubmitButton() {
        return this.submitButton;
    }

    private findInputArea(): any {
        return this.findElement(inputAreaSelectors);
    }

    private findContainer(): any {
        return this.findElement(containerSelectors);
    }

    private findSubmitButton(): any {
        return this.findElement(submitButtonSelectors);
    }

    private findElement(selectors: string[]) {
        const element = selectors.map((selector) => document.querySelector(selector)).find((e) => e !== null);

        if (!element) {
            console.error("Cannot find gemini element : ", selectors.toString());
            return null;
        }

        return element;
    }

    private async attempt(cb: Callback): Promise<any> {
        let attempt = 0;

        while (attempt < this.MAX_ATTEMPT) {
            const element = cb();

            if (element) return element;

            await this.sleep(this.SLEEP_MS);
            attempt++;
        }

        throw new Error("Gemini Element Not Found");
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
