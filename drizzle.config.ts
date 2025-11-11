import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "sqlite",
    dbCredentials: {
        url: process.env.DEBUG_DB_PATH as string
    }
});
