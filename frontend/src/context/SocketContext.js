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
        if (pathname === "/login" || pathname === "/register") {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
                setSocket(null);
                setIsConnected(false);
                setOnlineUsers(new Set());
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
                let pingInterval;

                ws.onopen = () => {
                    setIsConnected(true);
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
                    setIsConnected(false);
                    socketRef.current = null;
                    setSocket(null);
                    setOnlineUsers(new Set());
                    
                    if (pingInterval) clearInterval(pingInterval);

                    setTimeout(() => {
                        connectSocket();
                    }, 3000);
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

    // ✅ NUEVO: Función para notificar que leímos el chat
    const markChatAsRead = (chatId) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: "mark_chat_read",
                payload: { chat_id: chatId }
            }));
        }
    };

    const checkIsOnline = (userId) => {
        return onlineUsers.has(String(userId));
    };

    return (
        <SocketContext.Provider value={{ socket, isConnected, onlineUsers, checkIsOnline, messages, sendMessage, markViewed, toggleSave, markChatAsRead }}>
            {children}
        </SocketContext.Provider>
    );
};