"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FiLogOut } from "react-icons/fi"; // Import a logout icon from react-icons
import { useContext } from "react";
import { UserContext } from "@/app/UserContext";

interface NavbarProps {
	showLogout?: boolean;
}

export default function Navbar({ showLogout = false }: NavbarProps) {
	const router = useRouter();
	const userContext = useContext(UserContext);

	if (!userContext) {
		throw new Error("UserContext must be used within a UserProvider");
	}

	const { logout, user } = userContext;

	// Handle logout
	const handleLogout = async () => {
		// await supabase.auth.signOut();
		logout(); // Call the logout function from UserContext
		router.push("/");
	};

	return (
    <nav className="w-full py-4 px-4 md:px-8 flex justify-between items-center">
      <div className="text-xl font-bold">TruVote</div>
      {showLogout && user && (
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 py-1.5 px-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105 active:scale-95">
          <FiLogOut className="w-5 h-5" /> {/* Logout icon */}
          <span>Log Out</span>
        </button>
      )}
    </nav>
	);
}
