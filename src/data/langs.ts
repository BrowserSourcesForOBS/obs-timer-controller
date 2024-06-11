import dataJSON from "@/assets/langs.json" assert { type: "json" };

const Languages = dataJSON as unknown as ILang.Langs;

export default Languages;
