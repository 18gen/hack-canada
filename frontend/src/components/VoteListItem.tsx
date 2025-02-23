"use client";

import React, { useState } from "react";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { FaCalendarAlt, FaClock } from "react-icons/fa"; // Import calendar and clock icons
import { supabase } from "@/lib/supabase";
import { VoteListItemProps } from "@/interfaces/vote";
import { formatEndsAt } from "@/utils/dateUtils";

interface VoteListItemExtendedProps extends VoteListItemProps {
  currentUserId: number;
}

const VoteListItem: React.FC<VoteListItemExtendedProps> = ({ item, expanded, onToggle, currentUserId }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(
    (item as any).selectedOptionId ?? null
  );
  const [voteError, setVoteError] = useState("");
  const isClosed = new Date(item.endsAt) < new Date();

  const handleOptionChange = async (optionId: number) => {
    if (isClosed) {
      alert("This poll is closed. You cannot change your vote.");
      return;
    }

    const email = prompt("Enter your email to confirm your vote:");
    if (!email) {
      alert("Email is required to vote.");
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (userError || !userData) {
      alert("Could not verify your email. You cannot vote.");
      return;
    }

    const userId = userData.id;
    const pollOptionIds = item.options.map((opt) => opt.id);

    const { data: existingVote, error: voteFetchError } = await supabase
      .from("votes")
      .select("id")
      .in("option_id", pollOptionIds)
      .eq("user_id", userId)
      .maybeSingle();

    if (voteFetchError) {
      setVoteError(voteFetchError.message);
      return;
    }

    if (existingVote) {
      const { error: updateError } = await supabase
        .from("votes")
        .update({ option_id: optionId })
        .eq("id", existingVote.id);

      if (updateError) {
        setVoteError(updateError.message);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("votes")
        .insert({ option_id: optionId, user_id: userId });
      if (insertError) {
        setVoteError(insertError.message);
        return;
      }
    }

    setSelectedOptionId(optionId);
    setVoteError("");
  };

  return (
    <li
      onClick={onToggle}
      className="cursor-pointer px-4 py-3 bg-gray-800 rounded-lg shadow-inner transition-all hover:bg-gray-700 active:bg-gray-600"
    >
      {/* Poll Header with Title and Status Badges */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-100">{item.title}</span>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              isClosed ? "bg-red-600" : "bg-green-600"
            }`}
          >
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

          {/* Options as Buttons in a Flex Container */}
          <div>
            <h4 className="text-gray-100 font-medium mb-2">Options:</h4>
            <div className="flex flex-wrap gap-2">
              {item.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptionChange(option.id);
                    }}
                    disabled={isClosed}
                    className={`px-3.5 py-1 rounded-full transition-all duration-300 border 
                      ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-700 text-gray-200 border-transparent hover:bg-gray-600"
                      }
                      ${isClosed && "opacity-50 cursor-not-allowed"}`}
                  >
                    {option.option_text} {isSelected && <span className="ml-1">✓</span>}
                  </button>
                );
              })}
            </div>
            {voteError && <p className="text-red-500 text-xs mt-1">{voteError}</p>}
          </div>
        </div>
      )}
    </li>
  );
};

export default VoteListItem;
