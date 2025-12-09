import {open} from "@tauri-apps/plugin-dialog";
import {stat} from "@tauri-apps/plugin-fs";
import {useFileIo} from "~/composables/io/useFileIo";
import {BaseDirectory} from "@tauri-apps/api/path";

export function useAssets() {
    const $fio = useFileIo()
    const keywords = {
        "assets.pathname": "assets"
    }

    async function uploadAssetFiles() {
        const paths = await open({
            multiple: true,
            directory: false,
            title: "Upload Asset(s)"
        })

        if (paths) {
            await $fio.copyFiles(paths, keywords["assets.pathname"], undefined, BaseDirectory.AppData)
        }
    }

    async function uploadAssetImages() {
        const paths = await open({
            multiple: true,
            directory: false,
            title: "Upload Asset Image(s)",
            filters: [{
                name: 'Images',
                extensions: ['png', 'jpg', 'jpeg']
            }]
        })

        if (paths) {
            for (const path of paths) {
                await stat(path)
            }
            await $fio.copyFiles(paths, keywords["assets.pathname"], undefined, BaseDirectory.AppData)
        }
    }

    return {
        uploadAssetImages,
        uploadAssetFiles
    }
}