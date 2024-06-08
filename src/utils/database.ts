import fs from "fs";
import path from "path";

export function getConfig(configPath: string): Record<string, string> {
    try {
        // Check if the config file exists
        if (!fs.existsSync(configPath)) {
            return {};
        }

        // Read and parse the config file
        const configContent = fs.readFileSync(configPath, "utf8");
        return JSON.parse(configContent);
    } catch (error) {
        console.error("Error reading config file:", error);
        return {};
    }
}

export function updateConfig(newConfig: Record<string, string>, configPath: string) {
    try {
        // Get the directory from the config path
        const configDir = path.dirname(configPath);

        // Ensure the directory exists
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
            console.log(`Directory '${configDir}' created.`);
        }

        // Write the new configuration to the file
        const configContent = JSON.stringify(newConfig, null, 2);
        fs.writeFileSync(configPath, configContent, "utf8");
        console.log("Configuration updated successfully.");
    } catch (error) {
        console.error("Error writing config file:", error);
    }
}
