"use client";

import React, { useEffect, useState, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import Form from "@/components/Form";
import VoteList from "@/components/VoteList";
import Toast from "@/components/Toast";
import { supabase } from "@/lib/supabase";
import { UserContext } from "../UserContext";
import ClipLoader from "react-spinners/ClipLoader";

interface User {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
}

export default function DashboardPage() {
	const router = useRouter();
	const userContext = useContext(UserContext);
	const params = useParams();
	const userId = params.userId as string;
	const [user, setUser] = useState<User | null>(null);
	const [pollRefresh, setPollRefresh] = useState(0);
	const [notification, setNotification] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUser = async () => {
			const { data, error } = await supabase
				.from("users")
				.select("id, first_name, last_name, email")
				.eq("id", userId)
				.single();

			if (!error && data) {
				setUser(data);
			}
		};

		if (userId) {
			fetchUser();
		}
	}, [userId, userContext]);

	useEffect(() => {
		if (userContext?.user !== undefined) {
			setLoading(false);
		}
	}, [userContext]);

	useEffect(() => {
		if (!loading) {
			if (!userContext?.user) {
				router.push("/");
			} else if (
				userContext?.user &&
				Number(userContext.user) !== Number(userId)
			) {
				router.push(`/${userContext.user}`);
			}
		}
	}, [userContext, userId, router, loading]);

	// Callback passed to Form: refresh polls and show a toast.
	const handlePollCreated = () => {
		console.log("handlePollCreated called");
		setPollRefresh((prev) => prev + 1);
		setNotification("Poll created successfully!");
	};

	if (loading) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center">
				{/* <Navbar /> */}
				<ClipLoader size={50} color={"#123abc"} loading={loading} />
				<p className="text-xl mt-4">Loading...</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col">
			<Navbar showLogout />
			<div className="flex-1 p-4 md:px-10 flex flex-col gap-7">
				<div className="flex flex-col md:flex-row gap-7 h-full">
					{/* Left Column: User Card and New Poll Form */}
					<div className="flex-1 flex flex-col gap-4">
						<div className="flex justify-center items-center">
							{user && (
								<Card
									id={user.id}
									name={`${user.first_name} ${user.last_name}`}
									image="/cat-face.jpg"
									email={user.email}
								/>
							)}
						</div>
						{user && (
							<Form userId={user.id} onPollCreated={handlePollCreated} />
						)}
					</div>
					{/* Right Column: Vote List */}
					<div className="flex-1 flex justify-center items-start">
						{user ? (
							<VoteList user_id={user.id} refresh={pollRefresh} />
						) : (
							<p>Loading votes...</p>
						)}
					</div>
				</div>
			</div>
			{/* Render toast if there's a notification */}
			{notification && (
				<Toast message={notification} onClose={() => setNotification("")} />
			)}
		</div>
	);
}
