import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import open, { apps } from "open";
import { performance } from "perf_hooks";
import { ViteDevServer, createServer } from "vite";
import { ccolor } from "./src/utils/ccolor.ts";
import { getConfig } from "./src/utils/database.ts";
import { startWebSocketServer } from "./websocket.ts"; // Importa la función startWebSocketServer

// Obtén los argumentos de la línea de comandos desde el URL
const urlParams = new URLSearchParams(import.meta.url.split("?")[1]);
const args = JSON.parse(urlParams.get("args") || "[]");

const defaultPort = 5001;

async function getPackajeData() {
    const currentWorkingDir = process.cwd();
    let PackageJsonPath = path.resolve(currentWorkingDir, "resources/app/package.json");

    // Verifica si hay argumentos y si el primer argumento es "test"
    if (args.length > 0 && args[0] === "test") {
        PackageJsonPath = path.resolve(currentWorkingDir, "package.json");
    }

    // console.log("args:", args);
    // console.log(`PackageJsonPath: ${PackageJsonPath}`);

    try {
        const PackageJsonContent = fs.readFileSync(PackageJsonPath, "utf8");
        const PackageJson = JSON.parse(PackageJsonContent);
        return PackageJson;
    } catch (error) {
        console.error("Error reading package.json file:", error);
        return {};
    }
}

function getLocalIPAddress(): string | null {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName of Object.keys(networkInterfaces)) {
        const networkInterface = networkInterfaces[interfaceName];
        if (networkInterface) {
            for (const { address, family, internal } of networkInterface) {
                if (family === "IPv4" && !internal) {
                    return address;
                }
            }
        }
    }
    return null;
}

async function startServer() {
    const startTime = performance.now();

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const configPath = path.resolve(__dirname, "src/databases/config.json");
    const AppConfig = getConfig(configPath);

    const viteServer: ViteDevServer = await createServer({
        configFile: path.resolve(__dirname, "vite.config.ts"),
        server: {
            port: (AppConfig?.port as unknown as number) || defaultPort,
            host: "0.0.0.0",
        },
    });

    viteServer.listen().then(async ({ config }) => {
        getPackajeData().then((packageJson) => {
            // Inicia el servidor WebSocket utilizando el servidor HTTP subyacente de Vite
            startWebSocketServer(viteServer, { packageJson });

            const endTime = performance.now();
            const startupTime = (endTime - startTime).toFixed(2);
            const startupTimeFormatted = ccolor.bold(`${startupTime} ms`);

            const viteVersion = `v${packageJson?.devDependencies?.vite}`;
            const PORT = config.server?.port || defaultPort;
            const addressLocalHost = `http://localhost:${ccolor.bold(PORT)}${ccolor.cyan("/")}`;
            const addressLocal = `http://127.0.0.1:${ccolor.bold(PORT)}${ccolor.cyan("/")}`;
            const IPNetwork = getLocalIPAddress();
            const addressNetwork = IPNetwork ? `http://${IPNetwork}:${ccolor.bold(PORT)}${ccolor.cyan("/")}` : null;

            // BLOQUEO POR PARTE DE LOS ANTIVIRUS DE ESTA OPCIÓN
            // open(`http://localhost:${PORT}`, { app: { name: "google chrome" } }).catch((err) => {
            //     console.error("Failed to open browser:", err);
            // });

            // console.clear();
            console.log(`  ${ccolor.green(ccolor.bold("VITE"))} ${ccolor.green(viteVersion)} ready in ${startupTimeFormatted}\n`);
            console.log(`  ${ccolor.green("➜")}  ${ccolor.bold("Port")}:\t${ccolor.cyan(ccolor.bold(PORT))}`);
            console.log(`  ${ccolor.green("➜")}  ${ccolor.bold("LocalHost")}:\t${ccolor.cyan(addressLocalHost)}`);
            console.log(`  ${ccolor.green("➜")}  ${ccolor.bold("Local")}:\t${ccolor.cyan(addressLocal)}`);
            if (addressNetwork) console.log(`  ${ccolor.green("➜")}  ${ccolor.bold("Network")}:\t${ccolor.cyan(addressNetwork)}`);
            console.log("\n");
        });
    });
}

startServer();
