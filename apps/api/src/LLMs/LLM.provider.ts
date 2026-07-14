import type {
  ChatMessage,
  CompletionOptions,
  CompletionResult,
  LLMSchema,
} from "./LLM.schema.js";
import { GoogleGenAI } from "@google/genai";
import { env } from "@repo/env-config";

export class LLMProvider implements LLMSchema {
  private readonly client: GoogleGenAI;
  private model: string;

  constructor(model: string) {
    this.model = model;
    this.client = new GoogleGenAI({
      vertexai: env.GOOGLE_GENAI_USE_VERTEXAI,
      project: env.GOOGLE_CLOUD_PROJECT,
      location: env.GOOGLE_CLOUD_LOCATION,
    });
  }

  async isHealthy(): Promise<boolean> {
    try {
      const list = await this.client.models.list();
      console.log(JSON.stringify(list));
      return true;
    } catch (error) {
      console.error(error);
      throw new Error("Model is not healthy");
    }
  }

  async complete(
    messages: ChatMessage[],
    options?: CompletionOptions,
  ): Promise<CompletionResult> {
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: messages,
        config: {
          temperature: options?.temperature ?? 0.3,
        },
      });

      if (!response.text) {
        throw new Error("Failed to generate content");
      }

      return {
        content: response.text,
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokenCount: response.usageMetadata?.totalTokenCount || 0,
        },
      };
    } catch (err) {
      console.error(err);
      throw new Error("Failed to generate content");
    }
  }

  async *stream(
    messages: ChatMessage[],
    options?: CompletionOptions,
    onUsage?: (usage: NonNullable<CompletionResult["usage"]>) => void,
  ): AsyncGenerator<string> {
    try {
      const stream = await this.client.models.generateContentStream({
        model: this.model,
        contents: messages,
        config: {
          temperature: options?.temperature ?? 0.3,
        },
      });

      for await (const chunk of stream) {
        if (chunk.text) yield chunk.text;

        if (chunk.usageMetadata)
          onUsage?.({
            promptTokens: chunk.usageMetadata.promptTokenCount || 0,
            completionTokens: chunk.usageMetadata.candidatesTokenCount || 0,
            totalTokenCount: chunk.usageMetadata.totalTokenCount || 0,
          });
      }
    } catch (err) {
      console.error(err);
      throw new Error("Failed to generate content");
    }
  }
}

export function createLLMProvider(model: string): LLMProvider {
  return new LLMProvider(model);
}
