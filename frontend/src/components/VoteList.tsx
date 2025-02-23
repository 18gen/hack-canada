"use client";

import React, { useState, useEffect } from "react";
import {
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaSortNumericDown,
  FaSortNumericUp,
} from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import VoteListItem from "./VoteListItem";
import { Poll } from "@/interfaces/vote";

interface VoteListProps {
  user_id: number;
  refresh: number; // triggers re-fetch when changed
}

const VoteList: React.FC<VoteListProps> = ({ user_id, refresh }) => {
  const [search, setSearch] = useState("");
  const [voteItems, setVoteItems] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [activeSortField, setActiveSortField] = useState<"name" | "endsAt">("name");
  const [nameSortAsc, setNameSortAsc] = useState(true);
  const [dateSortAsc, setDateSortAsc] = useState(true);

  useEffect(() => {
    const fetchPolls = async () => {
      setLoading(true);
      setError("");

      // Query polls where the user has voted
      const { data: votesData, error: votesError } = await supabase
        .from("votes")
        .select(`
          options (
            id,
            option_text,
            poll:poll_id (
              id,
              admin,
              title,
              ends_at,
              description,
              options:options ( id, option_text )
            )
          )
        `)
        .eq("user_id", user_id);

      // Query polls where the user is admin
      const { data: adminPollsData, error: adminPollsError } = await supabase
        .from("poll")
        .select(`
          id,
          admin,
          title,
          ends_at,
          description,
          options:options ( id, option_text )
        `)
        .eq("admin", user_id);

      if (votesError) {
        setError(votesError.message);
        setLoading(false);
        return;
      }
      if (adminPollsError) {
        setError(adminPollsError.message);
        setLoading(false);
        return;
      }

      // Convert votesData -> polls
      const votePolls: Poll[] = votesData
        ? votesData.map((vote: any) => {
            const poll = vote.options.poll;
            return {
              id: poll.id,
              admin: poll.admin,
              title: poll.title,
              endsAt: poll.ends_at,
              description: poll.description,
              options: poll.options || [],
            };
          })
        : [];

      // Convert adminPollsData -> polls
      const adminPolls: Poll[] = adminPollsData
        ? adminPollsData.map((poll: any) => ({
            id: poll.id,
            admin: poll.admin,
            title: poll.title,
            endsAt: poll.ends_at,
            description: poll.description,
            options: poll.options || [],
          }))
        : [];

      // Combine the two arrays (remove duplicates if needed)
      const combinedPolls = [...votePolls, ...adminPolls];
      setVoteItems(combinedPolls);
      setLoading(false);
    };

    fetchPolls();
  }, [user_id, refresh]); // re-fetch whenever refresh changes

  // Filter by search term
  const filteredItems = voteItems.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  // Sort by name or end date
  const sortedItems = filteredItems.slice().sort((a, b) => {
    if (activeSortField === "name") {
      return nameSortAsc
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else {
      return dateSortAsc
        ? a.endsAt.localeCompare(b.endsAt)
        : b.endsAt.localeCompare(a.endsAt);
    }
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="w-full px-2 max-w-xl rounded-xl shadow-inner flex flex-col h-full">
      {/* Search */}
      <input
        type="text"
        placeholder="Search polls..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full text-gray-800 px-4 py-2 mb-4 bg-gray-100 border border-gray-300 rounded-lg shadow-inner focus:outline-none"
      />

      {/* Sorting Buttons */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => {
            setActiveSortField("name");
            setNameSortAsc((prev) => !prev);
            setExpandedItem(null);
          }}
          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          {activeSortField === "name" &&
            (nameSortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUp />)}
          Sort by Name
        </button>
        <button
          onClick={() => {
            setActiveSortField("endsAt");
            setDateSortAsc((prev) => !prev);
            setExpandedItem(null);
          }}
          className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
        >
          {activeSortField === "endsAt" &&
            (dateSortAsc ? <FaSortNumericDown /> : <FaSortNumericUp />)}
          Sort by End Date
        </button>
      </div>

      {/* Poll List */}
      <div className="flex-1 overflow-y-auto max-h-[280px] sm:max-h-[400px] md:max-h-[calc(100vh-230px)]">
        <ul className="space-y-1">
          {sortedItems.map((item) => (
            <VoteListItem
              key={item.id}
              item={item}
              currentUserId={user_id}
              expanded={expandedItem === item.id}
              onToggle={() =>
                setExpandedItem((prev) => (prev === item.id ? null : item.id))
              }
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VoteList;
