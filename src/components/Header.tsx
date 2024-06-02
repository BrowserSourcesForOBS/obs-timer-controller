import Icon from "@/components/Icon";
import LanguageSelector from "@/components/LanguageSelector";
// import ThemeSelector from "@/components/ThemeSelector";
// import Version from "@/components/NewVersion";
import { Button } from "primereact/button";

const NavigationBar: React.FC = () => {
    return (
        <header className="navigation-bar">
            <div className="navigation-bar-button-left" id="button-left">
                <Button className="navigation-bar-button-close" onClick={() => window.stop()} title="Close" id="button-close">
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
                    id="button-github"
                    className="navigation-bar-button-link"
                    title="GitHub"
                >
                    <Icon type="default" icon="FaBookOpen" classNamePicture="navigation-bar-button-link-icon" classNameImage="navigation-bar-button-link-icon__image" />
                </Button>
                {/* <Version /> */}
            </div>
            <LanguageSelector />
            {/* <ThemeSelector /> */}
        </header>
    );
};

export default NavigationBar;
