import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

export function useEncryption() {
    function encrypt(text: string, key: string): string {
        const algorithm = 'aes-256-cbc'
        const iv = randomBytes(16)
        const cipher = createCipheriv(algorithm, Buffer.from(key.padEnd(32).slice(0, 32)), iv)
        let encrypted = cipher.update(text)
        encrypted = Buffer.concat([encrypted, cipher.final()])
        return `${iv.toString('hex')}:${encrypted.toString('hex')}`
    }

    function decrypt(text: string, key: string): string {
        const algorithm = 'aes-256-cbc'
        const [ivHex, encryptedHex] = text.split(':')
        const iv = Buffer.from(ivHex, 'hex')
        const encrypted = Buffer.from(encryptedHex, 'hex')
        const decipher = createDecipheriv(algorithm, Buffer.from(key.padEnd(32).slice(0, 32)), iv)
        let decrypted = decipher.update(encrypted)
        decrypted = Buffer.concat([decrypted, decipher.final()])
        return decrypted.toString()
    }

    async function encryptEndpoint(text: string): Promise<string> {
        return await $fetch('/api/v1/auth/encrypt', {
            method: 'post',
            body: {
                apiKey: text
            }
        })
    }

    async function decryptEndpoint(text: string): Promise<string> {
        return await $fetch('/api/v1/auth/decrypt', {
            method: 'post',
            body: {
                encryptedKey: text
            }
        })
    }

    return {
        encrypt,
        decrypt,
        encryptEndpoint,
        decryptEndpoint
    }
}