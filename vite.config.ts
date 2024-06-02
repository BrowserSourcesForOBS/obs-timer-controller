import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { pluginAPIRoutes } from "vite-plugin-api-routes";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        pluginAPIRoutes(),
        {
            name: "markdown-loader",
            transform(code, file) {
                if (file.endsWith(".md")) {
                    return `export default ${JSON.stringify(code)};`;
                }
            },
        },
    ],
    resolve: {
        alias: {
            "@": "/src",
        },
    },
});
