import { z } from "zod";
import {useServerEncryption} from "~~/server/utils/utility/useServerEncryption";

export default defineEventHandler(async (event) => {
    const rc = useRuntimeConfig()
    const $crypt = useServerEncryption()
    const { encryptedKey } = await readValidatedBody(event, z.object({
        encryptedKey: z.string()
    }).parse)
    return $crypt.decrypt(encryptedKey, rc.sessionPassword);
})