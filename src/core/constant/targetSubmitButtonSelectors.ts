export const targetSubmitButtonSelectors: Record<string, string[]> = {
    gemini: [
        'button[class*="submit"]',
        'button[aria-label*="전송"]',
        'button[aria-label*="Send"]',
        'button[type="submit"]',
        "button.send-button",
        '[data-test-id="send-button"]',
    ],
    openAi: [".chat-input-container textarea"],
    claude: [".chat-input-container textarea"],
};
