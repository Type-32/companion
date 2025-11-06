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