<script setup lang="ts">
import {Chat} from "@ai-sdk/vue";
import {DefaultChatTransport, type UIMessage} from "ai";
import { useClipboard } from '@vueuse/core'
import {getTextFromMessage} from "@nuxt/ui/utils/ai";

const modelId = ref('deepseek/deepseek-v3.2-exp')
const apiKey = ref('')


const toast = useToast()
const clipboard = useClipboard()

const chat = new Chat({
    transport: new DefaultChatTransport({
        api: '/api/v1/generate'
    }),
    onError(error) {
        const { message } = typeof error.message === 'string' && error.message[0] === '{' ? JSON.parse(error.message) : error
        toast.add({
            description: message,
            icon: 'i-lucide-alert-circle',
            color: 'error',
            duration: 0
        })
    }
})

const input = ref('')
const copied = ref(false)

function handleSubmit(e: Event) {
    e.preventDefault()
    if (input.value.trim()) {
        chat.sendMessage({
            text: input.value,
        }, {
            body: {
                model: unref(modelId),
                apiKey: unref(apiKey)
            }
        })
        input.value = ''
    }
}

function copy(e: MouseEvent, message: UIMessage) {
    clipboard.copy(getTextFromMessage(message))

    copied.value = true

    setTimeout(() => {
        copied.value = false
    }, 2000)
}
</script>

<template>
    <UMain class="flex flex-col">
        <UContainer class="flex-1 flex flex-col">
            <UChatMessages
                should-auto-scroll
                :messages="chat.messages"
                :status="chat.status"
                :assistant="chat.status !== 'streaming' ? { actions: [{ label: 'Copy', icon: copied ? 'i-lucide-copy-check' : 'i-lucide-copy', onClick: copy }] } : { actions: [] }"
                :spacing-offset="160"
                class="lg:pt-(--ui-header-height) pb-4 sm:pb-6"
            >
                <template #content="{ message }">
                    <div class="*:first:mt-0 *:last:mb-0">
                        <template v-for="(part, index) in message.parts" :key="index">
                            <Reasoning
                                v-if="part.type == 'reasoning'"
                                :text="part.text"
                                :is-streaming="part.state !== 'done'"
                            />
                            <MDC
                                v-else-if="part.type == 'text'"
                                :value="part.text"
                                :cache-key="`${message.id}`"
                                :parser-options="{ highlight: false }"
                                class="*:first:mt-0 *:last:mb-0"
                            />
                        </template>
                    </div>
                </template>
            </UChatMessages>

            <UChatPrompt
                v-model="input"
                :error="chat.error"
                variant="subtle"
                class="[view-transition-name:chat-prompt]"
                @submit="handleSubmit"
            >
                <template #footer>
                    <UChatPromptSubmit
                        :status="chat.status"
                        color="neutral"
                        @stop="chat.stop"
                        @reload="chat.regenerate"
                    />
                    <UInput placeholder="Model ID" v-model="modelId"/>
                    <UInput placeholder="API Key" type="password" v-model="apiKey"/>
                </template>
            </UChatPrompt>
            <div>{{chat.messages}}</div>
        </UContainer>
    </UMain>
</template>
