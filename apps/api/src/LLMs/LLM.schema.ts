export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface CompletionOptions {
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
}

export interface CompletionResult {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokenCount: number
    };
}

export interface LLMSchema {
    complete(messages: ChatMessage[], options?: CompletionOptions): Promise<CompletionResult>;
    stream(messages: ChatMessage[], options?: CompletionOptions): AsyncGenerator<string>;
    isHealthy(): Promise<boolean>;
}
