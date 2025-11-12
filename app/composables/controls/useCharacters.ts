import {useDb} from "~/composables/core/useDb";
import {characters} from "#shared/database/schema";
import {eq} from "@type32/tauri-sqlite-orm";
import type {InsertCharacter} from "#shared/types/chat";
import {useQuickToasts} from "~/composables/core/useQuickToasts";

export function useCharacters() {
    const $db = useDb()
    const $qt = useQuickToasts()

    async function getCharacters(): Promise<Character[]> {
        return await $db.orm.select(characters)
            .orderBy(characters._.columns.name, "ASC")
            .all()
    }

    async function getCharacter(charId: string): Promise<Character | undefined> {
        return await $db.orm.select(characters)
            .where(eq(characters._.columns.id, charId))
            .get()
    }

    async function addCharacter(character: InsertCharacter): Promise<Character | undefined> {
        return await $db.orm.insert(characters)
            .values(character)
            .returningFirst()
    }

    async function deleteCharacter(charId: string): Promise<Character | undefined> {
        return await $db.orm.delete(characters)
            .where(eq(characters._.columns.id, charId))
            .returningFirst()
    }

    async function editCharacter(character: InsertCharacter): Promise<Character | undefined> {
        if (!character.id) {
            $qt.error('Unable to edit Character', 'The given character payload\'s ID cannot be undefined or null.')
            return
        }

        return await $db.orm.update(characters)
            .where(eq(characters._.columns.id, character.id))
            .set(character)
            .returningFirst()
    }

    return {
        getCharacters,
        getCharacter,
        addCharacter,
        deleteCharacter,
        editCharacter
    }
}