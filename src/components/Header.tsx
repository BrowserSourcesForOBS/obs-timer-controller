// Header.jsx

import Icon from "@/components/Icon";
import NewVersion from "@/components/NewVersion";
import ws, { setAuthor } from "@/utils/websocket";
import { Button } from "primereact/button";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

setAuthor("header");

const Header: React.FC = () => {
    const { t } = useTranslation();
    const translate = (key: string) => t(`components.header.${key}`);
    const [appVersion, setAppVersion] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchAppVersion = async () => {
            try {
                const version = await ws.request("app-version");
                setAppVersion(version);
            } catch (error) {
                console.error("Error fetching app version:", error);
            }
        };

        fetchAppVersion();
    }, []);

    const handleClose = () => {
        ws.send("button-close"); // Envía un mensaje al servidor para cerrar la conexión
    };

    return (
        <header className="navigation-bar">
            <div className="navigation-bar-button-left" id="button-left">
                <Button className="navigation-bar-button-close" onClick={handleClose} title={translate("close-title")} id="button-close">
                    <Icon type="default" icon="FaX" classNamePicture="navigation-bar-button-close-icon" classNameImage="navigation-bar-button-close-icon__image" />
                </Button>

                <Button
                    link
                    onClick={() => window.open("https://github.com/BrowserSourcesForOBS/obs-timer-controller", "_blank")}
                    rel="noreferrer"
                    id="button-github"
                    className="navigation-bar-button-link"
                    title="GitHub"
                >
                    <Icon type="default" icon="FaGithub" classNamePicture="navigation-bar-button-link-icon" classNameImage="navigation-bar-button-link-icon__image" />
                </Button>
                <Button
                    link
                    onClick={() => window.open("https://github.com/BrowserSourcesForOBS/obs-timer-controller/wiki", "_blank")}
                    rel="noreferrer"
                    id="button-wiki"
                    className="navigation-bar-button-link"
                    title="Wiki"
                >
                    <Icon type="default" icon="FaBookOpen" classNamePicture="navigation-bar-button-link-icon" classNameImage="navigation-bar-button-link-icon__image" />
                </Button>
                {appVersion && <Button className="navigation-bar-button-version">v{appVersion}</Button>}
                <NewVersion />
            </div>
            {/* <LanguageSelector /> */}
            {/* <ThemeSelector /> */}
        </header>
    );
};

export default Header;
