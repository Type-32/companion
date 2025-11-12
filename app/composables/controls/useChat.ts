import {useMessages} from "~/composables/controls/useMessages";
import type {Message} from "#shared/types/chat";

export function useChat(convId: string) {
    const $msg = useMessages()
    const $messages = useState<Message[]>(() => [])

    async function sendMessage(text: string, senderId: string) {
        const msg: Message | undefined = await $msg.addMessage(convId, text, senderId)
        if (msg) {
            $messages.value.push(msg)
        }
    }

    async function revokeMessage(messageId: number) {
        const msg = await $msg.deleteMessage(messageId)
        if (msg) {
            const index = $messages.value.findIndex(m => m.id === messageId)
            if (index > -1) {
                $messages.value.splice(index, 1)
            }
        }
    }

    return {
        sendMessage,
        revokeMessage
    }
}