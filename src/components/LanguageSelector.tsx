import Languages from "@/data/langs";
import DOMPurify from "dompurify";
import { Dropdown } from "primereact/dropdown";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import uEmojiParser from "universal-emoji-parser";

const LanguageSelector: React.FC = () => {
    const { t } = useTranslation();
    const translate = (key: string) => t(`components.language-selector.${key}`);
    const [selectedLanguage, setSelectedLanguage] = useState({ name: "Español", code: "es", flag: ":flag_spain:" });

    const selectedCountryTemplate = (option: ILang.Lang, props) => {
        if (option) {
            const rawHTML = uEmojiParser.parse(option.flag);
            const sanitizedHTML = DOMPurify.sanitize(rawHTML);

            return (
                <div className="flex align-items-center">
                    <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    };

    const countryOptionTemplate = (option: ILang.Lang) => {
        const rawHTML = uEmojiParser.parse(`${option.flag}\t${option.name}`);
        const sanitizedHTML = DOMPurify.sanitize(rawHTML);

        return (
            <div className="flex align-items-center">
                <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
            </div>
        );
    };

    return (
        <div title={translate("language")} className="language-selector-container">
            <i className="pi pi-language" />
            <div className="flex justify-content-center">
                <Dropdown
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.value)}
                    options={Languages}
                    optionLabel="name"
                    filter
                    valueTemplate={selectedCountryTemplate}
                    itemTemplate={countryOptionTemplate}
                    className="language-selector"
                />
            </div>
        </div>
    );
};

export default LanguageSelector;
