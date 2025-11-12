import {useProfile} from "~/composables/controls/useProfile";

export default defineNuxtPlugin({
    name: 'init.load_profile',
    async setup(nuxtApp) {
        const $prof = useProfile()
        await $prof.load()
    }
})