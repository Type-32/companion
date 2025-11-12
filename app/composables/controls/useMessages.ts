import {useDb} from "~/composables/core/useDb";
import {charactersConversations, messages} from "#shared/database/schema";
import {and, eq} from "@type32/tauri-sqlite-orm";

export function useMessages() {
    const $db = useDb()

    async function getAllMessages(convId: string): Promise<Message[]> {
        return await $db.orm.select(messages)
            .where(eq(messages._.columns.conversationId, convId))
            .orderBy(messages._.columns.createdAt, 'DESC')
            .all() as Message[]
    }

    async function getSingleMessage(msgId: number) {
        return await $db.orm.select(messages)
            .where(
                and(
                    eq(messages._.columns.id, msgId)
                )
            )
            .get()
    }

    async function editMessage(msgId: number, text: string): Promise<Message> {
        return await $db.orm.update(messages)
            .set({ text: text })
            .where(
                and(
                    eq(messages._.columns.id, msgId)
                )
            )
            .returningFirst() as Message
    }

    async function addMessage(convId: string, text: string, senderId: string) {
        if (await isCharacterInConv(convId, senderId)) {
            return await $db.orm.insert(messages)
                .values({
                    conversationId: convId,
                    senderId: senderId,
                    text: text
                })
                .returningFirst()
        }
    }

    async function deleteMessage(messageId: number) {
        if (await $db.orm.select(messages).where(eq(messages._.columns.id, messageId)).exists()) {
            return await $db.orm.delete(messages)
                .where(eq(messages._.columns.id, messageId))
                .returningFirst()
        }
    }

    async function isCharacterInConv(convId: string, senderId: string) {
        return await $db.orm.select(charactersConversations)
            .where(
                and(
                    eq(charactersConversations._.columns.conversationId, convId),
                    eq(charactersConversations._.columns.characterId, senderId)
                )
            )
            .exists()
    }

    return {
        getAllMessages,
        getSingleMessage,
        editMessage,
        addMessage,
        isCharacterInConv,
        deleteMessage
    }
}