"use client";

import { useParams, useRouter } from "next/navigation";
import UserProfile from "@/components/UserProfile";
import BottomNav from "@/components/BottomNav"; 

export default function UserProfilePage() {
  const { username } = useParams();
  const router = useRouter();

  const handleTabChange = (tab) => {
      router.push(`/?tab=${tab}`);
  };

  return (
    <div className="min-h-screen bg-[#0f0518]">
      <UserProfile username={decodeURIComponent(username)} isTab={false} />
      <BottomNav activeTab="profile" onTabChange={handleTabChange} />
    </div>
  );
}