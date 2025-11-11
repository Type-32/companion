import {GeneratePayload} from "#shared/types/requests";
import {createOpenRouter} from "@openrouter/ai-sdk-provider";
import {convertToModelMessages, streamText, UIMessage} from "ai";
import { z } from "zod";
import {useEncryption} from "~~/server/utils/utility/useEncryption";

export default defineEventHandler(async (event) => {
    const rc = useRuntimeConfig()
    const $crypt = useEncryption()
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
        }
    })

    return result.toUIMessageStreamResponse();
})