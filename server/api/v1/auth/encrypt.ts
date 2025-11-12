import {z} from "zod";
import {useServerEncryption} from "~~/server/utils/utility/useServerEncryption";

export default defineEventHandler(async (event) => {
    const rc = useRuntimeConfig()
    const $crypt = useServerEncryption()
    const { apiKey } = await readValidatedBody(event, z.object({
        apiKey: z.string()
    }).parse)

    return $crypt.encrypt(apiKey, rc.sessionPassword);
})