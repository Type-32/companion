import type {UserConfig, UserProfile} from "#shared/types/roleplay";

export function defaultUserProfile(data?: Partial<UserProfile>): UserProfile {
    return {
        baseProfile: data?.baseProfile ?? {},
        name: data?.name ?? "Default User",
        slug: data?.slug ?? "defaultuser",
        avatarPublicUrl: data?.avatarPublicUrl ?? ""
    } satisfies UserProfile
}

export function defaultUserConfig(data?: Partial<UserConfig>): UserConfig {
    return {
        apiKey: data?.apiKey ?? "",
        selectedCompletionModel: data?.selectedCompletionModel ?? "moonshotai/kimi-k2-thinking",
        selectedEmbeddingModel: data?.selectedEmbeddingModel ?? "qwen/qwen3-embedding-8b",
        msgRevokeAllowanceDuration: data?.msgRevokeAllowanceDuration ?? 120
    } satisfies UserConfig
}