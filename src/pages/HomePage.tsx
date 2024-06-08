import Header from "@/components/Header";
import { useTranslation } from "react-i18next";

const HomePage: React.FC = () => {
    const { i18n } = useTranslation();
    const changeLanguage = (language: string) => {
        i18n.changeLanguage(language);
    };

    changeLanguage("es");

    // TODO: Add title and icon

    return (
        <div className="homepage">
            <Header />
            <div className="homepage-container">"Home Page"</div>
        </div>
    );
};

export default HomePage;
