import { safeParseModelJson } from "./helpers";
import { SYSTEM_PROMPT, GENERATE_DESCRIPTION_PROMPT } from "./helpers/constants";
import {
    getBedrockRuntime,
    withMenuDescriptionGeneration,
} from "./bedrock-observability";

class BedrockAIService {
    constructor() {
        this.client = null;
        this.modelId = "amazon.nova-lite-v1:0";
    }

    async getClient() {
        if (!this.client) {
            const { BedrockRuntimeClient } = await getBedrockRuntime();
            this.client = new BedrockRuntimeClient({
                region: "us-east-1",
            });
        }

        return this.client;
    }

    withMenuDescriptionGeneration({ distinctId }, callback) {
        return withMenuDescriptionGeneration({ distinctId }, callback);
    }

    async generateMenuDescriptions(items = []) {
        if (!Array.isArray(items) || items.length === 0) {
            return [];
        }

        const cleanedItems = items.filter(item => item?.item_id != null && item?.name);
        if (!cleanedItems.length) {
            return [];
        }

        const systemPrompt = SYSTEM_PROMPT;
        const prompt = GENERATE_DESCRIPTION_PROMPT({ cleanedItems });

        try {
            const [{ ConverseCommand }, client] = await Promise.all([
                getBedrockRuntime(),
                this.getClient(),
            ]);
            const command = new ConverseCommand({
                modelId: this.modelId,
                system: [{ text: systemPrompt }],
                messages: [
                    {
                        role: "user",
                        content: [{ text: prompt }],
                    },
                ],
                inferenceConfig: {
                    maxTokens: 10000,
                    temperature: 0.2,
                },
            });

            const response = await client.send(command);
            const content = response?.output?.message?.content || [];
            const rawText = content.map((block) => block.text || "").join("\n");
            try {
                const parsed = JSON.parse(rawText);
                if (Array.isArray(parsed?.items)) {
                    return parsed.items;
                }
            } catch {
                console.warn("[BedrockAIService] Strict JSON parsing failed, attempting safe parse.");
            }

            const recovered = safeParseModelJson(rawText);
            if (recovered && Array.isArray(recovered.items)) {
                return recovered.items;
            }

            console.warn("[BedrockAIService] Failed to extract valid items array from model output.");
            return [];

        } catch (error) {
            console.error("[BedrockAIService] Failed to generate menu descriptions:", error);
            throw new Error("Failed to generate AI descriptions");
        }
    }
}

export const bedrockAIService = new BedrockAIService();
