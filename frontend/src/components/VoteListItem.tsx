"use client";

import React, { useState, useEffect } from "react";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { FaCalendarAlt } from "react-icons/fa"; // Import calendar and clock icons
import { supabase } from "@/lib/supabase";
import { VoteListItemProps } from "@/interfaces/vote";
import { formatEndsAt } from "@/utils/dateUtils";

interface VoteListItemExtendedProps extends VoteListItemProps {
	currentUserId: number;
}

const VoteListItem: React.FC<VoteListItemExtendedProps> = ({
	item,
	expanded,
	onToggle,
	currentUserId,
}) => {
	const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
	const [voteError, setVoteError] = useState("");
	const [optionVotes, setOptionVotes] = useState<
		Array<{
			option_id: number;
			option_text: string;
			vote_count: number;
		}>
	>([]);
	const isClosed = new Date(item.endsAt) < new Date();

	useEffect(() => {
		const fetchUserVote = async () => {
			if (!currentUserId || !item?.id) return; // Ensure valid IDs

			try {
				const { data: userVote, error } = await supabase
					.from("votes")
					.select("option_id")
					.eq("user_id", currentUserId)
					.maybeSingle(); // Allow cases where no vote exists

				if (error) {
					console.error("Error fetching user vote:", error.message);
					return;
				}

				if (userVote) {
					setSelectedOptionId(userVote.option_id);
				}
			} catch (error) {
				console.error("Unexpected error fetching user vote:", error);
			}
		};

		if (expanded) {
			fetchUserVote();
		}
	}, [expanded, currentUserId, item?.id]);

	const fetchVoteCount = async () => {
		try {
			const response = await fetch(
				`http://localhost:3001/api/get-votes/${item.id}`
			);
			const data = await response.json();
			setOptionVotes(data);
		} catch (error) {
			console.error("Error fetching vote counts:", error);
		}
	};

	return (
		<li
			onClick={() => {
				if (item.admin === currentUserId && !expanded) {
					fetchVoteCount();
				}
				onToggle();
			}}
			className="cursor-pointer px-4 py-3 bg-gray-800 rounded-lg shadow-inner transition-all hover:bg-gray-700 active:bg-gray-600">
			{/* Poll Header with Title and Status Badges */}
			<div className="flex justify-between items-center">
				<div className="flex items-center gap-2">
					<span className="font-medium text-gray-100">{item.title}</span>
					<span
						className={`text-xs font-semibold px-2 py-1 rounded-full ${
							isClosed ? "bg-red-600" : "bg-green-600"
						}`}>
						{isClosed ? "Closed" : "Open"}
					</span>
					{item.admin === currentUserId && (
						<span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-600 text-gray-900">
							Host
						</span>
					)}
				</div>
				<span className="text-sm text-gray-300">
					{expanded ? <IoIosArrowDown /> : <IoIosArrowForward />}
				</span>
			</div>

			{expanded && (
				<div className="mt-3 space-y-2">
					{/* Enhanced Date Badge */}
					<div className="flex items-center gap-2 bg-gray-700 rounded-lg py-1.5 px-3">
						<FaCalendarAlt className="text-gray-400" />
						<span className="text-sm text-gray-200">
							Ends on: {formatEndsAt(item.endsAt)}
						</span>
					</div>

					{/* Description */}
					<div className="p-3 bg-gray-700 rounded-lg border border-gray-600">
						<p className="text-sm text-gray-200">{item.description}</p>
					</div>

					{/* Conditionally render Host text or Options */}
					{item.admin === currentUserId ? (
						<div className="space-y-2">
							<h4 className="text-gray-100 font-medium mb-2">Vote Results:</h4>
							<div className="space-y-2">
								{optionVotes.map((option) => (
									<div
										key={option.option_id}
										className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
										<span className="text-gray-200">{option.option_text}</span>
										<span className="text-blue-400 font-semibold">
											{option.vote_count} votes
										</span>
									</div>
								))}
							</div>
						</div>
					) : (
						<div>
							<h4 className="text-gray-100 font-medium mb-2">Options:</h4>
							<div className="flex flex-wrap gap-2">
								{item.options.map((option) => {
									const isSelected = selectedOptionId === option.id;
									return (
										<div
											key={option.id}
											className={`px-3.5 py-1 rounded-full transition-all duration-300 border 
                      ${
												isSelected
													? "bg-green-600 text-white border-green-600"
													: "bg-gray-700 text-gray-200 border-transparent"
											}`}>
											{option.option_text}{" "}
											{isSelected && <span className="ml-1">✓</span>}
										</div>
									);
								})}
							</div>
							{voteError && (
								<p className="text-red-500 text-xs mt-1">{voteError}</p>
							)}
						</div>
					)}
				</div>
			)}
		</li>
	);
};

export default VoteListItem;
