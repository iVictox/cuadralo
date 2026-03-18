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
        // Evitar conectar en login/registro
        if (pathname === "/login" || pathname === "/register") {
            if (socketRef.current) {
                console.log("🔒 Cerrando sesión de chat");
                socketRef.current.close();
                socketRef.current = null;
                setSocket(null);
                setIsConnected(false);
                setOnlineUsers(new Set()); // Limpiamos la lista al salir
            }
            return;
        }

const connectSocket = () => {
            if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
                return;
            }

            try {
                const token = localStorage.getItem("token");
                const userStr = localStorage.getItem("user");
                
                if (!token || !userStr) return;

                const me = JSON.parse(userStr);
                if (!me || !me.id) return;

                // MEJORA: Construir la URL del WebSocket basándonos en la del API REST para evitar errores en Coolify
                let wsUrl = "";
                const apiUrlStr = process.env.NEXT_PUBLIC_API_URL;
                if (apiUrlStr) {
                    const apiUrlObj = new URL(apiUrlStr);
                    const isSecure = apiUrlObj.protocol === "https:";
                    const wsProtocol = isSecure ? "wss" : "ws";
                    wsUrl = `${wsProtocol}://${apiUrlObj.host}/ws/${me.id}`;
                } else {
                    const isSecure = window.location.protocol === "https:";
                    const wsProtocol = isSecure ? "wss" : "ws";
                    const wsHost = window.location.hostname === "localhost" ? "localhost:8080" : window.location.host;
                    wsUrl = `${wsProtocol}://${wsHost}/ws/${me.id}`;
                }

                const ws = new WebSocket(wsUrl);
                let pingInterval; // Guardaremos aquí el latido

                ws.onopen = () => {
                    console.log(`🟢 Conectado al Chat Server via WebSocket`);
                    setIsConnected(true);

                    // HEARTBEAT: Enviamos un ping cada 30 segundos para evitar que Coolify lo cierre
                    pingInterval = setInterval(() => {
                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({ type: "ping", payload: {} }));
                        }
                    }, 30000);
                };

                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    
                    const eventCustom = new CustomEvent("socket_event", { detail: data });
                    window.dispatchEvent(eventCustom);
                    
                    if (data.type === "new_message") {
                        setMessages((prev) => [...prev, data.payload]);
                    } 
                    else if (data.type === "online_users") {
                        const initialOnline = data.payload ? data.payload.map(id => String(id)) : [];
                        setOnlineUsers(new Set(initialOnline));
                    }
                    else if (data.type === "user_status") {
                        const { user_id, status } = data.payload;
                        const safeUserId = String(user_id); 

                        setOnlineUsers((prev) => {
                            const newSet = new Set(prev);
                            if (status === "online") {
                                newSet.add(safeUserId);
                            } else {
                                newSet.delete(safeUserId);
                            }
                            return newSet;
                        });
                    }
                };

                ws.onclose = () => {
                    console.log("🔴 Desconectado del Chat");
                    setIsConnected(false);
                    socketRef.current = null;
                    setSocket(null);
                    setOnlineUsers(new Set());
                    
                    // Limpiamos el heartbeat para que no siga corriendo sin conexión
                    if (pingInterval) clearInterval(pingInterval);

                    // RECONEXIÓN AUTOMÁTICA: Si el socket se cae, intentar reconectar en 3 segundos
                    setTimeout(() => {
                        console.log("🔄 Intentando reconectar WebSocket...");
                        connectSocket();
                    }, 3000);
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

    // ✅ Helper ultra-seguro para que cualquier componente sepa si alguien está conectado
    const checkIsOnline = (userId) => {
        return onlineUsers.has(String(userId));
    };

    return (
        <SocketContext.Provider value={{ socket, isConnected, onlineUsers, checkIsOnline, messages, sendMessage, markViewed, toggleSave }}>
            {children}
        </SocketContext.Provider>
    );
};