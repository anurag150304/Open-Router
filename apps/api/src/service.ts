import { createLLMProvider, LLMProvider } from "./LLMs/LLM.provider.js";
import { completionsSchema } from "./model.js";
import { apiDB } from "@repo/db-config";

export class CompletionsService {
  static async validateKey({
    authorization: key,
  }: Omit<completionsSchema["headerSchema"], "content-type">) {
    if (!key.startsWith("sk-or-v1-") || key.length !== 37) return false;

    const validKey = await apiDB.findFirst({ where: { key } });
    return Boolean(validKey);
  }

  static async LLMCall({ model, messages }: completionsSchema["bodySchema"]) {
    try {
      const llm = createLLMProvider(model);
      const response = await llm.complete(messages);

      return response;
    } catch (err) {
      console.error(err);
      throw new Error("Failed to call LLM");
    }
  }
}
