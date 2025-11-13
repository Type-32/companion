<script setup lang="ts">
const appConfig = useAppConfig()
</script>

<template>
    <NuxtLoadingIndicator :color="appConfig.ui.colors.primary"/>
    <UApp>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </UApp>
</template>

<style>
@reference "~/assets/css/main.css";
[data-tauri-decorum-tb] {
    @apply !h-4;
}
</style>