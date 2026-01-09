"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import UserProfile from "./UserProfile"; 
import { api } from "@/utils/api";

export default function Profile() {
  const [myUsername, setMyUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
        try {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.username) {
                    setMyUsername(user.username);
                    setLoading(false);
                    return; 
                }
            }

            console.log("Sincronizando perfil...");
            const me = await api.get("/me");
            
            if (me && me.username) {
                setMyUsername(me.username);
                localStorage.setItem("user", JSON.stringify(me));
            }
        } catch (error) {
            console.error("Error perfil", error);
        } finally {
            setLoading(false);
        }
    };

    fetchMe();
  }, []);

  if (loading) {
      return <div className="w-full h-full flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-cuadralo-pink" size={40} /></div>;
  }
  
  if (!myUsername) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-white gap-4 mt-20">
            <p>Sesión desactualizada.</p>
            <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }} className="px-6 py-2 bg-cuadralo-pink rounded-full font-bold">
                Relogin
            </button>
        </div>
      );
  }

  return <UserProfile username={myUsername} isTab={true} />;
}