import Header from "@/components/Header";
import ws from "@/utils/websocket";
import { useTranslation } from "react-i18next";

const HomePage: React.FC = () => {
    const { i18n } = useTranslation();

    ws.onMessage((action, author) => {
        console.log(`onMessage action [${author}]:`, action);
    });

    // changeLanguage("es");

    // TODO: Add title and icon

    return (
        <div className="homepage">
            <Header />
            <div className="homepage-container">"Home Page"</div>
        </div>
    );
};

export default HomePage;
