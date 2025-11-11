import type {UIMessage} from "ai";
import type {InferSelectModel} from "@type32/tauri-sqlite-orm";
import {type characters, conversations, messages} from "#shared/database/schema";

export interface ChatData {
    messages: UIMessage[], // for the user-character messages
    aiConvMessages: UIMessage[], // internal conversation messages for AI actions
}

export type Character = InferSelectModel<typeof characters>
export type Conversation = InferSelectModel<typeof conversations>
export type Message = InferSelectModel<typeof messages>