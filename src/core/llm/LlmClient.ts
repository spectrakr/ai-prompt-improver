import { Improvement } from "../improver/Improvement";

export interface LlmClient {
    analyzePrompt(originalPrompt: string): Promise<Improvement>;
}