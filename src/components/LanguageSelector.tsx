import Languages from "@/data/langs";
import { Dropdown } from "primereact/dropdown";
import { useState } from "react";

const LanguageSelector: React.FC = () => {
    const [selectedLanguage, setSelectedLanguage] = useState({ name: "Español", code: "es" });

    const selectedCountryTemplate = (option: ILang.Lang, props) => {
        if (option) {
            return (
                <div className="flex align-items-center">
                    <div>{`:flag-${option.code}:\t${option.name}`}</div>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    };

    const countryOptionTemplate = (option: ILang.Lang) => {
        return (
            <div className="flex align-items-center">
                <div>{`:flag-${option.code}:\t${option.name}`}</div>
            </div>
        );
    };

    return (
        <Dropdown
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.value)}
            options={Languages}
            optionLabel="name"
            placeholder="Select a Language"
            filter
            valueTemplate={selectedCountryTemplate}
            itemTemplate={countryOptionTemplate}
            className="language-selector"
        />
    );
};

export default LanguageSelector;
