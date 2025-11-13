export interface CharacterData {
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
    selectedCompletionModel: string, // The UUID of the added models
    selectedEmbeddingModel: string, // The UUID of the added embedding models
    msgRevokeAllowanceDuration: number, // In Seconds
}