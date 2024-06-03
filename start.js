// Importa los módulos necesarios
import { register } from "node:module";
import { pathToFileURL } from "node:url";

// Registra ts-node/esm con el archivo actual como base
register("ts-node/esm", pathToFileURL("./"));

// Ahora carga y ejecuta tu script server.ts
import("./server.ts");
