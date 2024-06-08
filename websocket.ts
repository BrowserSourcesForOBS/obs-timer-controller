import WebSocket, { WebSocketServer } from "ws";

export function startWebSocketServer(server) {
    const wsServer = new WebSocketServer({ server });

    wsServer.on("connection", (ws) => {
        ws.on("message", (message) => {
            if (message.toString() === "close-server") {
                console.log("Closing server as requested by the client");
                process.exit(0);
            }
        });
    });
}
