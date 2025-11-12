import {GeneratePayload} from "#shared/types/requests";
import {createOpenRouter} from "@openrouter/ai-sdk-provider";
import {convertToModelMessages, streamText, tool, UIMessage} from "ai";
import { z } from "zod";
import {useServerEncryption} from "~~/server/utils/utility/useServerEncryption";

export default defineEventHandler(async (event) => {
    const rc = useRuntimeConfig()
    const $crypt = useServerEncryption()
    const payload = await readValidatedBody<GeneratePayload>(event, z.custom<GeneratePayload>().parse);

    if (!payload.apiKey && !rc.testingApiKey)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad payload",
            message: "Missing API Key",
        })
    else if (!payload.model)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad payload",
            message: "Missing Model ID",
        })

    const openrouter = createOpenRouter({
        apiKey: await $crypt.decryptEndpoint(payload.apiKey ?? rc.testingApiKey)
    })

    const result = streamText({
        model: openrouter.chat(payload.model),
        messages: convertToModelMessages(payload.messages),
        onError({ error }) {
            console.error(error)
        },
        tools: {
            sendMessage: tool({
                description: 'Send a message to user.',
                inputSchema: z.object({
                    textMessage: z.string().describe('The text content to send in the message.')
                }),
                execute: async ({textMessage}) => ({
                    textMessage: textMessage,
                    messageId: useServerUUID()
                })
            }),
            revokeMessage: tool({
                description: 'Revokes one of your sent messages. If the message you\'ve sent is past the revoke allowance duration, the tool won\'t revoke that sent message.',
                inputSchema: z.object({
                    messageId: z.string().describe('The ID of the message you wanted to revoke.')
                }),
                execute: async ({messageId}) => {

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

    return result.toUIMessageStreamResponse();
})