import Icon from "@/components/Icon";
// import LanguageSelector from "@/components/LanguageSelector";
// import ThemeSelector from "@/components/ThemeSelector";
import NewVersion from "@/components/NewVersion";
import config from "@/data/config";
import { Button } from "primereact/button";
import React from "react";
import { useTranslation } from "react-i18next";

const Header: React.FC = () => {
    const { t } = useTranslation();
    const translate = (key: string) => t(`components.header.${key}`);

    const handleClose = () => {
        const ws = new WebSocket("ws://localhost:8080");
        ws.onopen = () => {
            ws.send("close-server");
        };
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
                <Button className="navigation-bar-button-version">v{config.AppVersion}</Button>
                <NewVersion />
            </div>
            {/* <LanguageSelector /> */}
            {/* <ThemeSelector /> */}
        </header>
    );
};

export default Header;
