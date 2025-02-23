"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";

interface UserContextProps {
	user: string | null;
	setUser: (user: string | null) => void;
	logout: () => void;
}

export const UserContext = createContext<UserContextProps | undefined>(
	undefined
);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<string | null>(null);

	useEffect(() => {
		const storedUser =
			typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
		setUser(storedUser);
	}, []);

	useEffect(() => {
		if (user) {
			localStorage.setItem("user_id", user);
		} else {
			localStorage.removeItem("user_id");
		}
	}, [user]);

	const logout = () => {
		localStorage.removeItem("user_id");
		setUser(null);
	};

	return (
		<UserContext.Provider value={{ user, setUser, logout }}>
			{children}
		</UserContext.Provider>
	);
};
