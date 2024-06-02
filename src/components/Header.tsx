import { version } from "os";
import Icon from "@/components/Icon";
import LanguageSelector from "@/components/LanguageSelector";
import ThemeSelector from "@/components/ThemeSelector";
import Version from "@/components/Version";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NavigationBar: React.FC = () => {
    return (
        <header className="navigation-bar">
            <div className="navigation-bar-button-left" id="button-left">
                <button type="button" className="navigation-bar-button-close" id="stopCode" title="Close" onClick={() => window.stop()}>
                    <Icon type="default" icon="FaX" classNamePicture="navigation-bar-button-close-icon" classNameImage="navigation-bar-button-close-icon__image" />
                </button>
                <Link
                    to="https://github.com/BrowserSourcesForOBS/obs-timer-controller"
                    target="_blank"
                    rel="noreferrer"
                    id="button-github"
                    className="navigation-bar-button-link"
                    title="GitHub"
                >
                    <Icon type="default" icon="FaGithub" classNamePicture="navigation-bar-button-link-icon" classNameImage="navigation-bar-button-link-icon__image" />
                </Link>
                <Link
                    to="https://github.com/BrowserSourcesForOBS/obs-timer-controller/wiki"
                    target="_blank"
                    rel="noreferrer"
                    id="button-wiki"
                    className="navigation-bar-button-link"
                    title="Wiki"
                >
                    <Icon type="default" icon="FaBookOpen" classNamePicture="navigation-bar-button-link-icon" classNameImage="navigation-bar-button-link-icon__image" />
                </Link>
                <Version />
            </div>
            {/* <LanguageSelector />
            <ThemeSelector /> */}
        </header>
    );
};

export default NavigationBar;
