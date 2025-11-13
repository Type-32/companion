import {useMessages} from "~/composables/controls/useMessages";
import type {Message} from "#shared/types/chat";
import type {UIMessage} from "ai";
import {useAi} from "~/composables/controls/useAi";
import {Chat} from "@ai-sdk/vue";
import {useUuid} from "~/composables/core/useUuid";
import {useCharacters} from "~/composables/controls/useCharacters";
import {useProfile} from "~/composables/controls/useProfile";
import {useConversations} from "~/composables/controls/useConversations";

export function useChat(convId: string) {
    const $msg = useMessages()
    const $ai = useAi()
    const $char = useCharacters()
    const $prof = useProfile()
    const $conv = useConversations()
    const $messages = useState<Message[]>(`chat.messages.${convId}`, () => [])
    const $aiMsgs = useState<UIMessage[]>(`chat.aiMessages.${convId}`, () => [])

    async function loadChat() {
        $messages.value = await $msg.getAllMessages(convId) ?? []
        $aiMsgs.value = await $ai.getUiMessages(convId) ?? []
    }

    async function triggerGeneration(charId: string) {
        const temp = unref($aiMsgs)
        const char = await $char.getCharacter(charId)
        const chars = (await $conv.getCharactersInConv(convId)).filter(value => value.characterId != charId)
        let memberList = `User (with the name of ${unref($prof.$profileState)?.name})`

        chars.forEach((value, index, array) => {
            memberList += index == array.length - 1 ? ", and" : ", "
            memberList += value
        })

        temp.push({
            id: useUuid(),
            role: "system",
            parts: [
                {
                    type: "text",
                    text: `Your primary goal is to pretend as the character ${char?.name} and use the available tools to interact with the user. You are online in a chat with ${memberList}.`
                },
                {
                    type: "text",
                    text: `Character Definition of ${char?.name}: ${char?.data}`
                },
                {
                    type: "text",
                    text: `Definition of User: ${unref($prof.$profileState)}`
                }
            ]
        })
        return await $ai.generateResponse(convId, unref($aiMsgs))
    }

    async function sendMessage(text: string, senderId: string) {
        const msg: Message | undefined = await $msg.addMessage(convId, text, senderId)
        if (msg) {
            $messages.value.push(msg)
        }
    }

    async function addUiMessage(message: UIMessage) {
        const msg = await $ai.addAiMessage(convId, message)
        if (msg)
            $aiMsgs.value.push(msg.data)
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
        revokeMessage,
        addUiMessage,
        triggerGeneration
    }
}