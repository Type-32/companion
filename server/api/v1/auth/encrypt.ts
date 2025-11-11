import {z} from "zod";
import {useEncryption} from "~~/server/utils/utility/useEncryption";

export default defineEventHandler(async (event) => {
    const rc = useRuntimeConfig()
    const $crypt = useEncryption()
    const { apiKey } = await readValidatedBody(event, z.object({
        apiKey: z.string()
    }).parse)

    return $crypt.encrypt(apiKey, rc.sessionPassword);
})