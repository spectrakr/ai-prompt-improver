export const inputAreaSelectors = [
    ".ql-editor[contenteditable='true']", // 최우선
    "rich-textarea .ql-editor",
];

export const containerSelectors = [
    ".input-area-container",
    ".text-input-field",
    ".input-area",
    ".leading-actions-wrapper",
];

export const submitButtonSelectors = [
    'button[class*="submit"]',
    'button[aria-label*="전송"]',
    'button[aria-label*="Send"]',
    'button[type="submit"]',
    "button.send-button",
    '[data-test-id="send-button"]',
];
