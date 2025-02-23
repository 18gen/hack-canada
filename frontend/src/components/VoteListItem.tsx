"use client";

import React, { useState, useEffect } from "react";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import {
	FaCalendarAlt,
	FaLock,
	FaLockOpen,
	FaCrown,
	FaCopy,
} from "react-icons/fa";
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
	const [totalVotes, setTotalVotes] = useState(0);
	const [isCopied, setIsCopied] = useState(false); // State to track if the link is copied
	const [analysis, setAnalysis] = useState<string | null>(null); // State to store poll analysis
	const isHost = item.admin === currentUserId;
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
			setTotalVotes(
				data.reduce((acc: number, curr: any) => acc + curr.vote_count, 0)
			);
		} catch (error) {
			console.error("Error fetching vote counts:", error);
		}
	};

	// Function to copy the poll link to the clipboard
	const copyPollLink = async () => {
		const pollLink = `http://localhost:3000/poll/${item.id}`;
		try {
			await navigator.clipboard.writeText(pollLink);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000); // Reset copied state after 2 seconds
		} catch (error) {
			console.error("Failed to copy link:", error);
		}
	};

	// Function to get poll analysis
	const getPollAnalysis = async () => {
		try {
			const response = await fetch(
				`http://localhost:3001/api/analysis/${item.id}`
			);
			const data = await response.json();
			if (data.error) {
				console.error("Error fetching poll analysis:", data.error);
			} else {
				setAnalysis(data.response);
			}
		} catch (error) {
			console.error("Error fetching poll analysis:", error);
		}
	};

	return (
		<li
			onClick={() => {
				if (isHost && !expanded) {
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
						className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
							isClosed ? "bg-red-600" : "bg-green-600"
						}`}>
						{isClosed ? (
							<>
								<FaLock className="text-xs" />
								Closed
							</>
						) : (
							<>
								<FaLockOpen className="text-xs" />
								Open
							</>
						)}
					</span>
					{isHost && (
						<span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-yellow-600 text-gray-900">
							<FaCrown className="text-xs" />
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
					<div className="flex items-center gap-3 mt-3">
						{/* Enhanced Date Badge */}
						<div className="flex items-center gap-2 bg-gray-700 rounded-lg py-1.5 px-3">
							<FaCalendarAlt className="text-gray-400" />
							<span className="text-sm text-gray-200">
								Ends on: {formatEndsAt(item.endsAt)}
							</span>
						</div>

						{/* Copy Link Button */}
						<button
							onClick={(e) => {
								e.stopPropagation(); // Prevent the parent onClick from firing
								copyPollLink();
							}}
							className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-xs text-white rounded-lg hover:bg-purple-700 transition-all">
							<FaCopy className="text-sm" />
							{isCopied ? "Copied!" : "Copy Poll Link"}
						</button>
					</div>

					{/* Description */}
					<div className="p-3 bg-gray-700 rounded-lg border border-gray-600">
						<p className="text-sm text-gray-200">{item.description}</p>
					</div>

					{/* Conditionally render Host text or Options */}
					{isHost ? (
						<div className="space-y-2">
							<h4 className="text-gray-100 mt-1 text-sm">
								Results ({totalVotes} total votes)
							</h4>
							<div className="space-y-2">
								{optionVotes.map((option) => {
									const percentage =
										totalVotes > 0
											? Math.round((option.vote_count / totalVotes) * 100)
											: 0;
									return (
										<div key={option.option_id} className="space-y-1">
											<div className="flex justify-between text-sm text-gray-300">
												<div>
													<span>{option.option_text}</span>
													<span className="text-xs text-gray-400 text-right">
														{" "}
														{option.vote_count} votes
													</span>
												</div>
												<span>{percentage}%</span>
											</div>
											<div className="w-full bg-gray-600 rounded-full h-2.5">
												<div
													className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
													style={{ width: `${percentage}%` }}
												/>
											</div>
										</div>
									);
								})}
							</div>
							{isClosed && totalVotes > 0 && (
								<button
									onClick={(e) => {
										e.stopPropagation(); // Prevent the parent onClick from firing
										getPollAnalysis();
									}}
									className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
									Get Poll Analysis
								</button>
							)}
							{analysis && (
								<div className="mt-3 p-3 bg-gray-700 rounded-lg border border-gray-600">
									<h4 className="text-gray-100 text-sm">Poll Analysis:</h4>
									<p className="text-sm text-gray-200">{analysis}</p>
								</div>
							)}
						</div>
					) : (
						<div>
							<h4 className="text-gray-100 text-sm pt-1 mb-2">Options:</h4>
							<div className="flex flex-wrap gap-2">
								{item.options.map((option) => {
									const isSelected = selectedOptionId === option.id;
									return (
										<div
											key={option.id}
											className={`px-3.5 text-sm py-1 rounded-full transition-all duration-300 border 
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
