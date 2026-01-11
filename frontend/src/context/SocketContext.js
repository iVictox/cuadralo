"use client";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { api } from "@/utils/api";
import { usePathname } from "next/navigation";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set()); // Set de IDs
    const [messages, setMessages] = useState([]); // Buffer global de mensajes entrantes
    const [isConnected, setIsConnected] = useState(false);
    
    // Referencia para evitar reconexiones multiples
    const socketRef = useRef(null);
    const pathname = usePathname();

    useEffect(() => {
        const connectSocket = async () => {
            try {
                // ✅ CORRECCIÓN: No conectar en páginas públicas
                if (pathname === "/login" || pathname === "/register") return;

                // ✅ CORRECCIÓN: Manejar error de sesión silenciosamente
                let me;
                try {
                    me = await api.get("/me");
                } catch (e) {
                    // Si falla (ej: 401 Unauthorized), simplemente no conectamos socket
                    // y evitamos que explote la app con "Sesión expirada"
                    return; 
                }
                
                if (!me || !me.id) return;

                if (socketRef.current) return; // Ya conectado

                const wsUrl = `ws://localhost:8000/ws/${me.id}`;
                const ws = new WebSocket(wsUrl);

                ws.onopen = () => {
                    console.log("🟢 Conectado al Chat Server");
                    setIsConnected(true);
                };

                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    
                    if (data.type === "new_message") {
                        // Disparar evento global o guardar en estado
                        setMessages((prev) => [...prev, data.payload]);
                    } else if (data.type === "user_status") {
                        const { user_id, status } = data.payload;
                        setOnlineUsers((prev) => {
                            const newSet = new Set(prev);
                            if (status === "online") newSet.add(user_id);
                            else newSet.delete(user_id);
                            return newSet;
                        });
                    }
                };

                ws.onclose = () => {
                    console.log("🔴 Desconectado del Chat");
                    setIsConnected(false);
                    socketRef.current = null;
                };

                socketRef.current = ws;
                setSocket(ws);
            } catch (error) {
                console.error("Error conectando socket:", error);
            }
        };

        connectSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [pathname]); // ✅ Añadido pathname como dependencia

    const sendMessage = (payload) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: "send_message",
                payload: payload
            }));
        } else {
            console.error("Socket no conectado");
        }
    };

    const markViewed = (msgId) => {
        if (socket) {
            socket.send(JSON.stringify({
                type: "view_once_opened",
                payload: { message_id: msgId }
            }));
        }
    }

    const toggleSave = (msgId, isSaved) => {
        if (socket) {
            socket.send(JSON.stringify({
                type: "save_message",
                payload: { message_id: msgId, is_saved: isSaved }
            }));
        }
    }

    return (
        <SocketContext.Provider value={{ socket, isConnected, onlineUsers, messages, sendMessage, markViewed, toggleSave }}>
            {children}
        </SocketContext.Provider>
    );
};