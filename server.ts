import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "vite";
import { ccolor } from "./ccolor.ts";

const defaultPort = 5001;

async function getViteVersion(): Promise<string> {
    const currentWorkingDir = process.cwd();
    const vitePackageJsonPath = path.resolve(currentWorkingDir, "package.json");

    try {
        const vitePackageJsonContent = fs.readFileSync(vitePackageJsonPath, "utf8");
        const vitePackageJson = JSON.parse(vitePackageJsonContent);
        return vitePackageJson.devDependencies.vite;
    } catch (error) {
        console.error("Error reading package.json file:", error);
        return "N/A";
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
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const server = await createServer({
        configFile: path.resolve(__dirname, "vite.config.ts"),
        server: {
            port: defaultPort,
            host: "0.0.0.0",
        },
    });

    server.listen().then(async ({ config }) => {
        const viteVersion = `v${await getViteVersion()}`;
        const PORT = config.server?.port || defaultPort;
        const addressLocalHost = `https://localhost:${ccolor.bold(PORT)}/`;
        const addressLocal = `http://127.0.0.1:${ccolor.bold(PORT)}/`;
        const IPNetwork = getLocalIPAddress();
        const addressNetwork = IPNetwork ? `http://${IPNetwork}:${ccolor.bold(PORT)}/` : null;
        console.log(`\n\n  ${ccolor.green(ccolor.bold("VITE"))} ${ccolor.green(viteVersion)}\n`);
        console.log(`  ${ccolor.green("➜")}  ${ccolor.bold("Port")}:\t${ccolor.cyan(ccolor.bold(PORT))}`);
        console.log(`  ${ccolor.green("➜")}  ${ccolor.bold("LocalHost")}:\t${ccolor.cyan(addressLocalHost)}`);
        console.log(`  ${ccolor.green("➜")}  ${ccolor.bold("Local")}:\t${ccolor.cyan(addressLocal)}`);
        if (addressNetwork) console.log(`  ${ccolor.green("➜")}  ${ccolor.bold("Network")}:\t${ccolor.cyan(addressNetwork)}`);
    });
}

startServer();
