// Importa los módulos necesarios
import { register } from "node:module";
import { pathToFileURL } from "node:url";

// Registra ts-node/esm con el archivo actual como base
register("ts-node/esm", pathToFileURL("./"));

// Obtén los argumentos de la línea de comandos
const args = process.argv.slice(2);

// Ahora carga y ejecuta tu script server.ts con los argumentos
import(`./server.ts?args=${encodeURIComponent(JSON.stringify(args))}`);
