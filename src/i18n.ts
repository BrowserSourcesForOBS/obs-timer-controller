import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

i18n.use(Backend) // para cargar traducciones usando http
    .use(LanguageDetector) // para detectar el idioma del navegador
    .use(initReactI18next) // para inicializar react-i18next
    .init({
        fallbackLng: "en",
        debug: true,
        interpolation: {
            escapeValue: false, // React already safeguards from xss
        },
        backend: {
            loadPath: "/locales/{{lng}}.json", // ruta a los archivos de traducción
        },
    });

export default i18n;
