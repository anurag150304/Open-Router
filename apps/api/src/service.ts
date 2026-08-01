import { createLLMProvider } from "./LLMs/LLM.provider.js";
import type { CompletionResult } from "./LLMs/LLM.schema.js";
import { completionsSchema } from "./model.js";
import { apiDB, userDB, conversationsDB } from "@repo/db-config";
import { MyError } from "primary/MyError";

type T_StoreConversations = {
  apiKey: string;
  promptTokens: number;
  completionTokens: number;
};

export class CompletionsService {
  static async validateKey({
    authorization: key,
  }: Omit<completionsSchema["headerSchema"], "content-type">) {
    if (!key || typeof key !== "string") {
      throw new MyError(401, "Authorization Bearer key is missing or invalid.");
    }

    const cleanKey = key.startsWith("Bearer ") ? key.slice(7) : key;

    if (!cleanKey.startsWith("sk-or-v1-") || cleanKey.length !== 37) {
      return null;
    }

    try {
      const validKey = await apiDB.findFirst({
        where: { key: cleanKey },
        select: {
          userId: true,
        },
      });

      if (!validKey) return null;

      return {
        userId: validKey.userId,
        cleanKey,
      };
    } catch (err) {
      console.error("Database error while validating key:", err);
      throw new MyError(
        500,
        "Database error occurred while validating API key.",
      );
    }
  }

  static async checkUserCredits({ userId }: { userId: number }) {
    try {
      const user = await userDB.findUnique({
        where: { id: userId },
        select: { credits: true },
      });

      if (!user) {
        throw new MyError(404, "User not found.");
      }

      if (user.credits <= 0) {
        throw new MyError(
          402,
          "Insufficient credits. Please top up your account.",
        );
      }

      return user.credits;
    } catch (err) {
      if (err instanceof MyError) throw err;
      console.error("Database error checking user credits:", err);
      throw new MyError(500, "Database error occurred while checking credits.");
    }
  }

  static async chatCompletion({
    model,
    messages,
    options,
  }: completionsSchema["bodySchema"]): Promise<CompletionResult> {
    try {
      const llm = createLLMProvider(model);
      return await llm.complete(messages, options);
    } catch (err) {
      console.error("Chat completion error:", err);
      if (err instanceof MyError) throw err;
      throw new MyError(
        500,
        err instanceof Error
          ? err.message
          : "Failed to generate completion content.",
      );
    }
  }

  static async *chatCompletionStream({
    model,
    messages,
    options,
    onUsage,
  }: completionsSchema["bodySchema"] & {
    onUsage?: (usage: NonNullable<CompletionResult["usage"]>) => void;
  }): AsyncGenerator<string> {
    try {
      const llm = createLLMProvider(model);
      yield* llm.stream(messages, options, onUsage);
    } catch (error) {
      console.error("Chat completion stream error:", error);
      if (error instanceof MyError) throw error;
      throw new MyError(
        500,
        error instanceof Error
          ? error.message
          : "Failed to stream completion content.",
      );
    }
  }

  static async storeConversation({
    apiKey,
    promptTokens,
    completionTokens,
  }: T_StoreConversations) {
    try {
      const cleanKey = apiKey.startsWith("Bearer ") ? apiKey.slice(7) : apiKey;
      await conversationsDB.create({
        data: {
          apiKey: { connect: { key: cleanKey } },
          inpTokenCount: promptTokens,
          outTokenCount: completionTokens,
        },
      });
      return true;
    } catch (err) {
      console.error("Database error storing conversation:", err);
      return false;
    }
  }

  static async deductCredits({
    userId,
    inputTokens,
    outputTokens,
  }: {
    userId: number;
    inputTokens: number;
    outputTokens: number;
  }) {
    const cost = this.calculateCost(inputTokens, outputTokens);
    if (cost <= 0) return true;

    try {
      const updated = await userDB.update({
        where: {
          id: userId,
          credits: { gte: cost },
        },
        data: {
          credits: { decrement: cost },
        },
      });

      return updated;
    } catch (err: any) {
      if (err?.code === "P2025") {
        throw new MyError(402, "Insufficient credits.");
      }
      console.error("Error deducting credits:", err);
      throw new MyError(500, "Failed to deduct credits.");
    }
  }

  static calculateCost(inputTokens: number, outputTokens: number): number {
    const INPUT_RATE = 0.001; // credits factor per input token
    const OUTPUT_RATE = 0.002; // credits factor per output token

    const rawCost = inputTokens * INPUT_RATE + outputTokens * OUTPUT_RATE;
    if (rawCost === 0 && (inputTokens > 0 || outputTokens > 0)) {
      return 1;
    }
    return Math.ceil(rawCost);
  }
}
