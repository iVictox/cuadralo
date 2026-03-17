"use client";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set()); 
    const [messages, setMessages] = useState([]); 
    const [isConnected, setIsConnected] = useState(false);
    
    const socketRef = useRef(null);
    const pathname = usePathname();

    useEffect(() => {
        // 1. Evitar conectar en login/registro
        if (pathname === "/login" || pathname === "/register") {
            if (socketRef.current) {
                console.log("🔒 Cerrando sesión de chat");
                socketRef.current.close();
                socketRef.current = null;
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        const connectSocket = () => {
            // Evitar doble conexión
            if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
                return;
            }

            try {
                const token = localStorage.getItem("token");
                const userStr = localStorage.getItem("user");
                
                if (!token || !userStr) return;

                const me = JSON.parse(userStr);
                if (!me || !me.id) return;

                // ✅ SOLUCIÓN: Detección dinámica de Entorno (Local vs Producción)
                const isSecure = window.location.protocol === "https:";
                const wsProtocol = isSecure ? "wss" : "ws";
                
                // Si estás en local usamos localhost:8080.
                // Si estás en producción, usamos el host actual (cuadralo.club).
                // Nota importante: En producción, Nginx/Cloudflare suele manejar el SSL en el puerto 443,
                // así que NO le ponemos el puerto :8080 a la URL de producción a menos que lo hayas expuesto directamente con SSL.
                const wsHost = window.location.hostname === "localhost" ? "localhost:8080" : window.location.host;
                
                // Conectamos el WebSocket
                const wsUrl = `${wsProtocol}://${wsHost}/ws/${me.id}`;
                const ws = new WebSocket(wsUrl);

                ws.onopen = () => {
                    console.log(`🟢 Conectado al Chat Server via ${wsProtocol.toUpperCase()}`);
                    setIsConnected(true);
                };

                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    
                    const eventCustom = new CustomEvent("socket_event", { detail: data });
                    window.dispatchEvent(eventCustom);
                    
                    if (data.type === "new_message") {
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
                    setSocket(null);
                };

                ws.onerror = (error) => {
                    console.error("Error WS:", error);
                };

                socketRef.current = ws;
                setSocket(ws);
            } catch (error) {
                console.error("Error conectando socket:", error);
            }
        };

        const timer = setTimeout(() => {
            connectSocket();
        }, 1000); 

        return () => clearTimeout(timer);

    }, [pathname]);

    const sendMessage = (payload) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: "send_message",
                payload: payload
            }));
        }
    };

    const markViewed = (msgId) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: "view_once_opened",
                payload: { message_id: msgId }
            }));
        }
    }

    const toggleSave = (msgId, isSaved) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
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