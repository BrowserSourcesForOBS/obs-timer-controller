export const ccolor = {
    bold: (text: string | number) => `\x1b[1m${text}\x1b[0m`,
    cyan: (text: string | number) => `\x1b[36m${text}\x1b[0m`,
    yellow: (text: string | number) => `\x1b[33m${text}\x1b[0m`,
    red: (text: string | number) => `\x1b[31m${text}\x1b[0m`,
    green: (text: string | number) => `\x1b[32m${text}\x1b[0m`,
    // Agrega más colores según sea necesario
};
