<script setup lang="ts">
import {useAi} from "~/composables/controls/useAi";
import {ScrollAreaRoot, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport} from "reka-ui";

interface SelectedModel {
    name: string,
    id: string,
    description: string
}

interface FetchedModel {
    value: string,
    label: string,
    description: string
}

const props = withDefaults(defineProps<{embeddingModels: boolean, maxSelectAmount: number}>(), {
    embeddingModels: false,
    maxSelectAmount: -1
})
const emit = defineEmits<{ close: [SelectedModel[]] }>()
const $ai = useAi()
const selectedModels = ref<SelectedModel[]>([])
const search = ref('')

const { data: orModels, pending: pending, refresh: refresh } = await useAsyncData('openrouter_completion_models', async () => $ai.listOpenRouterModels(props.embeddingModels))

const filteredModels = computed(() => unref(orModels)?.map(value => {
    return {
        value: value.id,
        label: value.name,
        description: value.description
    } as FetchedModel
}).filter(value => value.label.includes(unref(search)) || value.value.includes(unref(search))))

function isModelSelected(id: string): boolean {
    return unref(selectedModels).findIndex(value => value.id == id) != -1
}

function toggleModelSelection(model: FetchedModel) {
    if (model) {
        if (isModelSelected(model.value)) {
            selectedModels.value = unref(selectedModels).filter(value => value.id != model.value)
        } else {
            if (selectedModels.value.length < props.maxSelectAmount || props.maxSelectAmount == -1)
                selectedModels.value.push({
                    id: model.value,
                    name: model.label,
                    description: model.description
                })
        }
    }
}

function refreshModels() {
    refresh()
}

function showSelectionTools() {
    return unref(selectedModels).length > 0
}

function deselectAll() {
    selectedModels.value = []
}

</script>

<template>
    <UModal
        :close="{ onClick: () => emit('close', []) }"
        title="Select Models from OpenRouter"
        fullscreen
    >
        <template #body>
            <div class="w-full relative">
                <div class="flex gap-2 items-center z-10 sticky top-0 left-0 right-0 rounded-lg border border-default bg-default p-3 shadow-lg">
                    <UInput class="flex-grow" v-model="search" icon="i-lucide-search" placeholder="Search..."/>
                    <UButton @click="refreshModels" icon="i-lucide-refresh-ccw" :loading="pending"/>
                </div>
                <ScrollAreaRoot class="w-full relative" style="--scrollbar-size: 10px">
                    <ScrollAreaViewport class="h-full">
                        <div class="w-full space-y-4 px-1 py-4">
                            <div class="w-full h-full gap-4 grid grid-cols-2" v-if="!pending">
                                <UPageCard @click="toggleModelSelection(model)" :title="model.label" v-for="(model, index) in filteredModels" :highlight="isModelSelected(model.value)" :description="model.value" :key="index"/>
                            </div>
                            <div class="w-full h-full flex items-center justify-center" v-else>
                                <UIcon name="i-lucide-loader-circle" class="animate-spin text-muted"/>
                            </div>
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
                </ScrollAreaRoot>
            </div>
        </template>
        <template #footer>
            <div class="flex gap-2 w-full select-none">
                <div class="flex gap-2 items-center" v-if="showSelectionTools()" @click="deselectAll">
                    <UButton variant="outline" icon="i-lucide-x" label="Deselect All" color="neutral"/>
                    <div class="text-sm text-muted">Selected {{selectedModels.length}} item(s).</div>
                </div>
                <div class="flex-grow"/>
                <UButton color="neutral" variant="outline" label="Cancel" @click="emit('close', [])" />
                <UButton label="Done" @click="emit('close', selectedModels)" />
            </div>
        </template>
    </UModal>
</template>