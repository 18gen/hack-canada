"use client";

import React, { useContext, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import LoginModal from "@/components/LoginModal";
import CheckModal from "@/components/CheckModal";
import { UserContext } from "@/app/UserContext";

interface PollOption {
  id: number;
  option_text: string;
}

interface PollData {
  id: number;
  title: string;
  description: string;
  ends_at: string;
  options: PollOption[];
}

export default function PollInvitation() {
  const { pollId } = useParams() as { pollId: string };
  const router = useRouter();
  const userContext = useContext(UserContext);
  if (!userContext) {
    // Early return or throw an error if UserContext isn't available
    throw new Error("UserContext must be provided");
  }

  const [poll, setPoll] = useState<PollData | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCheckModal, setShowCheckModal] = useState(false);

  // Fetch the poll details
  useEffect(() => {
    const fetchPoll = async () => {
      const { data, error } = await supabase
        .from("poll")
        .select(`
          id,
          title,
          description,
          ends_at,
          options:options ( id, option_text )
        `)
        .eq("id", pollId)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setPoll(data);
      }
      setLoading(false);
    };

    if (pollId) {
      fetchPoll();
    }
  }, [pollId]);

  // Immediately open login modal if no user is found after loading
  useEffect(() => {
    if (!loading && !userContext.user) {
      setShowLoginModal(true);
    }
  }, [loading, userContext]);

  // Check if a logged-in user has already voted.
  useEffect(() => {
    if (!poll || !userContext.user) return;

    const checkUserVote = async () => {
      const pollOptionIds = poll.options.map((option) => option.id);

      const { data: existingVote, error: voteError } = await supabase
        .from("votes")
        .select("id")
        .in("option_id", pollOptionIds)
        .eq("user_id", userContext.user)
        .maybeSingle();

      if (voteError) {
        console.error("Error checking vote:", voteError.message);
        return;
      }

      if (existingVote) {
        router.push(`/${userContext.user}`);
      }
    };

    checkUserVote();
  }, [poll, router, userContext]);

  // Handle vote submission
  const handleVote = async () => {
    if (!selectedOption) {
      setError("Please select an option.");
      return;
    }

    if (!userContext.user) {
      setShowLoginModal(true);
      return;
    }
    setShowCheckModal(true);
  };

  const handleFaceCheckSuccess = async () => {
    // After successful face verification, insert the vote.
    const pollOptionIds = poll?.options.map((option) => option.id) || [];
    const { data: existingVote, error: voteError } = await supabase
      .from("votes")
      .select("id")
      .in("option_id", pollOptionIds)
      .eq("user_id", userContext.user)
      .maybeSingle();

    if (voteError) {
      setError(voteError.message);
      return;
    }

    if (existingVote) {
      router.push(`/${userContext.user}`);
      return;
    }

    const { error } = await supabase
      .from("votes")
      .insert({ user_id: userContext.user, option_id: selectedOption });
    if (error) {
      setError(error.message);
      return;
    }

    router.push(`/${userContext.user}`);
  };

  // Callback when login is successful from the modal
  const handleLoginSuccess = (userId: string) => {
    // Once logged in, attempt to submit the vote.
    handleVote();
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300">
        Loading poll details...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  if (!poll)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300">
        No poll found.
      </div>
    );

  const isClosed = new Date(poll.ends_at) < new Date();
  const endsAtDate = new Date(poll.ends_at);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)}  />
      )}
      {showCheckModal && (
        <CheckModal
          userId={String(userContext.user)}
          onClose={() => setShowCheckModal(false)}
          onSuccess={handleFaceCheckSuccess}
        />
      )}
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {userContext.user
              ? `${userContext.user}, You're Invited!`
              : "You're Invited!"}
          </h1>
          <div className="mt-4 flex items-center justify-center gap-2 bg-gray-800 rounded-lg py-2 px-4 mx-auto w-fit">
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                isClosed ? "bg-red-600" : "bg-green-600"
              }`}
            >
              {isClosed ? "Closed" : "Open"}
            </span>
            <div className="flex items-center gap-2 text-sm">
              <FaCalendarAlt className="text-gray-400" />
              <span>{endsAtDate.toLocaleDateString()}</span>
              <FaClock className="text-gray-400 ml-2" />
              <span>{endsAtDate.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg space-y-4">
          <h2 className="text-2xl font-bold text-center">{poll.title}</h2>
          {poll.description && (
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <p className="text-gray-300 text-center">{poll.description}</p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center">
              Select an option
            </h3>
            <div className="grid gap-2">
              {poll.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={`w-full p-3 rounded-lg transition-all duration-300 border-2 ${
                    selectedOption === option.id
                      ? "border-blue-500 bg-blue-500/20"
                      : "border-gray-600 hover:border-blue-400 hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-100">
                      {option.option_text}
                    </span>
                    {selectedOption === option.id && (
                      <span className="text-blue-400">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-center">
              {error}
            </p>
          )}

          <button
            onClick={handleVote}
            disabled={isClosed}
            className={`w-full py-3 rounded-full font-semibold transition-all ${
              isClosed
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isClosed ? "Voting Closed" : "Submit Vote"}
          </button>
        </div>
      </div>
    </div>
  );
}
