import Image from "@/components/Image";
import { icons } from "@/data";
import type * as CSS from "csstype";
import React, { useCallback, useEffect, useState } from "react";
import { type IconType } from "react-icons";
import type * as Fa6Icons from "react-icons/fa6";
import type * as GrIcons from "react-icons/gr";
import type * as HiIcons from "react-icons/hi";
import type * as ImIcons from "react-icons/im";

const iconsHi = import("react-icons/hi");
const iconsIm = import("react-icons/im");
const iconsGr = import("react-icons/gr");
const iconsFa6 = import("react-icons/fa6");

const allIcons = Promise.all([iconsHi, iconsIm, iconsGr, iconsFa6]).then((icons) => ({ ...icons[0], ...icons[1], ...icons[2], ...icons[3] }));

export type DefaultIcon = keyof typeof HiIcons | keyof typeof ImIcons | keyof typeof GrIcons | keyof typeof Fa6Icons;

interface A extends React.SVGProps<SVGSVGElement> {
    type: "custom";
    icon: keyof typeof icons;
    classNamePicture?: string;
    classNameImage?: string;
}

interface B extends React.SVGProps<SVGSVGElement> {
    type: "default";
    icon: DefaultIcon;
    size?: CSS.Property.Width;
    classNamePicture?: string;
    classNameImage?: string;
}

export type IconProps = A | B;

const Icon: React.FC<IconProps> = ({ type, icon, ...props }) => {
    const [Component, setComponent] = useState<IconType | null>(null);

    const loadIcon = useCallback(async () => {
        try {
            const componentIcon = (await allIcons)[icon as B["icon"]];
            setComponent(() => componentIcon);
        } catch {
            setComponent(null);
        }
    }, [icon]);

    useEffect(() => {
        if (type === "default") loadIcon();
    }, [loadIcon, type]);

    if (type === "default" && Component)
        return (
            <Image alt={`Icon ${(props as A).icon}`} classNamePicture={(props as A).classNamePicture}>
                <Component size={(props as B).size ?? "32"} className={(props as A).classNameImage} />
            </Image>
        );

    if (type === "custom")
        return <Image src={icons[icon]} alt={`Icon ${(props as A).icon}`} classNamePicture={(props as A).classNamePicture} classNameImage={(props as A).classNameImage} />;

    return <></>;
};

export default Icon;
