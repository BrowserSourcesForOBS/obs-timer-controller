import { compareVersions } from "@/utils/util";
import axios from "axios";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const NewVersion: React.FC = () => {
    const { t } = useTranslation();
    const translate = (key: string) => t(`components.new-version.${key}`);
    const [enableNewVersion, setEnableNewVersion] = useState<string | null>(null);
    const [appVersion, setAppVersion] = useState<string | null>(null);

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
            try {
                const response = await fetch("/request/app-version");
                if (response.ok) {
                    const version = await response.text();
                    setAppVersion(version);
                } else {
                    console.error("Failed to fetch app version:", response.status);
                }
            } catch (error) {
                console.error("Error fetching app version:", error);
            }
            const releaseVersion = await getVersionRelease();

            if (appVersion && compareVersions(appVersion, releaseVersion) === 1) {
                setEnableNewVersion(releaseVersion);
            }

            setEnableNewVersion(releaseVersion);
        }

        fetchVersions();
    }, []);

    if (enableNewVersion) {
        return (
            <div className="flex justify-content-center align-items-center">
                <Button
                    onClick={() => window.open("https://github.com/BrowserSourcesForOBS/obs-timer-controller/releases/latest", "_blank")}
                    rel="noreferrer"
                    id="button-new-version"
                    className="new-version-button"
                    title={translate("button-title")}
                    severity="success"
                >
                    {translate("button")} {enableNewVersion}
                </Button>
            </div>
        );
    }
    return null;
};

export default NewVersion;
