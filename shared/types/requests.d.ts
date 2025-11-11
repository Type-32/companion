import type {UIMessage} from "ai";

export interface GeneratePayload {
    messages: UIMessage[],
    model: string,
    apiKey: string | undefined, // For testing purposes
}

