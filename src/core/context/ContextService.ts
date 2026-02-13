import { targetResponseSelectors, targetUserQuerySelectors } from "../constant/targetResponseSelectors";
import { MAX_CONTENT_LENGTH } from "../constant/contextConstants";
import { ConfigManager } from "../config/ConfigManager";
import { getAiServiceName } from "../utils/utils";

export interface ConversationContext {
    role: 'User' | 'Assistant';
    content: string;
}

export class ContextService {
    private static instance: ContextService | null = null;
    private readonly configManager: ConfigManager;

    static getInstance(): ContextService {
        if (!ContextService.instance) {
            ContextService.instance = new ContextService();
        }
        return ContextService.instance;
    }

    private constructor() {
        this.configManager = ConfigManager.getInstance();
    }

    extract(): ConversationContext[] {
        const maxTurns = this.configManager.getCommonConfig().getMaxTurns();
        const modelName = getAiServiceName();

        if (!modelName) return [];

        const userSelectors = targetUserQuerySelectors[modelName] ?? [];
        const assistantSelectors = targetResponseSelectors[modelName] ?? [];

        const tagged: { element: Element; role: 'User' | 'Assistant' }[] = [];

        for (const selector of userSelectors) {
            document.querySelectorAll(selector).forEach((el) => {
                tagged.push({ element: el, role: 'User' });
            });
        }

        for (const selector of assistantSelectors) {
            document.querySelectorAll(selector).forEach((el) => {
                tagged.push({ element: el, role: 'Assistant' });
            });
        }

        // DOM 순서대로 정렬
        tagged.sort((a, b) => {
            const position = a.element.compareDocumentPosition(b.element);
            if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
            if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
            return 0;
        });

        // 최근 maxTurns 턴만 사용 (0이면 컨텍스트 미사용)
        if (maxTurns === 0) return [];
        const recent = tagged.slice((maxTurns * 2) * -1);

        return recent.map(({ element, role }) => ({
            role,
            content: (element.textContent ?? '').trim().slice(0, MAX_CONTENT_LENGTH),
        }));
    }
}