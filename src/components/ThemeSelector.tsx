import { InputSwitch } from "primereact/inputswitch";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const ThemeSelector: React.FC = () => {
    const { t } = useTranslation();
    const translate = (key: string) => t(`components.theme-selector.${key}`);
    const [checked, setChecked] = useState<boolean>(false);
    return (
        <div className="theme-selector-container" title={translate("theme")}>
            <i className="pi pi-sun" />
            <div className="flex justify-content-center align-items-center theme-selector-container-switch">
                <InputSwitch checked={checked} onChange={(e) => setChecked(e.value)} className="theme-selector-container-switch-slider" />
            </div>
            <i className="pi pi-moon" />
        </div>
    );
};

export default ThemeSelector;
