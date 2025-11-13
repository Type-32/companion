// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: {enabled: false},

    modules: ["@nuxt/ui", "nuxt-auth-utils", "@vueuse/nuxt", "@nuxt/image", "@nuxt/icon", "@nuxt/fonts", "@nuxtjs/i18n", "@nuxtjs/mdc"],

    css: ["~/assets/css/main.css"],

    compatibilityDate: "2025-11-01",

    // Enable SSG
    ssr: false,
    // Enables the development server to be discoverable by other devices when running on iOS physical devices
    devServer: {host: process.env.TAURI_DEV_HOST || "localhost"},
    vite: {
        // Better support for Tauri CLI output
        clearScreen: false,
        // Enable environment variables
        // Additional environment variables can be found at
        // https://v2.tauri.app/reference/environment-variables/
        envPrefix: ["VITE_", "TAURI_"],
        server: {
            // Tauri requires a consistent port
            strictPort: true,
        },
        optimizeDeps: {
            include: [
                "@tauri-apps/plugin-sql",
                "@type32/tauri-sqlite-orm",
                "@ai-sdk/vue",
                "ai",
                "@nuxt/ui/utils/ai",
                "@vue/devtools-core",
                "@vue/devtools-kit",
                "@tauri-apps/plugin-store",
                "@tauri-apps/plugin-fs",
                "@tauri-apps/plugin-dialog",
                "@tauri-apps/plugin-opener",
                "@tauri-apps/plugin-notification",
                "@tauri-apps/plugin-os",
                "@tauri-apps/plugin-clipboard-manager",
                "@openrouter/ai-sdk-provider",
                "zod",
                "reka-ui"
            ]
        }
    },
    runtimeConfig: {
        testingApiKey: '',
        sessionPassword: ''
    }
});