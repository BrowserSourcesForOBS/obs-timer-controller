// websocket.ts

import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { ViteDevServer } from "vite";

export async function startWebSocketServer(viteServer: ViteDevServer, packageJson: { version?: string }) {
    const httpServer = viteServer.httpServer as HttpServer | null;
    if (!httpServer) {
        console.error("HTTP server not available on ViteDevServer instance");
        return;
    }

    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: "*",
        },
    });

    // Ruta para obtener el puerto del WebSocket
    httpServer.on("request", (request, response) => {
        if (request.url === "/request/websocket-port") {
            response.writeHead(200, { "Content-Type": "text/plain" });
            response.end(viteServer.config.server.port?.toString());
        }
        if (request.url === "/request/app-version") {
            response.writeHead(200, { "Content-Type": "text/plain" });
            response.end(packageJson?.version);
        }
    });

    io.on("connection", (socket) => {
        //     console.log("A client connected");

        socket.on("message", (message) => {
            if (message.origin !== "obs-timer-controller") return;
            if (message.server === true) return;

            message.server = true;
            io.emit("message", message);
        });

        socket.on("disconnect", () => {
            // console.log("Client disconnected");
        });
    });

    // console.log("WebSocket server started");
}
