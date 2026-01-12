"use client";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { api } from "@/utils/api";
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
        // 1. Si vamos a páginas públicas (Login/Register), CERRAR conexión si existe.
        if (pathname === "/login" || pathname === "/register") {
            if (socketRef.current) {
                console.log("🔒 Cerrando sesión de chat (página pública)");
                socketRef.current.close();
                socketRef.current = null;
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        // 2. Función para iniciar conexión (solo si no existe ya)
        const connectSocket = async () => {
            // ✅ SINGLETON: Si ya hay conexión abierta, NO hacemos nada.
            // Esto evita que el socket se reinicie al navegar, quitando el spinner.
            if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
                return;
            }

            try {
                // Verificar sesión (solo si no estamos conectados)
                const me = await api.get("/me").catch(() => null);
                if (!me || !me.id) return;

                // Doble chequeo por si se conectó mientras esperábamos la API
                if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) return;

                const wsUrl = `ws://localhost:8000/ws/${me.id}`;
                const ws = new WebSocket(wsUrl);

                ws.onopen = () => {
                    console.log("🟢 Conectado al Chat Server");
                    setIsConnected(true);
                };

                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    
                    // Emitir evento global para otros componentes
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

        // 3. ESTRATEGIA ANTI-SPINNER
        // Si el documento ya cargó, conectamos. Si no, esperamos al evento 'load'.
        if (document.readyState === 'complete') {
            connectSocket();
        } else {
            window.addEventListener('load', connectSocket);
        }

        // ✅ IMPORTANTE: Cleanup modificado
        // Quitamos el listener de 'load', pero NO cerramos el socket al desmontar el efecto
        // debido a cambios de ruta. Solo se cierra explícitamente en el punto 1.
        return () => {
            window.removeEventListener('load', connectSocket);
        };

    }, [pathname]); // Se ejecuta al cambiar de ruta, pero el punto 2 filtra si ya estamos conectados.

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