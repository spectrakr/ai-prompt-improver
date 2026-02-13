export const targetResponseSelectors: Record<string, string[]> = {
    gemini: ["model-response"],
    openAi: ['[data-message-author-role="assistant"]'],
    claude: ['[data-testid="ai-turn"]'],
};

export const targetUserQuerySelectors: Record<string, string[]> = {
    gemini: [".user-query", ".query-text"],
    openAi: ['[data-message-author-role="user"]'],
    claude: ['[data-testid="human-turn"]'],
};
