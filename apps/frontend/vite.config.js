import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@repo/utils": path.resolve(__dirname, "../../packages/utils/src/index.ts"),
        },
    },
});
