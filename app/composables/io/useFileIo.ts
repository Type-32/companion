import {type DialogFilter, open} from "@tauri-apps/plugin-dialog";
import {BaseDirectory, copyFile} from "@tauri-apps/plugin-fs";

export function useFileIo() {
    async function selectDirectory(): Promise<string | null> {
        return await open({
            directory: true,
            multiple: false,
            title: "Select Directory"
        })
    }

    async function selectDirectories(): Promise<string[] | null> {
        return await open({
            directory: true,
            multiple: true,
            title: "Select Directory"
        })
    }

    async function selectFile(filters: DialogFilter[] = []): Promise<string | null> {
        return await open({
            title: "Select File(s)",
            multiple: false,
            directory: false,
            filters: filters
        })
    }

    async function selectFiles(filters: DialogFilter[] = []): Promise<string[] | null> {
        return await open({
            title: "Select File(s)",
            multiple: true,
            directory: false,
            filters: filters
        })
    }

    async function copyFiles(fromPaths: string[], toPath: string, fromBaseDir: BaseDirectory | undefined = undefined, toBaseDir: BaseDirectory | undefined = undefined) {
        for (const path of fromPaths) {
            await copyFile(path, toPath, {
                fromPathBaseDir: fromBaseDir,
                toPathBaseDir: toBaseDir
            })
        }
    }

    return {
        selectFile,
        selectFiles,
        selectDirectory,
        selectDirectories,
        copyFiles
    }
}