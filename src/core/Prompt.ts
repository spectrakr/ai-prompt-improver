import { defaultGuidePrompt, persona, responseGuide } from "./utils/promptConstants";

export class Prompt {
    private persona: string;
    private responseGuide: string;
    private improveGuide: string;
    private originalPrompt: string;

    constructor(improveGuide: string, originalPrompt: string) {
        this.persona = persona;
        this.responseGuide = responseGuide;
        this.improveGuide = improveGuide || defaultGuidePrompt;
        this.originalPrompt = originalPrompt || "";
    }
}
