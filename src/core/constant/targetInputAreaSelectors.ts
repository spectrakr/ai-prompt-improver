export const targetInputAreaSelectors: Record<string, string[]> = {
    gemini: [
        ".ql-editor[contenteditable='true']", // 최우선
        ".rich-textarea .ql-editor",
    ],
    openAi: [".chat-input-container textarea"],
    claude: [".chat-input-container textarea"],
};