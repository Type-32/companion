import Database from "@tauri-apps/plugin-sql";
import {TauriORM} from "@type32/tauri-sqlite-orm";
import * as schema from "#shared/database/schema";

let dbInstance: Database
let orm: TauriORM

export function useDb() {
    async function load() {
        try {
            if (!dbInstance)
                dbInstance = await Database.load("sqlite:main.db");
            orm = new TauriORM(dbInstance, schema)

            await orm.migrateIfDirty()
        } catch (e: any) {
            console.error(e)
        }
    }

    return {
        load,
        get orm() {
            if (!orm) {
                throw new Error("Database not loaded. Call load() first.");
            }
            return orm;
        }
    }
}