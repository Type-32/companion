import {useDb} from "~/composables/core/useDb";
import {useAi} from "~/composables/controls/useAi";
import {useProfile} from "~/composables/controls/useProfile";

export default defineNuxtPlugin({
    name: 'init.load_database',
    async setup(nuxtApp) {
        const $db = useDb()
        const $ai = useAi()
        const $prof = useProfile()

        await $prof.load()
        await $db.load()
        await $ai.load()
    }
})