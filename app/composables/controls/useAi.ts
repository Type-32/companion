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
        apiKey.value = await $cry.decryptEndpoint(unref($user.$configState)?.apiKey ?? "") ?? $rc.testingApiKey
    }

    async function getUserSelectedModel() {
        return await getModel(unref($user.$configState)?.selectedCompletionModel ?? '')
    }

    async function generateResponse(convId: string, messages: UIMessage[]) {
        return streamText({
            model: openrouter.chat((await getUserSelectedModel())?.inferenceId ?? "moonshotai/kimi-k2-thinking"),
            messages: convertToModelMessages(messages),
            onError({ error }) {
                console.error(error)
            },
            tools: {
                getMessagesInConv: tool({
                    description: 'Gets the recent sent messages and their sender in your current chat conversation.',
                    inputSchema: z.object({
                        paginate: z.boolean().default(false).describe('Whether your response is paginated or not. If this is set to true, then you need to fill in the other two parameters, `cursor` and `messagesPerPage`. By default, this is set to false, which gets you all the messages in the conversation.'),
                        cursor: z.number().optional().describe('The cursor of the paginated result.'),
                        messagesPerPage: z.number().optional().default(50).describe('The amount of messages per page for paginated response.')
                    }),
                    execute: async ({ paginate, cursor, messagesPerPage }) => {
                        if (paginate)
                            return await $msg.getAllMessages(convId, cursor, messagesPerPage)
                        else
                            return await $msg.getAllMessages(convId)
                    }
                }),
                sendMessage: tool({
                    description: 'Send a message to user.',
                    inputSchema: z.object({
                        textMessage: z.string().describe('The text content to send in the message.'),
                        senderId: z.string().describe('Who to send the message as.'),
                        quoteMessageId: z.number().optional().describe('You can choose to quote an already sent message in the conversation in your message. This can be used to reply to specific messages in a group chat. This parameter is optional.')
                    }),
                    execute: async ({ textMessage, senderId, quoteMessageId }) => {
                        return await $msg.addMessage(convId, textMessage, senderId, quoteMessageId)
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

    /**
     * Add a model.
     * @param modelName The name of the model. Can be any name, a user-given nickname.
     * @param inferenceId The inference ID of the model on OpenRouter. e.g. `deepseek/deepseek-v3.2-exp`
     * @param embeddingModel Whether the added model is for generating embeddings or not.
     */
    async function addModel(modelName: string, inferenceId: string, embeddingModel: boolean) {
        return await $db.orm.insert(models)
            .values({
                name: modelName,
                inferenceId: inferenceId,
                forEmbedding: embeddingModel
            })
            .returningFirst()
    }

    /**
     * Remove a model from the list.
     * @param modelId NOT the Inference ID. The UUID column value of the models table.
     */
    async function removeModel(modelId: string) {
        return await $db.orm.delete(models)
            .where(eq(models._.columns.id, modelId))
            .returningFirst()
    }

    async function editModel(modelId: string, model: Partial<InsertModel>) {
        return await $db.orm.update(models)
            .set(model)
            .where(eq(models._.columns.id, modelId))
            .returningFirst()
    }

    async function getModels() {
        return await $db.orm.select(models)
            .orderBy(models._.columns.createdAt, "DESC")
            .all()
    }

    async function getModel(modelId: string) {
        return await $db.orm.select(models)
            .where(eq(models._.columns.id, modelId))
            .first()
    }

    async function listOpenRouterModels(embeddingModels: boolean = false): Promise<any[]> {
        const list: any = await $fetch('/api/v1/openrouter/models', {
            method: 'post',
            body: {
                apiKey: unref($user.$configState)?.apiKey,
                embeddingModels: embeddingModels
            }
        })
        return list?.data as any[]
    }

    return {
        load,
        getUserSelectedModel,
        generateResponse,
        getAiMessages,
        addAiMessage,
        removeAiMessage,
        getUiMessages,
        addModel,
        removeModel,
        editModel,
        getModel,
        getModels,
        listOpenRouterModels
    }
}