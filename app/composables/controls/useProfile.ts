import {LazyStore, Store} from "@tauri-apps/plugin-store";
import type {UserConfig, UserProfile} from "#shared/types/roleplay";
import {defaultUserConfig, defaultUserProfile} from "~/utils/defaults/rp";

export function useProfile() {
    const $store = new LazyStore('userdata.json')
    const $keyword = {
        "profile.data": "profileData",
        "profile.config": "profileConfig"
    }
    const $profileState = useState<UserProfile | undefined>($keyword["profile.data"], () => undefined)
    const $configState = useState<UserConfig | undefined>($keyword["profile.config"], () => undefined)

    async function load() {
        await $store.init()

        $profileState.value = await $store.get<UserProfile>($keyword["profile.data"])
        $configState.value = await $store.get<UserConfig>($keyword["profile.config"])

        if (!unref($profileState)) {
            $profileState.value = defaultUserProfile()
            await save()
        }

        if (!unref($configState)) {
            $configState.value = defaultUserConfig()
            await save()
        }
    }

    async function save() {
        await $store.set($keyword["profile.data"], unref($profileState))
        await $store.set($keyword["profile.config"], unref($configState))
        await $store.save()

        console.log('save called')
    }

    return {
        $profileState,
        $configState,
        load,
        save
    }
}