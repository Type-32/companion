<script setup lang="ts">
import type {NavigationMenuItem} from '@nuxt/ui'
import {useProfile} from "~/composables/controls/useProfile";

const $prof = useProfile()
const isProperlyConfigured = computed(() => unref($prof.$configState)?.apiKey != '' && unref($prof.$configState)?.selectedCompletionModel != '')

const items: NavigationMenuItem[][] = [
    [
        {
            label: 'Hub',
            icon: 'i-lucide-home',
            to: '/'
        },
        {
            label: 'Chats',
            icon: 'i-lucide-message-circle',
            to: '/chats'
        },
        {
            label: 'Characters',
            icon: 'i-lucide-users',
            to: '/characters'
        },
        {
            label: 'Settings',
            icon: 'i-lucide-settings',
            to: '/settings'
        }
    ]
]

const bannerActions = ref([
    {
        label: 'Settings',
        trailingIcon: 'i-lucide-arrow-right',
        to: '/settings'
    },
])

</script>

<template>
    <UBanner
        v-if="!isProperlyConfigured"
        title="You have not configured your setup."
        :actions="bannerActions"
        :ui="{
            container: 'justify-center'
        }"
    />
    <UDashboardGroup>
        <UDashboardSidebar
            collapsed
            :collapsible="false"
            side="left"
            data-tauri-drag-region
            :ui="{
                root: 'flex w-fit px-2'
            }"
        >
            <template #header>
                <div data-tauri-drag-region class="w-full h-full">
                    <SpaceOnOs detect-os="macOS" show-on-os no-width/>
                    <UAvatar/>
                </div>
            </template>
            <template #default="{ collapsed }">
                <div data-tauri-drag-region class="h-full w-full">
                    <SpaceOnOs detect-os="macOS" show-on-os no-width :height="4"/>
                    <UNavigationMenu
                        collapsed
                        :items="items"
                        orientation="vertical"
                        :disabled="isProperlyConfigured"
                    />
                </div>
            </template>
        </UDashboardSidebar>
        <slot/>
    </UDashboardGroup>
</template>

<style scoped>

</style>