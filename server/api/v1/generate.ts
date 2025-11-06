import {GeneratePayload} from "#shared/types/requests";
import {createOpenRouter} from "@openrouter/ai-sdk-provider";
import {convertToModelMessages, streamText} from "ai";

export default defineEventHandler(async (event) => {
    const payload = await readBody<GeneratePayload>(event);
    console.log(await readBody(event))

    if (!payload.apiKey)
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
        apiKey: payload.apiKey
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