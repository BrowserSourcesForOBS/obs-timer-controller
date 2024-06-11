declare namespace ILang {
    export interface Lang {
        name: string;
        code: string;
        flag: string;
    }

    export interface Langs extends Array<Lang> {}
}
