{
    /* <div className="language-span">
    <i className="fas fa-language"></i>
    <select className="language-selector" id="language-selector"></select>
</div>; */
}

import { Dropdown } from "primereact/dropdown";
import { useState } from "react";

const LanguageSelector: React.FC = () => {
    const [selectedLanguage, setSelectedLanguage] = useState({ name: "Español", code: "ES" });
    const Languages = [
        { name: "Español", code: "ES" },
        { name: "English", code: "UK" },
    ];

    const selectedCountryTemplate = (option, props) => {
        if (option) {
            return (
                <div className="flex align-items-center">
                    <img
                        alt={option.name}
                        src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png"
                        className={`mr-2 flag flag-${option.code.toLowerCase()}`}
                        style={{ width: "18px" }}
                    />
                    <div>{option.name}</div>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    };

    const countryOptionTemplate = (option) => {
        return (
            <div className="flex align-items-center">
                <img
                    alt={option.name}
                    src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png"
                    className={`mr-2 flag flag-${option.code.toLowerCase()}`}
                    style={{ width: "18px" }}
                />
                <div>{option.name}</div>
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
