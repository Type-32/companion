import { z } from "zod";
import {useEncryption} from "~~/server/utils/utility/useEncryption";

export default defineEventHandler(async (event) => {
    const rc = useRuntimeConfig()
    const $crypt = useEncryption()
    const { encryptedKey } = await readValidatedBody(event, z.object({
        encryptedKey: z.string()
    }).parse)
    return $crypt.decrypt(encryptedKey, rc.sessionPassword);
})