"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FiLogOut } from "react-icons/fi"; // Import a logout icon from react-icons

interface NavbarProps {
  showLogout?: boolean;
}

export default function Navbar({ showLogout = false }: NavbarProps) {
  const router = useRouter();

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="w-full p-4 flex justify-between items-center">
      <div className="text-lg font-bold">Hack Canada</div>
      {showLogout && (
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 py-1.5 px-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          <FiLogOut className="w-5 h-5" /> {/* Logout icon */}
          <span>Log Out</span>
        </button>
      )}
    </nav>
  );
}