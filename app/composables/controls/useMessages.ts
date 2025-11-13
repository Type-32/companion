import {useDb} from "~/composables/core/useDb";
import {charactersConversations, messages} from "#shared/database/schema";
import {and, eq} from "@type32/tauri-sqlite-orm";

export function useMessages() {
    const $db = useDb()

    async function getAllMessages(convId: string, cursor: number | undefined = undefined, messagesPerPage: number | undefined = undefined) {
        if (cursor && messagesPerPage)
            return await $db.orm.select(messages)
                .where(eq(messages._.columns.conversationId, convId))
                .orderBy(messages._.columns.createdAt, 'DESC')
                .include({
                    quotingMessage: true,
                    sender: true
                })
                .paginate(cursor, messagesPerPage)
        else
            return await $db.orm.select(messages)
                .where(eq(messages._.columns.conversationId, convId))
                .orderBy(messages._.columns.createdAt, 'DESC')
                .include({
                    quotingMessage: true,
                    sender: true
                })
                .all()
    }

    async function getMessagesPaginated(convId: string): Promise<Message[]> {
        return await $db.orm.select(messages)
            .where(eq(messages._.columns.conversationId, convId))
            .orderBy(messages._.columns.createdAt, 'DESC')
            .include({
                quotingMessage: true,
                sender: true
            })
            .all() as Message[]
    }

    async function getSingleMessage(msgId: number) {
        return await $db.orm.select(messages)
            .where(eq(messages._.columns.id, msgId))
            .get()
    }

    async function editMessage(msgId: number, msg: Partial<InsertMessage>): Promise<Message> {
        return await $db.orm.update(messages)
            .set(msg)
            .where(eq(messages._.columns.id, msgId))
            .returningFirst() as Message
    }

    async function addMessage(convId: string, text: string, senderId: string, quotedMessageId: number | undefined = undefined) {
        if (await isCharacterInConv(convId, senderId)) {
            if (quotedMessageId && await isMessageInConv(convId, quotedMessageId))
                return await $db.orm.insert(messages)
                    .values({
                        conversationId: convId,
                        senderId: senderId,
                        text: text,
                        quotingMessageId: quotedMessageId
                    })
                    .returningFirst()
            else
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

    async function isMessageInConv(convId: string, messageId: number) {
        return await $db.orm.select(messages)
            .where(
                and(
                    eq(messages._.columns.conversationId, convId),
                    eq(messages._.columns.id, messageId)
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
        deleteMessage,
        isMessageInConv
    }
}