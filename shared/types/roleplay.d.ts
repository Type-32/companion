export interface CharacterData {
    id: string,
    baseProfile: Record<string, string>,
}

export interface UserProfile {
    baseProfile: Record<string, string>,
    name: string,
    slug: string,
    avatarPublicUrl: string,
}

export interface UserConfig {
    apiKey: string, // The encrypted key
    selectedModel: string, // The UUID of the added models
    msgRevokeAllowanceDuration: number, // In Seconds
}