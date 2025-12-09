<script setup lang="ts">
import {useCharacters} from "~/composables/controls/useCharacters";
import {z} from "zod"
import type { CharacterData } from "#shared/types/roleplay"

const $char = useCharacters()

const schema = z.object({
    name: z.string(),
    data: z.custom<CharacterData>(),
    embeddingsPath: z.string().optional(),
    publicAvatarUrl: z.string()
})

type Schema = z.output<typeof schema>

const state = reactive({
    name: undefined,
    data: undefined,
})

</script>

<template>

</template>

<style scoped>

</style>