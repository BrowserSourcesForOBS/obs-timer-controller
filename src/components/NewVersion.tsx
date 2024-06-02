import fs from "fs";
import { compareVersions } from "@/utils/util";
import axios from "axios";
import { useEffect, useState } from "react";

const Version: React.FC = () => {
    const [enableNewVersion, setEnableNewVersion] = useState<boolean>(false);

    async function getVersion() {
        try {
            // Determines the folder name based on the operating system
            //const appFolder = process.platform === "darwin" ? "Resources" : "resources";

            // Build the path to the package.json file
            //const data = await fs.promises.readFile(process.argv[0] === "test" ? "./package.json" : `./${appFolder}/app/package.json`, "utf8");
            const data = await fs.promises.readFile("./package.json", "utf8");

            // Parse the content of the JSON file
            const packageJson = JSON.parse(data);
            const packageVersion = `v${packageJson.version}`;

            // Extract the project version
            console.log(`Project version: ${packageVersion}`);
            return packageVersion;
        } catch (jsonError) {
            throw new Error(`Error parsing package.json: ${jsonError}`);
        }
    }

    async function getVersionRelease() {
        // Set the GitHub repository URL (make sure to replace 'owner' and 'repo' with your information)
        const repoOwner = "BrowserSourcesForOBS"; // Replace 'owner' with the name of the repository owner
        const repoName = "obs-timer-controller"; // Replace 'repo' with the name of the repository

        // Make a request to the public releases page
        try {
            const response = await axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`);
            const latestTag = response.data.tag_name;
            console.log(`Latest release tag on GitHub: ${latestTag}`);
            return latestTag;
        } catch (error) {
            throw new Error(`Error getting latest release tag: ${error}`);
        }
    }

    useEffect(() => {
        async function fetchVersions() {
            const localVersion = await getVersion();
            const releaseVersion = await getVersionRelease();

            if (compareVersions(localVersion, releaseVersion) === 1) {
                setEnableNewVersion(true);
            }
        }

        fetchVersions();
    }, []);

    if (enableNewVersion) {
        return <span className="navigation-bar-version navigation-bar-version-release" id="navigation-bar-version"></span>;
    }
    return null;
};

export default Version;
