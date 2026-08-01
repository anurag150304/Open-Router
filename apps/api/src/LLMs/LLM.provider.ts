import type {
  ChatMessage,
  CompletionOptions,
  CompletionResult,
  LLMSchema,
} from "./LLM.schema.js";
import { GoogleGenAI } from "@google/genai";
import { env } from "@repo/env-config";
import { MyError } from "primary/MyError";

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
      await this.client.models.list();
      return true;
    } catch (error) {
      console.error("LLM Provider health check failed:", error);
      throw new MyError(503, "LLM provider service is currently unavailable.");
    }
  }

  async complete(
    messages: ChatMessage,
    options?: CompletionOptions,
  ): Promise<CompletionResult> {
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: messages.content,
        config: {
          temperature: options?.temperature ?? 0.3,
        },
      });

      if (!response.text) {
        throw new MyError(500, "LLM provider returned an empty response.");
      }

      let { promptTokens, completionTokens } = { promptTokens: 0, completionTokens: 0 };
      promptTokens += response.usageMetadata?.promptTokenCount || 0;
      completionTokens += response.usageMetadata?.candidatesTokenCount || 0;

      return {
        content: response.text,
        usage: {
          promptTokens,
          completionTokens,
          totalTokenCount: promptTokens + completionTokens,
        },
      };
    } catch (err) {
      console.error("LLM Provider completion error:", err);
      if (err instanceof MyError) throw err;
      const msg = err instanceof Error ? err.message : "Failed to generate content.";
      throw new MyError(500, `LLM completion failed: ${msg}`);
    }
  }

  async *stream(
    messages: ChatMessage,
    options?: CompletionOptions,
    onUsage?: (usage: NonNullable<CompletionResult["usage"]>) => void,
  ): AsyncGenerator<string> {
    try {
      const stream = await this.client.models.generateContentStream({
        model: this.model,
        contents: messages.content,
        config: {
          temperature: options?.temperature ?? 0.3,
        },
      });

      let { promptTokens, completionTokens } = { promptTokens: 0, completionTokens: 0 };

      for await (const chunk of stream) {
        if (chunk.text) yield chunk.text;

        if (chunk.usageMetadata) {
          promptTokens += chunk.usageMetadata.promptTokenCount || 0;
          completionTokens += chunk.usageMetadata.candidatesTokenCount || 0;
          onUsage?.({
            promptTokens,
            completionTokens,
            totalTokenCount: promptTokens + completionTokens,
          });
        }
      }
    } catch (err) {
      console.error("LLM Provider streaming error:", err);
      if (err instanceof MyError) throw err;
      const msg = err instanceof Error ? err.message : "Failed to stream content.";
      throw new MyError(500, `LLM streaming failed: ${msg}`);
    }
  }
}

export function createLLMProvider(model: string): LLMProvider {
  return new LLMProvider(model);
}

