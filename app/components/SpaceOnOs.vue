<script setup lang="ts">
import {useOsPlatform} from "~/composables/core/useOsPlatform";

const props = withDefaults(defineProps<{
    detectOs: string,
    showOnOs?: boolean,
    noWidth?: boolean,
    noHeight?: boolean,
    height?: number,
    width?: number
}>(), {
    noWidth: false,
    noHeight: false,
    showOnOs: true,
    width: 24,
    height: 10
})

const $platform = useOsPlatform()
</script>

<template>
    <div class="w-fit h-fit" v-if="props.showOnOs">
        <div :class="`${noWidth ? '' : `w-${width}`} ${noHeight ? '' : `h-${height}`}`" v-if="$platform != props.detectOs"/>
    </div>
    <div class="w-fit h-fit" v-else>
        <div :class="`${noWidth ? '' : `w-${width}`} ${noHeight ? '' : `h-${height}`}`" v-if="$platform == props.detectOs"/>
    </div>
</template>

<style scoped>

</style>