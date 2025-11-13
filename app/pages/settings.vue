<script setup lang="ts">
import {useProfile} from "~/composables/controls/useProfile";
import {useAi} from "~/composables/controls/useAi";
import {z} from "zod";
import type {FormSubmitEvent, SelectMenuItem} from '@nuxt/ui'
import {defaultUserConfig} from "~/utils/defaults/rp";
import {useEncryption} from "~/composables/core/useEncryption";
import {useQuickToasts} from "~/composables/core/useQuickToasts";
import {ModalOpenRouterModelSelection} from "#components";
import {ScrollAreaRoot, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport} from "reka-ui";

const schemaObj = z.object({
    apiKey: z.string().describe("Your OpenRouter API Key."),
    selectedCompletionModel: z.string().optional().describe("Your selected model in your added list of models."),
    selectedEmbeddingModel: z.string().optional().describe("Your selected model in your added list of models."),
    msgRevokeAllowanceDuration: z.number().default(120).describe("Countdown in seconds of allowing the model and the user to revoke their message.")
})
type Schema = z.output<typeof schemaObj>

const saving = ref(false)
const deletingModel = ref(false)

const $prof = useProfile()
const $ai = useAi()
const $cry = useEncryption()
const $ov = useOverlay()
const $qt = useQuickToasts()

const orModelSelectModal = $ov.create(ModalOpenRouterModelSelection)

async function addModels(embeddingModels: boolean = false) {
    const selectedModels = await orModelSelectModal.open({
        embeddingModels: embeddingModels,
        maxSelectAmount: -1
    })

    console.log(selectedModels)
    for (const value of selectedModels) {
        await $ai.addModel(value.name, value.id, embeddingModels)
    }

    await refresh()
}

const state = reactive<Partial<Schema>>({
    apiKey: undefined,
    selectedCompletionModel: undefined,
    selectedEmbeddingModel: undefined,
    msgRevokeAllowanceDuration: 120
})

onMounted(async () => {
    const conf = unref($prof.$configState)
    state.apiKey = await $cry.decryptEndpoint(conf?.apiKey ?? '')
    state.selectedCompletionModel = conf?.selectedCompletionModel
    state.selectedEmbeddingModel = conf?.selectedEmbeddingModel
    state.msgRevokeAllowanceDuration = conf?.msgRevokeAllowanceDuration
})

const { data: models, refresh } = await useAsyncData('models', () => $ai.getModels())
const compModelsMenuSource = computed(() => unref(models)?.filter(value => {
    console.log(typeof value.forEmbedding, value)
    return value.forEmbedding == false
}))
const embeddingModelsMenuSource = computed(() => unref(models)?.filter(value => {
    return value.forEmbedding == true
}))

async function onSubmit(event: FormSubmitEvent<Schema>) {
    saving.value = true

    $prof.$configState.value = defaultUserConfig({
        apiKey: await $cry.encryptEndpoint(event.data.apiKey),
        selectedCompletionModel: event.data.selectedCompletionModel,
        selectedEmbeddingModel: event.data.selectedEmbeddingModel,
        msgRevokeAllowanceDuration: event.data.msgRevokeAllowanceDuration
    })

    await $prof.save()

    saving.value = false
}

async function deleteModel(id: string) {
    console.log(id)
    deletingModel.value = true

    await $ai.removeModel(id)
    await refresh()

    deletingModel.value = false
}

</script>

<template>
    <UPage
        class="w-full px-8 h-full"
    >
        <ScrollAreaRoot class="w-full relative h-screen" style="--scrollbar-size: 10px">
            <div :class="`absolute transition-all duration-300 right-0 left-0 top-0 bg-gradient-to-t from-transparent to-default h-4 w-full z-10 inline-flex justify-start items-center pointer-events-none`"/>
            <ScrollAreaViewport class="h-full">
                <div class="w-full space-y-6 pb-8">
                    <UPageHeader title="Settings"/>
                    <UPageCard title="Saved Models" variant="subtle">
                        <template #default>
                            <div class="w-full space-y-4">
                                <div class="flex justify-between">
                                    <UDropdownMenu :items="[[
                                        {label: 'Completion Models', onSelect() {addModels(false)} },
                                        {label: 'Embedding Models', onSelect() {addModels(true)} }
                                    ]]">
                                        <UButton label="Add..." icon="i-lucide-plus" color="neutral" :disabled="unref($prof.$configState)?.apiKey == undefined"/>
                                    </UDropdownMenu>
                                </div>
                                <div class="w-full grid grid-cols-1 gap-3">
                                    <div class="w-full shadow-sm rounded-lg border border-default bg-default p-3 select-none h-fit inline-flex items-center justify-between" v-for="(model, index) in models" :key="index">
                                        <div class="grid grid-cols-1 gap-1">
                                            <div class="font-bold">{{model.name}}</div>
                                            <div class="font-mono text-muted text-sm">{{model.inferenceId}}</div>
                                        </div>
                                        <UButton @click="deleteModel(model.id)" icon="i-lucide-trash-2" color="error" variant="subtle" :disabled="deletingModel" :loading="deletingModel"/>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </UPageCard>
                    <UPageCard title="Completion Settings" variant="subtle">
                        <template #default>
                            <UForm :disabled="saving" :state :schema="schemaObj" class="w-full space-y-4" @submit="onSubmit">
                                <div class="gap-4 grid grid-cols-2 w-full justify-items-stretch">
                                    <UFormField name="apiKey" label="API Key" required class="col-span-2">
                                        <UInput type="password" v-model="state.apiKey" class="w-full"/>
                                    </UFormField>
                                    <UFormField name="selectedCompletionModel" label="Completion Model">
                                        <USelectMenu v-model="state.selectedCompletionModel" value-key="id" label-key="name" :items="compModelsMenuSource" class="w-full"/>
                                    </UFormField>
                                    <UFormField name="selectedEmbeddingModel" label="Embedding Model">
                                        <USelectMenu v-model="state.selectedEmbeddingModel" value-key="id" label-key="name" :items="embeddingModelsMenuSource" class="w-full"/>
                                    </UFormField>
                                    <UFormField name="msgRevokeAllowanceDuration" label="Message Revoke Allowance Duration">
                                        <UInputNumber :min="0" v-model="state.msgRevokeAllowanceDuration" class="w-full"/>
                                    </UFormField>
                                </div>
                                <UButton type="submit" label="Save" icon="i-lucide-save" :disabled="saving" :loading="saving"/>
                            </UForm>
                        </template>
                    </UPageCard>
                </div>
            </ScrollAreaViewport>
            <ScrollAreaScrollbar
                class="select-none touch-none z-20 w-2 m-2 pointer-events-none"
                orientation="vertical"
            >
                <ScrollAreaThumb
                    class="flex-1 bg-accented rounded-lg"
                />
            </ScrollAreaScrollbar>
            <div :class="`absolute transition-all duration-300 right-0 left-0 bottom-0 bg-gradient-to-b from-transparent to-default h-4 w-full z-10 inline-flex justify-end items-center gap-1 pointer-events-none`"/>
        </ScrollAreaRoot>
    </UPage>
</template>

<style scoped>

</style>