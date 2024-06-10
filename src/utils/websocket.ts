import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io();

const dataWs = {
    origin: "obs-timer-controller",
    server: false,
} as Record<string, string | number | boolean | undefined>;

let ws_author: string | undefined = undefined;

export const setAuthor = (author: string | undefined) => {
    ws_author = author;
};

const useOnMessage = (callback: (action: string, author?: string) => void) => {
    useEffect(() => {
        const handleMessage = (message: { origin: string; server: boolean; action: string; author: string }) => {
            if (message.origin !== dataWs.origin) return;
            if (message.server === false) return;
            callback(message.action, message.author || undefined); // Llama al callback con la acción y el autor, si existe
        };

        socket.on("message", handleMessage);

        return () => {
            socket.off("message", handleMessage);
        };
    }, [callback]); // Ensure the callback is included in the dependency array
};

const send = (action: string) => {
    dataWs.author = ws_author;
    dataWs.action = action;
    socket.send(dataWs);
};

const request = async (data: string) => {
    try {
        const response = await fetch(`/request/${data}`);
        if (response.ok) {
            const result = await response.text();
            return result;
        }
        console.error("Failed to fetch app version:", response.status);
        return undefined; // Devuelve undefined en caso de error
    } catch (error) {
        console.error("Error fetching app version:", error);
        return undefined; // Devuelve undefined en caso de error
    }
};

// Optional alias for consistency
const onMessage = useOnMessage;

const ws = { onMessage, send, request };

export default ws;
