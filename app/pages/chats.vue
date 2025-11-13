<script setup lang="ts">
import {useConversations} from "~/composables/controls/useConversations";
import {ScrollAreaRoot, ScrollAreaViewport} from "reka-ui";

const $conv = useConversations()

const {data: conversations, refresh, pending} = await useAsyncData('chats', () => $conv.getAllConversations())
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
            <ScrollAreaRoot class="w-full h-full">
                <ScrollAreaViewport class="w-full inline-flex flex-col h-full">
                    <div class="w-full grid grid-cols-1">
                        <div class="w-full h-full" v-if="pending">Loading Conversations...</div>
                        <div class="w-full h-full flex flex-col items-center justify-center text-muted" v-else-if="conversations?.length == 0 || !conversations">
                            No conversations.
                        </div>
                        <div class="w-full h-full" v-else>{{conversations}}</div>
                    </div>
                </ScrollAreaViewport>
            </ScrollAreaRoot>
        </template>
    </UDashboardPanel>
    <UDashboardPanel>
        <NuxtPage/>
    </UDashboardPanel>
</template>

<style scoped>

</style>