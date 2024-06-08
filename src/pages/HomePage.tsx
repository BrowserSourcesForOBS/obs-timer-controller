import Header from "@/components/Header";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { io } from "socket.io-client";

const origin = "obs-timer-controller";
const socket = io();

const HomePage: React.FC = () => {
    const { i18n } = useTranslation();
    const changeLanguage = (language: string) => {
        i18n.changeLanguage(language);
    };

    // changeLanguage("es");
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
    // TODO: Add title and icon

    return (
        <div className="homepage">
            <Header />
            <div className="homepage-container">"Home Page"</div>
        </div>
    );
};

export default HomePage;
