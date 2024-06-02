import { createServer } from "node:http";
import express from "express";
import { Server as SocketIo } from "socket.io";

const PORT = process.env.PORT || 5001;
const app = express();
const server = createServer(app);

// Importa directamente la clase Server desde socket.io
const io = new SocketIo(server);

io.on("connection", (socket) => {
    console.log("Nuevo cliente conectado");

    socket.on("message", (message) => {
        console.log("Mensaje recibido:", message);
        io.emit("message", message);
    });

    socket.on("disconnect", () => {
        console.log("Cliente desconectado");
    });
});

app.use(express.static("src"));

server.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});
