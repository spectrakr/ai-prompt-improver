import { Improvement } from "../improver/Improvement";
import { ConversationContext } from "../context/ContextService";

export interface LlmClient {
    analyzePrompt(originalPrompt: string, contexts: ConversationContext[]): Promise<Improvement>;
}