import type {UIMessage} from "ai";
import type {InferInsertModel, InferSelectModel} from "@type32/tauri-sqlite-orm";
import {type characters, conversations, messages, models} from "#shared/database/schema";

export interface ChatData {
    messages: UIMessage[], // for the user-character messages
    aiConvMessages: UIMessage[], // internal conversation messages for AI actions
}

export type Character = InferSelectModel<typeof characters>
export type Conversation = InferSelectModel<typeof conversations>
export type Message = InferSelectModel<typeof messages>
export type Model = InferSelectModel<typeof models>

export type InsertCharacter = InferInsertModel<typeof characters>
export type InsertConversation = InferInsertModel<typeof conversations>
export type InsertMessage = InferInsertModel<typeof messages>
export type InsertModel = InferInsertModel<typeof models>