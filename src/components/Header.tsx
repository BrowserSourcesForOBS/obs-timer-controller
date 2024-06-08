// Header.jsx

import Icon from "@/components/Icon";
import NewVersion from "@/components/NewVersion";
import { Button } from "primereact/button";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { io } from "socket.io-client";

const origin = "obs-timer-controller";
const socket = io();

const Header: React.FC = () => {
    const { t } = useTranslation();
    const translate = (key: string) => t(`components.header.${key}`);
    const [appVersion, setAppVersion] = useState<string | null>(null);

    useEffect(() => {
        const fetchAppVersion = async () => {
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
        };

        fetchAppVersion();
    }, []);

    useEffect(() => {
        socket.on("message", (message) => {
            if (message.origin !== origin) return;
            if (message.server === false) return;
        });

        return () => {
            // Desuscribe la escucha del evento "message" al desmontar el componente
            socket.off("message");
        };
    }, []);

    const handleClose = () => {
        socket.send({ origin, server: false, author: "home-page", action: "button-close" }); // Envía un mensaje al servidor para cerrar la conexión
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
                {/* {appVersion && <Button className="navigation-bar-button-version">v{appVersion}</Button>} */}
                <NewVersion />
            </div>
            {/* <LanguageSelector /> */}
            {/* <ThemeSelector /> */}
        </header>
    );
};

export default Header;
