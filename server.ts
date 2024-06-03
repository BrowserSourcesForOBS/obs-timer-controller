import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { performance } from "perf_hooks";
// Revisar el problema de la importación al crear el paquete
import { ccolor } from "src/utils/ccolor.ts";
import { getConfig, updateConfig } from "src/utils/database.ts";
import { createServer } from "vite";

const defaultPort = 5001;

async function getPackajeData() {
    const currentWorkingDir = process.cwd();
    const PackageJsonPath = path.resolve(currentWorkingDir, "package.json");

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

    const server = await createServer({
        configFile: path.resolve(__dirname, "vite.config.ts"),
        server: {
            port: (AppConfig?.port as number) || defaultPort,
            host: "0.0.0.0",
        },
    });

    server.listen().then(async ({ config }) => {
        const endTime = performance.now();
        const startupTime = (endTime - startTime).toFixed(2);
        const startupTimeFormatted = ccolor.bold(`${startupTime} ms`);

        const packageJson = await getPackajeData();

        const viteVersion = `v${packageJson?.devDependencies?.vite}`;
        const PORT = config.server?.port || defaultPort;
        const addressLocalHost = `http://localhost:${ccolor.bold(PORT)}${ccolor.cyan("/")}`;
        const addressLocal = `http://127.0.0.1:${ccolor.bold(PORT)}${ccolor.cyan("/")}`;
        const IPNetwork = getLocalIPAddress();
        const addressNetwork = IPNetwork ? `http://${IPNetwork}:${ccolor.bold(PORT)}${ccolor.cyan("/")}` : null;

        AppConfig.AppVersion = packageJson?.version;
        updateConfig(AppConfig, configPath);

        console.clear();
        console.log(`  ${ccolor.green(ccolor.bold("VITE"))} ${ccolor.green(viteVersion)} ready in ${startupTimeFormatted}\n`);
        console.log(`  ${ccolor.green("➜")}  ${ccolor.bold("Port")}:\t${ccolor.cyan(ccolor.bold(PORT))}`);
        console.log(`  ${ccolor.green("➜")}  ${ccolor.bold("LocalHost")}:\t${ccolor.cyan(addressLocalHost)}`);
        console.log(`  ${ccolor.green("➜")}  ${ccolor.bold("Local")}:\t${ccolor.cyan(addressLocal)}`);
        if (addressNetwork) console.log(`  ${ccolor.green("➜")}  ${ccolor.bold("Network")}:\t${ccolor.cyan(addressNetwork)}`);
        console.log("\n");
    });
}

startServer();
