import Icon from "@/components/Icon";
import NewVersion from "@/components/NewVersion";
import ws, { setAuthor } from "@/utils/websocket";
import { Button } from "primereact/button";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";

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
            <div className="navigation-bar-container-left">
                <Button icon="pi pi-times" severity="danger" className="navigation-bar-button" onClick={handleClose} title={translate("close-title")} />

                <Button
                    icon="pi pi-github"
                    severity="secondary"
                    className="navigation-bar-button"
                    onClick={() => window.open("https://github.com/BrowserSourcesForOBS/obs-timer-controller", "_blank")}
                    title="GitHub"
                />

                <Button
                    icon="pi pi-book"
                    severity="secondary"
                    className="navigation-bar-button"
                    onClick={() => window.open("https://github.com/BrowserSourcesForOBS/obs-timer-controller/wiki", "_blank")}
                    title="Wiki"
                    plain={true}
                />

                {appVersion && <Button severity="info" label={`v${appVersion}`} disabled style={{ opacity: 100 }} />}
            </div>
            <div className="navigation-bar-container-right">
                <LanguageSelector />
                {/* <ThemeSelector /> */}
            </div>
        </header>
    );
};

export default Header;
