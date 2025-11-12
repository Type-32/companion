import {useDb} from "~/composables/core/useDb";
import {useAi} from "~/composables/controls/useAi";

export default defineNuxtPlugin({
    name: 'init.load_database',
    async setup(nuxtApp) {
        const $db = useDb()
        const $ai = useAi()
        await $db.load()
        await $ai.load()
    }
})