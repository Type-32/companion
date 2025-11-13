export default defineEventHandler(async (event) => {
    const {apiKey, embeddingModels} = await readBody<{apiKey: string, embeddingModels: boolean}>(event)
    const $cry = useServerEncryption()
    if (!embeddingModels) {
        return await $fetch('https://openrouter.ai/api/v1/models', {
            headers: {
                "Authorization": `Bearer ${await $cry.decryptEndpoint(apiKey)}`
            }
        })
    } else {
        return await $fetch('https://openrouter.ai/api/v1/embeddings/models', {
            headers: {
                "Authorization": `Bearer ${apiKey}`
            },
        })
    }
})