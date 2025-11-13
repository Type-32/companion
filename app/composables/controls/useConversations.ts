import {useDb} from "~/composables/core/useDb";
import {characters, charactersConversations, conversations} from "#shared/database/schema";
import {and, eq, type InferInsertModel} from "@type32/tauri-sqlite-orm";
import type {CharConvRelation} from "#shared/types/chat";

export function useConversations() {
    const $db = useDb()

    async function getAllConversations() {
        return await $db.orm.select(conversations)
            .include({
                characters: true
            })
            .orderBy(conversations._.columns.updatedAt, 'DESC')
            .all()
    }

    async function getConversation(id: string) {
        return await $db.orm.select(conversations)
            .where(eq(conversations._.columns.id, id))
            .get()
    }

    async function createConversation(data: InsertConversation) {
        if (!data.name) return;

        return await $db.orm.insert(conversations)
            .values(data)
            .returningAll()
    }

    async function editConversation(id: string, data: Partial<InsertConversation>) {
        return await $db.orm.update(conversations)
            .set(data)
            .where(eq(conversations._.columns.id, id))
            .returningAll()
    }

    async function addCharacterToConversation(convId: string, charId: string) {
        const character = await $db.orm.select(characters)
            .where(eq(characters._.columns.id, charId))
            .get()

        if (character) {
            if (await $db.orm.select(charactersConversations).where(and(eq(charactersConversations._.columns.characterId, charId), eq(charactersConversations._.columns.conversationId, convId))).execute())
            return await $db.orm.insert(charactersConversations)
                .values({
                    conversationId: convId,
                    characterId: charId
                })
                .returningAll()
        }
    }

    async function getCharactersInConv(convId: string) {
        const ids = await $db.orm.select(charactersConversations)
            .where(
                and(
                    eq(charactersConversations._.columns.conversationId, convId)
                )
            )
            .innerJoin(characters, eq(characters._.columns.id, charactersConversations._.columns.characterId), 'characters')
            .all()
        console.log(ids)
        return ids
    }

    async function addCharactersToConv(convId: string, charIds: string[]) {
        return await $db.orm.transaction(async (tx) => {
            const addedCharacters: CharConvRelation[] = []
            for (const id of charIds) {
                if (!(await tx.select(charactersConversations).where(and(eq(charactersConversations._.columns.conversationId, convId), eq(charactersConversations._.columns.characterId, id))).exists())) {
                    const ch = await tx.insert(charactersConversations)
                        .values({
                            conversationId: convId,
                            characterId: id
                        })
                        .returningFirst()

                    if (ch)
                        addedCharacters.push(ch)
                }
            }

            return addedCharacters
        })
    }

    async function removeCharactersFromConv(convId: string, charIds: string[]) {
        return await $db.orm.transaction(async (tx) => {
            const removedCharacters: CharConvRelation[] = []
            for (const id of charIds) {
                if (await tx.select(charactersConversations).where(and(eq(charactersConversations._.columns.conversationId, convId), eq(charactersConversations._.columns.characterId, id))).exists()) {
                    const ch = await tx.delete(charactersConversations)
                        .where(
                            and(
                                eq(charactersConversations._.columns.conversationId, convId),
                                eq(charactersConversations._.columns.characterId, id)
                            )
                        )
                        .returningFirst()

                    if (ch)
                        removedCharacters.push(ch)
                }
            }

            return removedCharacters
        })
    }

    return {
        getAllConversations,
        getConversation,
        createConversation,
        editConversation,
        addCharacterToConversation,
        getCharactersInConv,
        addCharactersToConv,
        removeCharactersFromConv
    }
}