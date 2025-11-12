import {createOpenRouter} from "@openrouter/ai-sdk-provider";
import {convertToModelMessages, streamText, tool, type UIMessage} from "ai";
import {z} from "zod";
import {useProfile} from "~/composables/controls/useProfile";
import {useEncryption} from "~/composables/core/useEncryption";
import {useDb} from "~/composables/core/useDb";
import {aiMessages, models} from "#shared/database/schema";
import type {Model} from "#shared/types/chat";
import {useMessages} from "~/composables/controls/useMessages";
import {useConversations} from "~/composables/controls/useConversations";
import {isTimePassedOverThresholdInclusive} from "~/utils/defaults/time";
import {and, eq} from "@type32/tauri-sqlite-orm";

export function useAi() {
    const $rc = useRuntimeConfig()
    const $user = useProfile()
    const $cry = useEncryption()
    const $db = useDb()
    const $msg = useMessages()
    const $conv = useConversations()
    const apiKey = useState<string>('ai.apiKey', () => '')
    const openrouter = createOpenRouter({
        apiKey: unref(apiKey)
    })

    async function load() {
        apiKey.value = await $cry.decryptEndpoint(unref($user.$configState)?.apiKey ?? $rc.testingApiKey)
    }

    async function getUserSelectedModel() {
        const userModels: Model[] = await $db.orm.select(models)
            .orderBy(models._.columns.updatedAt, 'DESC')
            .all()

        return userModels.find((value) => value.id == unref($user.$configState)?.selectedModel)
    }

    async function generateResponse(convId: string, messages: UIMessage[]) {
        return streamText({
            model: openrouter.chat((await getUserSelectedModel())?.inferenceId ?? "moonshotai/kimi-k2-thinking"),
            messages: convertToModelMessages(messages),
            onError({ error }) {
                console.error(error)
            },
            tools: {
                sendMessage: tool({
                    description: 'Send a message to user.',
                    inputSchema: z.object({
                        textMessage: z.string().describe('The text content to send in the message.'),
                        senderId: z.string().describe('Who to send the message as.'),
                    }),
                    execute: async ({ textMessage, senderId }) => {
                        await $msg.addMessage(convId, textMessage, senderId)
                    }
                }),
                revokeMessage: tool({
                    description: 'Revokes one of your sent messages. If the message you\'ve sent is past the revoke allowance duration, the tool won\'t revoke that sent message.',
                    inputSchema: z.object({
                        messageId: z.number().describe('The ID of the message you wanted to revoke.')
                    }),
                    execute: async ({messageId}) => {
                        const msg = await $msg.getSingleMessage(messageId)
                        if (isTimePassedOverThresholdInclusive(msg?.createdAt ?? new Date(), new Date(), unref($user.$configState)?.msgRevokeAllowanceDuration ?? 120, 's')) {
                            return {
                                success: false,
                                description: 'Exceeded message revoke duration threshold.'
                            }
                        } else {
                            await $msg.deleteMessage(messageId)
                            return {
                                success: true,
                                description: `Message of id ${messageId} has been revoked.`
                            }
                        }
                    }
                }),
                getCharactersInConv: tool({
                    description: 'Gets all characters in the conversation (Excludes the user).',
                    inputSchema: z.object({}),
                    execute: async () => {
                        return await $conv.getCharactersInConv(convId)
                    }
                }),
                suggestNewTool: tool({
                    description: 'Suggests a new tool for you to use to this application\'s developer in order to improve the user\'s experience if you deem the current sent of tools is unable to help you with your goal.',
                    inputSchema: z.object({
                        toolDesc: z.string().describe('Description of the new tool.'),
                        toolName: z.string().describe('The name of the new tool.'),
                    }),
                    execute: async ({toolName, toolDesc}) => ({
                        toolName: toolName,
                        toolDesc: toolDesc
                    })
                })
            }
        })
    }

    async function getAiMessages(convId: string) {
        return await $db.orm.select(aiMessages)
            .where(eq(aiMessages._.columns.conversationId, convId))
            .orderBy(aiMessages._.columns.createdAt, 'DESC')
            .all()
    }

    async function getUiMessages(convId: string): Promise<UIMessage[]> {
        return (await getAiMessages(convId)).map((value) => value.data)
    }

    async function addAiMessage(convId: string, message: UIMessage) {
        return await $db.orm.insert(aiMessages)
            .values({
                conversationId: convId,
                data: message
            })
            .returningFirst()
    }

    async function removeAiMessage(convId: string, messageId: number) {
        return await $db.orm.delete(aiMessages)
            .where(
                and(
                    eq(aiMessages._.columns.conversationId, convId),
                    eq(aiMessages._.columns.id, messageId)
                )
            )
            .returningFirst()
    }

    return {
        load,
        getUserSelectedModel,
        generateResponse,
        getAiMessages,
        addAiMessage,
        removeAiMessage,
        getUiMessages
    }
}