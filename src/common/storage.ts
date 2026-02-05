import {ModelNameType} from "../type/modelType";

export interface ConfigStorage {
    improverEnabled: boolean;
    improveGuide: string;
    selectedModel: ModelNameType;
    modelConfig: any;
    commonConfig: any;
}

export const PROMPTTIER_DEFAULT_CONFIG: ConfigStorage = {
    improverEnabled: false,
    improveGuide: "",
    selectedModel: "",
    modelConfig: {
        gemini: {
            apiKey: "",
        },
        openAi: {
            apiKey: "",
        },
        claude: {
            apiKey: "",
        },
    },
    commonConfig: {
        temperature: 0,
        topP: 1,
        maxOutputTokens: 4096,
        responseSchema: null,
    },
};