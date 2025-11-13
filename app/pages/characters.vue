<script setup lang="ts">
import {useCharacters} from "~/composables/controls/useCharacters";

const $char = useCharacters()

const {data: characters, refresh, pending} = await useAsyncData('chats', () => $char.getCharacters())
</script>

<template>
    <UDashboardPanel
        :ui="{
            root: 'border-r border-default flex-none min-w-0'
        }"
        :resizable="false"
    >
        <template #header>
            <div class="flex p-3 gap-2 border-b border-default" data-tauri-drag-region>
                <UInput placeholder="Search..."/>
                <UButton icon="i-lucide-plus"/>
            </div>
        </template>
        <template #body>
            <div class="grid grid-cols-1">
                <div class="w-full h-full" v-if="pending">Loading Characters...</div>
                <div class="w-full h-full flex flex-col items-center justify-center text-muted" v-else-if="characters?.length == 0 || !characters">
                    No characters.
                </div>
                <div class="w-full h-full" v-else>{{ characters }}</div>
            </div>
        </template>
    </UDashboardPanel>
    <UDashboardPanel>
        <NuxtPage/>
    </UDashboardPanel>
</template>

<style scoped>

</style>