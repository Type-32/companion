import Database from "@tauri-apps/plugin-sql";
import {TauriORM} from "@type32/tauri-sqlite-orm";
import * as schema from "#shared/database/schema";
import {useDb} from "~/composables/core/useDb";

export default defineNuxtPlugin({
    name: 'init.load_database',
    async setup(nuxtApp) {
        const $db = useDb()
        await $db.load()
    }
})