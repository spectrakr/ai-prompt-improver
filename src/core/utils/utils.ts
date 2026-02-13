import { ModelNameType } from "../../type/modelType";
import { targetUrls } from "../constant/targetUrls";
import { ConversationContext } from "../context/ContextService";
import { persona, responseGuide, systemPrompt } from "../constant/promptConstants";

export const getAiServiceName = (): ModelNameType => {
    const url = window.location.href;
    const foundEntry = Object.entries(targetUrls).find(([modelName, urls]) =>
        urls.some((targetUrl) => url.startsWith(targetUrl)),
    );

    return foundEntry ? (foundEntry[0] as ModelNameType) : "";
};

export const buildPrompt = (originalPrompt: string, improveGuide: string, contexts: ConversationContext[]): string => {
    const contextSection =
        contexts.length > 0
            ? `\n${contexts.map((c) => `[${c.role}]: ${c.content}`).join("\n")}\n\n`
            : "";

    return `
${systemPrompt}

${persona}

${responseGuide}

---
**conversationContext:**    
${contextSection}
**improveGuide:**
${improveGuide}

**originalPrompt:**
${originalPrompt}
`;
};
