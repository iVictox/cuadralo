"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import UserProfile from "@/components/UserProfile";
import BottomNav from "@/components/BottomNav"; 
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";

export default function UserProfilePage() {
  const { username } = useParams();
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const decodedUsername = decodeURIComponent(username);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/u/${decodedUsername}`);
        setUser(data);
      } catch (err) {
        setError("Usuario no encontrado");
      } finally {
        setLoading(false);
      }
    };
    
    if (decodedUsername) fetchUser();
  }, [decodedUsername]);

  const handleTabChange = (tab) => {
      router.push(`/?tab=${tab}`);
  };

  const handleClose = () => {
      router.back();
  };

  return (
    <div className="min-h-screen bg-[#0f0518] flex items-center justify-center relative">
      {loading ? (
        <Loader2 className="animate-spin text-cuadralo-pink" size={48} />
      ) : error ? (
        <div className="text-white text-center z-10">
            <h2 className="text-2xl font-bold mb-4">{error}</h2>
            <button onClick={handleClose} className="text-cuadralo-pink hover:underline">Volver</button>
        </div>
      ) : user ? (
        <UserProfile 
          user={user} 
          onClose={handleClose} 
        />
      ) : null}
      
      <BottomNav activeTab="profile" onTabChange={handleTabChange} />
    </div>
  );
}